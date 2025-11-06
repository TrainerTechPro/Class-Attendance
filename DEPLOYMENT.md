# QUICK SETUP GUIDE FOR PRODUCTION DATABASE

Your app is deployed but needs a PostgreSQL database to work in production. Here's the fastest way to set it up:

## Step 1: Get a Free PostgreSQL Database

### Option A: Neon (Recommended - Fastest)

1. Go to **https://neon.tech**
2. Click "Sign Up" (use GitHub)
3. Create a new project called "class-attendance"
4. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase

1. Go to **https://supabase.com**
2. Click "Start your project"
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)

## Step 2: Add Database to Vercel

1. Go to your Vercel dashboard: **https://vercel.com/dashboard**
2. Click on your `class-attendance` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your PostgreSQL connection string
   - **Environment**: Check all (Production, Preview, Development)
5. Click **Save**

## Step 3: Redeploy

1. In Vercel, go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**
4. Wait ~2 minutes

## Step 4: Initialize Database

After redeployment, run this command to create the database tables:

```bash
# Set your database URL locally
export DATABASE_URL="your-connection-string-here"

# Run migrations
cd /home/user/Class-Attendance
npx prisma db push
```

That's it! Your app should now work.

---

## Quick Test

1. Visit your Vercel URL
2. Go to `/instructor`
3. Try creating a class
4. If it works, you're done!

## Troubleshooting

**Still getting errors?**
- Make sure the DATABASE_URL is correct in Vercel
- Check that you clicked "Save" on the environment variable
- Try redeploying again
- Check Vercel logs for specific errors

**Need to see your database?**
- Neon: Use their built-in SQL editor
- Supabase: Use Table Editor in dashboard
