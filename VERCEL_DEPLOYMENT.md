# 🚀 Vercel Deployment Guide

## Problem
Products show locally but not on Vercel because:
- Local SQLite database doesn't work on Vercel (serverless environment)
- Vercel doesn't have persistent file storage
- Database needs to be set up for production

## Solution: Use Vercel Postgres

### Step 1: Set up Vercel Postgres Database
1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Click "Create Database"
4. Choose "Postgres" and follow the setup
5. Copy the `DATABASE_URL` from Vercel

### Step 2: Add Environment Variables
In your Vercel project settings > Environment Variables, add:
```
DATABASE_URL=your_postgres_database_url_from_vercel
RUPANTORPAY_API_KEY=your_api_key_here
RUPANTORPAY_MERCHANT_ID=SUBMONTH6629
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Step 3: Deploy and Seed Database
1. Push your code to GitHub
2. Deploy to Vercel
3. After deployment, visit: `https://your-domain.vercel.app/api/seed`
4. This will seed your database with products, categories, etc.

### Step 4: Verify Everything Works
1. Visit your homepage
2. Products should now be visible
3. Test all API endpoints:
   - `/api/products`
   - `/api/categories`
   - `/api/coupons`
   - `/api/hot-deals`

## Alternative: Use PlanetScale (MySQL)
If you prefer MySQL over PostgreSQL:

1. Create a PlanetScale account
2. Create a new database
3. Get the connection string
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
5. Follow the same deployment steps

## Troubleshooting

### If products still don't show:
1. Check Vercel function logs for errors
2. Verify DATABASE_URL is correct
3. Make sure database was seeded properly
4. Check if API endpoints return data

### Common Issues:
- **DATABASE_URL format**: Make sure it includes `?sslmode=require` for PostgreSQL
- **Database not seeded**: Visit `/api/seed` after deployment
- **Environment variables**: Ensure they're added in Vercel dashboard
- **CORS issues**: Check if API endpoints are accessible

## Local Development
To keep local development working:
1. Keep using SQLite locally
2. Use environment-specific database URLs
3. Use different `.env` files for local and production

## Files Modified
- `prisma/schema.prisma` - Updated to use PostgreSQL
- `vercel.json` - Added build configuration
- `prisma/seed-postgres.js` - Database seeding script
- `.env.example` - Environment variables template

## Support
If you need help:
1. Check Vercel deployment logs
2. Verify database connection
3. Test API endpoints individually
4. Ensure all environment variables are set