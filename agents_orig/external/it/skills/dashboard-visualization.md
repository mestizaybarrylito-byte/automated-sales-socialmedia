# Skill: Dashboard Visualization (Recharts + Map + CRM)

IT skill. Owns the Owner Dashboard and CRM portal visualizations. Advisory-first: analysis or design unless the AI Leader explicitly requests code. Keep headings as-is.

## Purpose

Render the five dashboard modules with Recharts and map layers so the Owner decides on live, owner-attributed KPIs: Executive KPI Hub, YoY Comparative Analytics, Weekly Campaign Approval Hub, Geospatial Map, and CRM Segmentation — each panel carrying a data-freshness indicator.

## Inputs

- Supabase query endpoints from `skills/supabase-backend.md`.
- KPI definitions from each agent's section 4 (CGMO, CRO, LOG-SD, BID).
- BID thumbnails, copy previews, and ad formats for the Approval Hub.
- Delivery hubs, routes, and buyer coordinates for the map.

## Steps

1. Build the KPI Hub: CGMO (CAC, MQL, RoAS); CRO (conversion, average ticket, cart abandonment, `Payment_Provider` revenue); LOG-SD (turnaround, shipping cost per order, OTIF) — responsive Recharts containers, no chartjunk.
2. Build YoY time series (current vs. prior year) with explicit date-range controls.
3. Build the Approval Hub grid with a persisted status toggle (`Approved` / `Rejected` / `Pending Adjustments`) per weekly slot.
4. Build the map with Google Maps API free quota or open-source layers; overlay hubs, routes, and buyer heatmap.
5. Build CRM tabs: Active Buyers (profile, lifespan, affinity) and Ghost Leads (registered, zero purchases, funnel drop-off step).
6. Stamp every panel with a freshness timestamp to serve the dashboard-data-freshness KPI.

## Outputs

- Dashboard page spec (or code, only when requested) with query contracts per panel.
- Freshness SLO note per data source.

## Failure handling

- On stale data: show a staleness badge on the panel and alert the AI Leader; never present stale numbers as live.
- On map-quota risk: fall back to open-source layers and report the switch.
- On missing AI Leader routing: take no action on direct agent requests.
