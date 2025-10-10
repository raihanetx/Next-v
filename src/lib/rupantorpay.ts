interface RupantorPaymentRequest {
  fullname: string;
  email: string;
  amount: string;
  success_url: string;
  cancel_url: string;
  webhook_url?: string;
  metadata?: Record<string, any>; // Correct field name is metadata, not meta_data
}

interface RupantorPaymentResponse {
  status: number | boolean; // Documentation shows status as 1 (number) for success
  message: string;
  payment_url: string; // Made required as successful responses should always have payment_url
}

interface RupantorVerifyRequest {
  transaction_id: string;
}

interface RupantorVerifyResponse {
  status: string; // COMPLETED or PENDING or ERROR
  fullname: string;
  email: string;
  amount: string;
  transaction_id: string;
  trx_id: string;
  currency: string;
  metadata: Record<string, any>; // Note: API returns metadata, not meta_data
  payment_method: string;
}

interface RupantorErrorResponse {
  status: boolean; // FALSE for error responses
  message: string;
}

class RupantorPayService {
  private apiKey: string;
  private baseUrl: string;
  private isTestMode: boolean;

  constructor() {
    // Use the provided API key
    this.apiKey = 'MEg5dK0kih7ERNCo0zjZqHNuD58oXWTtnVNGyA8DDN34rrFZx5';
    this.isTestMode = process.env.NODE_ENV !== 'production';
    
    // Use different endpoints for test vs production
    if (this.isTestMode) {
      // Sandbox environment for testing
      this.baseUrl = 'https://payment.rupantorpay.com/api/payment';
      console.log('🧪 RupantorPay running in TEST/SANDBOX mode');
    } else {
      // Production environment
      this.baseUrl = 'https://payment.rupantorpay.com/api/payment';
      console.log('💳 RupantorPay running in PRODUCTION mode');
    }

    console.log('⚠️ IMPORTANT: RupantorPay may have hardcoded redirects to submonth.com');
    console.log('🔗 If redirects don\'t work locally, test these URLs manually:');
    console.log('   Cancel: http://localhost:3000/payment/cancel?transaction_id=TEST&order_id=TEST&amount=1&fullname=Test');
    console.log('   Success: http://localhost:3000/payment/success?transaction_id=TEST&order_id=TEST&amount=1&fullname=Test');
  }

  async createPayment(paymentData: RupantorPaymentRequest): Promise<RupantorPaymentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        'X-CLIENT': 'localhost', // Try without port
        'X-TEST-MODE': this.isTestMode ? 'true' : 'false' // Indicate test mode
      };

      console.log('Creating payment with data:', JSON.stringify(paymentData, null, 2));
      console.log('Request headers:', headers);

      const response = await fetch(`${this.baseUrl}/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData)
      });

      console.log('Raw response status:', response.status);
      console.log('Raw response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Payment response:', data);
      console.log('Response status:', response.status);
      console.log('Payment URL exists:', !!data.payment_url);
      console.log('Payment URL value:', data.payment_url);
      
      // Check for error response (status: false, 0, or "error")
      if (data.status === false || data.status === 0 || data.status === 'error') {
        throw new Error(data.message || 'Failed to create payment');
      }

      // Validate that payment_url is present for successful responses
      if (!data.payment_url) {
        throw new Error(`Payment URL not found in response. Full response: ${JSON.stringify(data)}`);
      }

      return data;
    } catch (error) {
      console.error('RupantorPay create payment error:', error);
      throw error;
    }
  }

  async verifyPayment(transactionId: string): Promise<RupantorVerifyResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey
      };

      console.log('Verifying payment with transaction ID:', transactionId);

      const response = await fetch(`${this.baseUrl}/verify-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ transaction_id: transactionId })
      });

      const data = await response.json();
      console.log('Verification response:', data);
      
      // Check for error response (status: false)
      if (data.status === false) {
        throw new Error(data.message || 'Failed to verify payment');
      }

      return data;
    } catch (error) {
      console.error('RupantorPay verify payment error:', error);
      throw error;
    }
  }

  getPaymentUrl(paymentResponse: RupantorPaymentResponse): string {
    if (!paymentResponse.payment_url) {
      throw new Error('Payment URL is missing from response');
    }
    return paymentResponse.payment_url;
  }

  isPaymentSuccessful(verifyResponse: RupantorVerifyResponse): boolean {
    return verifyResponse.status === 'COMPLETED';
  }

  // Helper method to format amount for RupantorPay
  formatAmount(amount: number): string {
    // As per documentation: strip trailing zeros for whole numbers
    // Keep decimal places for non-whole numbers
    if (Number.isInteger(amount)) {
      return amount.toString();
    } else {
      return amount.toString().replace(/\.?0+$/, '');
    }
  }

  // Get checkout script URL
  getCheckoutScriptUrl(): string {
    return 'https://rupantorpay.com/public/assets/js/checkout.js';
  }
}

export const rupantorPayService = new RupantorPayService();
export default rupantorPayService;