# CropGuard AI — Frontend

AI-powered crop disease diagnosis platform built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
cropguard-frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Public home page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── diagnose/page.tsx
│   ├── history/page.tsx
│   ├── guides/page.tsx
│   ├── feedback/page.tsx
│   ├── settings/page.tsx
│   ├── profile/page.tsx
│   └── offline/page.tsx
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # DashboardLayout (sidebar + nav)
│   ├── home/               # Landing page sections
│   ├── dashboard/          # Dashboard view
│   ├── diagnose/           # Diagnose + results + chatbot
│   ├── history/            # Diagnosis history table
│   ├── guides/             # Crop guides
│   ├── feedback/           # Feedback form with stars
│   ├── settings/           # Settings page
│   └── profile/            # Profile page
├── lib/
│   ├── store.ts            # Zustand global state (auth, toasts, diagnoses)
│   ├── data.ts             # Static data (features, testimonials, bot responses)
│   └── utils.ts            # Helper functions
├── hooks/
│   └── useOnlineStatus.ts  # Offline detection hook
└── types/index.ts          # TypeScript interfaces
```

## Demo Login
- Email: `farmer@example.com`  
- Password: `password123`

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Zustand** (state management)
- **Lucide React** (icons)
