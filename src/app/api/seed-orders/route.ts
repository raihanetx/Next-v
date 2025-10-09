import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if orders already exist
    const existingOrders = await db.order.count();
    if (existingOrders > 0) {
      return NextResponse.json({ message: 'Orders already exist' });
    }

    // Get some products for sample orders
    const products = await db.product.findMany({ take: 5 });
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 400 });
    }

    // Create sample orders
    const sampleOrders = [
      {
        orderId: 'ORD-001',
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+8801234567890',
          address: '123 Main St, Dhaka, Bangladesh'
        },
        paymentInfo: {
          method: 'Bkash',
          transactionId: 'TXN123456789'
        },
        totals: {
          subtotal: 1000,
          discount: 100,
          finalTotal: 900
        },
        status: 'Pending',
        items: {
          create: [
            {
              name: products[0]?.name || 'Sample Product',
              quantity: 1,
              pricing: {
                duration: '1 Month',
                price: 1000
              },
              product: {
                connect: { id: products[0]?.id }
              }
            }
          ]
        }
      },
      {
        orderId: 'ORD-002',
        customerInfo: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+8800987654321',
          address: '456 Oak Ave, Chittagong, Bangladesh'
        },
        paymentInfo: {
          method: 'Nagad',
          transactionId: 'TXN987654321'
        },
        totals: {
          subtotal: 1500,
          discount: 0,
          finalTotal: 1500
        },
        status: 'Confirmed',
        items: {
          create: [
            {
              name: products[1]?.name || 'Sample Product 2',
              quantity: 2,
              pricing: {
                duration: '3 Months',
                price: 750
              },
              product: {
                connect: { id: products[1]?.id }
              }
            }
          ]
        }
      },
      {
        orderId: 'ORD-003',
        customerInfo: {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+8801122334455',
          address: '789 Pine Rd, Sylhet, Bangladesh'
        },
        paymentInfo: {
          method: 'Rocket',
          transactionId: 'TXN555666777'
        },
        totals: {
          subtotal: 800,
          discount: 80,
          finalTotal: 720
        },
        status: 'Cancelled',
        coupon: {
          code: 'SAVE10',
          discountPercentage: 10
        },
        items: {
          create: [
            {
              name: products[2]?.name || 'Sample Product 3',
              quantity: 1,
              pricing: {
                duration: '1 Month',
                price: 800
              },
              product: {
                connect: { id: products[2]?.id }
              }
            }
          ]
        }
      }
    ];

    // Insert sample orders
    for (const orderData of sampleOrders) {
      await db.order.create({
        data: orderData
      });
    }

    return NextResponse.json({ 
      message: 'Sample orders created successfully',
      count: sampleOrders.length 
    });
  } catch (error) {
    console.error('Error seeding orders:', error);
    return NextResponse.json(
      { error: 'Failed to seed orders' },
      { status: 500 }
    );
  }
}