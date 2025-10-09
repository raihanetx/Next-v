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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log('🔧 PATCH request received for order:', params.orderId);
    
    // Authenticate request
    const auth = await authenticate(request);
    if (auth.error) {
      console.log('❌ Authentication failed:', auth.error);
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { orderId } = params;
    const { status } = await request.json();

    console.log('🔧 Order update request:', { orderId, status });

    if (!status) {
      console.log('❌ Status is required');
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    console.log('🔧 Updating order in database...');
    
    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('✅ Order updated successfully:', updatedOrder.id);

    // Log the action (in production, use proper logging)
    console.log(`Order ${orderId} status updated to ${status} by admin ${auth.user.userId}`);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Authenticate request
    const auth = await authenticate(request);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { orderId } = params;

    // Delete the order (this will also delete related order items due to cascade)
    await db.order.delete({
      where: { id: orderId }
    });

    // Log the action (in production, use proper logging)
    console.log(`Order ${orderId} deleted by admin ${auth.user.userId}`);

    return NextResponse.json(
      { message: 'Order deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}