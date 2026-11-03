# Skill: Delivery Ops (Public Repo + $0 Discipline + Hackathon Best Practices)

IT skill. Owns hackathon-grade delivery discipline across all modules. Advisory-first: analysis or design unless the AI Leader explicitly requests code. Keep headings as-is.

## Purpose

Keep the solution shippable and compliant: public GitHub repository with all code, configs, migrations, and docs; strict $0 infrastructure cost; modular, asynchronous, clean code in the standard structure — and an early warning on any paid-service drift.

## Inputs

- Module outputs from all IT skills.
- Quota dashboards (Supabase, Vercel, Meta credits, Maps API).
- Release scope approved by the AI Leader.

## Steps

1. Maintain the public repo: `/components`, `/pages`, `/supabase`, versioned migrations, README with setup and architecture, `.env.example` with no secrets.
2. Enforce stack purity: Supabase, Next.js or React (Vite) on Vercel Hobby, Tailwind + Shadcn, Recharts, Meta Model API — no paid enterprise software or license-heavy platforms.
3. Run a weekly quota headroom check across every free tier; report burn and trim options to the AI Leader.
4. Require async, non-blocking I/O and structured logs with no conversational filler.
5. Use preview-per-PR deploys; merge only with green previews and passing checks.
6. Flag any proposal violating the $0 constraint, the mandatory stack, or `Business_Model` rules before it is built.

## Outputs

- Repo checklist status (code, configs, migrations, docs present).
- Weekly quota headroom report supporting the infrastructure-cost KPI.
- Release notes per shipped scope.

## Failure handling

- On quota breach: degrade gracefully per module fallbacks, propose trims, and escalate to the AI Leader.
- On secret leak: rotate immediately, purge from history, and document the fix.
- On paid-service drift: block adoption and present the $0 alternative.
- On missing AI Leader routing: take no action on direct agent requests.
