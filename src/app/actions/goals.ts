"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGoals() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar objetivos:", error);
    return [];
  }
  return data;
}

export async function createGoal(data: { name: string; target_amount: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name: data.name,
    target_amount: data.target_amount,
    current_amount: 0,
  });

  if (error) return { error: "Erro ao criar objetivo." };

  revalidatePath("/objectives");
  return { success: true };
}

export async function updateGoalAmount(id: string, amount: number, type: 'deposit' | 'withdraw') {
  const supabase = await createClient();
  
  const { data: goal } = await supabase.from("goals").select("current_amount").eq("id", id).single();
  if (!goal) return { error: "Objetivo não encontrado." };

  let newAmount = type === 'deposit' 
    ? Number(goal.current_amount) + amount 
    : Number(goal.current_amount) - amount;

  if (newAmount < 0) newAmount = 0;

  const { error } = await supabase
    .from("goals")
    .update({ current_amount: newAmount })
    .eq("id", id);

  if (error) return { error: "Erro ao movimentar o dinheiro." };

  revalidatePath("/objectives");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  
  if (error) return { error: "Erro ao deletar objetivo." };
  
  revalidatePath("/objectives");
  return { success: true };
}