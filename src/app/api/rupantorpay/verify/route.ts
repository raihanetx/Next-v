import { NextRequest, NextResponse } from 'next/server';
import rupantorPayService from '@/lib/rupantorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { 
          status: false,
          message: 'Missing required field: transaction_id' 
        },
        { status: 400 }
      );
    }

    const verificationResponse = await rupantorPayService.verifyPayment(transaction_id);
    
    // Return the exact response format from RupantorPay API
    return NextResponse.json(verificationResponse);

  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { 
        status: false,
        message: error.message || 'Failed to verify payment'
      },
      { status: 500 }
    );
  }
}