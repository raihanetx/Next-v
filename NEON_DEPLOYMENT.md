# 🚀 Neon PostgreSQL Deployment Guide

## 📋 Overview
This guide explains how to deploy the SubMonth project using Neon PostgreSQL database.

## 🔧 Prerequisites
- Neon PostgreSQL database account
- Vercel account (for deployment)
- GitHub repository

## 🗄️ Database Setup

### 1. Create Neon Database
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string

### 2. Update Environment Variables
Update your `.env` file with the Neon connection string:
```env
DATABASE_URL=postgresql://neondb_owner:npg_xTdKREGCMq56@ep-fragrant-block-a1zra3ey-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Push Schema and Seed Data
```bash
# Push database schema to Neon
npx prisma db push

# Seed the database with initial data
node prisma/seed-postgres.js
```

## 🌐 Vercel Deployment

### 1. Set Environment Variables in Vercel
In your Vercel project settings, add:
```
DATABASE_URL=postgresql://neondb_owner:npg_xTdKREGCMq56@ep-fragrant-block-a1zra3ey-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
RUPANTORPAY_API_KEY=your_api_key
RUPANTORPAY_MERCHANT_ID=SUBMONTH6629
```

### 2. Deploy to Vercel
```bash
# Push to GitHub (if not already done)
git add .
git commit -m "Configure for Neon PostgreSQL deployment"
git push origin main

# Vercel will automatically deploy
```

### 3. Post-Deployment Setup
After deployment, visit: `https://your-app.vercel.app/api/seed` to initialize the database.

## ✅ Verification Steps

### 1. Check Database Connection
- Visit your deployed site
- Products should load correctly
- Categories should be visible

### 2. Test API Endpoints
- `/api/products` - Should return product list
- `/api/categories` - Should return categories
- `/api/hot-deals` - Should return hot deals

### 3. Test Admin Panel
- Visit `/admin`
- Login with password: `admin123`
- Verify you can manage products, orders, etc.

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Check Neon database is active
   - Ensure SSL mode is enabled

2. **Products Not Showing**
   - Run `/api/seed` endpoint
   - Check database tables exist
   - Verify Prisma client generation

3. **Build Errors**
   - Run `npm run lint` locally
   - Check all dependencies are installed
   - Verify Prisma schema is valid

### Debug Commands
```bash
# Check database connection
npx prisma db pull

# Regenerate Prisma client
npx prisma generate

# Test database schema
npx prisma db push --force-reset
```

## 🎯 Benefits of Neon PostgreSQL

✅ **Serverless Compatible** - Works perfectly with Vercel
✅ **Auto-scaling** - Handles traffic automatically
✅ **Fast Connection** - Optimized for serverless functions
✅ **Backup Included** - Automatic backups and point-in-time recovery
✅ **Free Tier** - Generous free plan for development

## 📞 Support

If you encounter issues:
1. Check Neon console for database status
2. Verify Vercel function logs
3. Ensure all environment variables are set
4. Test database connection locally first

---

**Status**: ✅ Configured and ready for deployment with Neon PostgreSQL