import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Procura o "crachá" do Supabase nos cookies do navegador
  const hasSession = request.cookies.getAll().some(cookie => cookie.name.includes('-auth-token'));

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isRegisterPage = request.nextUrl.pathname.startsWith('/register');

  // 2. O LEÃO DE CHÁCARA: Não tem crachá e tentou entrar no Dashboard? Chuta pro Login!
  if (!hasSession && !isLoginPage && !isRegisterPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. OTIMIZAÇÃO: Já tem crachá e tentou ir pra tela de Login? Manda de volta pro Dashboard!
  if (hasSession && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configuração para o Middleware não bloquear imagens, ícones e arquivos do sistema
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}