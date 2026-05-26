# Daily Log

## Day 1 - 2026-05-21
**Hours worked:** 2
**What I did:** Initialized repository structure, required submission files, and system architecture draft.
**What I learned:** Strong assignment outcomes depend as much on documentation quality and cadence as on code.
**Blockers / what I'm stuck on:** Need final verified pricing values from official vendor pages for this week.
**Plan for tomorrow:** Implement core data models and deterministic audit engine with tests.

## Day 2 - 2026-05-22
**Hours worked:** 4
**What I did:** Implemented typed pricing schema, deterministic audit engine rules, and a runnable Vitest suite with 5 audit-focused tests. Added TypeScript and Vitest config and validated behavior through automated tests.
**What I learned:** Deterministic recommendation thresholds and rule ordering matter a lot for producing honest outcomes in low-savings scenarios.
**Blockers / what I'm stuck on:** Pricing values are currently placeholder modeling values and must be replaced with official source-backed numbers in PRICING_DATA.md.
**Plan for tomorrow:** Build spend input form with local persistence and connect it to the audit engine output UI.

## Day 3 - 2026-05-23
**Hours worked:** 4
**What I did:** Built a Next.js frontend shell, added a multi-tool spend input form with team size and use-case fields, persisted form data to localStorage, and wired form submission to the deterministic audit engine for on-screen results rendering.
**What I learned:** Keeping the audit logic isolated in pure TypeScript made UI integration straightforward and test-safe while still allowing instant client-side results.
**Blockers / what I'm stuck on:** Need to replace placeholder plan prices with official source-backed values and then calibrate recommendation thresholds using real-world interview data.
**Plan for tomorrow:** Implement lead capture backend (storage + confirmation email) and basic abuse protection.

## Day 4 - 2026-05-24
**Hours worked:** 5
**What I did:** Added `/api/leads` backend route with payload validation, honeypot bot trap, and in-memory IP rate limiting. Integrated Supabase REST write for lead storage and Resend transactional email sending. Wired a post-audit lead form (email + optional company/role/team size) to the API and verified with both tests and production build.
**What I learned:** Keeping anti-abuse checks in the API route (not only client-side) is essential, and simple honeypot + rate-limit layers give solid baseline protection for MVP stage.
**Blockers / what I'm stuck on:** Need to run a real end-to-end test against live Supabase and Resend keys to validate delivery and table schema alignment.
**Plan for tomorrow:** Build shareable result URL flow and sanitize public output for PII-safe sharing.

## Day 5 - 2026-05-25
**Hours worked:** 5
**What I did:** Implemented shareable public audit URLs using a dedicated `public_audits` table and new `/api/audits` endpoint. Added a “Create share link” flow in the results UI with copy-to-clipboard behavior. Built dynamic `/audit/[id]` page rendering sanitized audit data only, and added per-audit Open Graph + Twitter metadata generation.
**What I learned:** Separating share records from lead records keeps privacy boundaries explicit and avoids accidental PII leaks in public pages.
**Blockers / what I'm stuck on:** Need to apply the Day 5 migration in Supabase and validate OG previews on deployed URL (Twitter/X and LinkedIn cache behavior).
**Plan for tomorrow:** Add AI-generated personalized summary with graceful fallback, then tighten UI/accessibility and finalize docs.

## Day 6 - 2026-05-26
**Hours worked:** 5
**What I did:** Added `/api/summary` endpoint that generates a personalized summary using Anthropic when available and falls back to deterministic templated output on missing key, timeout, or API error. Wired summary generation into results flow and rendered it in a dedicated summary card. Improved accessibility with semantic `main` landmark, skip link, live regions for status updates, stronger focus-visible styles, and clearer disabled states. Added metadata/viewport refinements to support better Lighthouse mobile best-practices and accessibility outcomes.
**What I learned:** Reliable fallback behavior is as important as model quality for production trust, especially when external APIs can fail or be unavailable.
**Blockers / what I'm stuck on:** Need final Lighthouse run on deployed URL and minor visual tuning based on that report.
**Plan for tomorrow:** Final polish, complete pricing-source verification, and finish all submission docs/screenshots before final deploy.

## Day 7 - YYYY-MM-DD
**Hours worked:** X
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...
