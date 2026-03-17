import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  // 1. AWAIT the cookies() function (Next.js 15 requirement)
  const cookieStore = await cookies();

  // 2. Create the Supabase client using the resolved cookieStore
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignora avisos internos do Next.js
          }
        },
      },
    }
  );

  // 3. Destrói a sessão no banco E apaga os cookies do navegador
  await supabase.auth.signOut();

  // 4. Limpa o cache
  revalidatePath('/', 'layout');

  // 5. Foge do cache e redireciona para o login
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });
}