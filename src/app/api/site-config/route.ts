import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let config = await db.siteConfig.findFirst();
    
    // If no config exists, create default one
    if (!config) {
      config = await db.siteConfig.create({
        data: {
          heroBanner: [],
          favicon: "",
          contactInfo: {
            phone: "",
            whatsapp: "",
            email: ""
          },
          adminPassword: "password123",
          usdToBdtRate: 110,
          siteLogo: "",
          heroSliderInterval: 5000,
          hotDealsSpeed: 40
        }
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const config = await db.siteConfig.upsert({
      where: { id: body.id || 'default' },
      update: body,
      create: {
        ...body,
        id: 'default'
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { error: 'Failed to update site config' },
      { status: 500 }
    );
  }
}