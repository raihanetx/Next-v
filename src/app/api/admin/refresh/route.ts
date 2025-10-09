import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyJWT, 
  refreshAccessToken, 
  isSessionValid,
  updateSessionActivity,
  cleanupExpiredSessions,
  cleanupRateLimitRecords
} from '@/lib/auth';

// Clean up expired data periodically
cleanupExpiredSessions();
cleanupRateLimitRecords();

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Get client IP and user agent for session tracking
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Verify refresh token
    const payload = await verifyJWT(refreshToken);
    
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Skip session validation for refresh flow since refresh token is already verified
    // Session will be validated when the new access token is used

    // Create new access token
    const newAccessToken = await refreshAccessToken(refreshToken);
    
    if (!newAccessToken) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 }
      );
    }

    // Update session activity
    updateSessionActivity(payload.sessionId, userAgent, ip);

    // Set new access token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully'
    });

    response.cookies.set('access_token', newAccessToken, {
      httpOnly: false, // Allow JavaScript to read this cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}