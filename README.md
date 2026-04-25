<div align="center">

# ✦ IPDS ArchViz

**A premium architectural visualization hosting platform**

Built with Next.js 14 · Supabase · Framer Motion · Resend

[Live Site Demo](https://archviz-ook88r84k-veilafk.vercel.app/)

</div>

---

## ✦ Overview

IPDS ArchViz is a high-end, production-ready platform designed for architectural studios to showcase Unreal Engine immersive experiences. It provides a seamless transition from static media to interactive cloud-based walkthroughs.

The platform features a robust administrative dashboard for project management, lead tracking, and secure access control, all delivered through a premium, state-of-the-art UI/UX.

---

## ✦ Key Features

- **Premium UI/UX**: Unified design system using glassmorphism, smooth Framer Motion transitions, and a curated dark/light aesthetic.
- **Project Management**: Full CRUD capabilities for projects, including image uploads (main, dark, and light variants).
- **Access Control**: Secure your streams with multiple access levels:
  - **Public**: Instant access with lead capture.
  - **Password**: Gated access for private reviews.
  - **OTP**: Secure 6-digit code verification via Email/SMS.
- **Lead Capture & Analytics**: Tracks every visitor and enquiry.
  - **Overview**: Real-time traffic stats and lead distribution.
  - **Project**: Dedicated hits tracking per experience.
  - **Visitors**: Detailed interaction history with search and CSV export.
  - **Enquiry**: Integrated project enquiries with 10-digit mobile validation and CSV export.
- **Campaigns**: Send personalized project updates to your client base directly from the dashboard.
- **Mobile Optimized**: Fully responsive experience designed to wow clients on any device.

---

## ✦ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Realtime, Storage)
- **Email/OTP**: Resend
- **Haptics**: iOS-style haptic feedback integration
- **Deployment**: Vercel

---

## ✦ Getting Started

### 1. Database Setup
1. Create a new project at [Supabase](https://supabase.com).
2. Execute the provided `DATABASE.sql` in the SQL Editor to set up tables and RLS policies.
3. Create a storage bucket named `project-images` and set it to **Public**.

### 2. Environment Configuration
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSWORD_HASH=sha256_hash_of_your_admin_password
RESEND_API_KEY=your_resend_api_key
```

### 3. Local Development
```bash
npm install
npm run dev
```

---

## ✦ Dashboard Sections

The Admin Panel (`/admin`) is organized into five specialized modules:

- **Overview**: Global traffic analytics and growth trends.
- **Project**: CRUD management and visibility toggles for all ArchViz experiences.
- **Visitors**: Searchable lead database for "Passive" interest.
- **Enquiry**: Centralized hub for high-intent project enquiries and contact details.
- **Campaign**: Email broadcast center for project announcements.

---

<div align="center">
<sub>IPDS · Professional Architectural Visualization Platform</sub>
</div>
