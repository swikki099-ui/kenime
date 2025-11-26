# KENIME - Static Site Hosting Platform

## Project Overview

KENIME is a complete static-site hosting platform similar to Netlify/Vercel but simplified. Users can upload ZIP files containing HTML/CSS/JS, and the system hosts their sites at path-based URLs (e.g., `kenime.cc/username/`).

## Current Status

The platform is **COMPLETE and READY FOR DEPLOYMENT**. All core features have been implemented:

✅ User authentication system (Supabase Auth)
✅ ZIP upload and deployment system
✅ File validation and security measures
✅ Preview and publish workflows
✅ User dashboard with site management
✅ Analytics tracking (pageviews, storage, bandwidth)
✅ SEO tools (sitemap, meta checker, link validator)
✅ Admin panel with user and site management
✅ Path-based routing middleware
✅ Rate limiting and security
✅ Modern UI with Tailwind CSS and Lucide icons
✅ Complete database schema with RLS policies

## Architecture

### Frontend (Next.js App Router)
- `/` - Landing page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - User dashboard
- `/admin` - Admin panel
- Path-based routing: `/:username/` → serves from `/sites/:username/`

### Backend (Next.js API Routes)
- `/api/auth/*` - Authentication endpoints
- `/api/upload` - ZIP file upload
- `/api/deploy/*` - Deployment management
- `/api/sites` - Site CRUD operations
- `/api/analytics/*` - Analytics tracking
- `/api/seo/*` - SEO tools
- `/api/admin/*` - Admin management

### Database (Supabase PostgreSQL)
Tables:
- `users` - User accounts with limits
- `sites` - Hosted static sites
- `deployments` - Deployment history
- `analytics` - Page view tracking
- `rate_limits` - Rate limiting
- `admin_logs` - Admin audit trail

### File Storage
- `/public/sites/:username/` - Published sites
- `/public/preview/:id/` - Preview deployments

## Setup Instructions

### 1. Supabase Setup
1. Create a Supabase project at supabase.com
2. Run the SQL schema from `lib/supabase/schema.sql` in SQL Editor
3. Get your project URL and API keys from Settings → API
4. Set environment variables (see `.env.local.example`)

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Development Server
```bash
npm install
npm run dev
```

### 4. Create Admin User
After signing up, run in Supabase SQL Editor:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### 5. Deploy to Vercel
```bash
vercel
```

Add environment variables in Vercel dashboard and deploy to production.

## Key Features

### Security
- **File Validation**: Whitelist of allowed file extensions, blacklist of dangerous types
- **Malicious Content Detection**: Pattern-based scanning for PHP, eval(), etc.
- **Path Traversal Protection**: `sanitizeZipPath()` validates all extracted paths
- **Symlink Protection**: ZIP entries checked for symlink flags, rejected if found
- **Decompression Bomb Protection**: 500MB limit on extracted size, real-time tracking
- **Atomic Deployments**: Staging directory prevents live site corruption on failures
- **Reserved Username Protection**: Blocks 'admin', 'api', 'login', etc.
- **Rate Limiting**: 50 deploys/day default (configurable per user)
- **File Size Limits**: 100MB compressed, 500MB extracted (default)
- **Row-level Security**: Supabase RLS policies on all tables
- **Privileged Operations**: Service role client for bypassing RLS where needed

### User Features
- Upload ZIP files
- Preview before publishing
- Live site at `kenime.cc/username`
- Analytics dashboard
- SEO health checks
- File management

### Admin Features
- View all users and sites
- Ban/unban users
- Delete abusive sites
- Platform-wide analytics
- Audit logging

## Technical Details

### Dependencies
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- AdmZip (ZIP handling)
- Cheerio (HTML parsing for SEO)
- Lucide React (Icons)
- Monaco Editor (Code editor)

### Rate Limits
Default per user:
- 50 deploys/day
- 100MB max upload size
- 10 max sites
- Configurable per user by admins

### Path-Based Routing
Middleware rewrites requests:
- Request: `kenime.cc/john/` 
- Serves: `/public/sites/john/index.html`
- No subdomain configuration needed

## Recent Changes (November 26, 2025)

### Initial Build
- ✅ Complete project setup with Next.js 16 + TypeScript
- ✅ Implemented all authentication flows with Supabase
- ✅ Built ZIP upload with security validation
- ✅ Created preview/publish workflow
- ✅ Implemented analytics system
- ✅ Built SEO tools
- ✅ Created user dashboard
- ✅ Created admin panel
- ✅ Configured path-based routing
- ✅ Complete database schema with RLS
- ✅ Modern UI with Tailwind CSS 3.x + Lucide icons

### Security Hardening
- ✅ Added service role client for privileged database operations
- ✅ Implemented path traversal protection with `sanitizeZipPath()`
- ✅ Added symlink detection and rejection in ZIP files
- ✅ Implemented decompression bomb protection (500MB limit)
- ✅ Atomic deployment with staging directory and rollback
- ✅ Reserved username protection
- ✅ Fixed rate limiting to work without external RPC
- ✅ Fixed analytics tracking logic
- ✅ Comprehensive error handling and data integrity

## Next Steps for Production

1. Configure Supabase project
2. Set environment variables
3. Test signup/login flow
4. Test site upload/deployment
5. Verify admin panel access
6. Deploy to Vercel
7. Configure custom domain (kenime.cc)
8. Test path-based routing in production

## Support

- **Database Setup**: See `SUPABASE_SETUP.md`
- **Deployment**: See `README.md`
- **API Documentation**: Check `/app/api/` route files
- **Database Schema**: See `lib/supabase/schema.sql`

## Project Status
**Status**: ✅ COMPLETE - Ready for deployment and use
**Version**: 1.0.0
**Last Updated**: November 26, 2025
