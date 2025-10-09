import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerInfo, paymentInfo, items, totals, coupon, status } = body;

    if (!orderId || !customerInfo || !paymentInfo || !items || !totals) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        orderId,
        customerInfo,
        paymentInfo,
        totals,
        status: status || 'Pending',
        coupon: coupon || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            pricing: item.pricing
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIds = searchParams.get('ids');

    let whereClause: any = {};
    if (orderIds) {
      const idsArray = JSON.parse(orderIds);
      whereClause.orderId = {
        in: idsArray
      };
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
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