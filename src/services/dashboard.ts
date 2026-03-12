"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth } from "date-fns";

// Nova função inteligente para lidar com as datas
function getDateBounds(startDate?: string, endDate?: string) {
  // Se o usuário filtrou por data no Front-End
  if (startDate && endDate) {
    return {
      start: `${startDate}T00:00:00`, // Pega desde a meia-noite do dia inicial
      end: `${endDate}T23:59:59`      // Pega até o último segundo do dia final
    };
  }
  
  // Fallback: Se não tem filtro na URL, mostra o mês atual por padrão
  const now = new Date();
  return {
    start: startOfMonth(now).toISOString(),
    end: endOfMonth(now).toISOString()
  };
}

export async function getDashboardStats(startDate?: string, endDate?: string, search?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { balance: 0, income: 0, expense: 0, saved: 0 };

  const { start, end } = getDateBounds(startDate, endDate);
  
  let query = supabase.from("transactions").select("amount, type")
    .eq("user_id", user.id)
    .gte("created_at", start)
    .lte("created_at", end);

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

export async function getRecentTransactions(startDate?: string, endDate?: string, search?: string, type?: string, category?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { start, end } = getDateBounds(startDate, endDate);

  let query = supabase.from("transactions").select(`*, wallets ( name )`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .gte("created_at", start)
    .lte("created_at", end);

  if (search) query = query.ilike("description", `%${search}%`);
  if (type && type !== "all") query = query.eq("type", type);
  if (category && category !== "all") query = query.eq("category", category);

  const { data } = await query;
  return data || [];
}

export async function getExpensesByCategory(startDate?: string, endDate?: string, search?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { start, end } = getDateBounds(startDate, endDate);

  let query = supabase.from("transactions").select("amount, category")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("created_at", start)
    .lte("created_at", end);

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