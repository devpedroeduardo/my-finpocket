import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.getAll().some(cookie => 
    cookie.name.includes('sb-') || 
    cookie.name.includes('supabase') || 
    cookie.name.includes('auth')
  );

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isRegisterPage = request.nextUrl.pathname.startsWith('/register'); 


  if (!hasSession && !isLoginPage && !isRegisterPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}