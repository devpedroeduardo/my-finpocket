"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Interface atualizada com o campo 'date'
interface CreateTransactionData {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date; // <--- Novo campo obrigatório
}

export async function createTransaction(data: CreateTransactionData) {
  const supabase = await createClient();

  // 1. Segurança: Pegamos o usuário logado diretamente da sessão
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  // 2. Inserção: Usamos a data escolhida e o ID do usuário
  const { error } = await supabase.from("transactions").insert({
    description: data.description,
    amount: data.amount,
    type: data.type,
    category: data.category,
    created_at: data.date.toISOString(), // <--- Salva a data do calendário
    user_id: user.id, // Garante que a transação é do usuário logado
  });

  if (error) {
    console.error("Erro ao criar transação:", error);
    return { error: "Erro ao salvar no banco de dados." };
  }

  // 3. Atualiza a tela
  revalidatePath("/");
  return { success: true };
}

// --- Funções de Delete e Update (Mantidas iguais) ---

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    console.error("Erro ao deletar:", error);
    return { error: "Erro ao excluir transação." };
  }

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
    .eq("id", data.id);

  if (error) {
    console.error("Erro ao atualizar:", error);
    return { error: "Erro ao atualizar transação." };
  }

  revalidatePath("/");
  return { success: true };
}