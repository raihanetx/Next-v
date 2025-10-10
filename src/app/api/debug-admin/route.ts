import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Debug: Checking admin password setup...');
    
    // Test database connection
    await db.$connect();
    console.log('✅ Database connected');
    
    // Check if site config exists
    const config = await db.siteConfig.findFirst();
    
    if (!config) {
      console.log('❌ No site config found - creating default...');
      
      // Create default config with hashed password
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword("password123");
      
      const newConfig = await db.siteConfig.create({
        data: {
          heroBanner: [],
          favicon: "",
          contactInfo: {
            phone: "",
            whatsapp: "",
            email: ""
          },
          adminPassword: hashedPassword,
          usdToBdtRate: 110,
          siteLogo: "",
          heroSliderInterval: 5000,
          hotDealsSpeed: 40
        }
      });
      
      console.log('✅ Created new site config with hashed password');
      
      return NextResponse.json({
        success: true,
        message: 'Created new admin configuration',
        passwordSet: true,
        configId: newConfig.id
      });
    }
    
    console.log('✅ Found existing site config');
    console.log('🔍 Admin password hash length:', config.adminPassword?.length || 0);
    
    // Check if password looks like a bcrypt hash (starts with $2b$)
    const isHashed = config.adminPassword?.startsWith('$2b$');
    console.log('🔍 Password is hashed:', isHashed);
    
    if (!isHashed) {
      console.log('⚠️ Password is not hashed - updating...');
      
      // Update with hashed password
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword(config.adminPassword || "password123");
      
      await db.siteConfig.update({
        where: { id: config.id },
        data: { adminPassword: hashedPassword }
      });
      
      console.log('✅ Updated password to hashed version');
      
      return NextResponse.json({
        success: true,
        message: 'Updated admin password to hashed format',
        passwordSet: true,
        wasHashed: false,
        nowHashed: true
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin password is properly configured',
      passwordSet: true,
      isHashed: true,
      configId: config.id
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check admin configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await db.$disconnect().catch(console.error);
  }
}