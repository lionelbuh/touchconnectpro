# TouchConnectPro

## Overview

TouchConnectPro is a platform that connects entrepreneurs with mentors, coaches, and investors to transform ideas into fundable businesses. The platform combines AI-powered business planning tools with human mentorship to guide founders from concept to investor-ready stage.

The application follows a freemium model where entrepreneurs can start for free with AI-assisted idea refinement, then upgrade to a $49/month membership once accepted into a mentor's portfolio. The platform also includes marketplaces for coaches (who offer paid courses) and investors (who access vetted deal flow).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest Session)

**Pre-Approval Status for Entrepreneurs:**
- ✅ Admin can "Pre-Approve" entrepreneurs who are awaiting payment confirmation
- ✅ Pre-approved entrepreneurs appear in dedicated section with amber styling
- ✅ "Approve (Payment Received)" button converts pre-approved to fully approved
- ✅ Pre-approved entrepreneurs get view-only dashboard access with payment-pending messaging
- ✅ API endpoint updated to accept "pre-approved" status alongside "approved" and "rejected"
- ✅ Distinct status hierarchy: pending → pre-approved → approved (or pending → approved/rejected directly)

**Mentor Dashboard - Full Entrepreneur Profile View:**
- ✅ Mentors can now view complete entrepreneur profiles in portfolio tab
- ✅ Expandable "Idea Proposal (43 Questions)" section with full ideaReview data
- ✅ Expandable "Business Plan AI Draft (11 Sections)" with all business plan fields
- ✅ Added country, state, LinkedIn, and idea name fields to entrepreneur cards
- ✅ API endpoint updated to return ideaReview and businessPlan data for assigned entrepreneurs

**Mentor-Entrepreneur Direct Messaging:**
- ✅ Mentors can send direct messages to individual entrepreneurs via modal
- ✅ Entrepreneurs see mentor message section when assigned (green-themed)
- ✅ Message history now displays mentor messages with distinct styling (emerald green)
- ✅ Two-way messaging between mentors and entrepreneurs fully functional

**Previous Session - Email & Authentication System:**
- Integrated Resend for transactional emails (approval/rejection notifications)
- Created `password_tokens` table in Supabase for secure password setup links (7-day expiry)
- Users receive approval emails with password setup link
- After password setup, users are routed to their personal dashboard based on role
- Login now properly redirects to role-specific dashboards (entrepreneur, mentor, coach, investor)
- Fixed admin dashboard approve/reject buttons with proper styling

**Backend Improvements:**
- Updated `/api/set-password` to create user profile in `users` table with role
- Added support for `RESEND_API_KEY` environment variable (for Render deployment)
- Added detailed logging for email sending and error tracking
- Email sends with branded HTML templates for approved/rejected users
- Updated `/api/mentor-assignments/mentor-email/:email` to return full entrepreneur data including ideaReview and businessPlan

**Deployment:**
- Backend now requires: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `FRONTEND_URL` environment variables on Render
- Domain must be verified in Resend for email deliverability

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript
- Vite as the build tool and development server
- Wouter for client-side routing
- TanStack React Query for server state management
- Tailwind CSS for styling with shadcn/ui components
- Supabase client for authentication and database operations

**Design Decisions:**
- Component-based architecture using shadcn/ui design system
- Custom fonts: Space Grotesk for headings, Inter for body text
- Theme system with dark mode support using CSS variables
- Responsive design with mobile-first approach
- Path aliases (@/, @shared/, @assets/) for clean imports

**Key Pages:**
- Public marketing pages (Home, How It Works, Pricing, Q&A)
- Role-based dashboards (Entrepreneur, Mentor, Coach, Investor)
- Application flows for each user type
- Admin dashboard for approving applications
- Business plan builder with AI assistance

### Backend Architecture

**Technology Stack:**
- Express.js server
- TypeScript throughout
- Drizzle ORM for database operations
- PostgreSQL via Neon Database serverless driver
- Session management with connect-pg-simple
- In-memory storage fallback for development

**Design Decisions:**
- RESTful API endpoints under `/api` prefix
- Separation of concerns: routes, storage layer, static file serving
- Custom build script using esbuild for server bundling
- Vite middleware integration for development HMR
- Webhook support with raw body parsing for payment processing

**Server Structure:**
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Data access layer interface
- `server/static.ts` - Production static file serving
- `server/vite.ts` - Development server with HMR

### Data Storage

**Database:**
- PostgreSQL hosted on Neon (serverless)
- Drizzle ORM for type-safe database queries
- Schema defined in `shared/schema.ts`
- Migration files in `/migrations` directory

**Current Schema:**
- Users table with basic authentication fields
- Schema is minimal, suggesting Supabase handles most data storage

**Alternative Storage:**
- MemStorage class provides in-memory fallback
- LocalStorage used client-side for form state and temporary data

**Design Rationale:**
The application uses a hybrid storage approach. Supabase handles user data, applications, and business plans through its built-in database and authentication. The Express backend maintains a minimal user schema for session management. LocalStorage provides client-side persistence for form progress and draft states.

### Authentication & Authorization

**Authentication System:**
- Supabase Auth for user management
- Email/password authentication
- Password reset flow
- Role-based access control (Entrepreneur, Mentor, Coach, Investor, Admin)

**Session Management:**
- Express sessions stored in PostgreSQL
- connect-pg-simple for session store
- Credentials included in API requests
- Custom query functions handle 401 responses

**Authorization Pattern:**
- Role stored in user profile/metadata
- Different dashboard routes per role
- Admin approval workflow for applications
- Protected routes check authentication status

### External Dependencies

**Third-Party Services:**

1. **Supabase** (Primary Database & Auth)
   - PostgreSQL database hosting
   - Authentication and user management
   - Real-time subscriptions capability
   - Storage for user-uploaded files

2. **Neon Database** (PostgreSQL Serverless)
   - Serverless PostgreSQL for Express backend
   - Connection pooling and auto-scaling
   - Used via `@neondatabase/serverless` driver

3. **Stripe** (Payment Processing)
   - Subscription billing for $49/month membership
   - Webhook integration for payment events
   - Commission processing for coach marketplace

4. **GitHub Octokit** (Optional Integration)
   - REST API client for GitHub
   - Potential use for portfolio/project management

5. **Resend** (Email Service)
   - Transactional emails for approval/rejection notifications
   - Password setup links for new users
   - Domain verification required for email deliverability
   - API key configured via environment variables on Render

**UI Component Libraries:**
- Radix UI primitives (dialogs, dropdowns, tooltips, etc.)
- shadcn/ui component collection
- Lucide React for icons
- CMDK for command palette
- date-fns for date manipulation

**Development Tools:**
- Replit-specific plugins (dev banner, cartographer, error modal)
- Custom Vite plugin for OpenGraph meta tags
- TypeScript for type safety
- ESBuild for production bundling

**Design Rationale:**
The architecture separates concerns between Supabase (user-facing data) and Express/Neon (server logic and sessions). This allows Supabase to handle authentication and real-time features while Express manages business logic, payment webhooks, and admin operations. The dual-database approach provides flexibility but may require data synchronization between systems.