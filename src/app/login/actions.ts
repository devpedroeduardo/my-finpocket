"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Pega os dados do formulário
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string; // Vamos salvar o nome também?

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    return { error: "Erro ao cadastrar: " + error.message };
  }

  // Se o Supabase exigir confirmação de e-mail, avise o usuário
  // Por padrão em dev, ele costuma logar direto.
  
  // Vamos criar automaticamente a "Conta" (Account) para esse usuário novo
  // para o app não quebrar depois
  if (data.user) {
    await supabase.from("accounts").insert({
      name: "Carteira Principal",
      user_id: data.user.id,
      balance: 0
    });
  }

  revalidatePath("/", "layout");
  redirect("/");
}