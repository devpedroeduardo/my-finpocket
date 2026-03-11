"use server";

import { createClient } from "@/lib/supabase/server";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getMonthlyEvolution() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
  const now = endOfMonth(new Date());

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type, created_at")
    .eq("user_id", user.id)
    .gte("created_at", sixMonthsAgo.toISOString())
    .lte("created_at", now.toISOString());

  if (!transactions) return [];

  const grouped = transactions.reduce((acc, tx) => {
    const monthStr = format(new Date(tx.created_at), "MMM yyyy", { locale: ptBR });
    
    if (!acc[monthStr]) {
      acc[monthStr] = { month: monthStr, Receitas: 0, Despesas: 0 };
    }
    
    if (tx.type === 'income') {
      acc[monthStr].Receitas += Number(tx.amount);
    } else {
      acc[monthStr].Despesas += Number(tx.amount);
    }
    
    return acc;
  }, {} as Record<string, { month: string, Receitas: number, Despesas: number }>);


  const result = [];
  for (let i = 5; i >= 0; i--) {
    const m = format(subMonths(new Date(), i), "MMM yyyy", { locale: ptBR });
    result.push(grouped[m] || { month: m, Receitas: 0, Despesas: 0 });
  }

  return result;
}