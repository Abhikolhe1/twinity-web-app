import { NextRequest, NextResponse } from 'next/server'

// Routes that do NOT require authentication
const PUBLIC_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
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

  // Redirect bare root to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Logged-in user visiting auth pages → send to celebrities
  if (isPublic(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL('/celebrities', req.url))
  }

  // Guest visiting a protected page → send to login
  if (!isPublic(pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|logo|celebs|icons).*)',],
}
