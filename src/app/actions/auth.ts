"use server";

import { createClient } from "@/lib/supabase/server"; // Importante: aqui é o SERVER, não o client
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();
  
  // 1. Mata a sessão no banco e destrói os cookies HTTP-only
  await supabase.auth.signOut();

  // 2. Limpa a memória RAM do Next.js para ele esquecer que você estava logado
  revalidatePath('/', 'layout');

  // 3. Te joga pro login (pelo lado do servidor, o middleware não vai te barrar agora)
  redirect("/login");
}