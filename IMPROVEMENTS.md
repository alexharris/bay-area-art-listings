# Improvement Suggestions

A prioritized list of potential improvements for Bay Area Art Listings.

---

## Accessibility

### High Priority
- ~~Add `aria-label` attributes to all SVG icons (map pins, globe, clock, instagram)~~ ✓
- Replace interactive `<span>` elements with proper `<button>` elements (HoursPopup, listing toggles) *(partially done - hours button fixed)*
- Add visible focus indicators (`:focus-visible` states) to all interactive elements
- Implement focus trapping in modal dialogs (About, Newsletter) *(Radix Dialog handles this automatically)*
- Add skip-to-content link for keyboard users

### Medium Priority
- Verify color contrast meets WCAG AA standards (especially `#666` text, gray badges)
- ~~Add `rel="noopener noreferrer"` to all external `target="_blank"` links~~ ✓
- ~~Replace emoji loading indicator with semantic loading state and screen reader text~~ ✓
- Manage focus properly on "Read more/less" button toggles
- Add restore focus behavior when modals close

### Low Priority
- Add breadcrumbs on show detail page for navigation context
- Improve filter badge semantics (currently `onClick` on Badge without button role)

---

## User Interface

### Layout & Navigation
- Add URL query parameters for filters so users can share filtered views
- Add breadcrumbs on `/show/[slug]` page for easier navigation back to listings
- Consider tablet breakpoint for sidebar (currently jumps from hidden to visible at `lg`)
- Review sidebar width (`w-[400px]`) - may cause horizontal scroll on smaller desktops

### Visual Feedback
- ~~Add skeleton loading screens instead of emoji indicator~~ ✓
- Show success confirmation for newsletter signup and calendar additions
- Add clearer indication of which filters are currently active
- Move "Clear All" button closer to filter controls
- Improve empty state messaging with guidance on how to adjust filters

### Mobile Experience
- Increase tap target sizes (map carousel buttons are only 18x18px, recommend 48px minimum)
- Review calendar popup radio button sizes for touch
- Test "Read more" link tap targets on mobile
- Consider always-visible info bar (currently `md:hidden`)

### Visual Consistency
- Consolidate color system (mix of hardcoded hex values and Tailwind variables)
- Standardize spacing usage (`gap`, `p`, `px`, `py`)
- Fix dynamic Tailwind class issue in TopBar (`bg-${backgroundColor}` won't be purged correctly)

---

## Performance

### Images
- ~~Replace `<img>` tags with Next.js `<Image>` component for Sanity CDN images~~ ✓
  - Automatic lazy loading
  - Responsive image sizes
  - WebP/AVIF format support
  - Blur placeholders
- Make image dimensions responsive to viewport instead of fixed 400x300

### Code Splitting
- Break up `mainListings.js` (18KB+ with 15+ state variables) into smaller components
- Consider extracting filter logic into custom hooks
- Evaluate Leaflet bundle size (~300KB) - consider lighter alternatives or loading on demand

### State Management
- ~~Reduce prop drilling to Sidebar (40+ props) using React Context~~ *(partially - added memoized currentFilters prop)* ✓
- ~~Memoize hook return values to prevent creating new references on every render~~ ✓
- ~~Memoize callbacks to prevent component recreation~~ ✓
- ~~Add comparison checks before updating state objects to prevent unnecessary updates~~ ✓
- ~~Add unique `key` props using `item._id` instead of array index~~ ✓

### Data Fetching
- Add caching to `getListings.js` (currently fetches on every mount)
- Optimize show page to query by slug directly instead of fetching all listings
- Consider SWR or React Query for data fetching with built-in caching
- Cache or debounce Google Places API calls in CityFromPlaceId

---

## SEO

### Metadata
- Add dynamic metadata generation (`generateMetadata`) to show detail pages
- Add JSON-LD structured data for Event schema (startDate, endDate, location)
- Add canonical tags to prevent duplicate content issues
- Add per-page Open Graph tags

### Technical SEO
- Create dynamic sitemap for all show pages
- Add robots.txt if not present
- Ensure consistent trailing slash handling
- Add image alt text consistently (some images use event title generically)

### Content
- Improve "No Results" message with helpful guidance for users and search engines
- Consider descriptive URL slugs for better SEO

---

## Code Quality

### Reduce Duplication
- ~~Create shared utility file for:~~ ✓ *(src/utils/shared.js)*
  - ~~`formatDate` function (defined in 3 files)~~ ✓
  - ~~`generateSlug` function (defined in 2 files)~~ ✓
  - ~~Day names array (hardcoded in 3 files)~~ ✓

### Constants
- Extract magic values to constants file:
  - Sidebar width (`400px`)
  - Map default zoom (`10`)
  - Date range span (`10` years)
  - API version strings

### Error Handling
- Add user-friendly error messages with guidance (not just "Failed to load")
- Implement error boundaries for fault tolerance
- Standardize API error response format
- Add production error tracking (Sentry or similar)

### Type Safety
- Consider migrating to TypeScript (currently `strict: false`)
- Add PropTypes or runtime validation for components
- Add null checks before accessing nested properties

### Documentation
- Add JSDoc comments to utility functions
- Document complex filter logic
- Add component API documentation

---

## Features

### User Features
- Favorites/bookmarking for exhibitions
- Social sharing buttons
- Export filtered results as calendar file (ICS)
- Saved filter presets
- Multi-select for county filter

### Map Enhancements
- Visual marker clustering for dense areas
- Drawing tools to select search areas
- Heatmap view option

### Content
- Event categories/tags for filtering
- Venue/gallery browsing mode
- Artist directory (if data available)

---

## Security

### Links
- ~~Add `rel="noopener noreferrer"` to all `target="_blank"` links~~ ✓
- Validate external link URLs

### API
- Add rate limiting to email signup endpoint
- Implement API versioning strategy

### Configuration
- Add security headers to `next.config.mjs` (CSP, X-Frame-Options)
- ~~Create `.env.example` file for local setup documentation~~ ✓

---

## Quick Wins

These can be done in under 30 minutes each:

1. ~~Add `rel="noopener noreferrer"` to external links~~ ✓
2. ~~Create shared utility file for duplicate functions~~ ✓
3. ~~Add `aria-label` to SVG icons~~ ✓
4. ~~Add `key={item._id}` to list renders~~ ✓
5. ~~Create `.env.example` file~~ ✓
6. ~~Add basic skeleton loading component~~ ✓
7. ~~Implement Next.js Image component for thumbnails~~ ✓ *(Sanity CDN images only)*
8. ~~Add focus management to modals~~ ✓ *(Radix Dialog handles automatically)*
