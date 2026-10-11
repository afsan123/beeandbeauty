# AGENT HANDOVER & KNOWLEDGE BASE — BEE & BEAUTY

> **Target Audience**: AI Agents (Antigravity, Cursor, Claude Code, Copilot, etc.) and human engineers onboarding to the Bee & Beauty codebase.
> **Last Updated**: October 2026
> **Project**: Bee & Beauty (`beeandbeauty`) — Luxury Cosmetics & Skincare E-Commerce Platform
> **Target Market**: Bangladesh (BDT / `৳`)

---

## 1. Executive Summary & Brand Overview

**Bee & Beauty** is a luxury direct-to-consumer cosmetics and skincare brand operating in Bangladesh. The platform is designed to provide an opulent, fast, and frictionless shopping experience tailored for local e-commerce nuances (Cash on Delivery, bKash/Nagad mobile wallets, express Dhaka & nationwide courier delivery, and real-time WhatsApp consultation).

### Brand Identity & Positioning
- **Brand Tagline**: *"Nature, refined."*
- **Aesthetic**: Minimalist luxury, organic elegance, honey-infused and botanical formulations, premium editorial feel.
- **Tone of Voice**: Sophisticated, warm, authoritative, dermatologically conscious.

### Verified Brand Assets & Contact Information
- **Official WhatsApp & Direct Hotline**: `+8801754502430` (Used for customer care, shade consultation, and order dispute handling).
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

### Color Palette

| Token | Name | Hex | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--bb-plum` | **Deep Plum** | `#6A1B6D` | Primary brand color, primary CTA buttons, hero accents, category headers. |
| `--bb-magenta` | **Deep Magenta** | `#C2188B` | Secondary vibrant accent, sale banners, wishlist heart active state, hover highlights. |
| `--bb-gold` | **Honey Gold** | `#D4AF37` | Luxury metallic accent, bestseller badges, star ratings, borders, announcement highlights. |
| `--bb-ivory` | **Warm Ivory** | `#FFF9F5` | Default body canvas background, soft clean backdrop. |
| `--bb-blush` | **Soft Blush** | `#FCE4EC` | Card surface tint, subtle container backgrounds, promotional tile contrast. |
| `--bb-charcoal` | **Charcoal** | `#2C2C2C` | High-legibility typography for body copy, paragraphs, descriptions. |

*Additional neutrals:* White (`#FFFFFF`), Muted Slate (`#71717A`), Light Border (`#F0E6DE`).

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

- **Framework**: Next.js `16.4.0` (App Router, Turbopack enabled).
- **React**: `19.x` (Server Components by default; `'use client'` only where interactivity is required).
- **TypeScript**: Strict type validation across all modules.
- **Styling**: Tailwind CSS v4 + custom CSS custom properties in `styles/tokens.css`.
- **Icons**: `lucide-react` (feather-style crisp stroke icons).
- **Testing**: Node Native Test Runner (`node --experimental-strip-types --test 'lib/__tests__/**/*.test.ts'`).
- **Package Manager**: npm.

---

## 4. Architecture & Directory Blueprint

```
beeandbeauty/
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # Root layout (Google Fonts, metadata, FloatingWhatsApp, CartDrawer)
│   ├── globals.css                  # Global utility classes & root CSS variables
│   ├── page.tsx                     # Homepage (Hero, Categories, Products, Video, Offer, Founder Note)
│   ├── shop/page.tsx                # Catalog browsing, filtering, search, sorting
│   ├── product/[slug]/page.tsx      # PDP (Gallery, ShadePicker, OfferAccordion, Reviews, Related)
│   ├── cart/page.tsx                # Dedicated cart view
│   ├── checkout/page.tsx            # Multi-step checkout (Inside/Outside Dhaka, COD, bKash, Nagad)
│   ├── about/page.tsx               # Brand story, Vision, Mission, Core Pillars
│   ├── contact/page.tsx             # Contact channels, inquiry form, WhatsApp link
│   ├── delivery-policy/page.tsx     # 24h Dhaka / 48h Outside Dhaka delivery targets & rates
│   ├── return-policy/page.tsx       # 3-day return reporting, hygiene rules, WhatsApp reporting
│   ├── privacy-policy/page.tsx      # Customer privacy, payment data, courier transmission
│   ├── terms/page.tsx               # Terms of Service under Bangladesh jurisdiction
│   ├── faq/page.tsx                 # Categorized interactive FAQ accordion
│   ├── not-found.tsx                # Custom luxury 404 page
│   └── icon.svg                     # Vector brand favicon
│
├── components/
│   ├── ui/                          # Primitive / Atomic UI Components
│   │   ├── Logo.tsx                 # Official brand logo (header, footer, symbol variants)
│   │   ├── Button.tsx               # Brand button variants (primary plum, magenta, gold, outline)
│   │   ├── Badge.tsx                # Badges (bestseller, new, sale, organic)
│   │   ├── Price.tsx                # Formatted BDT price renderer with discount calculations
│   │   ├── FloatingWhatsApp.tsx     # Floating WhatsApp concierge with pre-filled consultation queries
│   │   ├── PolicyDisclaimer.tsx     # "Draft for development | Pending approval" staging banner
│   │   ├── Accordion.tsx            # Expandable accordion for FAQs and PDP specs
│   │   ├── Modal.tsx                # Accessible dialog modal
│   │   ├── Drawer.tsx               # Off-canvas drawer (Cart & Mobile menu)
│   │   ├── Input.tsx / Select.tsx   # Form fields with floating labels
│   │   ├── StarRating.tsx           # Rating stars in Honey Gold
│   │   └── Toast.tsx                # Notification feedback
│   │
│   ├── layout/                      # Structural Layout Components
│   │   ├── Header.tsx               # Main nav, search, wishlist & cart counters, logo
│   │   ├── Footer.tsx               # Brand manifesto, verified socials, policies, payment badges
│   │   ├── AnnouncementBar.tsx      # Ticker with Dhaka 24h / outside 48h and WhatsApp support
│   │   ├── MegaMenu.tsx             # Desktop category dropdown menu
│   │   └── MobileNav.tsx            # Responsive mobile drawer navigation
│   │
│   ├── catalog/                     # Product Listing Components
│   │   ├── ProductCard.tsx          # Card with shade swatches, quick add, wishlist toggle
│   │   ├── ProductGrid.tsx          # Responsive responsive grid
│   │   ├── FilterDrawer.tsx         # Category, price range, skin concern filters
│   │   └── ShopClient.tsx           # Client wrapper for filtering, search, sorting
│   │
│   ├── product/                     # Product Detail Components
│   │   ├── ProductGallery.tsx       # Multi-image thumbnail gallery & lightbox
│   │   ├── ProductInfo.tsx          # Title, price, BD delivery check, Add to Cart
│   │   ├── ShadePicker.tsx          # Foundation/lipstick color swatch selector
│   │   ├── OfferAccordion.tsx       # Ingredients, how-to-use, and delivery specs
│   │   ├── ReviewList.tsx           # Customer reviews with ratings
│   │   └── RelatedProducts.tsx      # Cross-sell recommendation rail
│   │
│   ├── cart/                        # Shopping Bag Components
│   │   ├── CartDrawer.tsx           # Slide-out bag with live totals
│   │   ├── CartItemRow.tsx          # Quantity modifiers & line item display
│   │   ├── FreeShippingBar.tsx      # Progress bar towards ৳2,500 threshold
│   │   └── CouponInput.tsx          # Promo code entry (e.g. BEE10)
│   │
│   ├── checkout/                    # Checkout Flow Components
│   │   ├── CheckoutSteps.tsx        # Step indicator (Shipping -> Payment -> Review)
│   │   ├── AddressForm.tsx          # Shipping details with Inside/Outside Dhaka toggle
│   │   ├── PaymentMethodSelector.tsx# COD, bKash, and Nagad selection
│   │   └── OrderSummary.tsx         # Itemized breakdown with delivery charge
│   │
│   └── home/                        # Landing Page Sections
│       ├── HeroCarousel.tsx         # Full-width editorial slider
│       ├── CategoryTiles.tsx        # Visual category entry points
│       ├── ProductRail.tsx          # Bestseller & New Arrival product carousels
│       ├── OfferBanner.tsx          # Promotional spotlight banner
│       ├── VideoBlock.tsx           # Editorial brand video showcase
│       └── FounderNote.tsx          # Brand philosophy & mission card
│
├── context/                         # State Providers
│   ├── CartContext.tsx              # Cart state persisted in localStorage
│   ├── WishlistContext.tsx          # Wishlist state persisted in localStorage
│   └── ToastContext.tsx             # Global transient notifications
│
├── lib/                             # Core Business Logic & Data Models
│   ├── cart.ts                      # Pricing calculations, discounts, shipping fees
│   ├── formatters.ts                # BDT currency formatter (`৳`), dates
│   ├── products.ts                  # Mock products dataset, categories, attributes
│   ├── categories.ts                # Category tree definitions
│   ├── reviews.ts                   # Customer reviews dataset
│   ├── orders.ts                    # Order generation & storage helper
│   └── __tests__/                   # Unit test suite
│       └── cart.test.ts             # Logic tests for subtotal, shipping, discounts
│
├── styles/                          # CSS Custom Properties
│   └── tokens.css                   # Brand palette, radii, shadows, typography tokens
│
└── public/                          # Static Assets
    ├── images/                      # Official logo (`logo.png`), product images, banners
    └── logo.png                     # Official logo root mirror
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

### Return & Hygiene Policy Rules
- **Reporting Window**: Must be reported within **3 calendar days** of parcel delivery.
- **Cosmetics Hygiene**: Due to hygiene regulations, opened or unsealed cosmetics (lipsticks, serums, creams) cannot be returned unless verified defective or incorrect shipment.
- **Report Channel**: Direct submission to WhatsApp `+8801754502430` with unboxing photos/video.

### Staging Disclaimers
Per developer handover instructions (Sections 16 & 17), policy pages include the `<PolicyDisclaimer />` component displaying:
> *"Draft for development | Pending approval — This policy is currently drafted for development and staging purposes. Final operational terms are pending review and approval by Bee & Beauty management."*
**Do not remove this disclaimer until authorized by management.**

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

### Form Props Conventions
- In `components/checkout/AddressForm.tsx`, the prop for existing data is `initialValues?: Partial<ShippingFormData>`, not `initialData`.

---

## 7. Useful Commands & Workflows

### Running Tests
Execute the unit test suite covering cart math, shipping thresholds, and currency formatters:
```bash
npm test
```

### Production Build
Run the Turbopack production build to verify TypeScript types, page routes, and static generation:
```bash
npm run build
```

### Development Server
Start the local Next.js development server:
```bash
npm run dev
# Running on http://localhost:3000
```

### Starting Built Production Server
```bash
npm run start
# Running on http://localhost:3000
```

---

## 8. Roadmap & Next Phases for Incoming Agents

If assigned new tasks on this project, prioritize according to the following roadmap:
1. **Backend Integration**: Replace mock product and order storage in `lib/products.ts` and `lib/orders.ts` with Supabase / PostgreSQL database or headless CMS.
2. **Automated Payment Webhook**: Integrate bKash and Nagad payment gateway APIs (e.g. SSLCommerz, Shurjopay, or direct bKash PGW API) alongside the current manual TrxID flow.
3. **SMS Notification Engine**: Integrate local BD SMS gateways (e.g. Greenweb, Elitbuzz) for automated order confirmation and courier dispatch SMS.
4. **Steadfast / Pathao Courier API**: Connect automated parcel booking upon order placement.
