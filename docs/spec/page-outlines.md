# Page Outlines

> Source: the closed wayfinder tickets on map [#1](https://github.com/0xnicholas/oribos-www/issues/1), plus `docs-ia.md`, `keyword-pages.md`, `design-system.md`, `fact-baseline.md`, and `stack.md`.
> Scope: 17 marketing routes + 404 + 24 handwritten docs pages + the generated API template.
> Convention: each outline gives section purpose, locked claims, required blocks/assets, internal links, and CTA. Final copy is written in implementation and must stay inside `fact-baseline.md` and the copy red lines. This file is the consolidated outline; `keyword-pages.md` §4 remains the canonical detailed outline for the four keyword pages.
> Matrix anchors: `page-inventory.csv` `outline_ref` points to a heading in this file.

## Marketing

### Home

**Locked copy**

- Title: `Oribos — Compose AI agents`
- Meta description: `An open-source agent framework of composable pieces — agents, workflows, memory, and a harness, with zero runtime dependencies in the core.`
- Eyebrow: `OPEN SOURCE · v0.9.0`
- H1: `Compose AI agents.`
- Sub: `An agent framework of small, composable pieces — agents, workflows, memory, and a harness. The core ships with zero runtime dependencies.`

**Sections (8, in order)**

| # | Section | Block(s) | Content | Required assets | Links / CTA |
|---:|---|---|---|---|---|
| 1 | Hero | `hero`, product-window tabs | `agent.ts` distilled to 17 lines from `examples/minimal-agent`; a real 7-line trace waterfall; version constant, not a handwritten string | `agent.ts` source, trace data, default OG | Primary `Quickstart` → `/docs/get-started/quickstart/`; secondary `Copy agent prompt`; `View the full example →` |
| 2 | Facts band | `facts` | `0.9.0` CURRENT RELEASE; `19` NPM PACKAGES; `23` RUNNABLE EXAMPLES; `0` RUNTIME DEPS IN CORE | Build-time version constant | None |
| 3 | Capability proof | `capability`, tabs, code | H2 `Small pieces. A complete agent.`; sub `Start with the core; add capability packages one at a time.`; 5 tabs: Agents, Workflows, Harness, Memory, MCP; tab claims and code sources per #10; capability index band; three-line zero-dep proof strip | Code from `minimal-agent`, `workflow-approval`, `workflow-time-travel`, `durable-approval`, `cron-schedule`, `memory-chat`, `sqlite-resume`, `mcp-tools` | Tab → matching docs concept page; `See the package surface →` → `/docs/reference/import-map/` |
| 4 | Observability + durability | `trace`, `prose`, `code` | H2 `See every step. Resume any run.`; three columns: real trace, span types, suspended-run JSON snapshot; no resident worker implication | Real trace, JSON snapshot | `/docs/concepts/observability/`; `/docs/concepts/durable-execution/` |
| 5 | Solutions | `cardGrid` | H2 `Start from a solution, not a blank file.`; three cards: Customer-facing agents, Developer infrastructure, Operations agents; claim + host-UI mock; no logo wall | Three host-UI mocks (`chat`, `console`, `thread`) | `/customer-facing-agents/`; `/developer-infrastructure/`; `/operations-agents/` |
| 6 | Resources | `cardGrid` | H2 `Go deeper.`; three equal cards: Docs, Examples, Package surface; data from one collection | None | `/docs/`; `/docs/guides/examples/`; `/docs/reference/import-map/` |
| 7 | FAQ | `faq` | H2 `Common questions.`; 7 questions per #10; native `<details>`, first row open, no-JS usable | None | Links inside answers |
| 8 | Final CTA | `cta` | H2 `Start building with Oribos.`; install line `npm install @oribos/core`; primary Quickstart, secondary Copy agent prompt | None | `/docs/get-started/quickstart/` |

**Acceptance**

- 8 sections in order; no customer proof, Platform block, or path chooser.
- Hero / facts / tab claims / links match the locked copy and `fact-baseline.md`.
- Every code block links its runnable example source.
- `data-pagefind-body`; `lang=en`; self hreflang + x-default; no TypeScript in H1/first screen.

### About

**Locked positioning**

- Title: `About — Oribos`
- H1: `About Oribos`
- No company claim, no team page, no team photos, no careers. FDE is delivered by “a small maintainer-led team”.

**Sections**

1. **What Oribos is** — umbrella brand; the open-source framework is the live product; a library of composable pieces, not a platform you operate.
2. **Product family** — two-layer diagram: Framework (live, solid) under Platform (planned, dashed); Studio and Agent Builder are faces of Platform; no dates.
3. **Who maintains it** — small maintainer-led team; no company behind it; FDE engagements are delivered by that team; everything else lands in the repository's issues.
4. **Where to get help** — docs, GitHub Issues, `/fde-support/`; best-effort support, no SLA.
5. **CTA** — GitHub and docs; no contact form, no newsletter.

**Assets / links**

- Product family diagram; wordmark; default OG.
- `/fde-support/`, `/ai-agent-framework/`, `/docs/`, GitHub repository.

### Privacy policy

**Locked positioning**

- Title: `Privacy policy — Oribos`
- H1: `Privacy policy`
- Prose/legal layout only.

**Sections**

1. **Scope** — what this policy covers; last-updated date.
2. **Data we collect** — no analytics, cookies, or third-party scripts at launch; hosting/provider logs if the host produces them.
3. **How we use data** — operations, security, and support only.
4. **Third parties** — hosting provider only; no ad or analytics vendors.
5. **Your choices / contact** — FDE contact email (launch blocker) and GitHub Issues.
6. **Changes** — update the last-updated date; if analytics or consent is added, this page and the consent scope change together.

**Acceptance**

- No cookie banner at launch because no cookies/analytics.
- Owner legal review before launch.

### Terms of service

**Locked positioning**

- Title: `Terms of service — Oribos`
- H1: `Terms of service`
- Prose/legal layout only.

**Sections**

1. **Acceptance** — using the site means accepting these terms.
2. **Site content** — documentation and marketing content; no warranty.
3. **Open-source license** — code is Apache-2.0; the license covers code, not the Oribos name or brand.
4. **No SLA** — support is best-effort through GitHub Issues; FDE engagements are separately scoped.
5. **Third-party links** — GitHub and other external sites are governed by their own terms.
6. **Changes / contact** — update date; contact through `/fde-support/` or GitHub Issues.

**Acceptance**

- No pricing, SLA, or contractual commitment invented.
- Owner legal review before launch.

### Customer-facing agents

> Solutions navigation order is fixed by #9 §2: Customer-facing agents, Operations agents, Developer infrastructure, Sales agents, Marketing agents. The section order below is editorial, not navigation order.

**Positioning**

- H1: use the solution-page headline for customer-facing teams; positioning sentence: “Answer your users, act inside your product, hand off to a human.”
- Page type: solution page; root slug; no `/solutions/` prefix.

**Sections**

1. **Hero** — eyebrow `SOLUTIONS · CUSTOMER-FACING`; H1; one-line positioning; host-interface mock or reference architecture.
2. **Problem / scenario** — 2–3 paragraphs, ≥150 words unique: the team already runs an app; adding an agent should not mean a second service; the risky steps need a human.
3. **3 scenario cards** — streaming answers into the host UI; acting through the team's own API; suspending a run and handing off to a human. Each card: name + 2–3 sentences + package chips; link 1 example + 1 docs page.
4. **Reference architecture** — host UI → `@oribos/ai-sdk` route → durable agent → memory store; own API as tools; approval gate before side effects.
5. **Package map** — only 0.9.0 published packages; `@oribos/ai-sdk`, core, memory/storage packages, approval/suspend packages.
6. **Boundaries** — not a chat product, not a hosted service, not a replacement for the host app's auth or data model.
7. **Evidence** — 1–3 runnable examples: `ai-chat-route`, `workflow-approval`, `durable-approval`; say what each proves; link GitHub source.
8. **FAQ (3)** — questions from this page's boundaries; no global FAQ duplication.
9. **Final CTA** — Quickstart + GitHub; no demo/waitlist.

**Links**

- Docs: `/docs/concepts/agents/`, `/docs/concepts/tools/`, `/docs/concepts/suspend-resume/`.
- Examples: `ai-chat-route`, `workflow-approval`, `durable-approval`.
- One 5–15 line code block from an example.

### Developer infrastructure

**Positioning**

- Positioning sentence: “Ship primitives other teams build on — each team installs only what it uses.”

**Sections**

1. **Hero** — eyebrow `SOLUTIONS · DEVELOPER INFRASTRUCTURE`; H1; positioning; host-interface mock or reference architecture.
2. **Problem / scenario** — platform teams need shared primitives without forcing one platform; product teams should install only what they use.
3. **3 scenario cards** — primitives rather than a platform; plug into existing observability; publish an agent as shared infrastructure. Each links an example + docs page.
4. **Reference architecture** — product teams → core subpaths + capability packages → MCP endpoint; traces through `@oribos/otlp` into the existing collector.
5. **Package map** — core subpaths, `@oribos/otlp`, `@oribos/otel-bridge`, `@oribos/mcp-server`; only published 0.9.0 packages.
6. **Boundaries** — not a hosted platform, not a replacement for the team's observability stack, not a monolith.
7. **Evidence** — `minimal-agent`, `otlp-collector`, `mcp-tools`; what each proves; GitHub source.
8. **FAQ (3)** — from this page's boundaries.
9. **Final CTA** — Quickstart + GitHub.

**Links**

- Docs: `/docs/reference/import-map/`, `/docs/concepts/observability/`, `/docs/concepts/tools/`.
- One 5–15 line code block from an example.

### Operations agents

**Positioning**

- Positioning sentence: “Agents that handle the busywork around your team — with a human on the risky steps.”

**Sections**

1. **Hero** — eyebrow `SOLUTIONS · OPERATIONS`; H1; positioning; host-interface mock or reference architecture.
2. **Problem / scenario** — operational busywork is repetitive but risky; teams already have MCP tools and schedules; they do not want a resident worker.
3. **3 scenario cards** — connect existing MCP tools as-is; put a human on risky steps; wake on a schedule instead of running a permanent worker.
4. **Reference architecture** — cron / signal / webhook → agent → MCP tools → approval gate → snapshot store; human on the risky steps.
5. **Package map** — core, `@oribos/mcp-client`, `@oribos/background-tasks`, `@oribos/distributed-signals`, `@oribos/sqlite`; only published packages.
6. **Boundaries** — not an always-on worker, not a workflow SaaS, not a replacement for the team's operations tooling.
7. **Evidence** — `mcp-tools`, `durable-approval`, `cron-schedule`; what each proves; GitHub source.
8. **FAQ (3)** — from this page's boundaries; state at-least-once / at-most-once where relevant.
9. **Final CTA** — Quickstart + GitHub.

**Links**

- Docs: `/docs/concepts/tools/`, `/docs/concepts/suspend-resume/`, `/docs/guides/signals-desk/`.
- One 5–15 line code block from an example.

### Sales agents

**Positioning**

- Positioning sentence: “Prospect research and follow-up, with a human on every CRM write.”

**Sections**

1. **Hero** — eyebrow `SOLUTIONS · SALES`; H1; positioning; host-interface mock or reference architecture.
2. **Problem / scenario** — inbound leads and account research are repetitive; CRM writes are high-risk; the team needs a draft-and-approve loop.
3. **3 scenario cards** — inbound lead triage; account research across CRM and the web; approved CRM write-back.
4. **Reference architecture** — inbound signal / CRM → agent + CRM MCP + research tools → draft → approval → CRM write-back; thread memory for context.
5. **Package map** — core, `@oribos/mcp-client`, `@oribos/sqlite`, approval/suspend packages; only published packages.
6. **Boundaries** — reference architecture, not a customer story; no claim of deployed sales customers; no autonomous CRM writes.
7. **Evidence** — `signals-desk`, `mcp-tools`, `durable-approval`; what each proves; GitHub source.
8. **FAQ (3)** — from this page's boundaries; include the human-approval rule.
9. **Final CTA** — Quickstart + GitHub.

**Links**

- Docs: `/docs/guides/signals-desk/`, `/docs/concepts/tools/`, `/docs/concepts/suspend-resume/`.
- One 5–15 line code block from an example.

### Marketing agents

**Positioning**

- Positioning sentence: “Draft and check campaign content with the tools you already use.”

**Sections**

1. **Hero** — eyebrow `SOLUTIONS · MARKETING`; H1; positioning; host-interface mock or reference architecture.
2. **Problem / scenario** — campaign work spans briefs, channels, and review; teams want drafts and checks, not an autonomous publisher.
3. **3 scenario cards** — campaign draft from a brief; long-form content split into channel variants; eval gate before publish.
4. **Reference architecture** — brief → workflow → model router → channel drafts → processor / eval gate → human approval; no automatic publish to an external CMS.
5. **Package map** — core, `@oribos/model-router`, `@oribos/evals`, `@oribos/background-tasks`; only published packages.
6. **Boundaries** — reference architecture, not a customer story; no auto-publish; no claim of brand-safety guarantees beyond the eval gate.
7. **Evidence** — `workflow-approval`, `background-tasks`, `agent-evals`; what each proves; GitHub source.
8. **FAQ (3)** — from this page's boundaries.
9. **Final CTA** — Quickstart + GitHub.

**Links**

- Docs: `/docs/concepts/workflows/`, `/docs/concepts/durable-execution/`, `/docs/concepts/processors/`.
- One 5–15 line code block from an example.

### Keyword pages

The four keyword pages have canonical detailed outlines in `keyword-pages.md` §4.1–§4.4. This section is the handoff summary; do not duplicate the argument copy.

| Route | H1 (locked) | Sections | FAQ | Evidence | CTA |
|---|---|---:|---:|---|---|
| `/ai-agent-framework/` | `Open-source AI agent framework — everything you need, nothing you have to run.` | 3 | 6 | `minimal-agent` | Quickstart + GitHub |
| `/ai-agents/` | `AI agents — a handful of fields, a built-in loop, and no hidden state.` | 4 | 6 | `memory-chat` | Quickstart + GitHub |
| `/ai-workflows/` | `AI workflows — typed steps, validated boundaries, and runs that survive a restart.` | 4 | 6 | `workflow-approval` | Quickstart + GitHub |
| `/ai-agent-observability/` | `AI agent observability — see what actually ran, in the stack you already use.` | 3 | 6 | `otlp-collector` | Quickstart + GitHub |

**Rules**

- One primary query per page; no primary query is shared with another page.
- `TypeScript` may appear in `title`, `meta description`, and `og:title`; it must not appear in H1 or the first screen.
- Every page has one 5–15 line code block from a runnable example and 2–3 “Used in” links.
- Each page has 4–6 local FAQ entries; no global FAQ duplication.
- `/ai-agent-framework/` is the only page with `SoftwareApplication` JSON-LD; no `aggregateRating`.
- No page owns deployment or platform observability; those queries are boundaries, not targets.

### Platform

**Locked copy**

- Title: `Oribos Platform (Planned) — Oribos`
- Meta description: `The hosted path for running and operating Oribos agents — direction only, no dates.`
- H1: `The hosted path for Oribos agents.`
- Status: live URL, planned content; `Planned` badge; disclaimer `Direction, not a commitment; no dates.`

**Sections**

1. **Hero** — H1; one-line direction; `Planned` badge; disclaimer.
2. **Three cards** — Platform, Studio, Agent Builder; each one direction sentence per #8; mark direction only; no fake UI.
3. **`#observability` direction** — direction paragraph only; no product page, no capability head-term targeting.
4. **`#deployment` direction** — direction paragraph only; deployment how-to belongs to docs when written.
5. **CTA** — `Follow progress on GitHub` → framework Issues; no waitlist, pricing, dates, or “Get started”.

**Acceptance**

- Indexable, self-canonical, in the `pages` sitemap shard.
- Primary query “AI agent platform” only; does not target observability or deployment head terms.
- Not a keyword page: no argument-card template, no local FAQ requirement, no code example.

### FDE and Support

**Locked copy**

- Title: `FDE + Support — Oribos`
- H1: `FDE + Support`
- Sub: `Forward-deployed engineering for teams building on Oribos, and best-effort support after handoff.`
- Status: live service page; FDE is not `Planned`.

**Sections**

1. **Hero** — positioning; primary CTA `Email us` (real address is a launch blocker); no form, no price.
2. **FDE** (`#fde`) — audience: teams that have chosen Oribos and need the first agent in production; 2–6 week scoped engagement; embedded with the team; deliverables: architecture, runnable agent, observability/evals, handoff; delivered by “a small maintainer-led team”; custom quote; no public price; evidence links repo, examples, architecture.
3. **Support** (`#support`) — included during the engagement; after handoff, GitHub Issues; best-effort; no SLA; security reporting only when a private channel exists.
4. **FAQ (3)** — What is FDE? Who delivers it? How do I get support after handoff? No pricing answer beyond “custom quote”.
5. **Final CTA** — email + GitHub Issues.

**Acceptance**

- No team photos, logos, customer testimonials, SLA, or price.
- The email CTA is a launch blocker, not a spec blocker; no placeholder address.
- About page wording matches #8.

### Templates

**Locked copy**

- Title: `Templates — Oribos`
- H1: `Templates`
- Page type: single index; one card per runnable example; no detail pages.

**Sections**

1. **Hero** — H1; one-line purpose; link to `/docs/guides/examples/` and GitHub.
2. **Start here** — 3 cards: `minimal-agent`, `workflow-approval`, `memory-chat`.
3. **Filters** — capability (Agents / Workflows / Memory / Harness / MCP & tools / Evaluation & integrations) × difficulty (Starter / Intermediate / Advanced).
4. **Full index** — 23 examples; at least 12 cards with complete fields; 7 cards carry `Model key required` badges: `minimal-agent`, `memory-chat`, `workflow-approval`, `durable-approval`, `signals-desk`, `ai-chat-route`, `sqlite-resume`.
5. **Card fields** — name; ≤120-character purpose; capability; difficulty; package chips; model-key badge where applicable; docs walkthrough or example README; GitHub source.
6. **How to use** — docs owns the walkthrough; GitHub owns the source; this page does not copy tutorials.

**Acceptance**

- At least 12 complete cards or the page is delayed; no half page.
- Two working links per card (docs/README + GitHub).
- No detail page, no empty category, no placeholder card.

### Changelog

**Locked copy**

- Title: `Changelog — Oribos`
- H1: `Changelog`
- Page type: one timeline; five curated stable releases; no detail pages, no RSS.

**Sections**

1. **Hero** — H1; one-line purpose; link to GitHub Releases.
2. **Timeline** — newest first: v0.9.0, v0.8.0, v0.7.0, v0.6.0, v0.5.0; anchors `#v0-9-0` … `#v0-5-0`.
3. **Each entry** — version; date; one-paragraph summary; 3–5 public-safe highlights; `Full release notes on GitHub →`; no raw release body, no internal ADR or roadmap names.
4. **Maintenance note** — checked-in curated JSON/Markdown; GitHub Releases are the fact source, not the rendered body.

**Acceptance**

- Five real entries; latest first.
- No unpublished version, internal ADR name, or raw release body.
- No detail page, RSS, author page, or comments.

### 404

**Locked copy**

- H1: `Page not found`
- Noindex; not in sitemap; not in Pagefind.

**Sections**

1. **Message** — one sentence; no joke copy.
2. **Links** — home, docs, Templates, search trigger.
3. **Chrome** — normal header/footer; no marketing hero.

## Docs

### Docs landing

**Locked positioning**

- URL: `/docs/`; H1 `Introduction`; docs shell; no marketing hero.
- It is both the docs landing and the Introduction page.

**Sections**

1. **What Oribos is** — one short paragraph; link to the marketing framework page for the why.
2. **3 entry cards** — Quickstart; Concepts overview; Examples.
3. **Capability table** — Get started / Concepts / Guides / Reference / Project & ecosystem, with the first page in each family.
4. **Docs for AI agents** — link to `/docs/project/docs-for-agents/`; `.md` twins, `/llms.txt`, `/llms-manifest.json`.
5. **Next step** — Quickstart.

**Acceptance**

- No marketing hero, no pricing, no customer proof.
- All 24 handwritten pages reachable from the sidebar; no orphan page.

### Docs: Installation

**H2 outline**

- Requirements (`Node >=22.13`)
- Install `@oribos/core`
- Add capability packages
- Verify the install
- Next steps

**Migration / fact refresh**

- Published 0.9.0; 18 capability packages; remove `@balsats/*` and 0.5.0; capability packages carry their own dependencies.

### Docs: Quickstart

**H2 outline**

- Create a project
- Install
- Build a first agent
- Add a tool
- Stream a run
- Next steps

**Migration / fact refresh**

- Code checked to 0.9.0.

### Docs: Concepts overview

**H2 outline**

- The composition model
- Core concepts: agents, tools, models, memory, workflows, observability, durable execution, suspend/resume, processors
- Capability concepts: storage, evals, MCP, multi-agent
- Where to go next

**Migration / fact refresh**

- Add storage / evals / MCP / multi-agent entry points.

### Docs: Agents

**H2 outline**

- What an agent is
- Generate and stream
- Tools
- Memory
- Related: supervisor, processors, evals

**Migration / fact refresh**

- Add a “Goal → Start here” capability table; link supervisor, processors, and evals.

### Docs: Tools

**H2 outline**

- Define a tool
- Schema and validation
- Execute a tool
- MCP tools
- Related

**Migration / fact refresh**

- Link MCP; do not write “tool registry”.

### Docs: Models

**H2 outline**

- Model providers
- AI SDK integration
- `@oribos/model-router`
- What Oribos does not provide
- Related

**Migration / fact refresh**

- Link `@oribos/model-router`; no AI Gateway or provider catalog.

### Docs: Memory

**H2 outline**

- Threads and resources
- History
- Storage ports
- RAG and observational memory as optional packages
- Related: storage

**Migration / fact refresh**

- Add RAG / observational-memory optional packages; link storage.

### Docs: Workflows

**H2 outline**

- Steps
- `then`, `parallel`, `branch`, `foreach`
- Validated boundaries
- Suspend and resume
- Time travel and checkpoints
- Related

**Migration / fact refresh**

- Add time-travel / checkpoints links.

### Docs: Observability

**H2 outline**

- Spans
- One tracer
- Built-in exporters
- OTLP and OTel bridge
- No hosted dashboard
- Related

**Migration / fact refresh**

- Add OTLP / OTel bridge; distinguish core spans from OTel.

### Docs: Durable execution

**H2 outline**

- Why durable execution
- Snapshots
- Background tasks
- Distributed signals
- Inngest
- Checkpoints
- Resumable stream
- At-least-once vs at-most-once
- Related

**Migration / fact refresh**

- Add `background-tasks`, `distributed-signals`, `inngest`, `checkpoints`, `resumable-stream`; state the delivery semantics.

### Docs: Suspend and resume

**H2 outline**

- `ctx.suspend()`
- The JSON snapshot
- Resuming in another process
- Approval gates
- Durable agent
- Related

**Migration / fact refresh**

- Align with durable-agent and approval gates.

### Docs: Processors

**H2 outline**

- What a processor is
- Input and output
- The evals processor
- Related

**Migration / fact refresh**

- Link the evals processor.

### Docs: Storage

**H2 outline**

- The four ports
- In-memory default
- SQLite adapter
- Writing an adapter
- Related

**Migration / fact refresh**

- New page; optional `@oribos/sqlite`; persistence is opt-in.

### Docs: Evals

**H2 outline**

- What evals are
- The optional `@oribos/evals` package
- Eval processor
- Datasets and CI
- Related

**Migration / fact refresh**

- New page; RAG / evals are optional capability packages, not core.

### Docs: MCP

**H2 outline**

- Serve tools over MCP
- Bring MCP tools in
- `@oribos/mcp-server` and `@oribos/mcp-client`
- Security boundaries
- Related

**Migration / fact refresh**

- New page; no MCP Registry product page.

### Docs: Multi-agent

**H2 outline**

- Agent-as-tool
- Optional `@oribos/supervisor`
- Composition patterns
- Boundaries
- Related

**Migration / fact refresh**

- New page; core has no supervisor protocol; supervisor is an optional package.

### Docs: Examples

**H2 outline**

- The 23 examples
- Offline and model-key examples
- How to run
- Index table
- Related

**Migration / fact refresh**

- 23 examples; 16 offline / 17 cases; 7 need a model key.

### Docs: Minimal agent

**H2 outline**

- What it builds
- Code
- Run it
- What it proves
- Next

**Migration / fact refresh**

- Code checked to 0.9.0.

### Docs: Durable approval

**H2 outline**

- What it builds
- The approval gate
- Suspend and resume
- Run it
- What it proves
- Next

**Migration / fact refresh**

- Code checked to 0.9.0.

### Docs: Signals desk

**H2 outline**

- What it builds
- Signals
- The workflow
- Human approval
- Run it
- What it proves
- Next

**Migration / fact refresh**

- Code checked to 0.9.0.

### Docs: Exporters and tracing

**H2 outline**

- Built-in exporters
- OTLP
- OTel bridge
- Collector setup
- What is traced
- Next

**Migration / fact refresh**

- New page; covers the basics; `exporters` P2 page goes deeper later.

### Docs: Import map

**H2 outline**

- 28 export surfaces
- Core: 10 entry points
- 18 capability packages
- Subpath imports
- Zero-dependency core
- Related

**Migration / fact refresh**

- 28 export surfaces; core 10 + 18 packages; pin v0.9.0.

### Docs: Docs for AI agents

**H2 outline**

- `.md` twins
- `/llms.txt`
- `/llms-manifest.json`
- Manifest example
- How to use
- Related

**Migration / fact refresh**

- Manifest example 0.9.0 / pin v0.9.0; remove “if and when they ship”.

### Docs: API template

**Page anatomy**

- H1 symbol name
- One-paragraph description
- Signature
- Parameters table
- Returns
- Example
- Source link
- Packages / export surface
- `generated: true` marker

**Rules**

- Generated from TypeDoc at pin v0.9.0; 10 groups / 249 pages.
- No per-page outline; no manual edits.
- Sidebar grouping and page template come from the docs shell; generated pages keep `generated: true`.

## Cross-page rules

- One H1 per page; no heading-level jumps.
- One primary query per page; no duplicate primary queries.
- Every internal link resolves; no orphan pages; header/footer/sitemap share one navigation source.
- Every code block comes from a runnable example and links the full source; marketing blocks are 5–15 lines, docs blocks may be longer.
- No customer logos, testimonials, customer counts, fake screenshots, invented benchmarks, or unpublished versions.
- `zero runtime dependencies` only describes core; capability packages carry their own dependencies.
- Platform is always `(Planned)`; no dates, prices, waitlists, or fake UI.
- Every page has a `.md` twin, head alternate link, canonical, OG, and `lang=en` + self hreflang + x-default.
- No empty stubs: P1/P2 pages stay in the matrix as `planned` and are not generated.
- Pagefind: `<main data-pagefind-body>`; nav/footer ignored; 404 and `.md` twins excluded.
