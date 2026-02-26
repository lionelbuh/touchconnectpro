# TouchConnectPro

## Overview

TouchConnectPro is a platform designed to connect entrepreneurs with mentors, coaches, and investors, facilitating the development of business ideas into fundable ventures. It integrates AI-powered business planning tools with human mentorship to guide founders from concept to an investor-ready stage. The platform operates on a freemium model, offering free AI tools and a premium membership for mentor access. It also hosts marketplaces for coaches offering paid courses and for investors seeking vetted deals, fostering innovation and business growth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript, leveraging Vite for development, Wouter for routing, and TanStack React Query for state management. Styling is handled by Tailwind CSS and shadcn/ui. Supabase client manages authentication and direct database interactions. The design emphasizes a component-based, responsive, and mobile-first approach, incorporating custom fonts and dark mode support. Key features include public marketing pages, role-based dashboards (Entrepreneur, Mentor, Coach, Investor, Admin), application workflows, and an AI-assisted business plan builder. A client-side SaaS revenue calculator is also implemented.

### Backend

The backend is an Express.js server developed with TypeScript, using Drizzle ORM for PostgreSQL interactions (Neon Database serverless driver). Session management is handled by `connect-pg-simple`. It follows a RESTful API design under an `/api` prefix, with a clear separation of concerns.

### Data Storage

PostgreSQL, hosted on Neon, serves as the primary database, with Drizzle ORM providing type-safe queries. Supabase is utilized for user authentication, application-specific data, and business plans. Client-side persistence uses LocalStorage.

### Authentication & Authorization

Supabase Auth handles email/password authentication and password resets, implementing role-based access control (Entrepreneur, Mentor, Coach, Investor, Admin). Express sessions are stored in PostgreSQL. An admin approval workflow is in place for user authorization. Admin authentication uses dedicated `admin_users` and `admin_sessions` tables, protecting `/admin-dashboard` and `/calculator` routes.

### UI/UX Decisions

The platform adopts a component-based, responsive, and mobile-first design. It incorporates custom fonts (Space Grotesk, Inter) and supports dark mode. Coach dashboards and profiles are designed to clearly display expertise, rates, and profile images.

### Feature Specifications

-   **Three-Tier Coach Pricing**: Coaches can set Intro Call, Per Session, and Per Month/Full Courses rates.
-   **Investor Notes**: Admins can track and respond to investor notes with email notifications.
-   **Coach Profile Enhancements**: Coaches can add bios, focus areas, and profile pictures.
-   **Stripe Connect for Coach Marketplace**: Uses Express connected accounts for simplified coach onboarding. Facilitates payments with a 20% platform fee via destination charges. Coaches access earnings via Express dashboard login links. Stripe handles 1099 tax reporting.
-   **Admin Earnings Tab**: Provides a consolidated view of revenue from the coach marketplace and subscriptions.
-   **One-Time Coach Contact Requests**: Entrepreneurs can send an initial contact message to coaches, with a single reply allowed before conversation closure. Email notifications are sent to all parties.
-   **Public Coach Profile Pages**: Shareable profile pages display coach details, pricing, reviews, and a contact CTA.
-   **Enhanced Coach Cards**: Entrepreneur dashboards show detailed coach cards with larger images, side panel design, and "View Profile" buttons.
-   **External Reputation Verification**: Coaches can submit ratings from other platforms, which are verified by admins.
-   **SEO Optimization**: Comprehensive SEO features including enhanced meta tags, dynamic sitemap.xml, robots.txt, and JSON-LD structured data.
-   **SaaS Revenue Calculator**: A client-side financial modeling tool with an "Internal (Founder View)" for detailed projections and a "Public (Educational View)" for simplified estimations. It includes 36-month projections, churn modeling, coaching marketplace income, mentor compensation, and accurate Stripe fee calculation.
-   **NORO Financial Model** (`/noro`): Password-gated financial dashboard with two business unit views: "Shared Studios" (100% consolidated — all revenues, all costs) and "New Brand NORO" (NORO-only revenues: software + hardware, NORO payroll, NORO OpEx). Features 5 tabs (Assumptions, Revenue, P&L, Cash, Annual Summary), year toggle 2026–2028, CSV export, localStorage persistence. Assumptions include separate payroll and OpEx inputs for NORO vs Shared Studios.
-   **Admin Email Management**: Admins can edit user emails across systems and resend registration/login reminder emails.
-   **Trial User Management**: The Admin Dashboard includes a "Trials" tab to manage trial entrepreneurs, assign mentors, and facilitate messaging between trial users and mentors.
-   **Community-Free Membership Flow**: Users can sign up for a free membership after completing a Founder Focus Score quiz, requiring agreement to a contract. Dashboard logic adapts based on idea submission status. After Q8, a contact step asks for name + email; if provided, auto-creates account and sends a password setup email (no manual registration needed on results page).
-   **Ask a Mentor (Community Questions)**: Entrepreneurs can submit questions for mentor guidance. Admins can generate, review, and send AI-prepared answers.
-   **Insights Knowledge Hub**: A section for SEO-optimized articles on startup guidance, acting as a topical authority.

## External Dependencies

1.  **Supabase**: Utilized for PostgreSQL database hosting, user authentication, real-time subscriptions, and storage for user-uploaded files.
2.  **Neon Database**: Provides serverless PostgreSQL backend for the Express.js application.
3.  **Stripe**: Integrated for payment processing, handling subscription billing, and facilitating coach marketplace payments via destination charges and webhooks.
4.  **Resend**: Used for sending transactional emails, including notifications and communications.