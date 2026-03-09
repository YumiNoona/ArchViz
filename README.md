# ArchViz Studio — Interactive Architecture Experiences

A modern production-ready platform for hosting multiple Unreal Engine Pixel Streaming architectural visualization projects.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design tokens
- **Animation**: Framer Motion
- **Fonts**: Cormorant Garamond (display) + DM Sans (body) + DM Mono
- **Theme**: next-themes (dark/light with animated transitions)
- **Backend**: Supabase (visitor data collection)
- **Deployment**: Vercel

## Features

- ✦ Stunning hero with animated gradient mesh background
- ✦ Project grid with 3-col → 2-col → 1-col responsive layout
- ✦ Filterable by project type with animated pill transitions
- ✦ Hover effects: scale, glow shadow, icon reveal
- ✦ Visitor data collection modal before stream launch
- ✦ Supabase integration for visitor analytics
- ✦ Dark/light mode toggle with icon swap animation
- ✦ Custom cursor with hover morphing (desktop only)
- ✦ Mobile haptic feedback on all interactive elements
- ✦ Fully accessible: keyboard navigation, aria labels, semantic HTML
- ✦ Architectural SVG illustrations per project type
- ✦ Scroll-parallax hero with fade-out on scroll
- ✦ Floating HUD cards with looping float animation

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd archviz-platform
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Add your projects

Edit `data/projects.ts` — replace the placeholder `streamURL` values with your actual Vagon Pixel Streaming URLs:

```ts
{
  id: "luminara-tower",
  title: "Luminara Tower",
  streamURL: "https://vagon.io/stream/YOUR_ACTUAL_STREAM_ID",
  // ...
}
```

### 5. Add project images

Place project preview images in `/public/projects/`:
- `tower.jpg`
- `pavilion.jpg`
- `villa.jpg`
- `district.jpg`
- `resort.jpg`
- `museum.jpg`

Recommended size: **800×600px** or **1200×900px** (4:3 ratio)

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Add your environment variables in **Vercel → Settings → Environment Variables**.

---

## Customization

### Colors
Edit `styles/globals.css` — CSS custom properties under `:root` and `.dark`.

### Projects
Add/edit/remove entries in `data/projects.ts`.

### Fonts
Change Google Fonts imports in `styles/globals.css` and `--font-display` / `--font-body` variables.

### Stream behavior
By default, streams open in a new tab. To embed via iframe, modify `LaunchModal.tsx`.

---

## Supabase Analytics

Query your visitor data:

```sql
-- All visits
SELECT * FROM visitors ORDER BY timestamp DESC;

-- Visits per project
SELECT * FROM visitor_analytics;

-- Unique visitors this week
SELECT COUNT(DISTINCT email) FROM visitors
WHERE timestamp > NOW() - INTERVAL '7 days';
```

---

## Folder Structure

```
archviz-platform/
├── app/
│   ├── layout.tsx         # Root layout with fonts, theme, cursor
│   └── page.tsx           # Main page (Hero + Grid + About + Contact)
├── components/
│   ├── Navbar.tsx          # Sticky nav with scroll behavior
│   ├── Hero.tsx            # Full-viewport animated hero
│   ├── ProjectGrid.tsx     # Filterable project grid
│   ├── ProjectCard.tsx     # Individual project card with hover
│   ├── LaunchModal.tsx     # Visitor form modal + stream launch
│   ├── About.tsx           # Technology section
│   ├── Contact.tsx         # Contact form section
│   ├── Footer.tsx          # Site footer
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   ├── ThemeProvider.tsx   # next-themes wrapper
│   ├── CustomCursor.tsx    # Animated desktop cursor
│   └── ui/
│       └── Toaster.tsx     # Toast notifications
├── data/
│   └── projects.ts         # Project data config
├── lib/
│   ├── supabase.ts         # Supabase client + visitor save
│   └── utils.ts            # cn() + haptic()
├── styles/
│   └── globals.css         # Tailwind + design tokens + fonts
├── supabase-schema.sql     # Run in Supabase SQL Editor
├── .env.local.example      # Environment variable template
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```
