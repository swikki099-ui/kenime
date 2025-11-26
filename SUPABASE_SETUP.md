# KENIME Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Enter project details:
   - Name: `kenime-platform`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"
6. Wait for the project to be ready (takes 1-2 minutes)

## 2. Run the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor** tab
2. Click "New Query"
3. Copy the entire contents of `lib/supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. You should see "Success. No rows returned"

## 3. Set Up Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the signup confirmation email

## 4. Create Default Admin User

After setting up authentication, you need to create the default admin user:

1. Go to **SQL Editor** in Supabase
2. Run this query to create the admin user (replace with your details):

```sql
-- First, sign up normally through the app with this email
-- Then run this query to make that user an admin:
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@kenime.cc';
```

Or create the admin user directly:

```sql
-- Insert admin user (you'll need to sign up first to get an auth.users record)
-- After signing up with email 'admin@kenime.cc', run:
UPDATE users 
SET is_admin = true, 
    max_sites = 999,
    daily_deploy_limit = 999,
    max_upload_size_mb = 1000
WHERE email = 'admin@kenime.cc';
```

## 5. Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## 6. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 7. Configure Storage (Optional)

If you want to use Supabase Storage for backups:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `site-backups`
3. Set it to private
4. Configure access policies as needed

## 8. Test the Connection

1. Start your Next.js development server: `npm run dev`
2. Open http://localhost:5000
3. Try signing up with a test account
4. Check the Supabase dashboard to verify the user was created

## 9. Production Deployment

For production on Vercel:

1. Go to your Vercel project settings
2. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy your application

## Database Schema Overview

The schema includes these tables:

- **users**: User accounts with rate limits and permissions
- **sites**: Hosted static sites
- **deployments**: Deployment history and preview deployments
- **analytics**: Page view tracking
- **rate_limits**: Rate limiting per user and action
- **admin_logs**: Admin action audit trail

## Security Notes

- ⚠️ **NEVER** commit your `.env.local` file
- ⚠️ Keep your `service_role` key secret
- ⚠️ The `anon` key is safe to expose in client-side code
- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ Admins have elevated permissions

## Troubleshooting

**Error: "relation 'users' does not exist"**
- Make sure you ran the schema.sql file in the SQL Editor

**Error: "Failed to connect to Supabase"**
- Check your environment variables are correct
- Verify your Supabase project is running

**Can't log in as admin**
- Make sure you ran the admin creation query
- Verify the email matches exactly

## Next Steps

After setup, you can:
- Create new users through the signup page
- Upload static sites
- View analytics in the dashboard
- Manage users in the admin panel (if admin)
