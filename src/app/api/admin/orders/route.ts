import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, isSessionValid, updateSessionActivity } from '@/lib/auth';

// Authentication middleware
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Authorization header required', status: 401 };
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token);
  
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  // Verify session
  if (!isSessionValid(payload.sessionId)) {
    return { error: 'Session expired', status: 401 };
  }

  // Update session activity
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  updateSessionActivity(payload.sessionId, userAgent, ip);

  return { user: payload };
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticate(request);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Get all orders with their items
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}