"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Busca todas as assinaturas do usuário
export async function getSubscriptions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("billing_day", { ascending: true });

  if (error) {
    console.error("Erro ao buscar assinaturas:", error);
    return [];
  }

  return data;
}

// 2. Cria uma nova assinatura
export async function createSubscription(data: { name: string; amount: number; category: string; billing_day: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    ...data
  });

  if (error) return { error: "Erro ao criar assinatura." };

  revalidatePath("/subscriptions");
  return { success: true };
}

// 3. Deleta uma assinatura
export async function deleteSubscription(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) return { error: "Erro ao deletar assinatura." };

  revalidatePath("/subscriptions");
  return { success: true };
}

// 4. Pausa ou Retoma uma assinatura
export async function toggleSubscriptionStatus(id: string, currentStatus: string) {
  const supabase = await createClient();
  const newStatus = currentStatus === 'active' ? 'paused' : 'active';
  
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) return { error: "Erro ao atualizar status." };

  revalidatePath("/subscriptions");
  return { success: true };
}