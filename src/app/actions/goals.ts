"use server";

import { createClient } from "@/lib/supabase/server";

export async function getGoals() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function createGoal(title: string, target_amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title,
    target_amount,
    current_amount: 0
  });

  if (error) return { error: "Erro ao criar meta." };
  return { success: true };
}

export async function addMoneyToGoal(id: string, amountToAdd: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  // 1. Busca o valor atual guardado
  const { data: goal } = await supabase.from("goals").select("current_amount").eq("id", id).single();
  if (!goal) return { error: "Meta não encontrada." };

  // 2. Soma com o novo valor
  const newAmount = Number(goal.current_amount) + amountToAdd;

  // 3. Atualiza no banco
  const { error } = await supabase.from("goals").update({ current_amount: newAmount }).eq("id", id);
  if (error) return { error: "Erro ao atualizar meta." };
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { error: "Erro ao deletar meta." };
  return { success: true };
}