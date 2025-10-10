import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const sampleCategories = [
  {
    name: 'Design Tools',
    slug: 'design-tools',
    icon: 'fas fa-palette'
  },
  {
    name: 'Productivity',
    slug: 'productivity',
    icon: 'fas fa-rocket'
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    icon: 'fas fa-bullhorn'
  },
  {
    name: 'Development',
    slug: 'development',
    icon: 'fas fa-code'
  },
  {
    name: 'Education',
    slug: 'education',
    icon: 'fas fa-graduation-cap'
  }
];

const sampleProducts = [
  {
    name: 'Canva Pro',
    slug: 'canva-pro',
    description: 'Professional design tool with premium templates and features',
    longDescription: 'Canva Pro is a professional design tool that gives you access to millions of premium templates, photos, and graphics. Perfect for creating stunning social media posts, presentations, and marketing materials.',
    image: 'https://via.placeholder.com/400x300.png?text=Canva+Pro',
    stockOut: false,
    categoryName: 'Design Tools',
    pricing: [
      { duration: '1 Month', price: 450 },
      { duration: '3 Months', price: 1200 },
      { duration: '1 Year', price: 4000 }
    ]
  },
  {
    name: 'ChatGPT Plus',
    slug: 'chatgpt-plus',
    description: 'Advanced AI assistant with GPT-4 capabilities',
    longDescription: 'ChatGPT Plus gives you access to GPT-4, faster response times, and priority access to new features. Perfect for professionals who need advanced AI assistance.',
    image: 'https://via.placeholder.com/400x300.png?text=ChatGPT+Plus',
    stockOut: false,
    categoryName: 'Productivity',
    pricing: [
      { duration: '1 Month', price: 550 },
      { duration: '3 Months', price: 1500 },
      { duration: '1 Year', price: 5000 }
    ]
  },
  {
    name: 'Envato Elements',
    slug: 'envato-elements',
    description: 'Unlimited creative assets and templates',
    longDescription: 'Envato Elements provides unlimited downloads of premium WordPress themes, plugins, video templates, graphics, photos, and more. Perfect for creators and developers.',
    image: 'https://via.placeholder.com/400x300.png?text=Envato+Elements',
    stockOut: false,
    categoryName: 'Design Tools',
    pricing: [
      { duration: '1 Month', price: 650 },
      { duration: '3 Months', price: 1800 },
      { duration: '1 Year', price: 6000 }
    ]
  },
  {
    name: 'Adobe Creative Cloud',
    slug: 'adobe-creative-cloud',
    description: 'Complete suite of creative applications',
    longDescription: 'Adobe Creative Cloud gives you access to all Adobe creative apps including Photoshop, Illustrator, Premiere Pro, and more. Essential for creative professionals.',
    image: 'https://via.placeholder.com/400x300.png?text=Adobe+CC',
    stockOut: false,
    categoryName: 'Design Tools',
    pricing: [
      { duration: '1 Month', price: 1200 },
      { duration: '3 Months', price: 3300 },
      { duration: '1 Year', price: 11000 }
    ]
  },
  {
    name: 'Figma Pro',
    slug: 'figma-pro',
    description: 'Advanced collaborative design tool',
    longDescription: 'Figma Pro offers advanced features for teams including version history, unlimited projects, and enhanced collaboration tools. Perfect for design teams.',
    image: 'https://via.placeholder.com/400x300.png?text=Figma+Pro',
    stockOut: false,
    categoryName: 'Design Tools',
    pricing: [
      { duration: '1 Month', price: 350 },
      { duration: '3 Months', price: 900 },
      { duration: '1 Year', price: 3000 }
    ]
  },
  {
    name: 'Notion Plus',
    slug: 'notion-plus',
    description: 'Advanced workspace for teams and projects',
    longDescription: 'Notion Plus provides unlimited file uploads, advanced permissions, and priority support. Perfect for teams looking to organize their work efficiently.',
    image: 'https://via.placeholder.com/400x300.png?text=Notion+Plus',
    stockOut: false,
    categoryName: 'Productivity',
    pricing: [
      { duration: '1 Month', price: 250 },
      { duration: '3 Months', price: 650 },
      { duration: '1 Year', price: 2200 }
    ]
  },
  {
    name: 'Zoom Pro',
    slug: 'zoom-pro',
    description: 'Professional video conferencing solution',
    longDescription: 'Zoom Pro offers extended meeting duration, cloud recording, and advanced features for businesses and educational institutions.',
    image: 'https://via.placeholder.com/400x300.png?text=Zoom+Pro',
    stockOut: false,
    categoryName: 'Productivity',
    pricing: [
      { duration: '1 Month', price: 400 },
      { duration: '3 Months', price: 1100 },
      { duration: '1 Year', price: 3800 }
    ]
  },
  {
    name: 'Grammarly Premium',
    slug: 'grammarly-premium',
    description: 'Advanced writing assistant and plagiarism checker',
    longDescription: 'Grammarly Premium provides advanced writing suggestions, tone detection, and plagiarism checking. Perfect for professionals and students.',
    image: 'https://via.placeholder.com/400x300.png?text=Grammarly+Premium',
    stockOut: false,
    categoryName: 'Productivity',
    pricing: [
      { duration: '1 Month', price: 300 },
      { duration: '3 Months', price: 800 },
      { duration: '1 Year', price: 2800 }
    ]
  }
];

const sampleCoupons = [
  {
    code: 'WELCOME10',
    discountPercentage: 10,
    scope: 'all_products',
    scopeValue: null
  },
  {
    code: 'DESIGN15',
    discountPercentage: 15,
    scope: 'category',
    scopeValue: 'Design Tools'
  },
  {
    code: 'FIRST20',
    discountPercentage: 20,
    scope: 'all_products',
    scopeValue: null
  }
];

const sampleSiteConfig = {
  heroBanner: [
    'https://via.placeholder.com/1200x400.png?text=Special+Offer+50%+Off',
    'https://via.placeholder.com/1200x400.png?text=New+Products+Available',
    'https://via.placeholder.com/1200x400.png?text=Premium+Digital+Subscriptions'
  ],
  favicon: '',
  contactInfo: {
    phone: '01867892521',
    whatsapp: '01867892521',
    email: 'support@submonth.com'
  },
  adminPassword: 'password123',
  usdToBdtRate: 110,
  siteLogo: 'https://i.postimg.cc/gJRL0cdG/1758261543098.png',
  heroSliderInterval: 5000,
  hotDealsSpeed: 40
};

export async function seedDatabase() {
  let connected = false;
  try {
    // Ensure database connection
    await db.$connect();
    connected = true;
    console.log('✅ Database connected successfully');

    console.log('🌱 Starting database seeding...');

    // Clear existing data - but handle cases where tables don't exist
    const tables = [
      { name: 'hotDeal', model: db.hotDeal },
      { name: 'coupon', model: db.coupon },
      { name: 'orderItem', model: db.orderItem },
      { name: 'order', model: db.order },
      { name: 'review', model: db.review },
      { name: 'pricing', model: db.pricing },
      { name: 'product', model: db.product },
      { name: 'category', model: db.category },
      { name: 'siteConfig', model: db.siteConfig }
    ];

    for (const table of tables) {
      try {
        await table.model.deleteMany();
        console.log(`✅ Cleared ${table.name} table`);
      } catch (error) {
        console.log(`⚠️ ${table.name} table might not exist yet, continuing...`);
      }
    }

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Promise.all(
      sampleCategories.map(async (category) => {
        return await db.category.create({
          data: category
        });
      })
    );

    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create products
    console.log('🛍️ Creating products...');
    const createdProducts = await Promise.all(
      sampleProducts.map(async (product) => {
        const category = createdCategories.find(c => c.name === product.categoryName);
        if (!category) throw new Error(`Category not found: ${product.categoryName}`);

        return await db.product.create({
          data: {
            name: product.name,
            slug: product.slug,
            description: product.description,
            longDescription: product.longDescription,
            image: product.image,
            stockOut: product.stockOut,
            categoryId: category.id,
            pricing: {
              create: product.pricing
            }
          },
          include: {
            pricing: true,
            category: true
          }
        });
      })
    );

    console.log(`✅ Created ${createdProducts.length} products`);

    // Create coupons
    console.log('🎫 Creating coupons...');
    const createdCoupons = await Promise.all(
      sampleCoupons.map(async (coupon) => {
        return await db.coupon.create({
          data: coupon
        });
      })
    );

    console.log(`✅ Created ${createdCoupons.length} coupons`);

    // Create hot deals
    console.log('🔥 Creating hot deals...');
    const hotDealsToCreate = createdProducts.slice(0, 4).map((product, index) => ({
      productId: product.id,
      customTitle: index === 0 ? 'Special Deal!' : undefined
    }));

    const createdHotDeals = await Promise.all(
      hotDealsToCreate.map(async (hotDeal) => {
        return await db.hotDeal.create({
          data: hotDeal
        });
      })
    );

    console.log(`✅ Created ${createdHotDeals.length} hot deals`);

    // Create site config
    console.log('⚙️ Creating site configuration...');
    
    // Hash the admin password before storing
    const hashedAdminPassword = await hashPassword(sampleSiteConfig.adminPassword);
    
    const createdConfig = await db.siteConfig.create({
      data: {
        ...sampleSiteConfig,
        adminPassword: hashedAdminPassword
      }
    });

    console.log('✅ Created site config');

    // Add some sample reviews
    console.log('⭐ Adding sample reviews...');
    const sampleReviews = [
      { name: 'John Doe', rating: 5, comment: 'Excellent service! Very satisfied with the purchase.' },
      { name: 'Jane Smith', rating: 4, comment: 'Good quality products and fast delivery.' },
      { name: 'Mike Johnson', rating: 5, comment: 'Best prices in the market. Highly recommended!' }
    ];

    await Promise.all(
      createdProducts.slice(0, 3).map(async (product, index) => {
        if (sampleReviews[index]) {
          await db.review.create({
            data: {
              ...sampleReviews[index],
              productId: product.id
            }
          });
        }
      })
    );

    console.log('✅ Added sample reviews');
    console.log('🎉 Database seeded successfully!');

    return {
      categories: createdCategories.length,
      products: createdProducts.length,
      coupons: createdCoupons.length,
      hotDeals: createdHotDeals.length,
      reviews: 3
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    if (connected) {
      await db.$disconnect().catch(console.error);
      console.log('🔌 Database disconnected');
    }
  }
}