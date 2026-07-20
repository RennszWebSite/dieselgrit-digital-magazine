# DieselGrit Upgrade — Phased Plan

You asked for everything. That's ~20 distinct feature areas. Shipping it all in a single turn would produce shallow, buggy versions of each and risk breaking the site you already run. Instead, I'll ship it in **6 phases**, each self-contained, tested on mobile, and purely additive — no existing routes, tables, buckets, submissions, or admin functions are removed or renamed.

## Guardrails (apply to every phase)

- All new tables are new — existing `features`, `submissions`, `user_roles` are untouched.
- New columns on `features` are nullable with safe defaults; old rows keep working.
- New admin pages live under `/admin/*` alongside current ones.
- Every UI is mobile-first and tested at 393px.
- RLS on every new table; admin-only writes via `has_role`.

## Phase 1 — Admin Overhaul + Instagram Caption Import + Build Partners

New/changed:
- `features` gains: `slug`, `seo_title`, `seo_description`, `instagram_post_url`, `status` (`draft|published`), `view_count`, `category`.
- Table `build_partners` (name, instagram, website, logo, category) + `feature_partners` join.
- New feature editor: multi-upload with drag-reorder (dnd-kit), hero picker, per-image crop (react-easy-crop), live preview, save-draft, duplicate-from-previous, auto next number, auto today's date, one-click publish.
- "Paste Instagram Caption" box → regex parser extracts @owner, @tagged partners, truck year/make/model/engine keywords, story body.
- Partner picker (searchable, multi-select) replaces free-text sponsors — old `sponsors` JSON kept for back-compat.

## Phase 2 — Homepage + Feature Pages + Search/Filters + SEO

- Homepage rewrite: new hero copy/buttons, sections for Latest / Featured of the Week / Popular / Trending / Recently Added / Browse by Make / Browse by Engine / Build Partners / community welcome block. Order/text driven by site-settings (Phase 5).
- Feature page: larger hero, improved gallery (swipeable + lightbox), specs, story, clickable IG links, related builds (same make/engine), share buttons (native + copy), view counter (RPC increment), reading-time estimate, "Submit your build" CTA footer.
- Global search page + make/engine/category filter chips.
- Auto SEO per feature: title, meta desc, OG/Twitter tags, `Article` JSON-LD, sitemap already dynamic — extended.

## Phase 3 — Giveaway System + Reusable Countdown

Tables: `giveaways`, `giveaway_entries`, `giveaway_draws`, `giveaway_winners`, `countdowns`.
- Admin: create/draft/publish giveaway, upload prize photo, sponsors, rules, dates.
- Entries: manual add, paste-list, CSV upload, dedupe, exclude list, keyword/tag rules. Instagram auto-import is gated behind official Meta Graph API — I'll scaffold the connector hook but ship manual+paste+CSV as the working path (documented clearly in UI). No scraping.
- Branded animated wheel (canvas), configurable colors/logo/sponsors/sound/speed, confetti, full-screen mobile mode.
- Draw: locks entries, records winner + timestamp + entry count (audit), backup winners, admin-confirm redraw.
- Winner announcement generator: Story + Square PNG using real prize photo + logo.
- Reusable countdown component usable in hero, banner, giveaway page, feature page, popup, with end-actions (hide/replace/open wheel/redirect).

## Phase 4 — Magazine Generator + Feature Pack

- Client-side canvas generator (no AI images) using uploaded truck photos only.
- 5 templates: Diesel Magazine, Premium Editorial, Show Truck, Off-Road, Minimal Modern.
- Sizes: 1080×1920 Story, 1080×1080 Square.
- Editable text layers (move, resize, font swap, headline edit), photo swap from feature gallery, live preview, PNG download.
- "Generate Feature Pack" button on any published feature: creates both graphics + prewritten caption + hashtags + tagged partners + shareable link, all in one modal.

## Phase 5 — Website Settings + Seasonal Effects + Announcements

Tables: `site_settings` (single-row JSON), `announcements`, `seasonal_effects`.
- Settings editor: colors (theme tokens), fonts (curated pairs), logo, favicon, header/footer text and links, nav items, homepage section order+visibility+copy, button styles, card styles, shadow intensity, animation intensity, featured-of-the-week override, homepage banners.
- Runtime applies settings via CSS variables + a `SiteSettingsProvider`. Safe fallback to current design if a setting is missing.
- Seasonal effects: snow, christmas lights, falling leaves, rain, fireworks, confetti, hearts, sparkles, halloween fog. Lightweight canvas, RAF-throttled, mobile toggle, date-window scheduling, intensity/speed sliders.
- Announcement banner manager: color, icon, button, link, expiration; renders sitewide.

## Phase 6 — Analytics + Future-Feature Scaffolding

- `page_views` table + RPC. Admin analytics: total views, most-viewed truck, most-searched terms (`search_log` table), submission count, returning-visitor estimate (localStorage cookie), top makes, top partners.
- Scaffolding (tables + admin stubs, no public surfaces yet, safe to ship): `truck_of_the_month_votes`, `favorites`, `brand_pages`, `shop_pages`, `events`, `magazine_issues`, `merch_items`, `sponsor_pages`, `newsletter_subscribers`, optional `profiles` for user accounts. Public routes ship in later phases when you're ready.

## Technical Notes

- New deps: `@dnd-kit/*`, `react-easy-crop`, `zod` (already), `date-fns` (already).
- Zero destructive migrations. Every migration includes GRANTs + RLS + admin policies via `public.has_role`.
- All admin writes stay under `/_authenticated/admin/*`; RLS enforces `admin` role server-side.
- Mobile-first Tailwind, keeps existing black/white/gold tokens; Site Settings extends them non-destructively.

## What I need from you

Reply **"start phase 1"** (or name any phase to jump to) and I'll build it end-to-end. Each phase is one focused delivery; when it's landed and you've kicked the tires on your phone, we move to the next.
