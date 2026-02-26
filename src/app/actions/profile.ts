"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    email: user.email,
    name: user.user_metadata?.full_name || "",
    phone: user.user_metadata?.phone_number || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const newPassword = formData.get("password") as string;
  const avatarFile = formData.get("avatar") as File | null;

  // CORREÇÃO: Tipagem estrita no lugar de 'any'
  const updatePayload: { 
    data: { full_name: string; phone_number: string; avatar_url?: string }; 
    password?: string 
  } = {
    data: {
      full_name: name,
      phone_number: phone,
    }
  };

  // 1. LÓGICA DE UPLOAD DE IMAGEM
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    // CORREÇÃO: Removido o 'uploadData' que não estava sendo usado
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      return { error: "Erro ao enviar a foto de perfil." };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    updatePayload.data.avatar_url = publicUrl;
  }

  // 2. LÓGICA DE SENHA
  if (newPassword) {
    if (newPassword.length < 8) {
      return { error: "A nova senha precisa ter no mínimo 8 caracteres." };
    }
    updatePayload.password = newPassword;
  }

  // 3. ATUALIZA O USUÁRIO
  const { error } = await supabase.auth.updateUser(updatePayload);

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { error: "Erro ao atualizar seus dados. Tente novamente." };
  }

  revalidatePath("/profile");
  return { success: true };
}