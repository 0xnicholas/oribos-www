# Oribos WWW

The specification and eventual source for the Oribos umbrella website: marketing, resources, and documentation in one site.

## Language

**Solutions**:
The navigation area and information-architecture group that holds role, industry, and cross-functional solution pages.
_Avoid_: Use cases (as the IA name)

**solution page**:
A page in Solutions that argues how to build a role, industry, or cross-functional solution with Oribos; it owns the problem, reference architecture, boundaries, and evidence, not how-to instructions.
_Avoid_: Use case page, solution landing page

**keyword page**:
A marketing page that owns one capability or category search intent, argues why Oribos fits, and links to docs for the how; it is not a product page or a solution page.
_Avoid_: SEO landing page, use case page

**product page**:
A page that presents one product in the family with its positioning, capabilities, and CTA; it may also be a keyword page when the product's category is the search intent.
_Avoid_: Marketing page, landing page

**scenario card**:
The evidence unit on a solution page: a named scenario, two or three sentences on how Oribos builds it, and the packages it uses.
_Avoid_: Use-case card, feature card

**reference architecture**:
A component and data-flow diagram on a solution page showing where the agent, tools, approval or eval gate, and state live; it stands in for customer proof.
_Avoid_: Architecture diagram, solution diagram

**example**:
A runnable, self-asserting program under `oribos-framework/examples/`; the canonical executable evidence behind a scenario card.
_Avoid_: Sample, demo

**template**:
The Templates page's discovery card for a runnable example; the example remains the canonical artifact and the docs walkthrough owns the how-to.
_Avoid_: Starter kit, boilerplate, sample app

**changelog**:
The curated public version history generated from `oribos-framework` GitHub Releases; release facts only, not editorial content.
_Avoid_: Release notes page, blog category

**site spec**:
The handoff artifact this effort produces: IA, page inventory, per-page outlines, content model, visual direction, stack choice, and migration, SEO, and agent-surface constraints.
_Avoid_: Design doc, brief

**docs IA**:
The documentation section's navigation tree and page inventory: a single Documentation lane with five families (Get started, Concepts, Guides, Reference, Project & ecosystem), two-segment URLs, and no Mastra-style tabs.
_Avoid_: Docs sitemap, docs navigation

**docs shell**:
The frame around documentation content — sidebar, article column, TOC, Copy page, search trigger, and pager — defined as stack-independent anatomy in the design system.
_Avoid_: Docs layout, docs template

**design system**:
The token, type, layout, and component contract in `docs/spec/design-system.md`; implementation consumes it but does not redefine it.
_Avoid_: Style guide, UI kit

**page block**:
A typed section of a marketing page that renders to both HTML and the page's Markdown twin from one source; the unit of the marketing content model.
_Avoid_: Component, section widget

**route inventory**:
The single build-time list of publishable routes and their metadata, consumed by the sitemap, `llms.txt`, the agent manifest, and link checks.
_Avoid_: Sitemap source, route list

**override registry**:
The recorded set of Starlight component overrides approved for the docs shell; anything outside it is a fork.
_Avoid_: Override list, custom theme

**content truth source**:
The repository and path that authoritatively hold the documentation Markdown/MDX. After migration this is `oribos-www`; `oribos-docs` is a read-only archive.
_Avoid_: Docs sync, mirror

**page migration mapping**:
The table that maps every existing docs URL to its new URL, migration action, and required fact refresh.
_Avoid_: Redirect list, content inventory

**agent surface**:
The machine-readable counterpart of the site: per-page `.md` twins, root `/llms.txt`, and `/llms-manifest.json`, generated from the same content as the HTML pages.
_Avoid_: Agent docs, export

**page matrix**:
The single per-route inventory in `docs/spec/page-inventory.csv`: URL, title, family, page type, audience, status, template, outline pointer, assets, links, and source. It is the scope contract for the build.
_Avoid_: Sitemap source, page list

**page outline**:
The consolidated section-level outline in `docs/spec/page-outlines.md` for every launch page. It fixes structure, locked claims, assets, links, and CTA; it is not final copy.
_Avoid_: Wireframe, content draft

**handoff acceptance**:
The spec-level checklist in `docs/spec/acceptance.md` §A that must pass before the site spec is signed off. It checks artifact completeness, matrix integrity, cross-document consistency, migration coverage, and sign-off.
_Avoid_: Definition of done, QA checklist

**implementation acceptance**:
The build/launch checklist in `docs/spec/acceptance.md` §B: routes, links, redirects, sitemap, agent surface, content schema, design and accessibility, search, SEO, performance, and content minimums.
_Avoid_: Launch checklist, test plan

**launch blocker**:
A known external input — domain, hosting, contact email, attribution, handle, or analytics decision — that blocks launch but not the spec handoff.
_Avoid_: Open question, TBD
