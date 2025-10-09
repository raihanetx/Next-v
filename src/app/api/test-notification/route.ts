import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { orderId, newStatus } = await request.json();
    
    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: 'orderId and newStatus are required' },
        { status: 400 }
      );
    }

    // Update the order status in database
    const order = await db.order.update({
      where: { orderId },
      data: { status: newStatus },
      include: { items: true }
    });

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} status updated to ${newStatus}`,
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}