# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bay Area Art Listings is a Next.js 15 application that displays visual arts exhibitions in the San Francisco Bay Area. Content is managed through an embedded Sanity Studio and served from Sanity's CMS.

## Commands

- `npm run dev` - Start development server on port 3333 (uses Turbopack)
- `npm run build` - Build for production
- `npm run lint` - Run Next.js linting

## Architecture

### Content Management
- **Sanity Studio** is embedded at `/studio` route (`src/app/studio/[[...tool]]/page.jsx`)
- **Schema types** in `src/sanity/schemaTypes/`:
  - `listing` - Art exhibition events with dates, location reference, notes (portable text)
  - `location` - Venues with address, geolocation, hours, Google Place ID
  - `settings` - Site-wide settings singleton
  - `page` - Generic pages
- **Studio structure** (`src/sanity/structure.js`) organizes listings by year/month

### Frontend Routes
- `/` - Main listings page with filtering/sorting (`src/app/(site)/page.js`)
- `/show/[slug]` - Individual show detail page (slug generated from event title)
- `/dashboard` - Admin dashboard
- `/studio` - Sanity Studio

### Core Components
- `src/app/components/mainListings.js` - Main client component managing state for listings, filters, map view
- `src/app/components/sidebar/` - Filter controls (date picker, county selector, display filters, sort)
- `src/app/components/map/mapView.js` - Leaflet map integration
- `src/app/components/listing.js` - Individual listing display

### Data Flow
1. `getListings.js` fetches from Sanity with GROQ, joining listings with location data
2. `src/utils/filters.js` - Client-side filtering logic (on view, opening, closing, date ranges, county)
3. `src/utils/sort.js` - Sorting logic (closing soon, opening soon, etc.)
4. Filtering computes `isOnViewToday` based on show dates AND venue hours

### API Routes
- `/api/email` - Email sending via Postmark
- `/api/cron/email` - Scheduled email trigger
- `/api/google-place` - Google Places API proxy
- `/api/addEmail` - Newsletter signup (Supabase)

### Key Patterns
- Dates use Pacific Time (America/Los_Angeles) for display and filtering
- Notes field uses `+++` separator to split preview/expanded text in portable text
- Location hours stored as day-of-week strings (e.g., "10am-6pm" or "Closed")
- County filtering uses zip code matching from `src/data/bay-area-zipcodes.json`

## Memory

Keep `memory/MEMORY.md` and topic files (e.g. `memory/email.md`) up to date as the project evolves. Update them when debugging reveals new insights, env var names change, routes are added/removed, or architectural decisions are made.

## Git Commits

- Do not add Co-Authored-By or any Claude/Anthropic attribution lines in commit messages

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID (ride9vgj)
- `NEXT_PUBLIC_SANITY_DATASET` - Dataset name
- `NEXT_PUBLIC_SANITY_API_VERSION` - API version (defaults to 2024-12-26)
