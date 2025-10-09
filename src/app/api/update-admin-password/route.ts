import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Hash the default admin password
    const defaultPassword = 'admin123';
    const hashedPassword = await hashPassword(defaultPassword);

    // Update the admin password in database
    const siteConfig = await db.siteConfig.findFirst();
    
    if (siteConfig) {
      await db.siteConfig.update({
        where: { id: siteConfig.id },
        data: { adminPassword: hashedPassword }
      });
    } else {
      // Create site config if it doesn't exist
      await db.siteConfig.create({
        data: {
          adminPassword: hashedPassword,
          heroBanner: {},
          contactInfo: {},
          usdToBdtRate: 110,
          heroSliderInterval: 5000,
          hotDealsSpeed: 40,
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Admin password updated successfully',
      note: 'Default password is: admin123'
    });
  } catch (error) {
    console.error('Error updating admin password:', error);
    return NextResponse.json(
      { error: 'Failed to update admin password' },
      { status: 500 }
    );
  }
}