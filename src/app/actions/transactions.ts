"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface TransactionData {
  amount: number;
  description: string;
  type: "income" | "expense";
  category: string;
}

export async function createTransaction(formData: TransactionData) {
  const supabase = await createClient();

  // 1. Buscamos a conta E o dono dela (user_id)
  // O erro acontecia porque pegávamos só o ID da conta e usávamos como user_id
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, user_id") // <--- Importante: Buscar o user_id também
    .limit(1);

  const account = accounts?.[0];

  if (!account) {
    return { error: "Nenhuma conta encontrada. Crie uma conta no banco primeiro." };
  }

  // 2. Inserir na tabela de Transações
  const { error: transactionError } = await supabase.from("transactions").insert({
    description: formData.description,
    amount: formData.amount,
    type: formData.type,
    category: formData.category, 
    account_id: account.id,      // ID da Conta
    user_id: account.user_id,    // ID do Usuário (Agora correto!)
  });

  if (transactionError) {
    console.error("Erro ao salvar no Supabase:", transactionError);
    return { error: "Erro ao salvar: " + transactionError.message };
  }

  // 3. Revalidar a tela para atualizar o saldo instantaneamente
  revalidatePath("/");
  
  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();

  // 1. Deleta a transação pelo ID
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    console.error("Erro ao deletar:", error);
    return { error: "Erro ao excluir transação." };
  }

  // 2. Atualiza a tela (recalcula saldo, gráficos, tudo)
  revalidatePath("/");

  return { success: true };
}

interface UpdateTransactionData {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export async function updateTransaction(data: UpdateTransactionData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("transactions")
    .update({
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category,
    })
    .eq("id", data.id); // <--- O segredo: altera SÓ onde o ID bate

  if (error) {
    console.error("Erro ao atualizar:", error);
    return { error: "Erro ao atualizar transação." };
  }

  revalidatePath("/");
  return { success: true };
}