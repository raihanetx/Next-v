import { NextRequest, NextResponse } from 'next/server';
import rupantorPayService from '@/lib/rupantorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fullname, 
      email, 
      amount, 
      orderId, 
      customerInfo, 
      items 
    } = body;

    if (!fullname || !email || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: fullname, email, amount, orderId' },
        { status: 400 }
      );
    }

    // Create payment request
    const paymentData = {
      fullname,
      email,
      amount: rupantorPayService.formatAmount(amount),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rupantorpay/webhook`,
      meta_data: { // Changed back to meta_data as per documentation table
        orderId,
        customerInfo,
        items,
        timestamp: new Date().toISOString()
      }
    };

    const paymentResponse = await rupantorPayService.createPayment(paymentData);
    
    return NextResponse.json({
      success: true,
      payment_url: paymentResponse.payment_url,
      message: paymentResponse.message
    });

  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}