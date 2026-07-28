import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req) {
  // Retrieve NextAuth token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = req.nextUrl;

  // Protect /checkout route
  if (pathname.startsWith('/checkout')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', '/checkout');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/catalog', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout/:path*', '/admin/:path*', '/api/admin/:path*'],
};