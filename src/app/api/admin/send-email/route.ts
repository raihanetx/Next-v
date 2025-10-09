import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, isSessionValid, updateSessionActivity } from '@/lib/auth';
import { emailService } from '@/lib/email';

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

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticate(request);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { orderId, items } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await db.order.findUnique({
      where: { orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Extract customer info
    const customerInfo = order.customerInfo as any;
    const customerName = customerInfo?.name || 'Valued Customer';
    const customerEmail = customerInfo?.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
      );
    }

    // Prepare order items with access information
    const orderItemsWithAccess = order.items.map((item, index) => {
      const baseItem = {
        name: item.name,
        quantity: item.quantity,
      };

      // Add access info if provided in the request
      if (items && items[index]) {
        return {
          ...baseItem,
          accessInfo: items[index].accessInfo
        };
      }

      return baseItem;
    });

    // Send email
    const emailSent = await emailService.sendProductAccessEmail({
      customerName,
      customerEmail,
      orderItems: orderItemsWithAccess,
      orderId: order.orderId,
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        orderId: order.orderId,
        customerEmail,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email. Please check email configuration and try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}