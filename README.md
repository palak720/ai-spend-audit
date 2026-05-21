# AI Spend Auditor

A free audit web app for founders and engineering managers to identify AI tooling overspend and get concrete, defensible savings recommendations. It is built to generate immediate user value first, then capture qualified leads for Credex when high monthly savings are detected.

## Planned Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + accessible component primitives
- Supabase (Postgres + storage for audits/leads)
- Resend for transactional email
- Anthropic API (or fallback LLM provider) for personalized summary generation
- Vitest for audit engine tests

## Quick Start (to be completed as implementation lands)
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Run tests: `npm test`
4. Run lint: `npm run lint`

## Decisions (initial)
1. Rules-based audit engine instead of LLM for pricing recommendations so savings math stays deterministic and finance-readable.
2. Email gate after value reveal to maximize trust and conversion quality.
3. Public share URL strips PII by default to prevent accidental exposure.
4. Server-side result rendering with OG image metadata to optimize social share quality.
5. Minimal dependency footprint to reduce deployment risk and improve Lighthouse scores.

## Deployed URL
- Add after deployment

## Demo assets
- Add 3 screenshots or 30-second Loom link before submission