# Reverse Engineering Analysis: SUGAR Cosmetics & Architectural Blueprint for Bee&Beauty

## 1. Page Inventory & Route Mapping
Based on analysis of https://www.sugarcosmetics.com/ (Shopify Prestige theme custom build), here is the full page inventory mapped to the Bee&Beauty Next.js App Router structure:

| Reference Template (SUGAR Cosmetics) | Reference URL Pattern | Bee&Beauty Route | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Homepage** | `/` | `/` | Brand showcase, announcement bar, hero banners, category circular tiles, product rails (New Launches, Bestsellers, Elite Kits), promo banners, founder note. |
| **Collection / PLP** | `/collections/[category]` | `/shop/[category]` | Category listing (Lips, Eyes, Face, Nails, Skin, Kits) with breadcrumbs, multi-facet filter sidebar (availability, price range, ratings, badges), sort dropdown, and responsive 2-to-4 column product grid. |
| **Product Detail / PDP** | `/products/[slug]` | `/product/[slug]` | Two-column desktop / stacked mobile layout: multi-image gallery with zoom/swatches, shade selector with color chips & shade family tabs, pricing with BDT discount math, quantity stepper, sticky add-to-bag, delivery pincode check, promo offers accordion, product detail tabs, and related products carousel. |
| **Cart Drawer (Global)** | Slide-over drawer trigger | Global `CartDrawer` | Slide-over drawer accessible from any page: free shipping threshold progress bar, line items with shade label, quantity controls, remove item, subtotal summary, promo upsell carousel, and direct checkout CTA. |
| **Cart Page** | `/cart` | `/cart` | Standalone full-page cart view mirroring drawer contents plus extended empty-state recommendation rail. |
| **Checkout Shell** | `/checkouts/...` | `/checkout` | 4-step progressive checkout shell (Contact Info → Shipping Address → Payment Method Demo → Order Review & Confirmation) with real-time order summary calculation and validation. |
| **Live Search** | `/search?q=...` | `/search` | Instant search results with live query filtering by product name, category, finish, and tags. |
| **Wishlist** | Customer drawer / wishlist | `/wishlist` | Persisted client-side wishlist with one-click move to bag. |
| **Offers & Deals** | `/pages/offer` | `/offers` | Dedicated promotional landing page detailing coupon codes (e.g. `BEEFREE`, `GLAM20`, `BEE700`), bundled tiers, and gift-with-purchase terms. |
| **Brand Story (About)** | `/pages/about-us` | `/about` | Bee&Beauty origin story, clean-beauty cruelty-free commitment, and formulation philosophy tailored for South Asian / modern diverse skin tones. |
| **Contact Support** | `/pages/contact-us` | `/contact` | Customer support form (name, email, order ID, inquiry type, message) with client-side validation and responsive confirmation states. |
| **404 Not Found** | `/404` | `/not-found` | Branded error page with recovery recommendations and quick links to top collections. |

---

## 2. Homepage Section Map
The reference homepage follows an editorial e-commerce layout that alternates between product carousels and promotional content:

1. **Top Announcement Bar**
   - *Layout*: 36px-height sticky bar with high-contrast background (Black `#000000` or Warm Gold `#D4AF37`), auto-rotating promotions (e.g., "FREE Luxe Lip Butter on Orders Above ৳1,499", "Free Shipping Across Bangladesh"), and manual prev/next navigation.
2. **Global Sticky Header**
   - *Layout*: Sticky navbar featuring Brand Logo, Category Navigation / Mega-Menu links, Live Search trigger, Wishlist counter, and Cart Drawer trigger badge.
3. **Hero Carousel**
   - *Layout*: Full-width responsive carousel with 16:9 desktop / 4:5 mobile aspect ratios, bold typographic overlays, CTA buttons ("Shop New Launches", "Claim Offer"), and slide dot/arrow indicators.
4. **Shop by Category (Circular / Rounded Tiles)**
   - *Layout*: Horizontal scrolling rail / responsive flex-wrap grid of circular category badges with photographic representation and uppercase labels: Lips, Eyes, Face, Nails, Skin, Gift Sets, Value Store.
5. **Product Rail: New Launches**
   - *Layout*: Section header (`NEW LAUNCHES` in uppercase tracked Jost font) with a 4-column responsive grid/rail. Includes discount badge, live shade swatches, rating stars, price & strike-through comparison, and direct "Add to Cart" CTA.
6. **Promotional Banner / Hero Teaser**
   - *Layout*: Full-width visual banner advertising seasonal promotions or featured hero product lines (e.g., Royal Honey Velvet Lipsticks).
7. **Product Rail: Bestsellers**
   - *Layout*: Section header (`BESTSELLERS`) displaying highest-rated crowd favorites with quick-add functionality and shade previews.
8. **Curated Value Sets & Kits Rail**
   - *Layout*: Showcase of bundled beauty boxes with tiered savings tags ("Save 35%"), kit breakdowns, and "View All Kits" link.
9. **Founder Note / Brand Mission**
   - *Layout*: Elegant dark-tint or warm-cream callout box with founder signature styling: "We crafted Bee&Beauty with one core belief: women deserve makeup formulated specifically for their undertones, weather, and daily lifestyle — never compromised, never settling."
10. **Video / Tutorial Block ("As Seen On You")**
    - *Layout*: Video reel preview cards simulating real customer unboxing and tutorial clips with play overlays.
11. **Value Store / Under ৳499 Rail**
    - *Layout*: Budget-friendly quick-grab beauty essentials rail targeting impulse buys.
12. **Footer**
    - *Layout*: 4-column desktop footer (Explore & Policies, Company & Collabs, Customer Care, Newsletter Subscription & Social Links) with SSL security badges, payment method logos, copyright notice, and back-to-top button.

---

## 3. Navigation Taxonomy
### Header Structure
- **Top Announcement Bar**: Compact marquee / slider with dismiss or rotate arrows.
- **Main Header Bar**:
  - Left / Center: Bee&Beauty wordmark logo (`BEE&BEAUTY` with geometric serif/modern sans-serif typography).
  - Center: Main Category Links (`LIPS`, `EYES`, `FACE`, `NAILS`, `SKIN`, `KITS`, `UNDER ৳499`, `OFFERS`).
  - Right: Quick Search input/icon, Wishlist heart with badge count, Cart shopping bag with badge item counter.
  - Mobile: Hamburger drawer trigger on left, centered logo, search + cart on right.

### Mega-Menu Categories & Sub-Taxonomy
- **LIPS**: Matte Lipsticks, Liquid Lip Velvets, Crayon Lipsticks, Plumping Glosses, Tinted Lip Oils, Lip Liners, Nourishing Balms.
- **EYES**: Kohl & Kajal, Waterproof Liquid Eyeliners, Volumizing Mascara, Eyeshadow Palettes, Brow Definer Pencils.
- **FACE**: Serum Foundations, Soft-Matte Compact Powders, Pore-Blurring Primers, Radiant Concealers, Liquid & Cream Blushes, Illuminating Drops.
- **NAILS**: Gel-Shine Nail Lacquers, Matte Enamels, Nail Care & Strengtheners.
- **SKINCARE**: Hydrating Glow Serums, Barrier Sunscreens (SPF 50), Sheet Masks, Honey Nourish Moisturizers.
- **GIFTING & KITS**: Bridal Glam Sets, Everyday Essentials Trio, Build Your Own Kit, Festive Glam Boxes.
- **OFFERS**: Buy 2 Get 1 Free, Flat ৳500 Off, Gifts With Purchase.

### Footer Columns
- **Column 1: Customer Care**: Help Center & FAQ, Shipping & Delivery, Returns & Exchanges, Order Tracking, Contact Us.
- **Column 2: Company**: About Bee&Beauty, Clean Beauty Guarantee, Sustainability, Press & Influencer Collaborations, Store Locator.
- **Column 3: Shop Collections**: Bestsellers, New Launches, Lip Vault, Value Combos, Gift Cards.
- **Column 4: Connect & Newsletter**: Email signup for exclusive launches and 10% off first order; social links (Instagram, Facebook, YouTube, TikTok).

---

## 4. Product Card Anatomy
The product cards on SUGAR Cosmetics are dense, informative, and conversion-optimized. Re-engineered specifications for Bee&Beauty:

1. **Card Container**: Clean, borderless or subtle-border card (`border border-neutral-100 dark:border-neutral-800`), white background, subtle elevation on hover (`hover:shadow-md transition-shadow`).
2. **Image Box (Aspect Ratio ~ 1:1 or 4:5)**:
   - Primary high-resolution graphic.
   - Secondary hover image flip (e.g. swatch application or model lip wear) on cursor hover.
   - **Floating Badges**:
     - Top-left: Launch / Trend badge (`NEW LAUNCH`, `BESTSELLER`) in bold solid black/white or accent gold pill.
     - Top-right / Secondary: Discount tag (`SAVE 25%`, `ON SALE`) in high-contrast badge.
     - Wishlist button: Floating heart icon on top right with animated filled state when active.
3. **Interactive Shade Swatches**:
   - Row of 3 to 5 circular color swatches (16px–20px) showing hex tone with active selection border ring.
   - "+N Shades" badge indicating total color range.
   - Hovering or clicking a swatch updates the selected shade title and variant image in real time.
4. **Product Metadata**:
   - Product Title in medium-weight sans-serif with truncation after 2 lines.
   - Rating Bar: Star glyphs (5-star rating) + review count in parentheses, e.g. `★ 4.8 (842)`.
5. **Pricing Block**:
   - Effective Sale Price formatted in Bangladeshi Taka (e.g. `৳450`).
   - Strike-through compare-at original price (e.g. `৳600`).
   - Discount percentage callout: `| 25% Off`.
6. **Call To Action**:
   - Full-width sharp rectangular black button: `ADD TO BAG` (`bg-neutral-900 text-white hover:bg-neutral-800 uppercase tracking-wider font-semibold text-xs py-2.5`).

---

## 5. Product Detail Page (PDP) Anatomy
1. **Breadcrumbs Navigation**: Home > Category > Product Name.
2. **Left Column: Gallery**:
   - Vertical thumbnail strip on desktop / horizontal swipe dots on mobile.
   - Large hero preview displaying active product photography, ingredient texture, or shade arm swatches.
3. **Right Column: Product Details & Purchase Actions**:
   - Brand kicker: `BEE&BEAUTY` in tracked small uppercase.
   - H1 Product Title in elegant Jost/heading typography.
   - Star rating summary with link to customer reviews section.
   - Price display: BDT Sale Price, strike-through MRP, percentage discount pill, and tax inclusion label.
   - **Shade Picker Matrix**:
     - Label displaying currently selected shade number & name (e.g. `Shade: 03 Honey Gold`).
     - Family filter tabs (`All`, `Nudes`, `Pinks & Berries`, `Reds & Plums`).
     - Color swatch circle grid with active outline ring and out-of-stock slash indicator.
   - **Quantity Stepper & Add to Bag**:
     - Counter component `[-] [ 1 ] [+]`.
     - Full-width primary CTA button: `ADD TO BAG` with instant feedback and opening of Cart Drawer.
     - Secondary "Buy It Now" / direct checkout trigger.
   - **Highlight Chips**:
     - `12HR Wear`, `Cruelty-Free & Vegan`, `Infused with Honey & Peptides`, `Transfer-Resistant`.
   - **Trust & Assurance Badges**:
     - Free shipping over ৳1,499, Cash on Delivery available, 7-day easy exchange guarantee.
   - **Delivery Pincode Check**:
     - Postal code / district input with interactive "Check" button estimating standard 2-3 business days delivery.
   - **Special Offers & Coupon Cards**:
     - Visual coupon cards with one-click "Copy Code" button (e.g. `BEEFIRST` for 10% off).
   - **Accordion Sections**:
     - *Description*: In-depth formula benefits, finish, and skin suitability.
     - *How to Apply*: Step-by-step professional application instructions.
     - *Key Ingredients*: Clean formulations, active peptides, honey extracts, and vitamin complexes.
     - *Product Details*: Net weight, country of manufacture, batch information.
4. **Related Products Rail**:
   - 4-card product carousel featuring cross-sell recommendations within the same category.

---

## 6. Cart & Checkout Flow
### Global Cart Drawer
- **Trigger**: Header bag icon or clicking "Add to Bag" on any ProductCard or PDP.
- **Top Announcement / Shipping Meter**:
  - Dynamic progress bar: `Spend ৳X more for FREE Delivery!` transitioning to `🎉 Congratulations! You unlocked Free Shipping!`.
- **Line Items List**:
  - Product thumbnail, title, selected shade name & swatch dot, unit price, quantity stepper `[- 1 +]`, and remove trash button.
- **Promo Coupon Input**:
  - Interactive coupon code field with automatic discount deduction calculation.
- **Cart Upsell Carousel**:
  - "Frequently Bought Together" or "Add a Mini for ৳199" compact slide cards with quick "+ Add" button.
- **Cart Summary**:
  - Subtotal, Discount Savings, Shipping Fee (or Free), and Grand Total.
  - Primary CTA: `PROCEED TO CHECKOUT` button navigating to `/checkout`.
  - Secondary link: `View Full Cart Page`.

### Checkout Shell (/checkout)
- **4-Step Breadcrumb / Stepper Navigation**:
  1. *Information*: Email / phone, customer full name, delivery notes.
  2. *Shipping*: Street address, district/city, postal code, delivery speed option.
  3. *Payment*: Demo Cash on Delivery (COD), bKash/Nagad mock selection, or Card mock payment with security badges.
  4. *Review & Confirm*: Full itemized order preview, discount verification, and simulated "Place Order" confirmation state generating a unique order ID.

---

## 7. Design Tokens & Visual Language
Derived directly from the Prestige theme stylesheet inspection of sugarcosmetics.com:

| Category | Token / Variable | Value / Specification | Role |
| :--- | :--- | :--- | :--- |
| **Primary Palette** | `--color-brand-black` | `#111111` / `rgb(17, 17, 17)` | Primary buttons, headers, high contrast |
| | `--color-brand-gold` | `#D4AF37` / `#C5A059` | Bee&Beauty luxury honey gold accent |
| | `--color-brand-amber` | `#E09F3E` | Warm honey/amber badge & highlight |
| | `--color-background` | `#FFFFFF` | Default canvas background |
| | `--color-surface-subtle` | `#F9F9F8` / `#F3F3F3` | Section backgrounds, card containers |
| | `--color-border` | `#E5E5E5` / `#DFDFDF` | Subtle dividers and card borders |
| | `--color-text-primary` | `#222222` / `#282828` | Main body text |
| | `--color-text-secondary`| `#666666` / `#757575` | Captions, subtitle, compare prices |
| | `--color-sale-red` | `#D32F2F` / `#B71C1C` | Discount percentages, sale chips |
| | `--color-success-green` | `#2E7D32` | Free shipping unlocked, in-stock badges |
| **Typography** | `--font-heading` | `Jost, Montserrat, sans-serif` | Editorial headings, uppercase, tracked `0.12em` |
| | `--font-body` | `Poppins, Inter, sans-serif` | Clean, legible body copy (400, 500, 600) |
| **Typography Scale** | `h1` | `2.25rem` / `36px` (Desktop: `42px`) | Hero titles, PDP title |
| | `h2` | `1.75rem` / `28px` (Desktop: `32px`) | Section titles (uppercase tracked) |
| | `h3` | `1.25rem` / `20px` | Card titles, drawer headings |
| | `body-base` | `0.875rem` / `14px` | Standard description text |
| | `body-sm` | `0.75rem` / `12px` | Badges, swatches, labels |
| **Shapes & Radii** | `--radius-none` | `0px` | Signature sharp Prestige-style CTA buttons |
| | `--radius-sm` | `4px` | Input fields, coupon cards |
| | `--radius-full` | `9999px` | Circular shade swatches, pill badges |
| **Shadows** | `--shadow-subtle` | `0 2px 8px rgba(0, 0, 0, 0.05)` | Floating badges, sticky headers |
| | `--shadow-drawer` | `-4px 0 24px rgba(0, 0, 0, 0.15)` | Cart drawer overlay shadow |

---

## 8. Component Inventory & Architecture
Mapped strictly to the project architecture layers:

```
app/
  layout.tsx                     # Root HTML/Body, fonts, global Header, AnnouncementBar, Footer, CartDrawer provider
  page.tsx                       # Composes homepage sections via CatalogRepository
  shop/[category]/page.tsx       # Dynamic collection listing with FilterSidebar and ProductGrid
  product/[slug]/page.tsx        # PDP with ImageGallery, ShadePicker, Accordions, RelatedProducts
  cart/page.tsx                  # Dedicated full-page shopping bag
  checkout/page.tsx              # Progressive 4-step checkout shell
  search/page.tsx                # Live client catalog search
  wishlist/page.tsx              # Saved favorite items with 1-click move to cart
  offers/page.tsx                # Active deals, coupon cards, and discount rules
  about/page.tsx                 # Brand story, formulation philosophy, clean beauty standards
  contact/page.tsx               # Customer contact form with validation
  not-found.tsx                  # 404 error page

components/ui/
  Button.tsx                     # Primary black button, outline button, ghost button, icon button
  Badge.tsx                      # Pill/square badges: New Launch, Bestseller, Discount %
  Price.tsx                      # Formatted BDT price (৳) with compare-at strike-through
  Rating.tsx                     # 5-star visual rating display with count
  QuantityStepper.tsx            # [- 1 +] quantity incrementer/decrementer
  Modal.tsx                      # Accessible modal dialog
  Drawer.tsx                     # Slide-in right drawer for Cart and Mobile Navigation
  Tabs.tsx                       # Accessible tab container (e.g. for shade categories)
  Accordion.tsx                  # Collapsible FAQ / product details accordion item

components/layout/
  AnnouncementBar.tsx            # Sticky rotatable promotional bar
  Header.tsx                     # Main sticky header with search, wishlist, cart count
  MegaMenu.tsx                   # Dropdown category menus with subcategories and imagery
  MobileNav.tsx                  # Mobile slide-out navigation menu
  Footer.tsx                     # Comprehensive 4-column footer + back to top

components/home/
  HeroCarousel.tsx               # Dynamic hero banners with CTA
  CategoryTiles.tsx              # Circular category cards rail
  ProductRail.tsx                # Reusable horizontal/grid product showcase (New Launches, Bestsellers)
  OfferBanner.tsx                # Promotional marketing banner
  FounderNote.tsx                # Personal brand philosophy callout
  VideoBlock.tsx                 # "As seen on you" customer reel showcase

components/catalog/
  ProductCard.tsx                # Standard product card with swatches, hover-flip, price, quick-add
  FilterSidebar.tsx              # Multi-attribute filter (Price, Rating, Availability, Badges)
  SortDropdown.tsx               # Sort selector (Featured, Price Asc/Desc, Rating, Alphabetical)
  Pagination.tsx                 # Page / load more controller

components/product/
  ImageGallery.tsx               # Product image viewer with thumbnails and active preview
  ShadePicker.tsx                # Shade swatch selector with shade count and name display
  ProductInfo.tsx                # Title, pricing, highlights, delivery pincode checker
  OfferAccordion.tsx             # Promotional coupon codes & collapsible descriptions
  RelatedProducts.tsx            # Related items recommendation rail

components/cart/
  CartDrawer.tsx                 # Slide-over cart overlay
  CartLineItem.tsx               # Individual item row with shade, quantity stepper, remove action
  FreeShippingBar.tsx            # Dynamic animated shipping threshold progress bar
  CartUpsell.tsx                 # Mini impulse-add carousel

components/checkout/
  CheckoutSteps.tsx              # Step indicator (Info → Shipping → Payment → Review)
  AddressForm.tsx                # Form validation for customer and shipping details
  OrderSummary.tsx               # Real-time line item breakdown, discounts, totals

data/
  types.ts                       # TypeScript interfaces: Product, Shade, Category, Offer, CartItem
  repository.ts                  # CatalogRepository contract interface
  mock/
    catalogData.ts               # 24+ realistic Bee&Beauty products across 6 categories
    mockRepository.ts            # Implementation of CatalogRepository using mock data

store/
  cart.tsx                       # CartContext with useReducer, localStorage persistence
  wishlist.tsx                   # WishlistContext with localStorage persistence

lib/
  cn.ts                          # Class name concatenation utility
  price.ts                       # Currency formatting (BDT ৳), discount percentage calculations
  cart.ts                        # Subtotal, tax, discount calculations, line-item modifications
  filters.ts                     # Catalog filter algorithms
  search.ts                      # Keyword search and ranking algorithm
  __tests__/
    price.test.ts                # Unit tests for price formatting and discount logic
    cart.test.ts                 # Unit tests for cart math and threshold calculations

styles/
  tokens.css                     # Extracted CSS custom properties for palette, typography, spacing
```

---

## 9. Dependencies Justification
Keeping dependencies strictly minimal and standard:
1. `next` & `react` & `react-dom`: Core Next.js 15 App Router framework.
2. `typescript`: Strict type safety across the domain model, repositories, and UI.
3. `tailwindcss`: Modern utility-first styling adhering to the custom token system without bloat.
4. `lucide-react`: Lightweight, clean SVG icon set for cart, search, heart, chevron, and star icons (no emoji icons in the UI).
5. No heavy UI libraries, no external component frameworks — all primitives built bespoke to match the Prestige theme design language.
