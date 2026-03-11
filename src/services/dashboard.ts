"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth } from "date-fns";

function getMonthBounds(monthStr?: string) {
  const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
  const baseDate = new Date(`${targetMonth}-01T12:00:00`); 
  
  return {
    startDate: startOfMonth(baseDate).toISOString(),
    endDate: endOfMonth(baseDate).toISOString()
  };
}

export async function getDashboardStats(month?: string, search?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { balance: 0, income: 0, expense: 0, saved: 0 };

  const { startDate, endDate } = getMonthBounds(month);
  let query = supabase.from("transactions").select("amount, type")
    .eq("user_id", user.id)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (search) query = query.ilike("description", `%${search}%`);

  const { data } = await query;
  if (!data) return { balance: 0, income: 0, expense: 0, saved: 0 };

  const income = data.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const expense = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

  const { data: goalsData } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("user_id", user.id);

  const totalSaved = (goalsData || []).reduce((acc, goal) => acc + Number(goal.current_amount), 0);

  return { 
    balance: (income - expense) - totalSaved, 
    income, 
    expense,
    saved: totalSaved 
  };
}

export async function getRecentTransactions(month?: string, search?: string, type?: string, category?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { startDate, endDate } = getMonthBounds(month);

  let query = supabase.from("transactions").select(`*, wallets ( name )`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (search) query = query.ilike("description", `%${search}%`);
  if (type && type !== "all") query = query.eq("type", type);
  if (category && category !== "all") query = query.eq("category", category);

  const { data } = await query;
  return data || [];
}

export async function getExpensesByCategory(month?: string, search?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { startDate, endDate } = getMonthBounds(month);

  let query = supabase.from("transactions").select("amount, category")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (search) query = query.ilike("description", `%${search}%`);

  const { data } = await query;
  if (!data) return [];

  const grouped = data.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}