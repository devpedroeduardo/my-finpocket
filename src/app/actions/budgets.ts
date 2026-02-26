"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Busca os orçamentos do usuário logado
export async function getBudgets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return [];
  }

  return data;
}

// 2. Cria ou atualiza um orçamento (Upsert)
export async function upsertBudget(category: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };
  if (!category || amount <= 0) return { error: "Dados inválidos." };

  const { error } = await supabase.from("budgets").upsert({
    user_id: user.id,
    category: category,
    amount: amount,
  }, { onConflict: 'user_id, category' });

  if (error) {
    console.error("Erro ao salvar orçamento:", error);
    return { error: "Erro ao salvar a meta." };
  }

  revalidatePath("/budgets");
  return { success: true };
}

// 3. Deleta um orçamento
export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) return { error: "Erro ao deletar meta." };

  revalidatePath("/budgets");
  return { success: true };
}

// 4. Busca despesas específicas para a tela de Metas
export async function getBudgetsExpenses(monthStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const [year, m] = monthStr.split("-");
  const startDate = new Date(parseInt(year), parseInt(m) - 1, 1).toISOString();
  const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) {
    console.error("Erro ao buscar despesas para metas:", error);
    return [];
  }

  // CORREÇÃO: Trocamos o 'any' por 'Record<string, number>'
  const expensesByCategory = data.reduce((acc: Record<string, number>, transaction) => {
    const cat = transaction.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += Number(transaction.amount);
    return acc;
  }, {} as Record<string, number>);

  // Devolve o array pronto para nossa tela ler
  return Object.keys(expensesByCategory).map(key => ({
    category: key,
    amount: expensesByCategory[key]
  }));
}