import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, isSessionValid, updateSessionActivity } from './auth';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/admin/auth',
  '/api/products',
  '/api/categories',
  '/api/site-config',
  '/api/coupons',
  '/api/hot-deals',
  '/api/seed',
  '/api/seed-orders',
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/api/admin/orders',
  '/api/admin/orders/',
];

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  // Skip authentication for public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return null;
  }

  // Check if it's an admin route
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify session
    if (!isSessionValid(payload.sessionId)) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Update session activity
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    updateSessionActivity(payload.sessionId, userAgent, ip);

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-session-id', payload.sessionId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return null;
}

// CSRF protection middleware
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  const { pathname, method } = request.nextUrl;
  
  // Only apply CSRF protection to state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null;
  }

  // Skip CSRF for API routes that are public or have their own protection
  if (pathname.startsWith('/api/admin/auth') || 
      pathname.startsWith('/api/seed') ||
      !pathname.startsWith('/api/')) {
    return null;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const sessionToken = request.headers.get('x-session-token');

  if (!csrfToken || !sessionToken) {
    return NextResponse.json(
      { error: 'CSRF tokens required' },
      { status: 403 }
    );
  }

  // In a real implementation, you'd verify the CSRF token against the session
  // For now, we'll just check if they exist and have proper length
  if (csrfToken.length !== 64 || sessionToken.length !== 64) {
    return NextResponse.json(
      { error: 'Invalid CSRF tokens' },
      { status: 403 }
    );
  }

  return null;
}

// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const { pathname, method } = request.nextUrl;
  
  // Only apply rate limiting to sensitive endpoints
  if (!pathname.startsWith('/api/admin/auth')) {
    return null;
  }

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // In a real implementation, you'd check against a rate limit store
  // For now, we'll just add rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '5');
  response.headers.set('X-RateLimit-Remaining', '4');
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 15 * 60 * 1000).toISOString());

  return response;
}

// Security headers middleware
export function securityHeadersMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  );

  // Remove server information
  response.headers.set('Server', '');

  return response;
}