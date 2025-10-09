import { NextRequest, NextResponse } from 'next/server';
import rupantorPayService from '@/lib/rupantorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Missing required field: transaction_id' },
        { status: 400 }
      );
    }

    const verificationResponse = await rupantorPayService.verifyPayment(transaction_id);
    
    return NextResponse.json({
      success: true,
      data: verificationResponse,
      isCompleted: rupantorPayService.isPaymentSuccessful(verificationResponse)
    });

  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}