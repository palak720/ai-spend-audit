# AI Spend Auditor

AI Spend Auditor is a free web app for founders and engineering managers to audit AI tooling costs and identify realistic savings opportunities. It produces a transparent, per-tool recommendation with monthly and annual savings and supports shareable public audit links with PII stripped.

## Stack
- Next.js (App Router) + TypeScript
- Deterministic rules engine for pricing recommendations
- Supabase (lead storage + public audits)
- Resend (transactional confirmation email, optional fallback)
- Anthropic API (personalized summary with deterministic fallback)
- Vitest (audit engine tests)

## Screenshots / Demo
- Add Screenshot 1: Landing + spend form
- Add Screenshot 2: Audit result + personalized summary
- Add Screenshot 3: Public share URL page with savings breakdown
- Or add 30-second Loom/YouTube demo link

## Quick Start
1. Install dependencies: `npm install`
2. Configure env vars in `.env`
3. Run dev server: `npm run dev`
4. Run lint: `npm run lint`
5. Run tests: `npm test`
6. Build: `npm run build`

## Deployment
- Deploy on Vercel (recommended) or equivalent
- Set env vars in deployment environment:
  - `NEXT_PUBLIC_APP_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY` (optional if email disabled)
  - `RESEND_FROM_EMAIL` (optional if email disabled)
  - `ANTHROPIC_API_KEY` (optional; fallback summary still works)

## Decisions (5 key trade-offs)
1. Deterministic rules engine over LLM for audit math to ensure defensible financial reasoning.
2. Email capture after value reveal to increase trust and reduce pre-value friction.
3. Separate `public_audits` data model from `leads` to enforce PII-safe sharing by design.
4. Graceful API fallback patterns (summary + email) to keep core flow resilient when external services fail.
5. Lightweight anti-abuse (honeypot + IP rate limit) for MVP-stage protection without heavy user friction.

## Deployed URL
- Add deployed link here

## Pre-Submission Checklist
- [ ] Update `PRICING_DATA.md` with official vendor URLs and verification dates
- [ ] Add real screenshot/video proof in this README
- [ ] Ensure Supabase migrations are applied in production
- [ ] Confirm CI workflow is green on latest `main` commit
- [ ] Verify Lighthouse mobile thresholds on deployed URL
