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
        { 
          status: false,
          message: 'Missing required fields: fullname, email, amount, orderId' 
        },
        { status: 400 }
      );
    }

    // Create payment request - Use multiple redirect strategies
    const baseUrl = 'http://localhost:3000';
    const paymentData = {
      fullname,
      email,
      amount: rupantorPayService.formatAmount(amount), // Use formatted string as per documentation
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/payment-cancelled`,
      webhook_url: `${baseUrl}/api/rupantorpay/webhook`,
      metadata: { // Correct field name is metadata, not meta_data
        orderId,
        customerInfo,
        items,
        timestamp: new Date().toISOString()
      }
    };

    console.log('🔗 Redirect URLs being sent to RupantorPay:');
    console.log('Success URL:', `${baseUrl}/payment-success`);
    console.log('Cancel URL:', `${baseUrl}/payment-cancelled`);
    console.log('Webhook URL:', `${baseUrl}/api/rupantorpay/webhook`);
    console.log('💡 Backup strategy: If RupantorPay still redirects to submonth.com, the redirect handlers will catch it.');

    const paymentResponse = await rupantorPayService.createPayment(paymentData);
    
    // Return the exact response format from RupantorPay API
    // Add both payment_url and paymentUrl for frontend compatibility
    const response = {
      status: paymentResponse.status, // Use the actual status from API (should be 1 for success)
      message: paymentResponse.message,
      payment_url: paymentResponse.payment_url,
      paymentUrl: paymentResponse.payment_url // Add camelCase version for frontend compatibility
    };
    
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Create payment error:', error);
    
    // Return error in the same format as RupantorPay API
    return NextResponse.json(
      { 
        status: false,
        message: error.message || 'Failed to create payment'
      },
      { status: 500 }
    );
  }
}