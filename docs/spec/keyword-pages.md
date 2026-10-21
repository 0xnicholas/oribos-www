# 关键词页与 SEO 落地页集

Status: decided 2026-10-21. Source decision: [关键词页与 SEO 落地页集](https://github.com/0xnicholas/oribos-www/issues/19).

Scope: the four existing marketing keyword pages, their query ownership, page template, and the canonical/SEO/agent-surface contract. Product pages, Solutions pages, and docs pages are only covered where they bound these four pages.

## 1. Decision summary

- **Keep exactly four keyword pages at launch.** No new keyword pages. The four existing URLs retain their SEO equity and are fact-refreshed to 0.9.0.
- **One primary query per URL.** No two pages own the same primary query.
- **`/ai-agent-framework/` is the single Framework flagship page.** It serves both the framework keyword intent and the Framework product page. No `/framework` page.
- **No `/platform-observability/` and no `/ai-agent-deployment/`.** `/ai-agent-observability/` is the only observability canonical. `/platform/` carries direction-only sections (`#observability`, `#deployment`).
- **TypeScript stays in `title` / `meta description` / `og:title` as a search term.** H1 and the first screen use category language (`open-source AI agent framework`). Body, FAQ, and code may mention TypeScript normally.
- **Keyword pages argue what/why; docs own how.** Solutions pages own role and industry queries.
- **No blog, no pricing, no customer proof.** Resources pages (`/templates/`, `/changelog/`) are not keyword pages.

## 2. Page inventory

| Route | Page type | Status | Canonical | Template | Sitemap shard | `.md` twin | Header |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/ai-agent-framework/` | Framework flagship / keyword | Live | Self | Flagship | `pages` | Yes | Framework ▾ Overview |
| `/ai-agents/` | Capability keyword | Live | Self | Keyword | `pages` | Yes | Framework ▾ Agents |
| `/ai-workflows/` | Capability keyword | Live | Self | Keyword | `pages` | Yes | Framework ▾ Workflows |
| `/ai-agent-observability/` | Capability keyword | Live | Self | Keyword | `pages` | Yes | Framework ▾ Observability |
| `/platform/` | Planned product direction page | Planned | Self | Product (planned) | `pages` | Yes | Platform (Planned) |

`/platform/` is listed only to define the boundary; it is not a keyword page and does not use the keyword template.

## 3. Query ownership

No keyword-volume tool was used. Volume is unknown and deliberately not invented; Search Console校正 happens after launch.

| Route | Primary query | Secondary queries | Intent | Must not compete for |
| --- | --- | --- | --- | --- |
| `/ai-agent-framework/` | AI agent framework for TypeScript | open-source AI agent framework; TypeScript AI agent framework; AI agent library TypeScript | Framework selection | AI agents / AI workflows / AI agent observability head terms |
| `/ai-agents/` | AI agents in TypeScript | build AI agents in TypeScript; stateful AI agents; AI agents with tools and memory | Understand the agent primitive | "AI agent framework" head term; AI workflows head term |
| `/ai-workflows/` | AI workflows in TypeScript | agent workflow orchestration; durable AI workflows; resumable AI workflows | Orchestration | AI agents head term; AI agent deployment |
| `/ai-agent-observability/` | AI agent observability | AI agent observability TypeScript; AI agent tracing; OpenTelemetry for AI agents | Runtime visibility | "AI observability platform" (future Platform page); AI agent deployment |
| `/platform/` | AI agent platform | Oribos Platform (branded) | Understand the hosted direction | Observability / deployment capability queries |

Boundary rules:

- **Solutions pages** own role and industry queries (for example "AI agents for sales"). Keyword pages do not add role qualifiers.
- **Docs** own how-to queries (for example "how to build an AI agent in TypeScript"). Keyword pages target what/why and link to docs for the how.
- **"AI agent deployment"** has no marketing landing page at launch. `/platform#deployment` carries direction language; `/docs/project/deployment/` (P2) owns the how-to when written.
- **"AI agent memory"** is a secondary query on `/ai-agents/`; no dedicated page at launch.
- **RAG / evals** belong to docs concept pages (`/docs/concepts/memory/`, `/docs/concepts/evals/`); they are not keyword-page primary queries.
- **`/platform/`** owns the generic "AI agent platform" query only. It must not target "AI agent observability platform", "AI agent deployment", or any capability head term.

## 4. Page outlines

Facts below are pinned to the public 0.9.0 release: 19 packages (core + 18 capability packages), core 10 entry points / 28 export surfaces total, 23 examples, zero runtime dependencies for the core only. RAG and evals are optional capability packages (`@oribos/rag`, `@oribos/evals`). Do not mention unreleased `@oribos/lease`, `agent-run`, or `output-object`.

### 4.1 `/ai-agent-framework/` — Framework flagship

- **Title**: `Open-source AI agent framework for TypeScript — Oribos`
- **Description**: `An open-source AI agent framework for TypeScript: agents, workflows, memory, and observability in a library — with a zero-runtime-dependency core.`
- **H1**: `Open-source AI agent framework — everything you need, nothing you have to run.`
- **Kicker**: `Framework`
- **Intro angle**: a library you call from the app you already run; core has zero runtime dependencies; 19 packages, capability packages added one at a time; no database, queue, or long-running process.
- **Sections (3)**:
  1. **A library, not infrastructure you operate** — keep the argument; state that storage ports default to in-memory and adapters are deliberate.
  2. **Compose only what you use** — 0.9.0 has 19 packages (core + 18 capability packages) and 28 export surfaces; name `@oribos/mcp-server`, `@oribos/sqlite`, `@oribos/otlp` as examples; RAG / evals are optional packages.
  3. **A small surface you can hold in your head** — keep the agent/tool/processor argument; say the core has no supervisor protocol, and `@oribos/supervisor` is an optional package for multi-agent coordination.
- **Evidence**: runnable example `minimal-agent`; docs links `/docs/get-started/quickstart/` and `/docs/reference/import-map/`.
- **Used in**: `/developer-infrastructure/`, `/customer-facing-agents/`, `/operations-agents/` (2–3 links).
- **FAQ (6)**: keep the six existing questions. Refresh:
  - "zero runtime dependencies" → "the **core** has zero runtime dependencies".
  - "How do multiple agents fit together?" → core composition via agent-as-tool, plus optional `@oribos/supervisor`.
  - "Does Oribos replace the AI SDK?" → keep.
- **CTA**: primary `Quickstart` → docs; secondary GitHub.
- **Notes**: no pricing, no customer proof, no installation tutorial (docs owns it).

### 4.2 `/ai-agents/` — Capability page

- **Title**: `AI agents in TypeScript — Oribos`
- **Description**: `AI agents in TypeScript: a small object, a built-in tool loop, streaming runs, and memory named per call — no hidden state.`
- **H1**: `AI agents — a handful of fields, a built-in loop, and no hidden state.`
- **Kicker**: `Agents`
- **Intro angle**: an agent is a small object; `generate()` and `stream()` share one code path; tools are plain objects validated with Standard Schema; memory is identity named per call.
- **Sections (4)**:
  1. **An agent is a small object** — keep.
  2. **The loop is built in, and it streams** — keep.
  3. **Tools are plain objects you already know how to write** — keep; link `/docs/concepts/tools/`.
  4. **Memory is identity you name per call** — keep; mention `@oribos/observational-memory` and `@oribos/rag` as optional packages; link `/docs/concepts/memory/` and `/docs/concepts/storage/`.
- **Evidence**: runnable example `memory-chat`; docs links `/docs/concepts/agents/`, `/docs/concepts/memory/`, `/docs/concepts/tools/`.
- **Used in**: `/customer-facing-agents/`, `/operations-agents/`, `/sales-agents/` (2–3 links).
- **FAQ (6)**: keep the six existing questions. Refresh the streaming answer only if the API wording changed; link "How do I see what an agent is doing?" to `/ai-agent-observability/`.
- **CTA**: `Quickstart` + GitHub.
- **Notes**: this page does not become a memory page; memory is one section. A future `/ai-agent-memory/` page would take over the memory query, not this page.

### 4.3 `/ai-workflows/` — Capability page

- **Title**: `AI workflows in TypeScript — Oribos`
- **Description**: `AI workflows in TypeScript: typed steps, validated boundaries, and JSON snapshots that resume a run in another process.`
- **H1**: `AI workflows — typed steps, validated boundaries, and runs that survive a restart.`
- **Kicker**: `Workflows`
- **Intro angle**: typed steps (`then`, `parallel`, `branch`, `foreach`); every boundary validated; `ctx.suspend()` produces a JSON snapshot; snapshot store defaults to memory and takes adapters.
- **Sections (4)**:
  1. **Steps that promise what they take and what they give back** — keep.
  2. **Agents join as steps, not instead of them** — keep; link `/docs/concepts/agents/`.
  3. **Suspend, resume, and move the run to another process** — keep; name `@oribos/sqlite`, `@oribos/checkpoints`, `@oribos/resumable-stream`, `@oribos/background-tasks` as optional packages; link `/docs/concepts/durable-execution/` and `/docs/concepts/suspend-resume/`.
  4. **Runs you can watch while they happen** — keep; link `/ai-agent-observability/`.
- **Evidence**: runnable example `workflow-approval`; related `durable-approval`; docs links `/docs/concepts/workflows/`, `/docs/concepts/durable-execution/`.
- **Used in**: `/operations-agents/`, `/customer-facing-agents/`, `/developer-infrastructure/` (2–3 links).
- **FAQ (6)**: keep the six existing questions. Add no new FAQ unless a 0.9.0 package boundary needs one; stay within six.
- **CTA**: `Quickstart` + GitHub.
- **Notes**: do not turn this into a deployment page. Deployment stays on `/platform#deployment` and docs.

### 4.4 `/ai-agent-observability/` — Capability page

- **Title**: `AI agent observability for TypeScript — Oribos`
- **Description**: `AI agent observability for TypeScript: spans for runs, model steps, tool calls and memory — exported to your collector over OTLP.`
- **H1**: `AI agent observability — see what actually ran, in the stack you already use.`
- **Kicker**: `Observability`
- **Intro angle**: spans for agent runs, model steps, tool calls, workflow runs and steps, memory recall/save; no OpenTelemetry SDK required; assemble a tracer once; console and memory exporters built in; `@oribos/otlp` maps to GenAI semantic conventions; untraced runs open no spans.
- **Sections (3)**:
  1. **Spans for the things that actually ran** — keep.
  2. **A tracer you hand down once** — keep.
  3. **Export to where your telemetry already lives** — keep; mention `@oribos/otlp` and `@oribos/otel-bridge`; do not imply a hosted dashboard.
- **Evidence**: runnable example `otlp-collector`; related `otel-bridge`; docs link `/docs/concepts/observability/`.
- **Used in**: `/developer-infrastructure/`, `/operations-agents/` (2 links).
- **FAQ (6)**: keep the six existing questions. The answer to "Does Oribos ship a dashboard or a hosted observability service?" remains **No**; this is the line that keeps the page distinct from any future Platform Observability page.
- **CTA**: `Quickstart` + GitHub.
- **Notes**: no customer logos, no fake dashboard screenshots. If Platform Observability later ships, the commercial page gets a new URL and this page keeps the framework-capability canonical.

### 4.5 `/platform/` — Planned product direction page (boundary only)

- **Title**: `Oribos Platform (Planned) — Oribos`
- **Description**: `The hosted path for running and operating Oribos agents — direction only, no dates.`
- **H1**: `The hosted path for Oribos agents.`
- **Sections**: Platform / Studio / Agent Builder, plus `#observability` and `#deployment` direction paragraphs. Every section is direction-only.
- **Status treatment**: `Planned` badge + disclaimer "Direction, not a commitment; no dates." No pricing, no fake screenshots, no waitlist. CTA: `Follow progress on GitHub`.
- **SEO**: indexable, self-canonical, in `pages` sitemap. Primary query "AI agent platform" only; no capability head terms.
- **Not a keyword page**: no argument-card template, no local FAQ requirement, no code example.

## 5. Keyword page template

```ts
type KeywordPage = {
  route: string;              // canonical path with trailing slash
  title: string;              // includes the primary query; "— Oribos"
  description: string;        // 120–160 chars, unique
  h1: string;                 // category language; no "TypeScript"
  kicker: string;             // Framework / Agents / Workflows / Observability
  intro: string;              // 2–3 sentences
  sections: {
    heading: string;
    body: string;
    code?: { example: string; file: string; highlight?: string[] }; // max 1 per page
    packages?: string[];      // capability package chips
  }[];                        // 3–4 sections
  evidence: {
    example: string;          // runnable example slug
    docs: string;             // docs concept or quickstart route
    referenceArchitecture?: string;
  };
  usedIn: string[];           // 2–3 solution routes
  faq: { question: string; answer: string }[]; // 4–6, page-local only
  cta: { primary: 'quickstart'; secondary?: 'github' };
};
```

Layout order:

1. Hero: kicker + H1 + intro + CTA pair.
2. 3–4 argument sections. At most one code block per page, sourced from a runnable example. Package chips are optional and must name published 0.9.0 packages only.
3. Evidence band: one runnable example + docs / reference architecture link. `zero runtime dependencies` appears here as evidence, never as the hero definition.
4. "Used in" strip: 2–3 Solutions links. No scenario cards; Solutions owns them.
5. Local FAQ: 4–6 questions, page-specific. Do not repeat the global 9. If a global question is relevant, link to `/#faq` instead of restating it.
6. Final CTA: shared component. No pricing, no customer proof.

Hard rules:

- H1 and first screen do not say "TypeScript"; title/meta/OG may.
- No page copies another page's argument sections. The Framework page links to the capability pages; capability pages link back.
- No customer logo wall, testimonial, or invented benchmark.
- No "coming soon"; `/platform/` uses `Planned` / "direction only".
- Code blocks must come from a runnable example, not hand-written marketing snippets.

## 6. Canonical, sitemap, JSON-LD, OG, agent surface

### 6.1 Canonical and URLs

- Absolute, self-referencing, trailing-slash canonical for HTML: `https://<SITE_ORIGIN>/ai-agents/`.
- Lowercase, hyphenated slugs; no query parameters in canonical.
- Non-trailing-slash requests 308 to the trailing-slash form.
- `SITE_ORIGIN` is a placeholder until [域名、托管与备案基线](https://github.com/0xnicholas/oribos-www/issues/18) closes.
- Keyword pages and docs are self-canonical; they do not canonicalize to each other.

### 6.2 Sitemap and robots

- Index: `/sitemap-index.xml`.
- Shards: `/sitemaps/pages.xml` (home, About, legal, four keyword pages, five Solutions pages, `/platform/`, `/templates/`, `/changelog/`, `/fde-support/`) and `/sitemaps/docs.xml` (docs).
- Do not write `changefreq` or `priority`. Write `lastmod` only when a real content date exists.
- `/sitemap.xml` may 301 or 200-alias to `/sitemap-index.xml`.
- `robots.txt`: allow all + sitemap pointer. No `noindex` on live pages.
- `/platform/` is indexable with the `Planned` disclaimer.

### 6.3 JSON-LD

| Schema | Where | Notes |
| --- | --- | --- |
| `Organization` | All pages | One entity, same `@id` site-wide |
| `WebSite` | Home only | Not repeated on inner pages |
| `BreadcrumbList` | All inner pages | Home → page; one item list per page |
| `FAQPage` | Pages with visible FAQ | Keyword pages and home; must match visible questions |
| `SoftwareApplication` | `/ai-agent-framework/` only | No `aggregateRating`, no invented offers |
| `TechArticle` | Docs | Owned by docs IA, not this spec |

No `Article`, `BlogPosting`, `AggregateRating`, or review schema. No structured data for content that is not visible on the page.

### 6.4 Open Graph and social

- `og:type=website` for keyword pages.
- Required: `og:title`, `og:description`, `og:url`, `og:image`, `og:image:alt`, `og:site_name`.
- Per-page OG images are generated later; until [品牌资产与 wordmark 规格](https://github.com/0xnicholas/oribos-www/issues/21) defines the asset, fall back to the site default OG.
- Ownership: this spec defines the contract; [技术栈与仓库形态](https://github.com/0xnicholas/oribos-www/issues/13) has implemented the mechanism in `docs/spec/stack.md` §7; [品牌资产与 wordmark 规格](https://github.com/0xnicholas/oribos-www/issues/21) supplies assets; [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16) accepts.

### 6.5 Agent surface

- Every keyword page gets a `.md` twin at `/<route>.md` (no trailing slash), generated from the same content source as the HTML.
- The twin is listed in `/llms.txt` and `/llms-manifest.json`, alongside docs.
- `Link: </llms.txt>; rel="llms-txt"` and the docs-style alternate link are site-wide.
- Implementation mechanism is defined in [技术栈与仓库形态](https://github.com/0xnicholas/oribos-www/issues/13) (`docs/spec/stack.md` §7); acceptance belongs to [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16).

### 6.6 hreflang and language

- Every page: `lang="en"`, self-referential `hreflang="en"`, `hreflang="x-default"`, `og:locale="en_US"`.
- No `/zh/`, no multilingual sitemap, no in-site language switcher. Per [语言与国际化策略](https://github.com/0xnicholas/oribos-www/issues/15).

## 7. Migration and redirects

- All four keyword URLs are retained unchanged. No 301 among them.
- `/in-product-agents/` → `/customer-facing-agents/` 301 is owned by [Solutions 页面集与内容形态](https://github.com/0xnicholas/oribos-www/issues/9), not this spec.
- `/developer-infrastructure/` and `/operations-agents/` keep their existing URLs; `/sales-agents/` and `/marketing-agents/` are new.
- `/ai-agent-deployment/` and `/platform-observability/` never existed on the Oribos site; do not invent redirects for them.
- If a keyword page is retired later, 301 it to `/ai-agent-framework/` or the closest capability page; never leave it 404.

## 8. Downstream constraints

- **[技术栈与仓库形态](https://github.com/0xnicholas/oribos-www/issues/13)**: trailing-slash canonical, `pages` / `docs` sitemap shards, `.md` twin generation for marketing pages, JSON-LD components, OG fields, build-time link checks. `SITE_ORIGIN` must be a single source.
- **[规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16)**: add acceptance items for the four URLs (200, canonical, indexable, in `pages.xml`), one-primary-query rule, no global FAQ duplication, JSON-LD validity, `.md` twin presence, no `/platform-observability/` or `/ai-agent-deployment/`, and no orphan keyword pages.
- **[设计系统与组件规格（B · 仪器）](https://github.com/0xnicholas/oribos-www/issues/20)**: keyword page needs hero, argument card, evidence band, used-in strip, FAQ list, and final CTA components. Visual treatment is owned there.
- **[品牌资产与 wordmark 规格](https://github.com/0xnicholas/oribos-www/issues/21)**: per-page OG asset and default fallback.
- **[资源/博客与不适用板块](https://github.com/0xnicholas/oribos-www/issues/14)**: Templates / Changelog are not keyword pages; their SEO fields are handled by the acceptance ticket.
- **[Solutions 页面集与内容形态](https://github.com/0xnicholas/oribos-www/issues/9)**: Solutions owns role/industry queries and scenario cards; keyword pages only cross-link.
- **[文档 IA 与内容迁移策略](https://github.com/0xnicholas/oribos-www/issues/12)**: docs own how-to content and the concept/reference routes linked from each keyword page.

## 9. Watchlist / fog

These are not tickets. They graduate only when the gate below is met.

- `/ai-agent-memory/` — memory is a category pillar, but `/ai-agents/` already carries it as a section. A dedicated page would need to take over the memory query without hollowing out `/ai-agents/`.
- `/ai-agent-evals/` — `@oribos/evals` is real, but evals is a capability package and docs owns the concept page. A marketing page needs a distinct intent and evidence beyond "we have a package".
- `/rag-pipeline/` — `@oribos/rag` is real; Mastra has this page. Oribos currently treats RAG as a memory/capability section, not a category.
- `/durable-ai-agents/` — durability is already the third argument on `/ai-workflows/`; a separate page would need a distinct query and proof.
- `/ai-agent-deployment/` — no product page until Platform ships; deployment remains `/platform#deployment` plus docs.

**Graduation gate** for any new keyword page:

1. A distinct search intent not served by the four pages, docs, or Solutions.
2. At least one runnable example plus a reference architecture or package mapping.
3. Three or more arguments that cannot be copied from an existing page.
4. No header slot required; discoverable through body links, footer, or docs.
5. Owner sign-off, and a fact refresh against the current release.

## 10. Acceptance checklist

- [ ] The four keyword URLs return 200, are self-canonical, indexable, and appear in `/sitemaps/pages.xml`.
- [ ] Each page has exactly one primary query; no primary query is shared with another page.
- [ ] Each H1 and first screen uses category language, not "TypeScript"; `title` / `meta` / `og:title` may include TypeScript.
- [ ] Each page has 3–4 argument sections, at most one code block from a runnable example, and 2–3 "Used in" links.
- [ ] Each page has 4–6 local FAQ entries; no global FAQ duplication.
- [ ] `FAQPage` JSON-LD matches the visible FAQ; `SoftwareApplication` exists only on `/ai-agent-framework/`; no `aggregateRating`.
- [ ] `Organization` / `WebSite` / `BreadcrumbList` are emitted per §6.3.
- [ ] Every keyword page has a `.md` twin listed in `/llms.txt` and `/llms-manifest.json`.
- [ ] `hreflang="en"`, `x-default`, and `og:locale="en_US"` are present.
- [ ] `/platform-observability/` and `/ai-agent-deployment/` do not exist; `/platform/` only has sections.
- [ ] No redirect among the four keyword URLs; `/in-product-agents/` redirect is owned by the Solutions ticket.
- [ ] Header, footer, and sitemap are generated from one navigation source; no orphan keyword page.
