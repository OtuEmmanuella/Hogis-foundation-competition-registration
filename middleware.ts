// middleware.ts (in your project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin session/token
    const adminToken = request.cookies.get('admin-token')?.value;
    
    // If no token and not on login page, redirect to login
    if (!adminToken && !request.nextUrl.pathname.includes('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // If token exists but is invalid (you can add validation logic here)
    // For now, we'll trust the cookie exists
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};