"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface TransactionData {
  id?: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
  wallet_id?: string;
  receipt_url?: string;
  installments?: number;
  status?: "paid" | "pending";
}

// ============================================================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// ============================================================================

const transactionSchema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres.").max(100, "Descrição muito longa."),
  amount: z.number().positive("O valor deve ser estritamente maior que zero."),
  
  type: z.enum(["income", "expense"], { 
    message: "O tipo deve ser receita ou despesa." 
  }),
  
  category: z.string().min(1, "A categoria é obrigatória."),
  date: z.coerce.date(), 
  wallet_id: z.string().optional(),
  receipt_url: z.string().url("URL do recibo inválida.").optional().or(z.literal("")),
  installments: z.number().int().positive().optional(),
  status: z.enum(["paid", "pending"]).optional(),
});

const transferSchema = z.object({
  description: z.string().max(100).optional(),
  amount: z.number().positive("O valor da transferência deve ser maior que zero."),
  date: z.coerce.date(),
  from_wallet_id: z.string().min(1, "Conta de origem é obrigatória."),
  to_wallet_id: z.string().min(1, "Conta de destino é obrigatória."),
});


export async function uploadReceipt(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const file = formData.get("file") as File;
  if (!file) return { error: "Nenhum arquivo encontrado." };

  if (file.size > 5 * 1024 * 1024) return { error: "O arquivo deve ter no máximo 5MB." };

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

export async function createTransaction(data: unknown) { 
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const validated = transactionSchema.safeParse(data);
  
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const safeData = validated.data;

  const transactionToSave = {
    user_id: user.id,
    description: safeData.description,
    amount: safeData.amount,
    type: safeData.type,
    category: safeData.category,
    created_at: safeData.date,
    wallet_id: safeData.wallet_id === "none" ? null : safeData.wallet_id,
    receipt_url: safeData.receipt_url,
    status: safeData.status || "paid",
  };

  const { error } = await supabase.from("transactions").insert([transactionToSave]);

  if (error) {
    console.error("Erro ao criar transação:", error);
    return { error: "Erro interno ao salvar a transação." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateTransaction(data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  
  if (!data || typeof data !== 'object' || !('id' in data)) {
    return { error: "ID não fornecido." };
  }

  const validated = transactionSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };
  
  const safeData = validated.data;

  const { error } = await supabase.from("transactions").update({
    description: safeData.description, 
    amount: safeData.amount, 
    type: safeData.type, 
    category: safeData.category,
    created_at: safeData.date, 
    wallet_id: safeData.wallet_id === "none" ? null : safeData.wallet_id, 
    receipt_url: safeData.receipt_url,
  }).eq("id", data.id as string).eq("user_id", user.id);

  if (error) return { error: "Erro ao atualizar transação." };
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  
  if (error) return { error: "Erro ao deletar transação." };
  revalidatePath("/");
  return { success: true };
}

export async function createTransfer(data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const validated = transferSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };
  
  const safeData = validated.data;

  if (safeData.from_wallet_id === safeData.to_wallet_id) {
    return { error: "As contas de origem e destino devem ser diferentes." };
  }

  const expense = {
    user_id: user.id,
    description: safeData.description || "Transferência enviada",
    amount: safeData.amount,
    type: "expense",
    category: "Transferência",
    created_at: safeData.date,
    wallet_id: safeData.from_wallet_id,
  };

  const income = {
    user_id: user.id,
    description: safeData.description || "Transferência recebida",
    amount: safeData.amount,
    type: "income",
    category: "Transferência",
    created_at: safeData.date,
    wallet_id: safeData.to_wallet_id,
  };

  const { error } = await supabase.from("transactions").insert([expense, income]);

  if (error) return { error: "Erro ao realizar transferência." };

  revalidatePath("/");
  return { success: true };
}

export async function bulkCreateTransactions(transactions: unknown[], wallet_id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const arraySchema = z.array(transactionSchema);
  const validatedArray = arraySchema.safeParse(transactions);

  if (!validatedArray.success) {
    return { error: "O arquivo contém transações com dados inválidos (ex: valores negativos)." };
  }

  const transactionsToInsert = validatedArray.data.map(t => ({
    user_id: user.id,
    description: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category,
    created_at: t.date,
    wallet_id: wallet_id === "none" ? null : wallet_id,
  }));

  const { error } = await supabase.from("transactions").insert(transactionsToInsert);

  if (error) {
    console.error("Erro no Bulk Insert:", error);
    return { error: "Erro interno ao importar as transações." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function toggleTransactionStatus(id: string, currentStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  if (!id || typeof id !== "string") return { error: "ID inválido." };

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