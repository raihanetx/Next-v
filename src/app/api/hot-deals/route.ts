import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const hotDeals = await db.hotDeal.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(hotDeals);
  } catch (error) {
    console.error('Error fetching hot deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hot deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, customTitle } = body;

    const hotDeal = await db.hotDeal.create({
      data: {
        productId,
        customTitle
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(hotDeal, { status: 201 });
  } catch (error) {
    console.error('Error creating hot deal:', error);
    return NextResponse.json(
      { error: 'Failed to create hot deal' },
      { status: 500 }
    );
  }
}