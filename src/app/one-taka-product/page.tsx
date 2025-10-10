'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShoppingCart, CreditCard, User, Mail, Shield } from 'lucide-react'
import Link from 'next/link'

export default function OneTakaProductPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    paymentMethod: 'bkash'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const generateOrderId = () => {
    return 'TEST' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  }

  const handlePayment = async () => {
    // Validation
    if (!formData.fullname.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const orderId = generateOrderId()
      
      // Create order data
      const newOrder = {
        id: orderId,
        customerName: formData.fullname,
        customerEmail: formData.email,
        amount: 1.00,
        currency: 'BDT',
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        items: [{
          name: 'Test Product - 1 Taka',
          price: 1.00,
          quantity: 1,
          category: 'Test'
        }],
        createdAt: new Date().toISOString()
      }

      setOrderData(newOrder)

      // Create payment request
      const paymentResponse = await fetch('/api/rupantorpay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          amount: 1.00,
          orderId: orderId,
          customerInfo: {
            name: formData.fullname,
            email: formData.email
          },
          items: newOrder.items
        }),
      })

      const paymentData = await paymentResponse.json()

      if (paymentData.status && paymentData.payment_url) {
        // Redirect to payment page
        window.location.href = paymentData.payment_url
      } else {
        setError(paymentData.message || 'Failed to create payment')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'An error occurred while processing your payment')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Test Product - 1 Taka
          </h1>
          <p className="text-gray-600">
            Perfect for testing payment integration with minimal risk
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">৳1</div>
                  <CreditCard className="w-12 h-12 text-blue-500 mx-auto" />
                </div>
              </div>
              <CardTitle className="text-xl">Test Payment Product</CardTitle>
              <CardDescription>
                A simple product for testing RupantorPay payment integration
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  ৳1.00 BDT
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="text-sm">Test Product</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Availability:</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  In Stock
                </Badge>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Secure Test Payment:</strong> This is a real payment transaction for 1 Bangladeshi Taka, perfect for testing the payment integration.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Checkout Information
              </CardTitle>
              <CardDescription>
                Enter your details to proceed with payment
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullname" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Full Name *
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullname}
                  onChange={(e) => handleInputChange('fullname', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="upay">uPay</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>৳1.00</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span>৳0.00</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-blue-600">৳1.00</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ৳1.00
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By clicking "Pay ৳1.00", you will be redirected to RupantorPay secure payment gateway
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">
                Your payment information is encrypted and secure
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Methods</h3>
              <p className="text-sm text-gray-600">
                Support for bKash, Nagad, Rocket, and more
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Instant Processing</h3>
              <p className="text-sm text-gray-600">
                Quick and efficient payment processing
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}