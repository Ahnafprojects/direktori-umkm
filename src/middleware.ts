// Middleware temporary disabled - focusing on routing issue
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Just pass through for now
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}