# AGENT HANDOVER & KNOWLEDGE BASE — BEE & BEAUTY

> **Target Audience**: AI Agents (Antigravity, Cursor, Claude Code, Copilot, etc.) and human engineers onboarding to the Bee & Beauty codebase.
> **Last Updated**: October 2026
> **Project**: Bee & Beauty (`beeandbeauty`) — Luxury Cosmetics & Skincare E-Commerce Platform
> **Target Market**: Bangladesh (BDT / `৳`)

---

## 1. Executive Summary & Brand Overview

**Bee & Beauty** is a luxury direct-to-consumer cosmetics and skincare brand operating in Bangladesh. The platform is designed to provide an opulent, fast, and frictionless shopping experience tailored for local e-commerce nuances (Cash on Delivery, bKash/Nagad mobile wallets, express Dhaka & nationwide courier delivery, and real-time WhatsApp consultation), coupled with an executive back-office control panel for catalog and operations management.

### Brand Identity & Positioning
- **Brand Tagline**: *"Nature, refined."*
- **Aesthetic**: Minimalist luxury, organic elegance, honey-infused and botanical formulations, premium editorial feel.
- **Tone of Voice**: Sophisticated, warm, authoritative, dermatologically conscious.

### Verified Brand Assets & Contact Information
- **Official WhatsApp & Direct Helpline**: `+8801754502430` (Used for customer care, shade consultation, and order dispute handling).
- **Official Email**: `beeandbeauty.bd@gmail.com`
- **Social Media Channels**:
  - Facebook: `https://facebook.com/beeandbeauty.bd`
  - Instagram: `https://instagram.com/beeandbeauty.bd`
  - TikTok: `https://tiktok.com/@beeandbeauty.bd`
  - Threads: `https://threads.net/@beeandbeauty.bd`
- **Official Logo**: Stored at `public/images/logo.png` and `public/logo.png`. Rendered via `components/ui/Logo.tsx`.
- **Favicon**: Luxury vector badge in Deep Plum and Honey Gold at `app/icon.svg`.

---

## 2. Design System & Visual Tokens

The project uses a strict luxury color palette and bespoke typography. All styling must conform to the tokens defined in `styles/tokens.css` and `app/globals.css`.

### Color Palette (Cosmetics & Skincare Harmony)

| Token | Name | Hex | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--bb-plum` | **Deep Plum** | `#6A1B6D` | Primary brand color, cosmetics anchor, luxury headings, primary CTA buttons. |
| `--bb-magenta` | **Deep Magenta** | `#C2188B` | Vibrant cosmetic accent, sale banners, wishlist active heart, high-pigment callouts. |
| `--bb-gold` | **Honey Gold** | `#D4AF37` | Luxury metallic accent, raw nectar emblem, bestseller badges, star ratings. |
| `--bb-sage` | **Botanical Sage** | `#3E6351` | Clean skincare anchor, clinical barrier repair, dermatologist-tested badges. |
| `--bb-nectar` | **Honey Nectar** | `#E5A93C` | Raw propolis & royal jelly glow, dewy moisture badges, warm radiance. |
| `--bb-ivory` | **Warm Ivory** | `#FFF9F5` | Default body canvas background, soft clean backdrop. |
| `--bb-blush` | **Soft Blush** | `#FCE4EC` | Rosewater tint, subtle container backgrounds, promotional tile contrast. |
| `--bb-charcoal` | **Charcoal** | `#2C2C2C` | High-legibility typography for body copy, paragraphs, descriptions. |

*Additional neutrals & tints:* Botanical Sage Light (`#EBF3EE`), Honey Nectar Light (`#FEF7ED`), Fresh Dew (`#F0F7F4`), White (`#FFFFFF`), Light Border (`#F0E6DE`).

### Typography Stack
Google Fonts are imported in `app/layout.tsx` and configured via CSS variables:
- **Display & Headings**: `Cormorant Garamond` (`font-serif`, serif italic accents for luxury emphasis).
  - CSS Variable: `var(--font-cormorant)`
  - Class: `font-serif`
- **Body & Interfaces**: `Karla` (`font-sans`, crisp modern legibility for UI and specs).
  - CSS Variable: `var(--font-karla)`
  - Class: `font-sans`

---

## 3. Technology Stack & Environment

- **Framework**: Next.js `16.4.0` (App Router, Turbopack enabled, Partial Prerendering & Cache Components).
- **React**: `19.3.0` (Server Components by default; `'use client'` only where interactivity is required).
- **TypeScript**: Strict type validation across all modules.
- **Styling**: Tailwind CSS v4 + custom CSS custom properties in `styles/tokens.css`.
- **Database**: Remote Supabase PostgreSQL with automated in-memory dual-layer resilience.
- **Icons**: `lucide-react` (feather-style crisp stroke icons).
- **Testing**: Node Native Test Runner (`node --experimental-strip-types --test 'lib/__tests__/**/*.test.ts'`).
- **Package Manager**: npm.

---

## 4. Architecture & Directory Blueprint

```
beeandbeauty/
├── app/                             # Next.js App Router (Storefront & Admin)
│   ├── layout.tsx                   # Root layout (Fonts, metadata, FloatingWhatsApp, CartDrawer)
│   ├── globals.css                  # Global utility classes & root CSS variables
│   ├── page.tsx                     # Homepage (Hero, Categories, Products, Video, Offer, Founder Note)
│   ├── shop/page.tsx                # Catalog browsing, filtering, search, sorting
│   ├── product/[slug]/page.tsx      # PDP (Gallery, ShadePicker, OfferAccordion, Reviews, Related)
│   ├── cart/page.tsx                # Dedicated cart view
│   ├── checkout/page.tsx            # Multi-step checkout (Inside/Outside Dhaka, COD, bKash, Nagad)
│   ├── track-order/page.tsx         # Real-time logistics tracker by order reference & phone
│   ├── offers/page.tsx              # Promotional campaigns & coupon vouchers landing
│   ├── admin/                       # Executive Admin Panel Suite
│   │   ├── page.tsx                 # Executive Dashboard & analytics metrics
│   │   ├── orders/page.tsx          # Orders & dispatch fulfillment desk
│   │   ├── customers/page.tsx       # Customer profiles & LTV CRM
│   │   ├── products/page.tsx        # Product catalog, stock matrix & bulk upload
│   │   ├── categories/page.tsx      # Category taxonomy & subcategory manager
│   │   ├── inventory/page.tsx       # Real-time stock & shade-level overrides
│   │   ├── banners/page.tsx         # Hero slides & promo banners sequencing
│   │   ├── offers/page.tsx          # Limited offers & flash deals manager
│   │   ├── studio/page.tsx          # Pro Beauty Studio masterclasses & bookings
│   │   ├── coupons/page.tsx         # Coupon promotion codes engine
│   │   ├── inquiries/page.tsx       # Customer support ticket desk
│   │   ├── reviews/page.tsx         # Verified product review moderation
│   │   ├── subscribers/page.tsx     # VIP newsletter subscriber directory
│   │   └── login/page.tsx           # Secure executive session authentication
│   │
│   └── api/                         # Next.js 16 Route Handlers (REST Endpoints)
│       ├── orders/                  # Storefront order placement, tracking, by-id
│       ├── coupons/                 # Coupon validation
│       ├── shipping/                # Dynamic shipping calculation & SLA
│       ├── contact/                 # Support inquiry submissions
│       ├── reviews/                 # Product review submissions
│       ├── newsletter/              # Newsletter subscription submissions
│       ├── banners/                 # Public banner retrieval
│       ├── offers/                  # Public limited offers
│       ├── studio/                  # Public masterclasses & bookings
│       └── admin/                   # Executive Back-Office Endpoints
│           ├── auth/                # Executive login, session verification, logout
│           ├── dashboard/           # Aggregate financial & operational metrics
│           ├── orders/              # Admin order management & status transitions
│           ├── customers/           # CRM analytics, customer LTV, notes
│           ├── products/            # Product CRUD and /bulk batch upload
│           ├── categories/          # Category CRUD & taxonomy management
│           ├── coupons/             # Coupon creation, toggles, deletion
│           ├── banners/             # Banner slides CRUD
│           ├── offers/              # Limited offers CRUD
│           ├── studio/              # Studio tutorials & consultation bookings
│           ├── inquiries/           # Ticket status workflow
│           ├── reviews/             # Review moderation & approval
│           └── subscribers/         # Subscriber directory
│
├── components/
│   ├── admin/                       # Executive Admin UI Components
│   │   ├── AdminHeader.tsx          # Top bar with status pill, BDT badge, action buttons
│   │   ├── AdminSidebar.tsx         # Collapsible 13-module navigation menu
│   │   ├── AdminUIContext.tsx       # Responsive sidebar state provider
│   │   ├── BulkProductUploadModal.tsx# CSV/JSON bulk catalog importer with preview
│   │   ├── CreateProductModal.tsx   # Formula builder with auto-slug & shade palette
│   │   ├── CreateCategoryModal.tsx  # Category & subcategory builder
│   │   ├── CreateBannerModal.tsx    # Slide banner creator
│   │   ├── CreateOfferModal.tsx     # Campaign deal builder
│   │   ├── CreateTutorialModal.tsx  # Masterclass video editor
│   │   ├── CustomerDetailModal.tsx  # Customer timeline & concierge notes
│   │   └── MetricCard.tsx           # Key operational KPI card
│   │
│   ├── ui/                          # Primitive Luxury UI Components
│   │   ├── Logo.tsx                 # Official brand logo
│   │   ├── Button.tsx               # Brand button variants (plum, magenta, gold, outline)
│   │   ├── Badge.tsx                # Badges (bestseller, new, sale, organic)
│   │   ├── Price.tsx                # Formatted BDT price renderer
│   │   └── FloatingWhatsApp.tsx     # Floating WhatsApp concierge (+8801754502430)
│   │
│   ├── layout/                      # Storefront Structural Components
│   │   ├── Header.tsx               # Main nav, search, wishlist & cart counters
│   │   ├── Footer.tsx               # Manifesto, verified socials, policies, payment badges
│   │   ├── AnnouncementBar.tsx      # Ticker with Dhaka 24h SLA and WhatsApp support
│   │   └── StorefrontWrapper.tsx    # Hides storefront header/footer on `/admin/*` routes
│   │
│   ├── catalog/                     # Product Listing Components
│   │   ├── ProductCard.tsx          # Card with shade swatches, quick add, wishlist
│   │   ├── ProductGrid.tsx          # Responsive catalog grid
│   │   └── FilterDrawer.tsx         # Multi-facet category & price filter
│   │
│   └── home/                        # Homepage Sections
│       ├── HeroCarousel.tsx         # Full-width editorial slider (live synced to admin)
│       ├── CategoryTiles.tsx        # Visual category entry points
│       ├── ProductRail.tsx          # Bestseller & New Arrival product rails
│       ├── VideoBlock.tsx           # Editorial brand video & tutorial showcase
│       └── FounderNote.tsx          # Brand philosophy & mission card
│
├── lib/                             # Core Business Logic, Services & Parsers
│   ├── slug.ts                      # SEO URL Slug auto-generation engine
│   ├── productBulkParser.ts         # RFC 4180 CSV & JSON catalog tokenizer
│   ├── formatters.ts                # BDT currency formatter (`৳`), dates
│   ├── filters.ts                   # In-memory product filtering & sorting
│   ├── search.ts                    # Multi-attribute catalog search
│   ├── services/                    # Business Domain Services (Dual-Persistence)
│   │   ├── adminAuth.ts             # Session tokens & credential validation
│   │   ├── productService.ts        # Product catalog CRUD & bulk ingestion
│   │   ├── categoryService.ts       # Category taxonomy & slug routing
│   │   ├── inventoryService.ts      # Product & shade-level inventory overrides
│   │   ├── bannerService.ts         # Hero slides & promo banners registry
│   │   ├── limitedOfferService.ts   # Campaign deals & timer vouchers
│   │   ├── studioService.ts         # Masterclasses & makeover bookings
│   │   ├── orderService.ts          # Order creation, calculation, tracking, metrics
│   │   ├── customerService.ts       # Customer CRM aggregation & concierge notes
│   │   ├── couponService.ts         # Promotion validation & rule enforcement
│   │   ├── shippingService.ts       # Bangladesh shipping rates & SLA calculation
│   │   ├── inquiryService.ts        # Customer support ticket handling
│   │   ├── reviewService.ts         # Verified customer reviews
│   │   └── newsletterService.ts     # VIP beauty club subscriptions
│   │
│   └── __tests__/                   # Unit Test Suites (61 tests passed)
│       ├── slug.test.ts             # Auto-slug generation rules
│       ├── productBulkUpload.test.ts# CSV tokenizer, shade parser, batch import
│       ├── adminFeatures.test.ts    # Extended admin services testing
│       ├── adminService.test.ts     # Core admin metrics & security
│       ├── orderService.test.ts     # Order security, price re-calculation
│       ├── couponService.test.ts    # Promotion rules & discount math
│       ├── shippingService.test.ts  # BD shipping rates & free threshold
│       └── cart.test.ts             # Cart arithmetic & line-item logic
│
└── supabase/                        # Database Migrations
    ├── migrations/20261011_initial_schema.sql # Orders, coupons, reviews, inquiries
    └── migrations/20261012_admin_features.sql # Categories, products, banners, offers, studio
```

---

## 5. Business Logic & Market Specifications (Bangladesh)

### Delivery SLAs & Shipping Rules
- **Free Shipping Threshold**: Orders equal to or exceeding **৳2,500** qualify for free delivery nationwide.
- **Inside Dhaka**:
  - Delivery Target: **24 Hours** (Express courier dispatch).
  - Standard Charge: **৳70** (when cart < ৳2,500).
- **Outside Dhaka (Nationwide)**:
  - Delivery Target: **48 Hours** (via Steadfast & Pathao courier networks).
  - Standard Charge: **৳130** (when cart < ৳2,500).
- **Courier Logistics**: Primarily Steadfast Courier and Pathao Logistics.

### Payment Gateways & Flow
1. **Cash on Delivery (COD)**:
   - Primary payment mode in Bangladesh.
   - Customers may inspect parcel exterior upon delivery before payment.
2. **bKash Direct / Merchant**:
   - Customers send payment to the official account or scan merchant QR code.
   - Order confirmation records the customer's bKash number and Transaction ID (TrxID).
3. **Nagad Direct**:
   - Secondary mobile wallet option following identical flow to bKash.

---

## 6. Critical Engineering Guidelines & Gotchas

### Next.js 16.4.0 Prerender Constraint
Next.js 16 enforces strict hydration and static analysis rules.
- **Gotcha**: Using dynamic runtime calls like `new Date().getFullYear()` or `Math.random()` inside Client Components during static prerender will crash the build with:
  `Next.js encountered the unstable value new Date() in a Client Component`.
- **Solution**: Hardcode the current year (e.g. `2026`) or pass static build constants down from server components.

### Next.js AGENTS Rules Block
The file `AGENTS.md` is monitored by `next dev`. Keep the `<!-- BEGIN:nextjs-agent-rules -->` comment block intact to prevent `next dev` from generating unwanted file diffs.

### Currency Formatting
- **Never use `$` or other foreign currencies**. Always format prices in Bangladesh Taka (`৳`) using `formatPrice()` from `lib/formatters.ts`.
- Format example: `formatPrice(2450)` yields `"৳2,450"`.

### Next.js 16 Partial Prerendering (PPR) & Instant Shells
- Dynamic route pages (`app/shop/[category]/page.tsx`, `app/product/[slug]/page.tsx`, `app/search/page.tsx`) must defer `await params` / `await searchParams` to inner components wrapped in a `<Suspense fallback={<Skeleton />}>` boundary, preserving instant static shells under Partial Prerendering.

---

## 7. Useful Commands & Workflows

```bash
# Run all automated test suites (61 tests across 21 suites)
npm test

# Build production bundle with Next.js Turbopack & PPR (98 routes generated)
npm run build

# Start local development server
npm run dev
```
