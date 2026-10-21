# Acceptance

> Source: [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16), plus the gate definitions in `stack.md` §10, `design-system.md` §9, `docs-ia.md` §6–§7, and `keyword-pages.md` §10.
> This file has two layers. **A** is the spec handoff gate: it must pass before the spec is signed off. **B** is the implementation gate: the build/launch effort must pass it before the site ships. Do not use B to block the spec handoff, and do not use A as evidence that the site is ready.

## A. Handoff acceptance

The spec is ready to hand off when all of these are true.

### A1. Artifact completeness

- [ ] `docs/spec/README.md` exists, has the destination, reading order, locked/latitude boundary, deferred list, ADR list, prototype note, and sign-off section.
- [ ] `docs/spec/page-inventory.csv` exists and parses as CSV with the agreed header.
- [ ] `docs/spec/page-outlines.md` exists and covers every `launch` marketing route plus the 24 handwritten docs pages and the API template.
- [ ] `docs/spec/acceptance.md` exists with both layers.
- [ ] `docs/spec/redirect-map.csv` exists and covers the old marketing URL set, the docs paths, and the docs subdomain rule.
- [ ] The topic specs (`docs-ia.md`, `design-system.md`, `brand-assets.md`, `stack.md`, `keyword-pages.md`, `fact-baseline.md`, `deploy-baseline.md`) are present and linked from `README.md`.
- [ ] ADR-0001, ADR-0002, and ADR-0003 exist and are linked from `README.md`.

### A2. Matrix integrity

- [ ] Every `launch` and `planned` row has a non-empty `title`, `family`, `page_type`, `audience`, `status`, `priority`, `template`, `source`, `indexable`, `route_count`, and `notes`.
- [ ] Every `launch` row has a non-empty `url`; the only row with an empty `url` is the `planned` 18-package-overview bundle row.
- [ ] Every `launch` row has `canonical=self` except `/404/`, which is `noindex`.
- [ ] Every `launch` row with an `outline_ref` resolves to a heading in `page-outlines.md` or a section in a topic spec.
- [ ] Every `not_doing` row has a reason in `notes` and `indexable=false`.
- [ ] No URL appears twice with conflicting statuses; no two `launch`/`planned` rows share a URL.
- [ ] `route_count` sums correctly: 17 marketing launch pages + 404; 24 handwritten docs + 249 generated API pages = 273 docs routes; 290 sitemap URLs.
- [ ] `not_doing` rows are excluded from the launch/planned counts.

### A3. Page-set consistency

- [ ] The launch marketing set is exactly: `/`, `/about/`, `/privacy-policy/`, `/terms-of-service/`, the five solution pages, the four keyword pages, `/platform/`, `/fde-support/`, `/templates/`, `/changelog/`, plus `/404/`.
- [ ] The docs launch set is exactly the 24 handwritten pages in `docs-ia.md` §3.3 plus the 249 generated API pages.
- [ ] No launch page is missing from the matrix; no `not_doing` page is in the launch set.
- [ ] `/platform/` is present as a launch URL with planned content. No other page is marked `Planned` except the Platform badge.
- [ ] `/fde-support/` is present; `/support/` is `not_doing` and has no redirect.

### A4. Cross-document consistency

- [ ] URLs, titles, and statuses in `page-inventory.csv` match `docs-ia.md`, `keyword-pages.md`, and the closed tickets.
- [ ] The public facts match `fact-baseline.md`: 0.9.0, 19 packages, core 10 entry points, 28 export surfaces, 23 examples, zero runtime dependencies only in core.
- [ ] No launch copy claims an unpublished `agent-run`, `output-object`, or `@oribos/lease`.
- [ ] The keyword pages have unique primary queries; no solution page claims a keyword primary query.
- [ ] Header and footer order match `design-system.md` §8.1 / §8.9 and #14; no Pricing, Blog, Customers, Careers, Contact, Newsletter, or research entry.
- [ ] The page outlines do not contradict the design system, the docs IA, or the stack.

### A5. Migration coverage

- [ ] `redirect-map.csv` lists every old marketing URL: `/`, `/about/`, `/privacy-policy/`, `/terms-of-service/`, `/in-product-agents/`, `/operations-agents/`, `/developer-infrastructure/`, and the four keyword pages.
- [ ] `/in-product-agents/` (with and without trailing slash) has a 301 to `/customer-facing-agents/`.
- [ ] All other old marketing URLs have `action=keep`.
- [ ] The 268 existing `/docs/**` paths are `keep`; the API tree stays at `/docs/reference/api/**`.
- [ ] The old `/` → `/docs/` entry is recorded as `remove`.
- [ ] The docs subdomain rule is recorded as a host-level 301, not as a path redirect.
- [ ] No redirect is invented for a URL that never existed (`/support/`, `/ai-agent-deployment/`, `/platform-observability/`, `/rag-pipeline/`).
- [ ] Path redirects stay well below the EdgeOne 100-redirect limit.

### A6. Decision boundary

- [ ] `README.md` locked table matches the decisions in the closed tickets and ADRs.
- [ ] `README.md` latitude list does not accidentally lock implementation details.
- [ ] The deferred / launch-blocker table lists every known external input with an owner and a blocking scope.
- [ ] No launch page has an unresolved `TBD` except the explicit launch blockers (domain, hosting, FDE email, attribution, Twitter handle, analytics).

### A7. Sign-off

- [ ] A consistency pass has been run after the last edit (CSV parse, anchor check, count check, local link check).
- [ ] Owner has reviewed the handoff PR from `spec/handoff` to `main`.
- [ ] `README.md` status changes to `accepted`.
- [ ] The sign-off comment is recorded on #16.

## B. Implementation acceptance

The build/launch effort must pass all of these before launch. The exact scripts are defined in `stack.md` §10; this section is the contract, not a second implementation.

### B1. Routes and content

- [ ] 17 marketing HTML routes + 273 docs routes build and return 200; the 404 page renders with status 404.
- [ ] 268 existing `/docs/**` paths are preserved; `/` serves the marketing home and does not 301 to `/docs/`.
- [ ] `/docs` normalizes to `/docs/`; trailing slashes are canonical.
- [ ] No `planned`, `not_doing`, P1/P2, or empty-stub route is generated.
- [ ] The 24 handwritten docs pages have real content; the 249 generated API pages regenerate at pin v0.9.0 with an empty diff gate.
- [ ] `/platform/` is indexable with the `Planned` badge and disclaimer; no independent Studio / Agent Builder / MCP Registry / AI Gateway pages exist.

### B2. Links and navigation

- [ ] `pnpm verify:links` is green: internal links, anchors, and `.md` twins are bidirectional.
- [ ] Every header, footer, and in-page link returns 200; no dead nav entry, no orphan page.
- [ ] Footer `License` points to the GitHub `LICENSE` file, not an invented site page; footer `GitHub` is external.
- [ ] Mobile and desktop use the same navigation source and item order.
- [ ] The skip link is the first focusable element; header/mega menu/mobile nav keyboard behavior matches `design-system.md` §9.3–§9.4.

### B3. Redirects and hosts

- [ ] `pnpm verify:redirects` is green: old − new ⊆ ledger; host rules do not conflict with path rules.
- [ ] `/in-product-agents/` and `/in-product-agents` 301 to `/customer-facing-agents/`.
- [ ] `/` is not redirected.
- [ ] The docs subdomain 301 is configured at the host; it is not in the path ledger.
- [ ] Non-trailing-slash requests 308 to the trailing-slash form.
- [ ] 404 behavior and the 404 page match the host rules.

### B4. Sitemap and robots

- [ ] `pnpm verify:sitemap` is green: `/sitemap-index.xml` has `pages.xml` and `docs.xml`; the URL set equals the launch route inventory.
- [ ] The `pages` shard contains the 17 marketing pages; the `docs` shard contains 273 docs pages.
- [ ] No `.md`, 404, planned, or `not_doing` URL is in the sitemap.
- [ ] `/sitemap.xml` 301s or 200-aliases to `/sitemap-index.xml`.
- [ ] No `changefreq` or `priority`; `lastmod` only when a real content date exists.
- [ ] `robots.txt` allows crawling and points to the sitemap; no live page is `noindex` except 404.

### B5. Agent surface

- [ ] `pnpm verify:agent-surface` is green: every page has a `.md` twin, a head alternate link, and a row in `/llms.txt`.
- [ ] `.md` twins return `text/markdown; charset=utf-8`; no trailing slash on the twin URL.
- [ ] `/llms.txt` follows the llmstxt.org v2 shape and links the full content set.
- [ ] `/llms-manifest.json` recomputes; `framework.version=0.9.0`; `framework.pin=77e582419c425f7d4d7cee2cd189b9f46f69ef84`; `packages` has 28 export surfaces; `pages` covers non-docs pages.
- [ ] No per-page `llms.txt`, `llms-full.txt`, or `Accept: text/markdown` negotiation.

### B6. Content, schema, and copy

- [ ] `pnpm verify:content` is green: marketing schema, block registry, docs frontmatter, and Templates/Changelog schemas.
- [ ] Every block in `src/lib/blocks.ts` has an HTML renderer and a Markdown projector; missing either fails.
- [ ] `packages` values are in the 28-surface set; generated docs pages have `generated: true`.
- [ ] `pnpm verify:copy` is green: no `0.5.0` / `0.6.0` as current, no `ultralight` / `lightweight`, no `@balsats/*`, no RAG/evals denial, no CJK in shipped content, no `coming soon`.
- [ ] No customer logos, testimonials, customer counts, fake screenshots, invented benchmarks, prices, or dates.
- [ ] `zero runtime dependencies` only modifies core; capability packages carry their own dependencies.
- [ ] Platform is always `(Planned)` with no dates, prices, or fake UI.
- [ ] `pnpm verify:api` is green: TypeDoc regeneration has an empty diff; pin and `packages` agree.

### B7. Design and accessibility

- [ ] `pnpm verify:design` is green: token completeness, no bare color values, no radius/shadow/transform, contrast.
- [ ] WCAG 2.2 AA: all 33 text/non-text pairs pass in both themes per `design-system.md` §9.1–§9.2.
- [ ] axe has no critical or serious findings on home, a keyword page, a solution page, a docs article, Templates, and Changelog.
- [ ] Keyboard: header, mega menu, mobile drawer, tabs, FAQ, docs sidebar, TOC, and Copy page are reachable and operable; focus returns to triggers.
- [ ] Focus is always visible; `outline: none` is not used; forced-colors mode keeps a visible outline.
- [ ] Reduced motion removes transitions/animations; no smooth scrolling.
- [ ] No horizontal overflow at 320, 390, 768, 1024, 1328, and 1440.
- [ ] No external requests: fonts, icons, scripts, and styles are same-origin; no Google Fonts, CDN, or analytics.
- [ ] Theme toggle persists, matches across marketing/docs, and has no FOUC.
- [ ] Wordmark, favicon, OG, fonts, and icons match `brand-assets.md`.

### B8. Search

- [ ] Pagefind builds one index covering all indexable HTML; `page_count > 0`.
- [ ] No Pagefind request on first paint; the trigger opens a dialog; keyboard and focus behavior match `stack.md` §5.
- [ ] The index is ≤ 5 MB; 404, `.md` twins, nav, and footer are excluded.
- [ ] No third-party search UI library or analytics.

### B9. SEO, social, and structured data

- [ ] Canonical is absolute, self-referencing, and trailing-slash; `SITE_ORIGIN` is a single source; no hardcoded domain.
- [ ] Every page has `og:title`, `og:description`, `og:url`, `og:image`, `og:image:alt`, `og:site_name`; per-page OG falls back to the default when missing.
- [ ] Twitter uses `summary_large_image`; `twitter:title`, `twitter:description`, and `twitter:image` derive from OG; no `twitter:site` until a handle exists.
- [ ] JSON-LD matches visible content: `Organization` site-wide, `WebSite` home only, `BreadcrumbList` inner pages, `FAQPage` where visible FAQ exists, `SoftwareApplication` only on `/ai-agent-framework/`.
- [ ] No `aggregateRating`, review schema, invisible structured data, or `Article`/`BlogPosting`.
- [ ] Every page has `lang=en`, self `hreflang=en`, `x-default`, and `og:locale=en_US`; no `/zh/` and no language switcher.

### B10. Performance

- [ ] At launch, p75 mobile on home, a keyword page, a solution page, a docs article, Templates, and Changelog: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.
- [ ] Measure with PageSpeed Insights / CrUX at launch; record the date and URL set.
- [ ] No Lighthouse CI gate; no visual regression suite; no content unit tests.

### B11. Content minimums

- [ ] Home: 8 sections in order; locked H1/sub/CTAs/facts; 7 FAQ; no customer proof, Platform block, or path chooser.
- [ ] Each solution page: 3 scenario cards, 3 FAQ, 1–3 runnable examples, reference architecture, package map, boundaries, one 5–15 line code block; no customer proof.
- [ ] Each keyword page: 3–4 argument sections, 4–6 FAQ, one primary query, one code block, 2–3 “Used in” links; no TypeScript in H1/first screen.
- [ ] Templates: at least 12 complete cards, 23-example index, 3 Start here cards, filters, two links per card; otherwise the page is delayed.
- [ ] Changelog: 5 entries (v0.9.0–v0.5.0), 3–5 highlights each, GitHub link; no raw release body, detail pages, or RSS.
- [ ] Docs: 24 handwritten pages with real content; 249 generated pages; no empty stub; P1/P2 pages not generated.
- [ ] About, privacy, terms, `/fde-support/`, `/platform/`: match their outlines and copy red lines.

## C. Launch blockers

These do not block the spec handoff. They block launch, and each has an owner.

| Blocker | Owner | Why it blocks launch | Current state |
|---|---|---|---|
| Domain registration + final canonical host | owner | Canonical, OG, sitemap, llms, and sitemap submission need a real origin | `SITE_ORIGIN` is provisional (`https://oribos.ai`) |
| Hosting account + real-host verification | owner | 301/308, headers, 404, TLS, and cache behavior need a real host | Moved to the build/launch effort |
| FDE contact email or booking link | owner | `/fde-support/` primary CTA and privacy contact | No placeholder allowed |
| Public team attribution | owner | About/FDE copy | Default: “a small maintainer-led team” |
| Twitter/X handle | owner | `twitter:site` only | Optional; omit until available |
| Analytics / consent | owner | Privacy copy and consent scope | Off at launch |
| Platform / Studio / Agent Builder facts | owner | Independent product/docs pages | Not needed for the `/platform/` direction page |
| Industry solution evidence | owner | Financial services / healthcare pages | Future effort |
| MCP Registry public content | owner | Docs pages | Future effort |
| Package overview content | build effort | 18 P1/P2 docs pages | Not a launch requirement |

## D. Explicitly not gated

- No Lighthouse CI, visual regression, content unit tests, or performance CI.
- No CMS, database, SSR, adapter, client framework, docs versioning, i18n, analytics, or third-party search.
- No blog, RSS, author system, customers, pricing, careers, newsletter, or contact page.
- No customer logos, testimonials, or case studies.
- No independent Studio / Agent Builder / MCP Registry / AI Gateway pages.

## E. Sign-off record

- Owner: @0xnicholas
- Spec status: `handoff-ready`
- Sign-off vehicle: [#22](https://github.com/0xnicholas/oribos-www/pull/22), from `spec/handoff` to `main`
- Sign-off comment: recorded on [#16](https://github.com/0xnicholas/oribos-www/issues/16)
- Date: 2026-10-21
