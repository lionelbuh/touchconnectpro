# TouchConnectPro

## Overview

TouchConnectPro is a platform designed to connect entrepreneurs with mentors, coaches, and investors to develop ideas into fundable businesses. It integrates AI-powered business planning tools with human mentorship, guiding founders from initial concept to an investor-ready stage. The platform operates on a freemium model, allowing free AI-assisted idea refinement, with an optional $49/month membership for access to a mentor's portfolio. It also features marketplaces for coaches offering paid courses and investors seeking vetted deal flow, aiming to foster innovation and business growth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite for development and bundling. Wouter handles client-side routing, and TanStack React Query manages server state. Styling is implemented with Tailwind CSS and shadcn/ui components. Supabase client is used for authentication and direct database operations. The design emphasizes a component-based approach with responsive, mobile-first design, custom fonts (Space Grotesk, Inter), and dark mode support. Key pages include public marketing sites, role-based dashboards (Entrepreneur, Mentor, Coach, Investor), application flows, an admin dashboard, and an AI-assisted business plan builder.

### Backend Architecture

The backend is an Express.js server developed with TypeScript. It uses Drizzle ORM for database interactions with PostgreSQL (Neon Database serverless driver). Session management is handled with `connect-pg-simple`. It follows a RESTful API design under an `/api` prefix, with a clear separation of concerns for routes, data access, and static file serving. Custom build scripts using esbuild bundle the server, and Vite middleware is integrated for development HMR.

### Data Storage

The primary database is PostgreSQL, hosted on Neon, with Drizzle ORM for type-safe queries. Supabase also handles user authentication, application data, and business plans, acting as a critical component for user-facing data. The `shared/schema.ts` defines the database schema. LocalStorage provides client-side persistence for form progress and temporary data.

### Authentication & Authorization

Authentication is managed via Supabase Auth, supporting email/password and password reset flows. It implements role-based access control (Entrepreneur, Mentor, Coach, Investor, Admin). Express sessions are stored in PostgreSQL using `connect-pg-simple`. Authorization is based on user roles, determining access to specific dashboard routes and functionalities, including an admin approval workflow for applications.

## External Dependencies

1.  **Supabase**: Provides PostgreSQL database hosting, authentication, user management, real-time subscriptions, and storage for user-uploaded files.
2.  **Neon Database**: Serves as the serverless PostgreSQL backend for the Express.js application, utilized through the `@neondatabase/serverless` driver.
3.  **Stripe**: Integrated for payment processing, handling subscription billing for memberships, and potentially commission processing for the coach marketplace, with webhook support.
4.  **Resend**: Used for sending transactional emails, including approval/rejection notifications and password setup links.

## Recent Changes (December 2025)

### Three-Tier Coach Pricing Structure
- Coaches now set three rates: Intro Call ($), Per Session ($), Per Month/Full Courses ($)
- Stored as JSON in `hourly_rate` field: `{"introCallRate": "25", "sessionRate": "150", "monthlyRate": "500"}`
- Backward compatible: `parseRates()` function handles both JSON (new) and plain string (legacy) formats
- Updated dashboards: DashboardCoach.tsx, AdminDashboard.tsx, DashboardEntrepreneur.tsx

### Investor Notes Read Tracking
- Added `lastAdminViewedNotesAt` timestamp to track when admin views investor notes
- Unread badge now clears when admin opens notes dialog (separate from marking as completed)
- New endpoint: `POST /api/investor-notes/:investorId/mark-read`

### Email Notifications for Investor Notes
All investor note interactions trigger email notifications via Resend:
- Admin creates new note → Email sent to investor
- Investor responds → Email sent to ADMIN_EMAIL (falls back to buhler.lionel+admin@gmail.com)
- Admin responds → Email sent to investor

**IMPORTANT**: Both `server/routes.ts` and `backend/index.js` use `ADMIN_EMAIL` constant with fallback to ensure emails are delivered to a real inbox, not `admin@touchconnectpro.com` which may not be receiving emails.

### Debugging Investor Note Emails
Enhanced logging added to both files for debugging email delivery:
- Logs `fromAdmin` value and investor email
- Logs whether resendData client is available
- Logs target admin email when sending
- Production (Render) requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL` env vars

### Coach Dashboard Restructure (December 2025)
Coach Dashboard now matches Mentor Dashboard structure with 4 tabs:
- **Overview**: Editable profile with expertise, rates, LinkedIn, focus areas, bio, and profile picture
- **Entrepreneurs**: Shows clients who have purchased coaching services (name/email only)
- **Messages**: Admin-only communication channel
- **Earnings**: Historical transactions with commission breakdown (80% coach, 20% platform)

New API endpoints (synchronized in both server/routes.ts and backend/index.js):
- `GET /api/coaches/:coachId/clients` - Returns coach's clients (placeholder until payment integration)
- `GET /api/coaches/:coachId/transactions` - Returns earnings history (placeholder until payment integration)
- `PUT /api/coaches/profile/:id` - Updates coach profile including bio and profileImage

### Coach Profile Enhancements (December 2025)
- **Focus Areas**: Changed from textarea to dropdown select (FOCUS_AREAS_OPTIONS)
  - Options: Business Strategy, Pitching & Fundraising, Product & Technology, Marketing & Sales, Operations & Scaling, Leadership & Team Building, Legal & Compliance, Financial Planning, Sustainability & Impact
- **Bio Field**: Added 4-row textarea for coach bio description
- **Profile Picture**: Added Supabase storage upload (5MB limit, JPG/PNG/GIF/WebP)
  - Stored in "profile-images" bucket as `coach-{id}-{timestamp}.{ext}`
  - Public URL saved to `profile_image` column in coach_applications table
- **Admin Dashboard**: Added LinkedIn and Bio display for approved coaches
- **Profile Image Display**: Coach profile pictures now display in:
  - Entrepreneur Dashboard (Coach marketplace tab)
  - Admin Dashboard (Pending and Approved coaches sections)
  - Mentor Dashboard (Available Coaches tab)

Commission calculation: Computed client-side as `commission = amount * 0.20`, `netEarnings = amount * 0.80`

### Mentor Dashboard - Available Coaches Tab (December 2025)
- Added "Available Coaches" tab to Mentor Dashboard
- Allows mentors to browse all approved coaches to recommend to their portfolio members
- Displays coach cards with:
  - Profile picture (with fallback to initials)
  - Name and expertise
  - Star rating (if available)
  - Bio (line-clamped to 3 lines)
  - Focus areas
  - LinkedIn link
  - Three-tier pricing (Intro Call, Session, Monthly)

### Stripe Connect for Coach Marketplace (December 2025)
Implemented Stripe Connect with destination charges for coach payments:
- **Payment Flow**: Entrepreneur purchases coach service → 80% goes to coach's connected account, 20% platform fee
- **Service Types**: intro (15 min call), session (coaching session), monthly (subscription/full course)
- **Coach Onboarding**: Coaches connect their Stripe account via standard Connect onboarding flow
- **Dynamic Pricing**: Uses `price_data` at checkout time based on coach's individual rates

New Stripe Connect API endpoints (synchronized in both server/routes.ts and backend/index.js):
- `POST /api/stripe/connect/create-account` - Create Stripe Connect account for coach
- `GET /api/stripe/connect/account-link/:coachId` - Get onboarding link for coach
- `GET /api/stripe/connect/account-status/:coachId` - Check if coach has completed onboarding
- `POST /api/stripe/connect/checkout` - Create checkout session with destination charges

**Coach Dashboard Updates**:
- Shows Stripe Connect status card in Overview tab
- Green card if onboarding complete, amber card with "Connect with Stripe" button if not
- Automatic redirect to Stripe onboarding flow

**Entrepreneur Dashboard Updates**:
- Purchase buttons on each coach card (Intro Call, Session, Monthly)
- Buttons disabled while processing, show loading spinner
- Redirects to Stripe Checkout with coach's connected account as destination

**Database Requirement**: Add `stripe_account_id` column to `coach_applications` table (see Required Database Migrations section)

## Backend Synchronization

**IMPORTANT**: The `backend/index.js` file is a standalone copy for Render production deployment. It must be kept in sync with `server/routes.ts` (development).

Key synchronized endpoints:
- **Investor Notes**:
  - `POST /api/investor-notes/:investorId` - Create new note
  - `POST /api/investor-notes/:investorId/respond` - Add response
  - `PATCH /api/investor-notes/:investorId/:noteId/toggle` - Toggle completion
  - `POST /api/investor-notes/:investorId/mark-read` - Mark as read
- **Coach Endpoints**:
  - `GET /api/coaches/:coachId/clients` - Get coach's clients
  - `GET /api/coaches/:coachId/transactions` - Get coach's earnings history
- **Stripe Connect Endpoints**:
  - `POST /api/stripe/connect/create-account` - Create Stripe Connect account
  - `GET /api/stripe/connect/account-link/:coachId` - Get onboarding link
  - `GET /api/stripe/connect/account-status/:coachId` - Check account status
  - `POST /api/stripe/connect/checkout` - Create checkout with destination charges
- **Stripe Webhook**:
  - `POST /api/stripe/webhook` - Handles checkout.session.completed events for coach purchases. Sends email notifications to entrepreneur, coach, and admin (buhler.lionel+admin@gmail.com). Also saves purchase to coach_purchases table.

## Required Database Migrations (Supabase)

Run these SQL commands in Supabase SQL Editor if columns don't exist:

```sql
-- Add invitees columns to meetings table
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS invitees TEXT[] DEFAULT '{}';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS invitee_type TEXT;

-- Add data column to investor_applications if not exists
ALTER TABLE investor_applications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- Add bio and profile_image columns to coach_applications table
ALTER TABLE coach_applications ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE coach_applications ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add stripe_account_id for Stripe Connect integration
ALTER TABLE coach_applications ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Create coach_purchases table for tracking coaching service transactions
CREATE TABLE IF NOT EXISTS coach_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id TEXT NOT NULL,
  coach_name TEXT,
  entrepreneur_email TEXT NOT NULL,
  entrepreneur_name TEXT,
  service_type TEXT NOT NULL,
  service_name TEXT,
  amount INTEGER NOT NULL,
  platform_fee INTEGER,
  coach_earnings INTEGER,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries by coach_id and entrepreneur_email
CREATE INDEX IF NOT EXISTS idx_coach_purchases_coach_id ON coach_purchases(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_purchases_entrepreneur_email ON coach_purchases(entrepreneur_email);
```

### Coach Purchases Table (December 2025)
The `coach_purchases` table stores all coaching service transactions:
- **coach_id**: References the coach from coach_applications
- **entrepreneur_email**: Email of the entrepreneur who purchased
- **service_type**: 'intro', 'session', or 'monthly'
- **amount**: Total amount in cents (e.g., 2500 = $25.00)
- **platform_fee**: 20% platform fee in cents
- **coach_earnings**: 80% coach earnings in cents
- **stripe_session_id**: Stripe checkout session ID for reference

### Coach Purchase Flow
1. Entrepreneur selects a coach service (Intro/Session/Monthly)
2. Stripe checkout processes payment with destination charges
3. Webhook receives `checkout.session.completed` event
4. Purchase saved to `coach_purchases` table
5. Emails sent to both entrepreneur and coach
6. Coach Dashboard shows client in "Entrepreneurs" tab
7. Coach Dashboard shows transaction in "Earnings" tab
8. Entrepreneur can view purchase history

### New API Endpoints (December 2025)
- `GET /api/coaches/:coachId/clients` - Returns unique clients who purchased from coach
- `GET /api/coaches/:coachId/transactions` - Returns earnings history with commission breakdown
- `GET /api/entrepreneurs/:email/coach-purchases` - Returns entrepreneur's purchase history
- `GET /api/admin/earnings` - Returns all coach purchases with aggregated totals (totalRevenue, platformFees, coachEarnings)

### Admin Earnings Tab (December 2025)
Added Earnings tab to Admin Dashboard displaying:
- **Summary Cards**: Total Revenue, Platform Fees (20%), Coach Payouts (80%)
- **Transaction Table**: All coach marketplace purchases with date, coach name, entrepreneur, service type, amount breakdown, and status
- Data fetched from `/api/admin/earnings` endpoint which queries the `coach_purchases` table

## Required Supabase Storage Setup

For coach profile pictures to work, create a storage bucket in Supabase:

1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name it: `profile-images`
4. Set it as **Public** (for public URL access)
5. Add a policy to allow uploads:
   - Policy name: `Allow authenticated uploads`
   - Allowed operations: `INSERT`, `UPDATE`, `DELETE`
   - Target roles: `authenticated`