# Oribos WWW — Site Spec Handoff

> Status: handoff-ready; owner sign-off pending in the handoff PR.
> Date: 2026-10-21
> Map: [Oribos 官网：Mastra 形态站点规格](https://github.com/0xnicholas/oribos-www/issues/1)
> Ticket: [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16)
> Handoff PR: [#22](https://github.com/0xnicholas/oribos-www/pull/22), from branch `spec/handoff` to `main`.

## Destination

Deliver a handoff site spec for `oribos-www`: IA and navigation, complete page inventory,
per-page outlines, content model, visual direction, stack choice, and migration / SEO /
agent-surface constraints. Implementation and launch are a separate effort and are not part of
this spec.

## What this spec is not

- It is not the site implementation. No Astro project, components, or page content are created
  here.
- It is not a content draft. Page outlines define structure, locked claims, required assets, and
  links; final copy belongs to the build effort and must stay inside `fact-baseline.md` and the
  copy red lines.
- It is not the launch plan. Domain registration, hosting, and real-host verification are deferred
  to the build/launch effort.

## Read in this order

1. [`page-inventory.csv`](./page-inventory.csv) — the route/page matrix; start here for scope.
2. [`page-outlines.md`](./page-outlines.md) — per-page section outlines.
3. [`docs-ia.md`](./docs-ia.md) — docs IA, URL/migration, agent surface.
4. [`design-system.md`](./design-system.md) — visual, token, and component contract.
5. [`brand-assets.md`](./brand-assets.md) — wordmark, favicon, OG, fonts, icons.
6. [`stack.md`](./stack.md) — framework, repo shape, content model, search, CI.
7. [`keyword-pages.md`](./keyword-pages.md) — keyword page set and SEO contract.
8. [`fact-baseline.md`](./fact-baseline.md) — public facts and copy invariants.
9. [`acceptance.md`](./acceptance.md) — handoff and implementation acceptance.
10. [`redirect-map.csv`](./redirect-map.csv) — old → new URL actions.
11. [`deploy-baseline.md`](./deploy-baseline.md) — provisional domain/hosting baseline; not this
    effort's critical path.

## Page set at a glance

| Family | Launch routes | Planned (not built) | Not doing |
|---|---:|---:|---:|
| Marketing | 17 (+ 404) | 0 | 22 |
| Docs | 273 (24 handwritten + 249 generated) | 15 named + 18 package overviews | docs versioning, `/zh/` |
| **Total** | **290 sitemap URLs (+ 404)** | **33 named + 18 overviews** | **24 candidates** |

`/platform/` is a launch route with planned, direction-only content. It is not a separate planned
route: the URL, navigation entry, sitemap entry, and `Planned` badge are all part of the launch.

The exact rows, statuses, and reasons live in [`page-inventory.csv`](./page-inventory.csv). The
counts above are a summary, not a second source of truth. Bundle rows may have an empty `url` (the
18-package-overview row is the only one); they are not routes and are never generated.

### Matrix schema

| Column | Required | Meaning |
|---|---|---|
| `url` | launch / planned | Public route or proposed route; empty only for bundle rows |
| `title` | yes | HTML `<title>` / page title |
| `family` | yes | `home`, `company`, `legal`, `solutions`, `keyword`, `product`, `support`, `resources`, `system`, `docs`, `i18n`, `commercial` |
| `page_type` | yes | `marketing`, `solution`, `keyword`, `product-direction`, `service`, `resource-index`, `legal`, `error`, `docs-landing`, `docs-concept`, `docs-guide`, `docs-reference`, `docs-api`, etc. |
| `audience` | yes | Who the page is for |
| `status` | yes | `launch`, `planned`, `not_doing` |
| `priority` | yes | `P0` for launch, `P1`/`P2` for planned |
| `template` | yes | Page template key; `docs-package-overview` for the bundle row |
| `primary_query` | keyword pages, `/platform/` | One primary query per page; empty elsewhere |
| `outline_ref` | launch | `#anchor` in `page-outlines.md`, or a topic-spec section |
| `required_assets` | launch | Images, diagrams, OG, code/trace sources |
| `internal_links` | launch | Semicolon-separated link targets |
| `source` | yes | `new`, `existing`, `existing; refreshed`, `301 from …`, `generated`, `planned`, `n/a` |
| `canonical` | launch | `self`, `none` (404 only), or empty for unbuilt rows |
| `indexable` | yes | `true` / `false` |
| `route_count` | yes | 1, 249 for the API tree, 18 for the package bundle |
| `notes` | yes | Scope, migration, fact-refresh, or `not_doing` reason |

Status vocabulary is deliberately small: `launch` is built and published; `planned` is in the
inventory but not generated; `not_doing` is a candidate that is explicitly ruled out. `not_doing`
rows never enter the route inventory, sitemap, search index, or agent surface.

To add a page after handoff, add a matrix row, an outline, and its links first, then update the
route inventory. A new route in a locked area needs owner approval and, if it changes the IA or a
contract, a new issue or ADR.

## Decisions locked

| Area | Locked decision | Source |
|---|---|---|
| Site scope | Marketing + resources + docs; no blog, customers, pricing, research hub, or `/solutions` hub | Map #1, #14 |
| IA / navigation | Header: Framework ▾ / Platform (Planned) / FDE + Support / Solutions ▾ / Resources ▾ / Docs / GitHub; Solutions order: Customer-facing, Operations, Developer infrastructure, Sales, Marketing; footer groups per #14; no Pricing | #8, #9, #14, `design-system.md` §8.1 / §8.9 |
| Page set | 17 marketing routes + 404 + 273 docs routes; 5 solution pages; 4 keyword pages; Templates and Changelog; docs 24 handwritten + 249 generated | #8, #9, #12, #14, #19, `page-inventory.csv` |
| Narrative | Home H1 `Compose AI agents.`; category language; `TypeScript` only in title/meta/og, not H1/first screen; `zero runtime dependencies` only for core | #10, #19, `fact-baseline.md` |
| Facts | Public 0.9.0: 19 packages, core 10 entry points, 28 export surfaces, 23 examples, zero runtime dependencies only in core | `fact-baseline.md` |
| Visual | B · instrument: graphite, mono labels, 1328 / 144px, rail sections, 1px hairline, 0 radius, dark-first; signal orange `#d94f2b` light / `#ff7a4d` dark | ADR-0002, `design-system.md` |
| Brand assets | Text wordmark `Oribos`; placeholder O tile favicon; dark 1200×630 OG template; self-hosted InterVar + system mono | `brand-assets.md` |
| Stack | Astro 7 + Starlight single app; Node 22.21 + pnpm 10; Tailwind 4; static `dist/`; no CMS/SSR/adapter | ADR-0001, `stack.md` |
| Content model | Typed marketing blocks + Markdown projector; Starlight docs collection; Templates and Changelog JSON schemas | `stack.md` §3 |
| Contracts | Shared route inventory; pages/docs sitemap shards; redirects; `.md` twins; `/llms.txt`; `/llms-manifest.json`; JSON-LD; build-time OG | `stack.md` §7–§8, `docs-ia.md` §6, `keyword-pages.md` §6 |
| Docs migration | Content truth source moves to `oribos-www`; `oribos-docs` becomes read-only archive; all 268 `/docs/**` paths retained; docs subdomain 301; `/` → `/docs/` removed | ADR-0003, `docs-ia.md` |
| Acceptance | Two layers: handoff acceptance (this spec) and implementation acceptance (build/launch) | `acceptance.md` |

## Latitude for implementers

- Component internals and CSS organization inside the design tokens.
- Final copy inside the page outlines and copy red lines.
- Responsive behavior details at the specified breakpoints.
- Build tooling internals, test implementation, and fixture choices.
- Animation parameters inside the allowed motion set.
- Docs migration mechanics and fact-refresh execution.
- Placeholder asset production inside the brand specs.
- Pagefind UI implementation inside the search contract.

Anything in **Decisions locked** needs a new issue or ADR plus owner approval to change. Copy and
typo fixes inside the locked claims can go through normal PR review.

## Deferred / launch blockers

| Item | Owner | Blocks | Status |
|---|---|---|---|
| Domain registration + final canonical host | owner | Launch, sitemap submission, absolute OG/llms URLs | Open; `SITE_ORIGIN` is provisional |
| Hosting account + real-host verification | owner | Launch | Moved to the build/launch effort |
| FDE contact email or booking link | owner | `/fde-support/` primary CTA, privacy contact | Open; no placeholder allowed |
| Public team attribution | owner | About and FDE copy | Default: “a small maintainer-led team” |
| Twitter/X handle | owner | `twitter:site` only | Optional; no placeholder |
| Analytics / consent | owner | Privacy copy, consent scope | Off at launch; revisit post-launch |
| Platform / Studio / Agent Builder facts | owner | Independent product and docs pages | Future effort; `/platform/` is direction only |
| Industry solution evidence | owner | Financial services / healthcare pages | Future effort |
| MCP Registry public content | owner | Docs pages | Future effort |
| Package overview content | build effort | 18 P1/P2 docs pages | Not a launch requirement |

## ADRs

- [ADR-0001: Astro + Starlight for a single-site oribos-www](../adr/0001-astro-starlight-single-app.md)
- [ADR-0002: Instrument visual direction for Oribos WWW](../adr/0002-instrument-visual-direction.md)
- [ADR-0003: Single-site docs migration and content truth source](../adr/0003-single-site-docs-migration.md)

## Prototype

The throwaway visual-direction prototype lives on branch `prototype/visual-direction`
(`prototype/visual-direction/index.html`). It is evidence for the visual decision, not production
code and not a scaffold. Do not merge it or fold it into the site.

## Review and sign-off

- Owner: @0xnicholas.
- Sign-off vehicle: [#22](https://github.com/0xnicholas/oribos-www/pull/22), from `spec/handoff` to `main`.
- Handoff acceptance: [`acceptance.md`](./acceptance.md) §A.
- On sign-off, this file's status changes to `accepted`, and the sign-off comment is recorded on
  #16.
- After sign-off, changes to locked areas require a new issue/ADR and owner approval; copy and typo
  fixes can go through PR review.

## Glossary

Use the vocabulary in [`CONTEXT.md`](../../CONTEXT.md): solution page, scenario card, reference
architecture, example, template, changelog, site spec, docs IA, docs shell, design system, page
block, route inventory, override registry, content truth source, page migration mapping, agent
surface, page matrix, handoff acceptance, implementation acceptance.
