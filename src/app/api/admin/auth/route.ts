import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  verifyPassword, 
  createAuthTokens, 
  isRateLimited, 
  recordFailedAttempt, 
  clearFailedAttempts,
  generateCSRFToken,
  cleanupExpiredSessions,
  cleanupRateLimitRecords
} from '@/lib/auth';

// Clean up expired data periodically
cleanupExpiredSessions();
cleanupRateLimitRecords();

export async function POST(request: NextRequest) {
  try {
    const { password, rememberMe = false } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Check rate limiting
    const rateLimitResult = isRateLimited(ip);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { 
          error: 'Too many failed attempts. Please try again later.',
          lockUntil: rateLimitResult.lockUntil,
          remainingAttempts: rateLimitResult.remainingAttempts
        },
        { status: 429 }
      );
    }

    // Get admin configuration
    const siteConfig = await db.siteConfig.findFirst();
    
    if (!siteConfig) {
      return NextResponse.json(
        { error: 'Site configuration not found' },
        { status: 500 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, siteConfig.adminPassword);
    
    if (!isPasswordValid) {
      // Record failed attempt
      recordFailedAttempt(ip);
      
      return NextResponse.json(
        { 
          error: 'Invalid password',
          remainingAttempts: rateLimitResult.remainingAttempts - 1
        },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(ip);

    // Create auth tokens
    const tokens = await createAuthTokens('admin', 'admin@site.com', rememberMe);
    
    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Set secure HTTP-only cookies
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: 'admin',
        email: 'admin@site.com',
        role: 'admin'
      },
      csrfToken,
      sessionId: tokens.sessionId,
    });

    // Set access token cookie (readable by JavaScript for client-side API calls)
    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: false, // Allow JavaScript to read this cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 15 * 60, // 30 days or 15 minutes
      path: '/',
    });

    // Set refresh token cookie
    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Set session ID cookie (readable by JavaScript for client-side API calls)
    response.cookies.set('session_id', tokens.sessionId, {
      httpOnly: false, // Allow JavaScript to read this cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Set CSRF token cookie (not httpOnly so JavaScript can read it)
    response.cookies.set('csrf_token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Log successful login (in production, use proper logging)
    console.log(`Admin login successful from IP: ${ip}, User-Agent: ${userAgent}`);

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Logout endpoint
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear all auth cookies
    response.cookies.set('access_token', '', {
      httpOnly: false, // Match the login setting
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('session_id', '', {
      httpOnly: false, // Match the login setting
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('csrf_token', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}