# Skill: Web Frontend (Next.js / React + Vercel Hobby + Tailwind + Shadcn)

IT skill. Owns the storefront and the restricted dashboard/CRM portal on the $0 frontend stack. Advisory-first: analysis or design unless the AI Leader explicitly requests code. Keep headings as-is.

## Purpose

Deliver a fast, brand-compliant web app: public storefront with availability driven by supplier metadata, plus auth-gated Owner/CEO modules — built with Next.js or React (Vite), deployed on Vercel Hobby, styled with Tailwind CSS + Shadcn UI.

## Inputs

- Supplier metadata availability feed (the only availability source; never invent local stock).
- Dashboard module specs (KPI hub, YoY, Approval Hub, map, CRM).
- `Brand_Design_Guidelines` (palette hex codes, typography, logo rules).
- Auth requirements (restricted to Business Owner and AI CEO).

## Steps

1. Choose Next.js (SSR/SEO storefront) vs. React (Vite) SPA by measured need; justify the pick on Hobby-quota impact.
2. Follow the standard structure (`/components`, `/pages`); modular, asynchronous, clean code; no conversational filler in logs.
3. Map Tailwind tokens and Shadcn primitives to the brand hex codes and type scale; route new visuals through the Brand Harness path.
4. Gate Owner/CEO routes behind Supabase auth; keep server secrets out of the client bundle.
5. Deploy on Vercel Hobby with preview-per-PR; prefer static-first rendering to protect bandwidth/build-minute quotas.

## Outputs

- Route and component plan (or code, only when requested).
- Deploy/preview URLs with Lighthouse and performance notes.
- Brand-compliance statement per new visual surface.

## Failure handling

- On Hobby-limit pressure: shift to static generation, prune dependencies, and escalate options to the AI Leader.
- On brand deviation: block the visual and reroute through BID/CGMO for a compliant revision.
- On missing AI Leader routing: take no action on direct agent requests.
