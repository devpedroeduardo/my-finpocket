import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// No Next.js 16, a função se chama 'proxy' em vez de 'middleware'
export function proxy(request: NextRequest) {
  // 1. Busca o crachá de autenticação
  const hasSession = request.cookies.getAll().some(cookie => 
    cookie.name.includes('sb-') || 
    cookie.name.includes('supabase') || 
    cookie.name.includes('auth')
  );

  // 2. Define as rotas que TÊM PASSE LIVRE
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isRegisterPage = request.nextUrl.pathname.startsWith('/register'); 

  // 3. Se NÃO tem crachá e tentou ir pra uma rota fechada, chuta pro Login
  if (!hasSession && !isLoginPage && !isRegisterPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Se JÁ TEM crachá e tentou ir pro login/registro, manda pro Dashboard
  if (hasSession && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 5. Configuração para liberar imagens, ícones e os arquivos do PWA offline
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}