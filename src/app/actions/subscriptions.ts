"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSubscriptions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Buscamos as assinaturas SOZINHAS (sem forçar o join que está causando o erro)
  const { data: subs, error: subsError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("due_day", { ascending: true });

  if (subsError) {
    console.error("Erro ao buscar assinaturas:", subsError);
    return [];
  }

  // 2. Buscamos as carteiras do usuário
  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, name")
    .eq("user_id", user.id);

  // 3. Fazemos o "Join" manualmente no JavaScript! (À prova de falhas)
  const mappedSubs = subs.map(sub => {
    const matchedWallet = wallets?.find(w => w.id === sub.wallet_id);
    return {
      ...sub,
      wallets: matchedWallet ? { name: matchedWallet.name } : null
    };
  });

  return mappedSubs;
}

export async function createSubscription(data: { name: string; amount: number; category: string; due_day: number; wallet_id?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    name: data.name,
    amount: data.amount,
    category: data.category,
    due_day: data.due_day,
    wallet_id: data.wallet_id === "none" ? null : data.wallet_id,
    last_processed_month: "", // Deixa vazio para forçar a geração imediata no mês atual
  });

  if (error) return { error: "Erro ao criar assinatura." };

  revalidatePath("/subscriptions");
  return { success: true };
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);
  
  if (error) return { error: "Erro ao deletar assinatura." };
  
  revalidatePath("/subscriptions");
  return { success: true };
}

// Função que roda em segundo plano para gerar as contas do mês
export async function processMonthlySubscriptions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .neq("last_processed_month", currentMonthStr);

  if (!subs || subs.length === 0) return;

  const transactionsToInsert = [];
  const subsToUpdate = [];

  for (const sub of subs) {
    // CORREÇÃO: Trocamos 'let' por 'const' para deixar o ESLint feliz!
    const dueDate = new Date(now.getFullYear(), now.getMonth(), sub.due_day, 12, 0, 0);

    transactionsToInsert.push({
      user_id: user.id,
      description: sub.name,
      amount: sub.amount,
      type: "expense",
      category: sub.category,
      status: "pending", 
      created_at: dueDate.toISOString(),
      wallet_id: sub.wallet_id,
    });

    subsToUpdate.push(sub.id);
  }

  const { error: insertError } = await supabase.from("transactions").insert(transactionsToInsert);

  if (!insertError) {
    await supabase
      .from("subscriptions")
      .update({ last_processed_month: currentMonthStr })
      .in("id", subsToUpdate);
  }
}