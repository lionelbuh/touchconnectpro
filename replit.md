# TouchConnectPro

## Overview

TouchConnectPro is a platform connecting entrepreneurs with mentors, coaches, and investors to develop ideas into fundable businesses. It combines AI-powered business planning with human mentorship, guiding founders from concept to an investor-ready stage. The platform operates on a freemium model, offering free AI tools and an optional $49/month membership for mentor access. It also features marketplaces for coaches offering paid courses and investors seeking vetted deals, aiming to foster innovation and business growth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

Built with React and TypeScript, using Vite, Wouter for routing, and TanStack React Query for state management. Styling uses Tailwind CSS and shadcn/ui. Supabase client handles authentication and direct database operations. The design is component-based, responsive, mobile-first, includes custom fonts, and supports dark mode. Key pages include public marketing, role-based dashboards (Entrepreneur, Mentor, Coach, Investor), application flows, an admin dashboard, and an AI-assisted business plan builder.

### Backend

An Express.js server developed with TypeScript, utilizing Drizzle ORM for PostgreSQL (Neon Database serverless driver) interactions. Session management uses `connect-pg-simple`. It follows a RESTful API design under an `/api` prefix, with clear separation of concerns. Custom build scripts with esbuild bundle the server.

### Data Storage

PostgreSQL, hosted on Neon, is the primary database, with Drizzle ORM for type-safe queries. Supabase handles user authentication, application data, and business plans. `shared/schema.ts` defines the database schema. LocalStorage is used for client-side persistence.

### Authentication & Authorization

Supabase Auth manages email/password authentication and password resets, implementing role-based access control (Entrepreneur, Mentor, Coach, Investor, Admin). Express sessions are stored in PostgreSQL. Authorization determines access to dashboard routes and functionalities, including an admin approval workflow.

### UI/UX Decisions

The platform uses a component-based approach with a responsive, mobile-first design. It incorporates custom fonts (Space Grotesk, Inter) and includes dark mode support. Coach dashboards and profile displays are structured to showcase coach expertise, rates, and profile images effectively.

### Feature Specifications

-   **Three-Tier Coach Pricing**: Coaches can set Intro Call, Per Session, and Per Month/Full Courses rates.
-   **Investor Notes**: Admins can track and respond to investor notes, with email notifications for all interactions.
-   **Coach Profile Enhancements**: Coaches can add bios, select from predefined focus areas, and upload profile pictures.
-   **Stripe Connect for Coach Marketplace**: Facilitates payments to coaches with a 20% platform fee via destination charges. Coaches onboard through a standard Stripe Connect flow.
-   **Admin Earnings Tab**: Provides a comprehensive view of revenue from coach marketplace and subscriptions.
-   **One-Time Coach Contact Requests**: Entrepreneurs can send one initial contact message per coach via "Get in Touch" button. Coaches can send one reply, then the conversation closes. All interactions trigger email notifications to coach, entrepreneur, and admin. Table: `coach_contact_requests` in Supabase. Endpoints: POST `/api/coach-contact-requests`, POST `/api/coach-contact-requests/:id/reply`, GET `/api/coaches/:coachId/contact-requests`, GET `/api/entrepreneurs/:email/contact-requests`, GET `/api/admin/contact-requests`, GET `/api/coach-contact-requests/check`.
-   **Public Coach Profile Pages**: Shareable coach profile pages at `/coach/:coachId` featuring large profile photos with gradient header, three-tier service pricing cards, reviews section, share button with clipboard support, and CTA for contacting the coach. Coaches can share their profile URL for marketing purposes. Endpoint: GET `/api/coaches/:coachId` (must be ordered after all other `/api/coaches/:coachId/*` routes to avoid intercepting profile-by-email endpoints).
-   **Enhanced Coach Cards**: Entrepreneur dashboard displays coach cards in single-column layout with larger profile photos (128px avatars), side panel design, gradient backgrounds, and "View Profile" buttons linking to public coach pages.
-   **SEO Optimization**: Comprehensive SEO implementation including:
    - Enhanced meta tags (Open Graph, Twitter Cards, keywords, canonical URL)
    - Dynamic sitemap.xml at `/sitemap.xml` with static pages + approved mentors/coaches
    - robots.txt at `/robots.txt` with sitemap reference
    - JSON-LD structured data endpoints: `/api/seo/organization-schema`, `/api/seo/mentor-schema/:mentorId`, `/api/seo/coach-schema/:coachId`
-   **SaaS Revenue Calculator**: A frontend-only financial modeling tool at `/calculator` with two modes:
    - **Internal (Founder View)**: Full control over all inputs including traffic, conversion, pricing, churn, Stripe fees, fixed/variable costs, marketing spend, coaching marketplace settings, and mentor compensation. Features complete cost breakdown, 36-month projections, and break-even analysis.
    - **Public (Marketing View)**: Simplified educational view with only 3 editable inputs (visitors, conversion, price) + optional coaching toggle. Shows high-level outputs only (Active Members, Platform Revenue, Profit Potential as qualitative indicator). No internal metrics exposed (costs, margins, mentor payouts). Includes CTA and disclaimer.
    - **36-Month Projections (Founder Only)**: Month-by-month subscriber evolution with churn modeling. Includes month selector slider (1-36), three line charts (Subscribers, Revenue vs Costs, Net Profit), collapsible detailed table, CSV export, and break-even month indicator.
    - **Coaching Marketplace Income**: Models coaching adoption rate, average spend per user, and platform commission (default 20%). GMV and commission revenue tracked separately.
    - **Mentor Compensation**: Mentor payouts modeled as COGS (default 50% of subscription + coaching commission revenue). Revenue stays at 100% platform income; mentor payouts appear only in costs.
    - **Stripe Fee Accuracy**: Stripe percentage fees calculated on full processed volume (subscriptions + gross coaching GMV), not just platform revenue.
    - **localStorage Persistence**: Inputs saved per mode (internal vs public) with separate storage keys. Settings persist between sessions.
    - **Design Principle**: One calculator, one logic (`client/src/lib/calculatorLogic.ts`), two views. Founder view = truth; Public view = education + motivation (not promises).
    - No backend required - all calculations happen client-side with instant recalculation.

## External Dependencies

1.  **Supabase**: Provides PostgreSQL database hosting, authentication, user management, real-time subscriptions, and storage for user-uploaded files (e.g., profile images).
2.  **Neon Database**: Serverless PostgreSQL backend for the Express.js application, accessed via `@neondatabase/serverless` driver.
3.  **Stripe**: Integrated for payment processing, handling subscription billing for memberships, and facilitating coach marketplace payments with destination charges and webhooks.
4.  **Resend**: Used for sending transactional emails, including approval/rejection notifications and investor note communications.