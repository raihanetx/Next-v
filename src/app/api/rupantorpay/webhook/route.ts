import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import rupantorPayService from '@/lib/rupantorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transactionID, // Note: capital ID in webhook parameters
      paymentMethod,
      paymentAmount,
      paymentFee,
      currency,
      status
    } = body;

    console.log('RupantorPay webhook received:', body);

    if (!transactionID || !status) {
      return NextResponse.json(
        { error: 'Missing required webhook data' },
        { status: 400 }
      );
    }

    // Verify the payment with RupantorPay API
    const verifyResponse = await rupantorPayService.verifyPayment(transactionID);
    
    if (!rupantorPayService.isPaymentSuccessful(verifyResponse)) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Extract metadata from verification response
    const { orderId, customerInfo, items } = verifyResponse.metadata || {};

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID not found in payment metadata' },
        { status: 400 }
      );
    }

    // Create order in database
    const order = await db.order.create({
      data: {
        orderId,
        customerInfo: customerInfo || {
          name: verifyResponse.fullname,
          email: verifyResponse.email,
          phone: verifyResponse.metadata?.phone || ''
        },
        paymentInfo: {
          method: verifyResponse.payment_method,
          trx_id: verifyResponse.trx_id,
          transactionId: transactionID,
          amount: paymentAmount,
          fee: paymentFee,
          currency: currency,
          status: status
        },
        totals: {
          subtotal: parseFloat(paymentAmount) - parseFloat(paymentFee || '0'),
          discount: 0,
          total: parseFloat(paymentAmount)
        },
        status: status === 'COMPLETED' ? 'Confirmed' : 'Pending',
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.productId,
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

    console.log('Order created successfully:', order.orderId);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderId: order.orderId
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}