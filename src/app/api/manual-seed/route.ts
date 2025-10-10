import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔧 Manual seed trigger - Testing database connection...');
    
    // Test database connection
    const response = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Manual seed completed:', result);
      return NextResponse.json({
        success: true,
        message: 'Database seeded successfully',
        result
      });
    } else {
      const error = await response.json();
      console.error('❌ Manual seed failed:', error);
      return NextResponse.json({
        success: false,
        error: error.error || 'Seeding failed',
        details: error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Manual seed error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger seeding',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}