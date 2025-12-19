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

### Investor Notes Read Tracking
- Added `lastAdminViewedNotesAt` timestamp to track when admin views investor notes
- Unread badge now clears when admin opens notes dialog (separate from marking as completed)
- New endpoint: `POST /api/investor-notes/:investorId/mark-read`

### Email Notifications for Investor Notes
All investor note interactions trigger email notifications via Resend:
- Admin creates new note → Email sent to investor
- Investor responds → Email sent to admin@touchconnectpro.com
- Admin responds → Email sent to investor

## Backend Synchronization

**IMPORTANT**: The `backend/index.js` file is a standalone copy for Render production deployment. It must be kept in sync with `server/routes.ts` (development).

Key investor notes endpoints synchronized:
- `POST /api/investor-notes/:investorId` - Create new note
- `POST /api/investor-notes/:investorId/respond` - Add response
- `PATCH /api/investor-notes/:investorId/:noteId/toggle` - Toggle completion
- `POST /api/investor-notes/:investorId/mark-read` - Mark as read

## Required Database Migrations (Supabase)

Run these SQL commands in Supabase SQL Editor if columns don't exist:

```sql
-- Add invitees columns to meetings table
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS invitees TEXT[] DEFAULT '{}';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS invitee_type TEXT;

-- Add data column to investor_applications if not exists
ALTER TABLE investor_applications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
```