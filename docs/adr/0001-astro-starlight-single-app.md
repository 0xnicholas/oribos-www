# Astro + Starlight for a single-site oribos-www

Status: accepted
Date: 2026-10-21

`oribos-www` will be one Astro 7 + Starlight application in a single package, built to static `dist/`, with marketing pages and `/docs/**` in the same app. Both existing sites already run Astro 7 + Tailwind 4, and the docs site's 249-page TypeDoc tree, `.md` twins, `llms.txt`, Pagefind index, and redirect ledger already work on Starlight; rebuilding them on Next.js + Fumadocs would rewrite both sites and lose the only proven TypeDoc pipeline. The single app also gives one origin, one sitemap index, one search index, one `/llms.txt`, and one deploy.

## Considered Options

- **Next.js 16 + Fumadocs**: the only serious alternative. Rejected because both marketing and docs would be rewritten, the TypeDoc symbol tree would need a new pipeline, and Next.js static export does not provide redirects or response headers.
- **Monorepo (`apps/www` + `apps/docs`)**: rejected because there is one site, one deploy, one search index, and one release cadence today. It would add two configs, two previews, and cross-app link/token drift with no current payoff.
- **Two repos / two domains**: rejected because the destination is a single site on one canonical origin; `docs.<apex>` remains an alias, not a second site.

## Consequences

- Docs are latest-only at launch; no `starlight-versions` or `/docs/v<n>/` until a separate effort requires it.
- Marketing layouts must opt into Pagefind indexing with `data-pagefind-body`; Starlight already does this for docs.
- The docs shell is Starlight-first: routing, content collection, and Pagefind are untouched, and any component override is recorded in an override registry.
- Marketing and docs share one build, so a marketing change also runs the docs/API gates. This is accepted at the current size.
- `oribos-website` is retired and `oribos-docs` becomes a read-only archive; `oribos-www` is the content truth source.
