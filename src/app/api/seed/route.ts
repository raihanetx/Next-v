import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    console.log('🌱 Starting database seeding...');
    const result = await seedDatabase();
    console.log('✅ Database seeding completed successfully');
    return NextResponse.json({
      message: 'Database seeded successfully',
      ...result
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed database', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}