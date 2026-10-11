<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bee & Beauty AI Agent Directives

For the full architectural knowledge base, market specifications, and design system, refer to [`AGENT.md`](file:///home/kratzer/workspace/beeandbeauty/AGENT.md).

### Quick Operational Rules for AI Agents:
1. **Target Market**: Bangladesh. Currency is always BDT (`৳`), never USD (`$`). Always use `formatPrice()` from `lib/formatters.ts`.
2. **Official Channels**:
   - WhatsApp / Phone: `+8801754502430`
   - Email: `beeandbeauty.bd@gmail.com`
3. **Brand Palette (Cosmetics & Skincare Harmony)**:
   - Deep Plum (`#6A1B6D` / `--bb-plum` - Cosmetics & royal brand anchor)
   - Deep Magenta (`#C2188B` / `--bb-magenta` - Vibrant cosmetic accent)
   - Honey Gold (`#D4AF37` / `--bb-gold` - Propolis & luxury metal)
   - Botanical Sage (`#3E6351` / `--bb-sage` - Clean skincare & barrier care)
   - Honey Nectar (`#E5A93C` / `--bb-nectar` - Raw honey radiance)
   - Warm Ivory (`#FFF9F5` / `--bb-ivory` - Clean radiant canvas)
   - Soft Blush (`#FCE4EC` / `--bb-blush` - Rosewater & lip tint)
   - Charcoal (`#2C2C2C` / `--bb-charcoal` - High-legibility text)
4. **Logistics & SLAs**:
   - Free shipping threshold: `৳2,500`
   - Inside Dhaka: 24-hour delivery target (`৳70`)
   - Outside Dhaka: 48-hour delivery target (`৳130`) via Steadfast / Pathao
5. **Next.js 16 Prerendering & PPR Constraints**:
   - Do NOT use dynamic runtime dates (`new Date().getFullYear()`) inside Client Components during static builds. Use static constants (e.g. `2026`).
   - Dynamic route pages (`app/shop/[category]/page.tsx`, `app/product/[slug]/page.tsx`, `app/search/page.tsx`) must wrap async data access (`await params` / `await searchParams`) inside `<Suspense fallback={<Skeleton />}>` rather than awaiting at the root of the page component, preserving instant static shells under Partial Prerendering.
6. **Verification Requirements**:
   - Always run `npm test` and `npm run build` before completing tasks.
7. **Admin Panel & Bulk Operations**:
   - All catalog creation must enforce valid BDT pricing and auto-generate SEO URL slugs via `generateSlug()` from `lib/slug.ts`.
   - Bulk upload operations must parse through `lib/productBulkParser.ts` supporting CSV/JSON with live preview.
8. **Pre-Launch Data Integrity**:
   - The production catalog must be driven by the real launch dataset via the Admin Panel and Supabase database.
   - Operational collections (orders, inquiries, customer reviews) must be kept clean of dummy/mock records prior to live launch.
