interface RupantorPaymentRequest {
  fullname: string;
  email: string;
  amount: string;
  success_url: string;
  cancel_url: string;
  webhook_url?: string;
  meta_data?: Record<string, any>; // Changed back to meta_data as per documentation table
}

interface RupantorPaymentResponse {
  status: boolean | number; // Documentation shows status as 1 (number) for success
  message: string;
  payment_url?: string;
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
    // RupantorPay uses the same URL for both sandbox and production
    // The behavior is determined by the API key
    this.baseUrl = 'https://payment.rupantorpay.com/api/payment';
  }

  async createPayment(paymentData: RupantorPaymentRequest): Promise<RupantorPaymentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        'X-CLIENT': 'localhost' // In production, this should be the actual domain
      };

      console.log('Creating payment with data:', JSON.stringify(paymentData, null, 2));
      console.log('Request headers:', headers);

      const response = await fetch(`${this.baseUrl}/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      console.log('Payment response:', data);
      
      // Check for error response (status: false)
      if (data.status === false) {
        throw new Error(data.message || 'Failed to create payment');
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

  getPaymentUrl(paymentResponse: RupantorPaymentResponse): string | null {
    return paymentResponse.payment_url || null;
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