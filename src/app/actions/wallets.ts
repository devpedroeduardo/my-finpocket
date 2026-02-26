"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Busca as carteiras do usuário logado
export async function getWallets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar carteiras:", error);
    return [];
  }

  return data;
}

// 2. Cria uma nova carteira
export async function createWallet(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };
  if (!name.trim()) return { error: "O nome da carteira é obrigatório." };

  const { error } = await supabase.from("wallets").insert({
    user_id: user.id,
    name: name.trim(),
  });

  if (error) {
    console.error("Erro ao criar carteira:", error);
    return { error: "Erro ao criar a conta bancária." };
  }

  revalidatePath("/wallets");
  return { success: true };
}

// 3. Deleta uma carteira
export async function deleteWallet(id: string) {
  const supabase = await createClient();
  
  // Opcional: Verificar se existem transações ligadas a esta carteira antes de deletar
  // Para manter simples agora, vamos permitir a exclusão direta (ou o banco bloqueia se houver transações via Foreign Key)
  
  const { error } = await supabase.from("wallets").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar carteira:", error);
    return { error: "Não é possível excluir uma carteira que possui transações vinculadas." };
  }

  revalidatePath("/wallets");
  return { success: true };
}

// 4. Busca carteiras já com os saldos calculados
export async function getWalletsWithBalances() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: wallets } = await supabase.from("wallets").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
  const { data: transactions } = await supabase.from("transactions").select("wallet_id, amount, type").eq("user_id", user.id);

  if (!wallets) return [];

  return wallets.map(wallet => {
    const walletTxs = (transactions || []).filter(t => t.wallet_id === wallet.id);
    const income = walletTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = walletTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    return {
      id: wallet.id,
      name: wallet.name,
      balance: income - expense
    };
  });
}