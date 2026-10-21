# Single-site docs migration and content truth source

Status: accepted
Date: 2026-10-21

Documentation Markdown/MDX moves from `oribos-docs` into `oribos-www` at `src/content/docs/docs/**`; `oribos-docs` becomes a read-only archive. The new site keeps all 268 existing `/docs/**` paths, canonicalizes them at `${SITE_ORIGIN}/docs/**`, and 301s the old docs subdomain to the main origin at the host. It removes the old `/` → `/docs/` redirect because `/` is now the marketing home. The launch docs set is 24 handwritten pages plus 249 TypeDoc-generated pages (273 routes); the API tree is regenerated at pin `v0.9.0` and covers core only. The agent surface (`.md` twins, `/llms.txt`, `/llms-manifest.json`) moves with the content and is expanded to 28 export surfaces.

## Considered Options

- **Keep `oribos-docs` as the content truth source and reverse-proxy it under `/docs`**: rejected because it keeps two content sources, two release cadences, and two agent-surface generators; the destination is one site with one content truth source.
- **Two apps on the same domain (`apps/www` + `apps/docs`)**: rejected because it produces two builds, two sitemaps, two token sets, two search indexes, and two previews with no current payoff. It was the low-risk option, not the right one for a single-site destination.
- **Make `docs.<apex>` the canonical host**: rejected because it conflicts with the single-origin destination and splits canonical, OG, sitemap, and llms URLs across two hosts. It remains an alias that 301s to the main origin.
- **Reorder or merge docs URLs during migration**: rejected. Keeping all 268 paths preserves search equity and the existing redirect ledger; the IA changes happen inside the five-family sidebar, not in the URL set.

## Consequences

- One build produces one `dist/`, one sitemap index (pages + docs shards), one Pagefind index, and one `/llms.txt`.
- `oribos-docs` documentation specs are historical and are not a source of truth for the new site.
- The docs shell is Starlight-first; component overrides are limited to the recorded override registry.
- Migration order is fixed: freeze the old docs content, copy the 19 handwritten + 249 generated pages and the pipeline, refresh facts, regenerate the API tree at v0.9.0, rebuild the agent surface and redirects, then archive `oribos-docs`.
- Docs versioning and i18n are not part of this migration; they would need a separate ADR/effort.
