"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export async function login(formData: FormData) {
  const supabase = await createClient();

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

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (password.length < 8) {
    return { error: "A senha precisa ter no mínimo 8 caracteres." };
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
  if (!strongPasswordRegex.test(password)) {
    return { error: "A senha deve ter letras maiúsculas, minúsculas, números e símbolos (!@#$)." };
  }

  const firstName = name.split(" ")[0].toLowerCase();
  if (password.toLowerCase().includes(firstName)) {
    return { error: "Por segurança, a senha não pode conter seu nome." };
  }


  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone_number: phone,
      },
    },
  });

  if (error) {
    console.error("Erro Auth:", error);
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Erro ao criar usuário." };
  }

  try {
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: accountError } = await supabaseAdmin.from("accounts").insert({
      name: "Carteira Principal",
      user_id: data.user.id,
      balance: 0
    });

    if (accountError) {
      console.error("Erro ao criar carteira:", accountError);
    }
  } catch (err) {
    console.error("Erro admin:", err);
  }

  await supabase.auth.signOut();
  redirect("/login?registered=true");
}