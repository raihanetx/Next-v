'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/helpers';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';

interface Order {
  id: string;
  orderId: string;
  customerInfo: any;
  paymentInfo: any;
  totals: any;
  status: string;
  coupon?: any;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailOrder, setEmailOrder] = useState<Order | null>(null);
  const [emailItems, setEmailItems] = useState<any[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { siteConfig } = useAppStore();
  
  const { 
    isAuthenticated, 
    user, 
    loading: authLoading, 
    error: authError, 
    login, 
    logout,
    makeAuthenticatedRequest 
  } = useAuth();

  // Fetch orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Add a small delay to ensure cookies are properly set
      const timer = setTimeout(() => {
        fetchOrders();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(password, rememberMe);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    } else {
      setPassword('');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/admin/orders');
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('🔧 BUTTON CLICKED - Updating order status:', { orderId, status });
      setError('');
      
      const response = await makeAuthenticatedRequest(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      console.log('🔧 Order update response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        console.log('✅ Order updated successfully');
        fetchOrders(); // Refresh orders
      } else {
        const errorData = await response.json();
        console.log('❌ Order update failed:', errorData);
        setError(errorData.error || 'Failed to update order');
      }
    } catch (err) {
      console.log('❌ Order update error:', err);
      setError('Failed to update order');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      setError('');
      const response = await makeAuthenticatedRequest(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete order');
      }
    } catch (err) {
      setError('Failed to delete order');
    }
  };

  const sendProductEmail = async (order: Order) => {
    try {
      setSendingEmail(true);
      setError('');
      
      // Get auth headers
      const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
      const sessionId = document.cookie.split('; ').find(row => row.startsWith('session_id='))?.split('=')[1];
      const csrfToken = typeof window !== 'undefined' ? (window as any).__csrfToken : null;
      
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Session-Token': sessionId,
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          items: emailItems
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Email sent successfully to ${result.customerEmail}!\n\n📧 Real email has been sent from useforpzx@gmail.com\n\nPlease check the customer's inbox to confirm delivery.`);
        setEmailDialogOpen(false);
        setEmailOrder(null);
        setEmailItems([]);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details || errorData.error || 'Unknown error';
        console.error('Email send error:', errorData);
        alert(`❌ Failed to send email: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error('Email send error:', err);
      alert(`❌ Error sending email: ${err.message || 'Network error'}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const openEmailDialog = (order: Order) => {
    setEmailOrder(order);
    // Initialize email items with empty access info
    const initialItems = order.items?.map((item: any) => ({
      name: item.name,
      accessInfo: {
        username: '',
        password: '',
        downloadLink: '',
        instructions: ''
      }
    })) || [];
    setEmailItems(initialItems);
    setEmailDialogOpen(true);
  };

  const updateEmailItem = (index: number, field: string, value: string) => {
    const updatedItems = [...emailItems];
    updatedItems[index] = {
      ...updatedItems[index],
      accessInfo: {
        ...updatedItems[index].accessInfo,
        [field]: value
      }
    };
    setEmailItems(updatedItems);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = async () => {
    await logout();
    setOrders([]);
    setError('');
  };

  const testEmailConfiguration = async () => {
    const testEmailInput = document.getElementById('testEmail') as HTMLInputElement;
    const testEmail = testEmailInput?.value;
    
    if (!testEmail) {
      alert('Please enter an email address to test');
      return;
    }

    try {
      // Get auth headers
      const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
      const sessionId = document.cookie.split('; ').find(row => row.startsWith('session_id='))?.split('=')[1];
      const csrfToken = typeof window !== 'undefined' ? (window as any).__csrfToken : null;
      
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Session-Token': sessionId,
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ testEmail })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const { results, summary } = result;
        let message = `🧪 Email Test Results for ${testEmail}:\n\n`;
        message += `Total configurations tested: ${summary.totalConfigs}\n`;
        message += `Successful: ${summary.successful}\n`;
        message += `Failed: ${summary.failed}\n\n`;
        
        results.forEach((r: any) => {
          if (r.status === 'success') {
            message += `✅ ${r.config}: SUCCESS\n`;
            message += `   Message ID: ${r.messageId}\n`;
          } else {
            message += `❌ ${r.config}: FAILED\n`;
            message += `   Error: ${r.error}\n`;
          }
        });
        
        if (summary.successful > 0) {
          message += `\n🎉 Your email configuration is working! Check your inbox.`;
        } else {
          message += `\n❌ All configurations failed. Please check your Gmail App Password setup.`;
        }
        
        alert(message);
      } else {
        alert(`❌ Email test failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Email test error:', err);
      alert(`❌ Error testing email: ${err.message || 'Network error'}`);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary-color)]"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <p className="text-center text-gray-600">Secure Authentication Portal</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me for 30 days
                </Label>
              </div>
              
              {(error || authError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error || authError}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Protected by enterprise-grade security</p>
              <p className="text-xs mt-1">JWT • CSRF Protection • Rate Limiting</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading spinner while fetching orders
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary-color)]"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                🔒 Secure Session Active
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>You are logged in with enterprise-grade security. This session will expire automatically for your protection.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Configuration Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                ✅ Email System: Configured with Gmail App Password
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p><strong>Current Status:</strong> Email system is properly configured</p>
                <p><strong>From:</strong> useforpzx@gmail.com</p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="email"
                    id="testEmail"
                    placeholder="Enter email to test"
                    className="px-3 py-1 border border-green-300 rounded text-sm"
                  />
                  <button
                    onClick={() => testEmailConfiguration()}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    🧪 Test Email
                  </button>
                </div>
                <p className="mt-2">Test your email configuration to verify real emails are being sent.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <p className="text-gray-600">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'Pending').length}
              </div>
              <p className="text-gray-600">Pending Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'Confirmed').length}
              </div>
              <p className="text-gray-600">Confirmed Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'Cancelled').length}
              </div>
              <p className="text-gray-600">Cancelled Orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{order.orderId}</td>
                        <td className="py-3 px-4">
                          {order.customerInfo?.name || 'N/A'}
                          <br />
                          <span className="text-sm text-gray-500">
                            {order.customerInfo?.email || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatPrice(
                            order.totals?.total || 0,
                            'BDT',
                            siteConfig?.usdToBdtRate
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {order.orderId}</DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4">
                                    {/* Customer Info */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Customer Information</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p><strong>Name:</strong> {selectedOrder.customerInfo?.name}</p>
                                        <p><strong>Email:</strong> {selectedOrder.customerInfo?.email}</p>
                                        <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone}</p>
                                        <p><strong>Address:</strong> {selectedOrder.customerInfo?.address}</p>
                                      </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Order Items</h4>
                                      <div className="space-y-2">
                                        {selectedOrder.items?.map((item, index) => (
                                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <p><strong>{item.name}</strong></p>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: {formatPrice(item.pricing?.price || 0, 'BDT', siteConfig?.usdToBdtRate)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Payment Information</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p><strong>Method:</strong> {selectedOrder.paymentInfo?.method}</p>
                                        <p><strong>Transaction ID:</strong> {selectedOrder.paymentInfo?.transactionId}</p>
                                        {selectedOrder.coupon && (
                                          <p><strong>Coupon:</strong> {selectedOrder.coupon.code} (-{selectedOrder.coupon.discountPercentage}%)</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Totals */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Order Totals</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p><strong>Subtotal:</strong> {formatPrice(selectedOrder.totals?.subtotal || 0, 'BDT', siteConfig?.usdToBdtRate)}</p>
                                        <p><strong>Discount:</strong> {formatPrice(selectedOrder.totals?.discount || 0, 'BDT', siteConfig?.usdToBdtRate)}</p>
                                        <p><strong>Total:</strong> {formatPrice(selectedOrder.totals?.total || 0, 'BDT', siteConfig?.usdToBdtRate)}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEmailDialog(order)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              📧 Send Email
                            </Button>

                            {order.status === 'Pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    alert('Button clicked!');
                                    try {
                                      // Get auth headers
                                      const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
                                      const sessionId = document.cookie.split('; ').find(row => row.startsWith('session_id='))?.split('=')[1];
                                      const csrfToken = typeof window !== 'undefined' ? (window as any).__csrfToken : null;
                                      
                                      const response = await fetch(`/api/admin/orders/${order.id}/update`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${accessToken}`,
                                          'X-Session-Token': sessionId,
                                          'X-CSRF-Token': csrfToken,
                                        },
                                        body: JSON.stringify({ status: 'Confirmed' })
                                      });
                                      
                                      if (response.ok) {
                                        alert('Order updated!');
                                        fetchOrders();
                                      } else {
                                        alert('Failed: ' + await response.text());
                                      }
                                    } catch (error) {
                                      alert('Error: ' + error);
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    alert('Cancel clicked!');
                                    try {
                                      // Get auth headers
                                      const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
                                      const sessionId = document.cookie.split('; ').find(row => row.startsWith('session_id='))?.split('=')[1];
                                      const csrfToken = typeof window !== 'undefined' ? (window as any).__csrfToken : null;
                                      
                                      const response = await fetch(`/api/admin/orders/${order.id}/update`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${accessToken}`,
                                          'X-Session-Token': sessionId,
                                          'X-CSRF-Token': csrfToken,
                                        },
                                        body: JSON.stringify({ status: 'Cancelled' })
                                      });
                                      
                                      if (response.ok) {
                                        alert('Order cancelled!');
                                        fetchOrders();
                                      } else {
                                        alert('Failed: ' + await response.text());
                                      }
                                    } catch (error) {
                                      alert('Error: ' + error);
                                    }
                                  }}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}

                            {(order.status === 'Confirmed' || order.status === 'Cancelled') && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this order? This action cannot be undone and will be logged.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteOrder(order.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📧 Send Product Access Email - {emailOrder?.orderId}</DialogTitle>
          </DialogHeader>
          
          {emailOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">👤 Customer Information</h4>
                <p><strong>Name:</strong> {emailOrder.customerInfo?.name}</p>
                <p><strong>Email:</strong> {emailOrder.customerInfo?.email}</p>
              </div>

              {/* Product Access Information */}
              <div>
                <h4 className="font-semibold mb-4">🔐 Product Access Information</h4>
                <div className="space-y-4">
                  {emailItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <h5 className="font-medium mb-3">{item.name}</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`username-${index}`}>Username (Optional)</Label>
                          <Input
                            id={`username-${index}`}
                            placeholder="Enter username"
                            value={item.accessInfo.username}
                            onChange={(e) => updateEmailItem(index, 'username', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`password-${index}`}>Password (Optional)</Label>
                          <Input
                            id={`password-${index}`}
                            type="password"
                            placeholder="Enter password"
                            value={item.accessInfo.password}
                            onChange={(e) => updateEmailItem(index, 'password', e.target.value)}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor={`download-${index}`}>Download Link (Optional)</Label>
                          <Input
                            id={`download-${index}`}
                            placeholder="https://example.com/download"
                            value={item.accessInfo.downloadLink}
                            onChange={(e) => updateEmailItem(index, 'downloadLink', e.target.value)}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor={`instructions-${index}`}>Instructions (Optional)</Label>
                          <Textarea
                            id={`instructions-${index}`}
                            placeholder="Enter setup instructions or any additional information..."
                            value={item.accessInfo.instructions}
                            onChange={(e) => updateEmailItem(index, 'instructions', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailDialogOpen(false);
                    setEmailOrder(null);
                    setEmailItems([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => sendProductEmail(emailOrder)}
                  disabled={sendingEmail}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sendingEmail ? '📧 Sending...' : '📧 Send Email'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}