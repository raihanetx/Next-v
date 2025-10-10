import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Debug: Checking admin password setup...');
    
    // Test database connection
    await db.$connect();
    console.log('✅ Database connected');
    
    // Check ALL site configs
    const configs = await db.siteConfig.findMany();
    console.log('🔍 Found site configs:', configs.length);
    
    if (configs.length === 0) {
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
    
    // Test each config
    const results = [];
    for (const config of configs) {
      console.log(`🔍 Config ${config.id}:`);
      console.log('  - Password hash length:', config.adminPassword?.length || 0);
      
      // Check if password looks like a bcrypt hash (starts with $2b$)
      const isHashed = config.adminPassword?.startsWith('$2b$');
      console.log('  - Password is hashed:', isHashed);
      
      // Test password verification
      let passwordValid = false;
      try {
        passwordValid = await verifyPassword("password123", config.adminPassword);
        console.log('  - Password verification test:', passwordValid);
        
        // If verification fails, let's re-hash with the correct password
        if (!passwordValid) {
          console.log('  - Password verification failed, re-hashing with correct password...');
          const { hashPassword } = await import('@/lib/auth');
          const hashedPassword = await hashPassword("password123");
          
          await db.siteConfig.update({
            where: { id: config.id },
            data: { adminPassword: hashedPassword }
          });
          
          console.log('  - Updated with correct password hash');
          
          // Test again
          passwordValid = await verifyPassword("password123", hashedPassword);
          console.log('  - New password verification test:', passwordValid);
          
          results[results.length - 1].passwordRehashed = true;
          results[results.length - 1].passwordValid = passwordValid;
        }
      } catch (error) {
        console.log('  - Password verification error:', error);
      }
      
      results.push({
        configId: config.id,
        isHashed,
        passwordValid,
        hashLength: config.adminPassword?.length || 0,
        hashPrefix: config.adminPassword?.substring(0, 10) + '...'
      });
      
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
        
        results[results.length - 1].wasHashed = false;
        results[results.length - 1].nowHashed = true;
      }
    }
    
    // If there are multiple configs, delete all but the first one
    if (configs.length > 1) {
      console.log('⚠️ Multiple configs found, cleaning up...');
      for (let i = 1; i < configs.length; i++) {
        await db.siteConfig.delete({ where: { id: configs[i].id } });
        console.log(`🗑️ Deleted config ${configs[i].id}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin password debug completed',
      totalConfigs: configs.length,
      results
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