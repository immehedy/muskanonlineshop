import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_ROUTES = ['/admin', '/dashboard']

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔥 Middleware running for:', pathname)
  
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  if (isAdminRoute(pathname)) {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      console.log('❌ No token, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const user = await verifyToken(token)
    if (!user) {
      console.log('❌ Invalid token, redirecting to login')
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
    
    console.log('✅ Server-side access granted')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}