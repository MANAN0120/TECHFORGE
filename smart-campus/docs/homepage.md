# Strategic Homepage & Route Structure

## Overview
The **Strategic Homepage** serves as the initial 10-second entry landing page at `/` for SmartCampus. It outlines the core value proposition ("Navigation that works when GPS doesn't"), presents the four core features, and proves the campus-agnostic architecture.

---

## Route Map

- `/`: Strategic Homepage (`HomePage.tsx`)
- `/app/*`: Smart Campus Application Shell (`AppShell.tsx`)
  - Default view: Interactive Map & Live Navigation (`/app`)
- Unknown routes (`/*`): Automatically redirects to `/app`.

---

## Key Homepage Sections

1. **The Hook (Hero Section)**
   - Headline: "The campus app that works when GPS doesn't."
   - Subheadline: "Navigation · Safety · Coordination · Every campus"
   - Primary CTA: "LAUNCH LIVE DEMO →" (navigates directly to `/app`)
   - Accessibility skip link: "Skip to demo" (`#main-cta`)

2. **The Four Features (2×2 Grid)**
   - **Navigation**: Indoor/outdoor graph routing.
   - **Meetup**: AI-optimized meeting points.
   - **Class Auto-Pilot**: Timetable schedule & walk time notifications.
   - **Safety**: Emergency SOS & Lost & Found community board.

3. **Architecture Proof**
   - Demonstrates campus manifest portability ("One engine. Any campus.").
   - Displays core tech stack chips (React 18, TypeScript, FastAPI, Leaflet, NetworkX, Gemini AI).
