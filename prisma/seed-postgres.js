#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.hotDeal.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteConfig.deleteMany();

  console.log('Cleared existing data');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Productivity',
        slug: 'productivity',
        icon: '💼',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Design Tools',
        slug: 'design-tools',
        icon: '🎨',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Development',
        slug: 'development',
        icon: '💻',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Marketing',
        slug: 'marketing',
        icon: '📈',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Special Offers',
        slug: 'special-offers',
        icon: '⭐',
      },
    }),
  ]);

  console.log('Created categories:', categories.length);

  // Create products
  const products = [
    {
      name: 'Special 1 Taka Deal',
      slug: 'one-taka-special',
      description: 'Exclusive digital product for just 1 taka! Limited time offer.',
      longDescription: 'This is an exclusive special offer product available for only 1 taka! Get access to premium digital content at an unbelievable price. This limited-time deal includes access to selected digital tools, resources, or courses. Perfect for trying out our platform with minimal investment. Hurry, this offer won\'t last long!',
      image: 'https://via.placeholder.com/400x300.png?text=1+Taka+Special&bg=gold&text=black',
      categoryId: categories[4].id, // Special Offers
      pricing: [
        { duration: '1 Taka Special', price: 1 },
      ],
    },
    {
      name: 'Grammarly Premium',
      slug: 'grammarly-premium',
      description: 'Advanced writing assistant and plagiarism checker',
      longDescription: 'Grammarly Premium provides advanced writing suggestions, tone detection, and plagiarism checking. Perfect for professionals and students.',
      image: 'https://via.placeholder.com/400x300.png?text=Grammarly+Premium',
      categoryId: categories[0].id, // Productivity
      pricing: [
        { duration: '1 Month', price: 300 },
        { duration: '3 Months', price: 800 },
        { duration: '1 Year', price: 2800 },
      ],
    },
    {
      name: 'Zoom Pro',
      slug: 'zoom-pro',
      description: 'Professional video conferencing solution',
      longDescription: 'Zoom Pro offers extended meeting duration, cloud recording, and advanced features for businesses and educational institutions.',
      image: 'https://via.placeholder.com/400x300.png?text=Zoom+Pro',
      categoryId: categories[0].id, // Productivity
      pricing: [
        { duration: '1 Month', price: 400 },
        { duration: '3 Months', price: 1100 },
        { duration: '1 Year', price: 3800 },
      ],
    },
    {
      name: 'Notion Plus',
      slug: 'notion-plus',
      description: 'Advanced workspace for teams and projects',
      longDescription: 'Notion Plus provides unlimited file uploads, advanced permissions, and priority support. Perfect for teams looking to organize their work efficiently.',
      image: 'https://via.placeholder.com/400x300.png?text=Notion+Plus',
      categoryId: categories[0].id, // Productivity
      pricing: [
        { duration: '1 Month', price: 250 },
        { duration: '3 Months', price: 650 },
        { duration: '1 Year', price: 2200 },
      ],
    },
    {
      name: 'Adobe Creative Cloud',
      slug: 'adobe-creative-cloud',
      description: 'Complete suite of creative applications',
      longDescription: 'Adobe Creative Cloud gives you access to all Adobe creative apps including Photoshop, Illustrator, Premiere Pro, and more. Essential for creative professionals.',
      image: 'https://via.placeholder.com/400x300.png?text=Adobe+CC',
      categoryId: categories[1].id, // Design Tools
      pricing: [
        { duration: '1 Month', price: 1200 },
        { duration: '3 Months', price: 3300 },
        { duration: '1 Year', price: 11000 },
      ],
    },
    {
      name: 'Envato Elements',
      slug: 'envato-elements',
      description: 'Unlimited creative assets and templates',
      longDescription: 'Envato Elements provides unlimited downloads of premium WordPress themes, plugins, video templates, graphics, photos, and more. Perfect for creators and developers.',
      image: 'https://via.placeholder.com/400x300.png?text=Envato+Elements',
      categoryId: categories[1].id, // Design Tools
      pricing: [
        { duration: '1 Month', price: 650 },
        { duration: '3 Months', price: 1800 },
        { duration: '1 Year', price: 6000 },
      ],
    },
    {
      name: 'Figma Pro',
      slug: 'figma-pro',
      description: 'Advanced collaborative design tool',
      longDescription: 'Figma Pro offers advanced features for teams including version history, unlimited projects, and enhanced collaboration tools. Perfect for design teams.',
      image: 'https://via.placeholder.com/400x300.png?text=Figma+Pro',
      categoryId: categories[1].id, // Design Tools
      pricing: [
        { duration: '1 Month', price: 350 },
        { duration: '3 Months', price: 900 },
        { duration: '1 Year', price: 3000 },
      ],
    },
    {
      name: 'ChatGPT Plus',
      slug: 'chatgpt-plus',
      description: 'Advanced AI assistant with GPT-4 capabilities',
      longDescription: 'ChatGPT Plus gives you access to GPT-4, faster response times, and priority access to new features. Perfect for professionals who need advanced AI assistance.',
      image: 'https://via.placeholder.com/400x300.png?text=ChatGPT+Plus',
      categoryId: categories[0].id, // Productivity
      pricing: [
        { duration: '1 Month', price: 550 },
        { duration: '3 Months', price: 1500 },
        { duration: '1 Year', price: 5000 },
      ],
    },
    {
      name: 'Canva Pro',
      slug: 'canva-pro',
      description: 'Professional design tool with premium templates and features',
      longDescription: 'Canva Pro is a professional design tool that gives you access to millions of premium templates, photos, and graphics. Perfect for creating stunning social media posts, presentations, and marketing materials.',
      image: 'https://via.placeholder.com/400x300.png?text=Canva+Pro',
      categoryId: categories[1].id, // Design Tools
      pricing: [
        { duration: '1 Month', price: 450 },
        { duration: '3 Months', price: 1200 },
        { duration: '1 Year', price: 4000 },
      ],
    },
  ];

  // Create products with pricing
  const createdProducts = await Promise.all(
    products.map(async (product) => {
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          longDescription: product.longDescription,
          image: product.image,
          categoryId: product.categoryId,
          pricing: {
            create: product.pricing,
          },
        },
        include: {
          pricing: true,
          category: true,
        },
      });
      return createdProduct;
    })
  );

  console.log('Created products:', createdProducts.length);

  // Create some reviews
  await Promise.all([
    prisma.review.create({
      data: {
        name: 'Ahmed Khan',
        rating: 5,
        comment: 'Amazing deal! Got great value for just 1 taka. Highly recommend this special offer!',
        productId: createdProducts[0].id,
      },
    }),
    prisma.review.create({
      data: {
        name: 'Mike Johnson',
        rating: 5,
        comment: 'Best prices in the market. Highly recommended!',
        productId: createdProducts[5].id,
      },
    }),
    prisma.review.create({
      data: {
        name: 'Jane Smith',
        rating: 4,
        comment: 'Good quality products and fast delivery.',
        productId: createdProducts[7].id,
      },
    }),
    prisma.review.create({
      data: {
        name: 'John Doe',
        rating: 5,
        comment: 'Excellent service! Very satisfied with the purchase.',
        productId: createdProducts[8].id,
      },
    }),
  ]);

  console.log('Created reviews');

  // Create coupons
  await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        discountPercentage: 10,
        scope: 'all_products',
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'SPECIAL20',
        discountPercentage: 20,
        scope: 'category',
        scopeValue: 'special-offers',
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'FIRST15',
        discountPercentage: 15,
        scope: 'all_products',
        isActive: true,
      },
    }),
  ]);

  console.log('Created coupons');

  // Create hot deals
  await Promise.all([
    prisma.hotDeal.create({
      data: {
        productId: createdProducts[0].id, // 1 Taka Special
        customTitle: '🔥 MEGA DEAL - Only 1 Taka!',
      },
    }),
    prisma.hotDeal.create({
      data: {
        productId: createdProducts[7].id, // ChatGPT Plus
        customTitle: '🤖 AI Assistant Special',
      },
    }),
    prisma.hotDeal.create({
      data: {
        productId: createdProducts[4].id, // Adobe Creative Cloud
        customTitle: '🎨 Creative Bundle Deal',
      },
    }),
  ]);

  console.log('Created hot deals');

  // Create site config
  await prisma.siteConfig.create({
    data: {
      heroBanner: [
        '🎉 Welcome to SubMonth - Your Digital Subscription Store!',
        '💎 Premium Tools at Affordable Prices',
        '🚀 Instant Delivery - Start Using Today!'
      ],
      favicon: '/favicon.ico',
      contactInfo: {
        phone: '+8801234567890',
        whatsapp: '+8801234567890',
        email: 'support@submonth.com',
      },
      adminPassword: 'admin123',
      usdToBdtRate: 110,
      siteLogo: '/logo.svg',
      heroSliderInterval: 5000,
      hotDealsSpeed: 40,
    },
  });

  console.log('Created site config');
  console.log('Database seed completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });