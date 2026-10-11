# Bee & Beauty (`beeandbeauty`) — Luxury Cosmetics & Skincare

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-61%2F61%20Passed-success)](#testing--verification)
[![Market](https://img.shields.io/badge/Market-Bangladesh%20(৳%20BDT)-amber)](#market-specifications--logistics)

> **"Nature, refined."**  
> Bee & Beauty is an opulent direct-to-consumer e-commerce platform and executive management system crafted specifically for Bangladesh. Infused with raw honey nectar and propolis extract, the brand harmonizes high-pigment South Asian cosmetics with clean clinical skincare.

---

## 🌟 Platform Highlights

- **⚡ Next.js 16 App Router & Turbopack**: Blazing-fast page loads, partial prefetching, and instant navigation shells with Partial Prerendering (PPR).
- **🛡️ Full Executive Admin Suite**: Complete back-office control panel across 13 modules for catalog, inventory, merchandising, CRM, and order dispatch.
- **📥 Product Bulk Upload Engine**: Drag-and-drop or paste CSV/JSON import with real-time field validation, shade tokenization, automatic SEO slug generation, and template downloads.
- **🇧🇩 Bangladesh E-Commerce Native**:
  - Currency strictly in **BDT (`৳`)** using canonical formatters.
  - Nationwide courier integrations (Steadfast / Pathao target SLAs: 24h Inside Dhaka `৳70`, 48h Outside Dhaka `৳130`, Free shipping $\ge ৳2,500$).
  - Cash on Delivery (COD) + bKash / Nagad mobile financial services workflow.
  - Dedicated **Order Tracking** via Order Number and customer phone number.
- **💎 Dual-Resilience Architecture**: Primary persistence to remote Supabase PostgreSQL with automated in-memory failover for uninterrupted operations.

---

## 🎨 Design System & Visual Tokens

The user interface follows an editorial luxury aesthetic anchored in botanical and royal cosmetic tones:

| Token | Name | Hex | Role |
| :--- | :--- | :--- | :--- |
| `--bb-plum` | **Deep Plum** | `#6A1B6D` | Royal brand anchor, cosmetic headings, primary CTAs |
| `--bb-magenta` | **Deep Magenta** | `#C2188B` | High-impact promotional accents, sale alerts, active states |
| `--bb-gold` | **Honey Gold** | `#D4AF37` | Luxury metallic accents, propolis emblems, ratings, badges |
| `--bb-sage` | **Botanical Sage**| `#3E6351` | Clean skincare & barrier repair indicator |
| `--bb-nectar` | **Honey Nectar** | `#E5A93C` | Raw honey glow & radiance badges |
| `--bb-ivory` | **Warm Ivory** | `#FFF9F5` | Radiant canvas background |
| `--bb-blush` | **Soft Blush** | `#FCE4EC` | Rosewater tint, container highlights |
| `--bb-charcoal`| **Charcoal** | `#2C2C2C` | High-legibility typography |

**Typography**:
- *Display & Luxury Headings*: **Cormorant Garamond** (`font-serif`)
- *User Interface & Specifications*: **Karla** (`font-sans`)

---

## 🎛️ Executive Admin Panel Suite (`/admin`)

The platform features an executive management interface accessible at `/admin`:

1. **Executive Dashboard (`/admin`)**: Live gross merchandise value (GMV), 30-day orders, real-time average order value (AOV), fulfillment velocity, and courier breakdown.
2. **Orders & Dispatch Desk (`/admin/orders`)**: Filter by fulfillment (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) and payment (`cod`, `bkash`, `nagad`), assign courier tracking codes, and update statuses in real time.
3. **Customer Profiles & CRM (`/admin/customers`)**: Lifetime value (LTV) analytics, customer order timelines, concierge tags (`VIP`, `At-Risk`, `Frequent Buyer`), and internal notes.
4. **Product Catalog & Stock Matrix (`/admin/products`)**:
   - Create, edit, and delete formulas with full specification controls.
   - **Real-Time Auto-Generated Slugs**: Slugs dynamically update based on product title with instant manual override and "⚡ Auto-generate" sync.
   - **Bulk Catalog Upload**: Import multiple catalog items via CSV/JSON with live validation table and sample template downloads.
5. **Categories & Taxonomy (`/admin/categories`)**: Manage categories (`Lips`, `Face`, `Eyes`, `Skincare`, `Nails`, `Kits`, `Under ৳499`), subcategories, and SEO slugs.
6. **Stock & Shade Matrix (`/admin/inventory`)**: Product-level and shade-level inventory toggles (`In Stock` / `Sold Out`) and live stock counts.
7. **Hero Slides & Banners (`/admin/banners`)**: Interactive slide sequencing, custom gradient backgrounds, CTA links, and real-time storefront synchronization.
8. **Limited Offers & Flash Deals (`/admin/offers`)**: Configure promotional discounts (percentage, fixed BDT, free gift) and campaign timer badges.
9. **Pro Beauty Studio (`/admin/studio`)**: Masterclass tutorial library and 1-on-1 virtual makeover consultation booking desk.
10. **Coupons & Promo Vouchers (`/admin/coupons`)**: Configure vouchers (`BEE10`, `GLAM20`, `BEE700`, `BEEFREE`) with minimum spend and discount caps.
11. **Customer Support Desk (`/admin/inquiries`)**: Ticket routing, priority tagging, and inquiry resolution timeline.
12. **Verified Product Reviews (`/admin/reviews`)**: Moderation desk for customer reviews and star ratings.
13. **VIP Newsletter Subscribers (`/admin/subscribers`)**: Subscriber directory, export tools, and engagement metrics.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) `16.4.0` (Turbopack, App Router, PPR)
- **Runtime**: Node.js `v20+` / `v26+` with ESM native modules
- **Database**: [Supabase](https://supabase.com/) PostgreSQL with Row-Level Security (RLS)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) `v4` with bespoke CSS variable tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: Node Native Test Runner (`node --test`)
- **E2E & Automation**: Playwright MCP

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20.x or later
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/afsan123/beeandbeauty.git
cd beeandbeauty
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xhhjowchwnaglimgpygr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Authentication
ADMIN_SECRET_KEY=your_secure_admin_jwt_secret
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the live storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the Executive Admin Panel.

---

## 🧪 Testing & Verification

The codebase includes automated test suites covering e-commerce math, shipping rates, coupon rules, catalog services, slug generation, and bulk upload parsing:

```bash
# Run all unit test suites
npm test

# Build production bundle with Next.js Turbopack & PPR
npm run build
```

---

## 📞 Official Contacts & Verified Channels

- **Official WhatsApp / Helpline**: `+8801754502430`
- **Customer Care Email**: `beeandbeauty.bd@gmail.com`
- **Headquarters**: Dhaka, Bangladesh
- **Free Shipping Threshold**: `৳2,500` nationwide
