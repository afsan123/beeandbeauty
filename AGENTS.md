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
3. **Brand Palette**:
   - Deep Plum (`#6A1B6D` / `--bb-plum`)
   - Deep Magenta (`#C2188B` / `--bb-magenta`)
   - Honey Gold (`#D4AF37` / `--bb-gold`)
   - Warm Ivory (`#FFF9F5` / `--bb-ivory`)
   - Soft Blush (`#FCE4EC` / `--bb-blush`)
   - Charcoal (`#2C2C2C` / `--bb-charcoal`)
4. **Logistics & SLAs**:
   - Free shipping threshold: `৳2,500`
   - Inside Dhaka: 24-hour delivery target (`৳70`)
   - Outside Dhaka: 48-hour delivery target (`৳130`) via Steadfast / Pathao
5. **Next.js 16 Prerendering Constraint**:
   - Do NOT use dynamic runtime dates (`new Date().getFullYear()`) inside Client Components during static builds. Use static constants (e.g. `2026`).
6. **Verification Requirements**:
   - Always run `npm test` and `npm run build` before completing tasks.
