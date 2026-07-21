# DieselGrit — Cinematic Redesign Plan

This is 4–6 sessions of work. Rebuilding it all in one shot risks breaking the admin, publishing flow, and mobile stability you already depend on. I'll ship it in ordered phases, each self-contained and mobile-verified before moving on.

## Phase 0 — Mobile stability audit (ship first, no visual redesign)
Foundation for everything else. Zero horizontal scroll, no layout shift, safe-area aware.

- Add `overflow-x: clip` on `html, body`, wrap route outlet in a clipped container.
- Swap `100vh` → `100dvh` / `100svh` across hero, menu, intro, magazine view.
- Replace `100vw` with `100%` where used; audit every `w-screen`.
- Reserve image dimensions (`aspect-ratio` + width/height) on hero, cards, gallery to kill CLS.
- Safe-area padding on nav, banners, submit form CTA.
- `prefers-reduced-motion` respected globally (already partially done in seasonal-effect).
- Fix any `transform: translateX` blocks that leak past viewport.

## Phase 1 — Motion foundation
- Install `gsap` (+ ScrollTrigger) and `framer-motion`.
- Create `src/lib/motion.ts` with shared easings, durations, reveal presets, and a `useReveal()` hook (IntersectionObserver → GSAP). One system, reused.
- `<PageTransition>` wrapper in `__root.tsx`: black panel wipe with DIESELGRIT wordmark between routes. No white flash.
- `<SessionIntro>`: full-screen loader, letter-by-letter wordmark, gold progress line, `sessionStorage` gate so returning visits skip it.
- `<Reveal>` primitive: masked upward line/word reveal, staggered variants for cards, clip-path variants for images.

## Phase 2 — Homepage art direction
- Full-bleed hero: featured truck image, cinematic gradient, slow Ken-Burns zoom (transform-only), timed sequence for issue nº → headline → dek → CTAs.
- Animated stats strip (features / brands / engines / reach) with IntersectionObserver counters.
- Pinned editorial section (one, sparingly) — desktop pins text while images cross-transition; on mobile it degrades to stacked reveals.
- Horizontal feature showcase driven by vertical scroll, wrapped in `overflow-x: clip` container, disabled under 640px.
- Latest-features grid: large image cards with tap feedback + image zoom on mobile, cursor-follow parallax on desktop.

## Phase 3 — Navigation, cursor, buttons
- Full-screen editorial menu overlay: staggered link reveal, background image swap per hovered link, body scroll lock, safe-area aware close.
- Desktop-only custom cursor (`matchMedia('(pointer: fine)')`), grows on links/images/buttons, disabled on touch.
- Magnetic primary buttons on desktop (subtle, ~8px range); tactile scale-press on mobile. Applied to a shared `<CTA>` component so it doesn't sprawl.

## Phase 4 — Feature page as digital magazine
- Oversized editorial hero with clip-path reveal.
- Sticky story metadata rail (desktop) / condensed sticky header (mobile).
- Animated spec list (staggered rows, gold divider draw-in).
- Elegant image placeholders (dominant-color or blurred low-res) → fade to full.
- Related trucks block already present — restyle to match new card system.

## Phase 5 — Archive + Submit + Micro-interactions
- Archive: filters for Cummins / Duramax / Power Stroke / lifted / lowered / performance / show truck / daily driver. Framer Motion `AnimatePresence` layout for filter/sort changes. (Requires small data addition — see Technical.)
- Submit: multi-step guided flow with progress bar, transitions between steps, image previews, validation, cinematic success screen. Reuses existing Zod schema.
- Micro-interactions pass: arrows, counters, category labels, form fields, menu icons, social links.

## Phase 6 — Performance & polish
- Lazy-load below-fold sections (`React.lazy` + `<ClientOnly>` where needed).
- Verify GSAP contexts are torn down on unmount; no stacked animation systems per element.
- Real iPhone Safari check via Playwright at 390×844: horizontal scroll test, CLS check, motion-reduced check.
- Lighthouse pass on hero LCP (preload hero image via route `head().links`).

## Technical notes
- **No breaking changes** to Supabase schema, storage, admin routes, or publishing flow. Everything is additive on the frontend.
- **One tiny migration in Phase 5**: add `tags text[]` (or reuse `category`) on `features` so archive filters can hit Cummins/Duramax/etc. without a rebuild. Will confirm with you before running.
- **Bundle cost**: GSAP + ScrollTrigger + Framer Motion ≈ 60kb gz. Acceptable for this brief; code-split heavy scroll scenes.
- **Animation split**: GSAP/ScrollTrigger for scroll-driven scenes (pinning, horizontal scroll, reveals). Framer Motion for route transitions, menu, filter list. Never both on the same element.
- **Mobile guardrails baked into `motion.ts`**: `isTouch`, `prefersReduced`, `isSmallViewport` helpers so each effect self-disables cleanly.

## Order of delivery
I'll start with **Phase 0 + Phase 1** in the next turn (stability + motion foundation + intro + page transitions). That alone will already feel dramatically more premium, and every later phase plugs into it. After you see it live on your iPhone, I move to Phase 2.

Reply "go" to start Phase 0 + 1, or tell me to reorder / drop anything.