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
    avatar_url: user.user_metadata?.avatar_url || "", // <--- NOVO: Puxa a foto
  };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const newPassword = formData.get("password") as string;
  const avatarFile = formData.get("avatar") as File | null; // <--- NOVO: Pega o arquivo

  // Prepara o objeto de atualização
  const updatePayload: any = {
    data: {
      full_name: name,
      phone_number: phone,
    }
  };

  // 1. LÓGICA DE UPLOAD DE IMAGEM
  if (avatarFile && avatarFile.size > 0) {
    // Cria um nome único para o arquivo (ex: id_do_usuario-12345678.jpg)
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      return { error: "Erro ao enviar a foto de perfil." };
    }

    // Pega a URL pública da imagem recém-upada
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    updatePayload.data.avatar_url = publicUrl; // Salva a URL no payload
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