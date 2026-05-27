import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/join-as-celebrity',
  '/join-as-celebrity/apply',
  '/join-as-celebrity/sign-in',
  '/terms',
  '/privacy',
])

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith('/reset-password/')) return true
  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isLoggedIn = req.cookies.has('twinity_auth')

  // Logged-in user visiting login page → send to studio
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/studio', req.url))
  }

  // Guest visiting a protected page → send to login
  if (!isPublic(pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|logo|images|placeholders|celebs|icons).*)',],
}
