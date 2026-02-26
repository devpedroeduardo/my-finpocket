"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TransactionData {
  id?: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
  wallet_id?: string;
  receipt_url?: string;
  installments?: number; // <--- NOVO: Quantidade de parcelas
  status?: "paid" | "pending";
}

export async function uploadReceipt(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const file = formData.get("file") as File;
  if (!file) return { error: "Nenhum arquivo encontrado." };

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from('receipts').upload(fileName, file, { upsert: true });

  if (error) {
    console.error("Erro no upload:", error);
    return { error: "Erro ao enviar o comprovante." };
  }

  const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
  return { publicUrl };
}

export async function createTransaction(data: TransactionData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const installmentsCount = data.installments || 1;

  // SE FOR COMPRA PARCELADA (Mais de 1 parcela)
  if (installmentsCount > 1) {
    const installmentAmount = data.amount / installmentsCount; // Divide o valor total
    const transactionsToInsert = [];

    for (let i = 1; i <= installmentsCount; i++) {
      // Avança os meses corretamente de acordo com a parcela
      const installmentDate = new Date(data.date);
      installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

      transactionsToInsert.push({
        user_id: user.id,
        description: `${data.description} (${i}/${installmentsCount})`, // Ex: "iPhone (1/12)"
        amount: installmentAmount,
        type: data.type,
        category: data.category,
        created_at: installmentDate,
        wallet_id: data.wallet_id,
        receipt_url: data.receipt_url,
      });
    }

    // Insere todas as parcelas de uma vez só no banco!
    const { error } = await supabase.from("transactions").insert(transactionsToInsert);
    if (error) return { error: "Erro ao criar transações parceladas." };

  } else {
    // SE FOR COMPRA NORMAL (À vista)
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category,
      created_at: data.date,
      wallet_id: data.wallet_id,
      receipt_url: data.receipt_url,
    });
    if (error) return { error: "Erro ao criar transação." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateTransaction(data: TransactionData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  if (!data.id) return { error: "ID não fornecido." };

  const { error } = await supabase.from("transactions").update({
    description: data.description, amount: data.amount, type: data.type, category: data.category,
    created_at: data.date, wallet_id: data.wallet_id, receipt_url: data.receipt_url,
  }).eq("id", data.id).eq("user_id", user.id);

  if (error) return { error: "Erro ao atualizar transação." };
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: "Erro ao deletar transação." };
  revalidatePath("/");
  return { success: true };
}

export async function createTransfer(data: { description?: string; amount: number; date: Date; from_wallet_id: string; to_wallet_id: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };
  if (data.from_wallet_id === data.to_wallet_id) return { error: "As contas de origem e destino devem ser diferentes." };

  // 1. Cria a SAÍDA da conta de origem
  const expense = {
    user_id: user.id,
    description: data.description || "Transferência enviada",
    amount: data.amount,
    type: "expense",
    category: "Transferência",
    created_at: data.date,
    wallet_id: data.from_wallet_id,
  };

  // 2. Cria a ENTRADA na conta de destino
  const income = {
    user_id: user.id,
    description: data.description || "Transferência recebida",
    amount: data.amount,
    type: "income",
    category: "Transferência",
    created_at: data.date,
    wallet_id: data.to_wallet_id,
  };

  // 3. Salva as duas juntas no banco!
  const { error } = await supabase.from("transactions").insert([expense, income]);

  if (error) return { error: "Erro ao realizar transferência." };

  revalidatePath("/");
  return { success: true };
}

export async function bulkCreateTransactions(
  transactions: { description: string; amount: number; type: "income" | "expense"; date: Date; category: string }[],
  wallet_id: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  // Prepara a lista para o formato exato do banco de dados
  const transactionsToInsert = transactions.map(t => ({
    user_id: user.id,
    description: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category,
    created_at: t.date,
    wallet_id: wallet_id === "none" ? null : wallet_id,
  }));

  // O Supabase permite inserir um Array inteiro de uma vez só!
  const { error } = await supabase.from("transactions").insert(transactionsToInsert);

  if (error) {
    console.error("Erro no Bulk Insert:", error);
    return { error: "Erro ao importar as transações." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function toggleTransactionStatus(id: string, currentStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const newStatus = currentStatus === "paid" ? "pending" : "paid";

  const { error } = await supabase
    .from("transactions")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao atualizar status." };

  revalidatePath("/");
  return { success: true };
}