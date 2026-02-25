"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) return [];
  return data;
}

export async function createCategory(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Usuário não autenticado" };

  if (!name || name.trim().length < 2) {
    return { error: "Nome muito curto." };
  }

  const { error } = await supabase.from("categories").insert({
    name: name.toUpperCase(), // Salvamos em maiúsculo para padronizar
    user_id: user.id
  });

  if (error) return { error: "Erro ao criar categoria." };

  revalidatePath("/categories"); // Atualiza a página de categorias
  revalidatePath("/"); // Atualiza a dashboard (caso impacte filtros)
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return { error: "Erro ao deletar." };

  revalidatePath("/categories");
  return { success: true };
}