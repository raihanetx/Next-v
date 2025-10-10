import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Auto-seed database if empty (for first deployment)
    const productCount = await db.product.count();
    if (productCount === 0) {
      console.log('🌱 Database empty - Auto-seeding products...');
      try {
        const seedResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/seed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (seedResponse.ok) {
          console.log('✅ Auto-seeding completed');
        }
      } catch (seedError) {
        console.error('❌ Auto-seeding failed:', seedError);
      }
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');

    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      whereClause.category = {
        name: { contains: category, mode: 'insensitive' }
      };
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: true,
        pricing: true,
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match the expected format
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      longDescription: product.longDescription,
      image: product.image,
      stockOut: product.stockOut,
      category: product.category.name,
      categorySlug: product.category.slug,
      pricing: product.pricing.map(p => ({
        duration: p.duration,
        price: p.price
      })),
      reviews: product.reviews.map(r => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        comment: r.comment
      }))
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, longDescription, image, stockOut, categoryId, pricing } = body;

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        longDescription,
        image,
        stockOut: stockOut || false,
        categoryId,
        pricing: {
          create: pricing || []
        }
      },
      include: {
        category: true,
        pricing: true,
        reviews: true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}