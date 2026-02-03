import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Atualiza o cookie da sessão do Supabase
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone)
     * - /login (página de login, senão entra em loop infinito)
     * - /auth (rotas de callback de autenticação)
     */
    "/((?!_next/static|_next/image|favicon.ico|login|auth).*)",
  ],
};