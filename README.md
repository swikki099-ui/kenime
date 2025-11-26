# KENIME - Static Site Hosting Platform

A simplified static-site hosting platform like Netlify/Vercel. Users upload ZIP files containing HTML/CSS/JS, and the system hosts their sites at path-based URLs (e.g., `kenime.cc/username/`).

## Features

- ✅ **Static-Only Hosting**: No server-side code execution, pure HTML/CSS/JavaScript
- ✅ **Path-Based URLs**: Sites hosted at `kenime.cc/username/` (no subdomains)
- ✅ **User Authentication**: Signup/Login with Supabase Auth
- ✅ **ZIP Upload & Deploy**: Simple drag-and-drop deployment
- ✅ **Preview Mode**: Test deployments before going live
- ✅ **File Manager**: Browser-based file editor with Monaco
- ✅ **Analytics**: Track pageviews, storage, and bandwidth
- ✅ **SEO Tools**: Sitemap generation, meta tag checker, link validator
- ✅ **Security**: File validation, malicious content detection, rate limiting
- ✅ **Admin Panel**: User management, site moderation, global analytics
- ✅ **Modern UI**: Beautiful, responsive interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Handling**: AdmZip, Formidable
- **Deployment**: Vercel (or any Node.js hosting)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd kenime
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `lib/supabase/schema.sql`
3. Copy your project URL and API keys from Settings → API

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

### 6. Create Admin User

After signing up through the app, run this SQL in Supabase to make yourself an admin:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── upload/           # File upload
│   │   ├── deploy/           # Deployment management
│   │   ├── sites/            # Site management
│   │   ├── analytics/        # Analytics tracking
│   │   ├── seo/              # SEO tools
│   │   └── admin/            # Admin endpoints
│   ├── dashboard/            # User dashboard
│   ├── admin/                # Admin panel
│   ├── login/                # Login page
│   └── signup/               # Signup page
├── lib/                      # Utilities and helpers
│   ├── auth/                 # Auth utilities
│   ├── supabase/             # Supabase client & types
│   └── utils/                # File validation, rate limiting
├── public/                   # Static assets
│   ├── sites/                # User-uploaded sites
│   └── preview/              # Preview deployments
├── middleware.ts             # Path-based routing middleware
└── SUPABASE_SETUP.md        # Detailed Supabase setup guide
```

## Database Schema

The platform uses the following tables:

- **users**: User accounts, limits, and permissions
- **sites**: Hosted static sites
- **deployments**: Deployment history
- **analytics**: Page view tracking
- **rate_limits**: Rate limiting per user
- **admin_logs**: Admin action audit trail

See `lib/supabase/schema.sql` for complete schema.

## Usage

### For Users

1. **Sign Up**: Create an account at `/signup`
2. **Upload Site**: Prepare a ZIP file with your HTML/CSS/JS
3. **Deploy**: Upload ZIP in dashboard
4. **Preview**: Test your site before publishing
5. **Publish**: Make your site live at `kenime.cc/yourusername`
6. **Analytics**: View pageviews and storage usage

### For Admins

1. Navigate to `/admin` (requires admin privileges)
2. View platform statistics
3. Manage users (ban/unban)
4. Moderate sites (delete abusive content)
5. View audit logs

## Security Features

- ✅ File type validation (only web assets allowed)
- ✅ Malicious content detection
- ✅ Directory traversal prevention
- ✅ Rate limiting (uploads, deploys, API calls)
- ✅ Row-level security (RLS) in database
- ✅ File size limits
- ✅ Sanitized file names

## Deployment on Vercel

### 1. Create Vercel Project

```bash
npm install -g vercel
vercel
```

### 2. Configure Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy

```bash
vercel --prod
```

### 4. Update Domain

Your site will be hosted at `your-project.vercel.app`. Configure your custom domain `kenime.cc` in Vercel dashboard.

## Configuration Files

### vercel.json (Optional)

Already configured in `next.config.js` with rewrites and headers.

### next.config.js

Includes:
- Path-based routing rewrites
- Cache-control headers
- Body size limits for large ZIP uploads

## Limits & Quotas

Default user limits (configurable per user):

- **Max Sites**: 10
- **Daily Deploys**: 50
- **Max Upload Size**: 100MB
- **Max File Size**: 50MB per file

## SEO Tools

- **Sitemap Generator**: Auto-generate sitemap at `/api/seo/sitemap/[username]`
- **Meta Tag Checker**: Validate title, description, OG tags
- **Link Validator**: Check for broken internal links
- **SEO Score**: Get an SEO health score for your site

## Analytics

Track for each site:

- Total pageviews
- Daily pageview trends
- Storage usage
- Bandwidth estimates
- Last deployment date

## Support & Documentation

- **Setup Guide**: See `SUPABASE_SETUP.md` for detailed Supabase configuration
- **Schema**: See `lib/supabase/schema.sql` for database schema
- **API Docs**: API routes are self-documented in `app/api/`

## Contributing

This is a production-ready platform. Contributions are welcome!

## License

MIT

## Credits

Built with ❤️ using Next.js, Supabase, and Vercel.
