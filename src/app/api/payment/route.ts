import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get all payment parameters
  const transactionId = searchParams.get('transaction_id');
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const status = searchParams.get('status');
  const fullname = searchParams.get('fullname');
  const email = searchParams.get('email');
  const paymentMethod = searchParams.get('payment_method');
  
  console.log('🔗 Payment redirect received:', {
    transactionId,
    orderId,
    amount,
    status,
    fullname,
    email,
    paymentMethod
  });

  // Determine if this is success or cancel based on status or other parameters
  const isSuccessful = status === 'COMPLETED' || status === 'SUCCESS' || !searchParams.has('cancel');
  
  // Build redirect URL with all parameters
  const baseUrl = 'http://localhost:3000';
  const redirectPath = isSuccessful ? '/payment/success' : '/payment/cancel';
  
  const params = new URLSearchParams();
  if (transactionId) params.set('transaction_id', transactionId);
  if (orderId) params.set('order_id', orderId);
  if (amount) params.set('amount', amount);
  if (status) params.set('status', status);
  if (fullname) params.set('fullname', fullname);
  if (email) params.set('email', email);
  if (paymentMethod) params.set('payment_method', paymentMethod);
  
  const redirectUrl = `${baseUrl}${redirectPath}?${params.toString()}`;
  
  console.log('🔄 Redirecting to:', redirectUrl);
  
  // Redirect to the appropriate page
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  // Handle POST requests as well
  return GET(request);
}