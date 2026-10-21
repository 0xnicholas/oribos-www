# 技术栈与仓库形态候选评估（stack-options）

> 票号：#5 · 状态：调研报告（供后续决策票消费，不代替 owner 裁决）· 核对日期：2026-10-20
>
> 范围：为「单站承载营销 + 资源/博客 + 文档」的 Oribos 新站，评估候选技术栈、仓库形态、文档内容管线、搜索、部署与迁移路径。
>
> 方法：只使用一手来源——Mastra 官网页面 / sitemap / docs、Oribos 四个本地仓库（`oribos-www`、`../oribos-website`、`../oribos-docs`、`../oribos-framework`）源文件、各框架官方文档与 npm registry。关键结论均给 URL 或本地路径；本机实测命令的结果单独标注「本机核对」。

---

## TL;DR

1. **推荐候选（供 owner 裁决）：Astro 7 + Starlight，单仓、单应用、单次静态构建。** 不是因为它「更流行」，而是因为现有两站已经是同一套 Astro 7.3.5 + Tailwind 4 + Node 22.12 + pnpm 10.33.2；文档站最难的管线（TypeDoc 生成树、`.md` twin、`llms.txt`、重定向台账、Pagefind、CI 门禁）已经在 Starlight 上跑通 269 页 / 249 页 API 树。营销站只有 11 页，导入成本远低于把文档管线迁到另一个生态。
2. **Next.js 16 + Fumadocs 16 是唯一值得认真比较的次选**：它内置 blog、版本化导航、LLM 路由和静态搜索，React 生态更强；代价是营销站与文档站都要重写，TypeDoc 生成树没有 Starlight 等价的现成插件，Next.js 静态导出不能输出 redirects / headers / ISR，必须依赖托管层配置。
3. **Nuxt Content 与 Docusaurus 不建议作为主栈**：Nuxt 要整站改 Vue，且 Nuxt 4.6.2 要求 Node `^22.22.3`（现有文档站 `.nvmrc` 是 22.12.0）；Docusaurus 的版本化/blog/i18n 最强，但 Mastra 自己就是「Next.js 营销 + Docusaurus 文档」的双栈，Oribos 若选 Docusaurus 等于把营销站也押到 React，且 `.md` twin / llms / TypeDoc 都要另建。
4. **仓库形态先选「单包单应用」，不要先上 monorepo。** 只有一个站点、一个部署、一个搜索索引、一个 agent 面时，monorepo 的 `apps/www + apps/docs + packages/ui/content` 只会增加两套配置、两套预览、两套依赖与跨应用链接的成本。只有「文档必须独立部署/独立发布节奏」或「第二个产品站确定要来」时，monorepo 才成立。
5. **迁移的真正难点不是页面，而是三处漂移**：文档 pin 还停在 `81483bd` / `0.5.0` / 10 个 exports，而框架已经是 `0.9.0` / 11 个 exports（新增 `agent-run`）；两站品牌 token 是两套真相源；Pagefind 的 `data-pagefind-body` 会让未标记的营销/博客页不进索引。这三项必须在建站票里单独立项。
6. **部署目标仍是外部依赖**：`oribos.dev` 截至本机核对仍未注册（RDAP 404）、`oribos.dev` / `www.oribos.dev` / `docs.oribos.dev` 均 NXDOMAIN。Cloudflare 技术上最合适（静态请求免费不限量、`_redirects`/`_headers` 原生支持），但 owner 已在 2026-10-02 裁决本期不用 Cloudflare、目标腾讯云；腾讯云 EdgeOne/COS 可行但具体形态、备案、301 语义都还没验。Vercel Hobby 明文禁商用，不能作为公司站长期方案。

---

## 详细发现

### 1. 本地基线：两站已经是同一条技术路线的两半

| 事实 | 值 | 来源 |
| --- | --- | --- |
| 营销站框架 | Astro `7.3.5`，`output: 'static'`，无 adapter，`dist/` 可移植 | `../oribos-website/astro.config.mjs:25-33`、`../oribos-website/package.json:10-27` |
| 营销站样式/构建 | Tailwind 4.3.3 + `@tailwindcss/vite` 4.3.3，Shiki 双主题，`@astrojs/sitemap` 3.7.4 | 同上 |
| 营销站 i18n | 预留 `locales: ['en']`、`prefixDefaultLocale: false`，不建 `zh/` | `../oribos-website/astro.config.mjs:30`、`../oribos-website/docs/SPEC.md` §8.4 |
| 营销站页面 | 11 页 + 404：首页、About、2 法务、3 用例、4 关键词页 | `../oribos-website/docs/SPEC.md` §2.1 |
| 营销站内容形态 | build-time content collections，38 个 JSON 数据文件；页面仍手写 `.astro` | `../oribos-website/docs/SPEC.md` §8.3 |
| 文档站框架 | Astro `7.3.5` + `@astrojs/starlight` `0.42.4` + Tailwind 4 | `../oribos-docs/package.json:23-30` |
| 文档站内容 | 269 个 `.md` / `.mdx` 文件，其中 `/docs/reference/api/**` 249 页 TypeDoc 生成树 | 本机 `find`：`src/content/docs` 269，API 树 249 |
| 文档站 API 管线 | `starlight-typedoc 0.23.1` + `typedoc 0.28.20` + `typedoc-plugin-markdown 4.13.1`，入口 shim 固定 `.framework/oribos-framework` | `../oribos-docs/astro.config.mjs:232-249`、`../oribos-docs/docs/spec/api-reference.md` §2/§4 |
| 文档站 `.md` twin | `starlight-dot-md 0.2.1`，每个 HTML 路由对应 `<route>.md` | `../oribos-docs/astro.config.mjs:232-235`、`../oribos-docs/docs/spec/agent-surface.md` §2 |
| 文档站 llms | 自写 `/llms.txt` 逐页索引 + `/llms-manifest.json` 包→页映射 | `../oribos-docs/docs/spec/agent-surface.md` §3/§4 |
| 文档站搜索 | Starlight 内置 Pagefind，构建期产出 `dist/pagefind/**` | `../oribos-docs/docs/spec/stack.md` §4、`../oribos-docs/docs/spec/delivery.md` §10.8 |
| 文档站重定向 | `redirects.json` 台账 → `dist/_redirects`；`/` → `/docs/` 301 | `../oribos-docs/redirects.json`、`../oribos-docs/docs/spec/delivery.md` §4 |
| 文档站托管配置 | `wrangler.jsonc` 仅 assets：`html_handling: auto-trailing-slash`、`not_found_handling: 404-page` | `../oribos-docs/wrangler.jsonc` |
| 文档站 pin | `0xnicholas/oribos-framework` @ `81483bd`（框架 `0.5.0`，10 exports） | `../oribos-docs/pinned-ref.json`；本机 `git show 81483bd:packages/core/package.json` |
| 框架现状 | `@oribos/core 0.9.0`，11 exports（新增 `agent-run`） | `../oribos-framework/packages/core/package.json`、`npm view @oribos/core`（0.9.0） |
| 域名状态 | `oribos.dev` RDAP 404（未注册）；`oribos.dev` / `www.oribos.dev` / `docs.oribos.dev` 均 NXDOMAIN | 本机 `curl https://rdap.org/domain/oribos.dev`、`dig`、`curl -I`（2026-10-20） |
| 托管裁决 | 2026-10-02 owner 定：本期不用 Cloudflare，迁移目标腾讯云；具体形态/节点待定，大陆节点需 ICP 备案 | `../oribos-website/docs/SPEC.md` §1/§10.1、`../oribos-docs/docs/spec/delivery.md` 文首注记 |

**结论**：两站共享 Astro 版本、Node 下限、pnpm 版本与 Tailwind 4；营销站没有 MDX / RSS / 搜索，文档站有全部文档管线。新站如果继续 Astro，最自然的路径是「以文档站为骨架，把营销站作为根路由与自定义页面导入」，而不是从营销站反向重建文档管线。

### 2. Mastra 的一手 IA：它不是「单栈单站」，而是 Next.js 营销 + Docusaurus 文档

#### 2.1 运行时与栈标记

本机抓取 `https://mastra.ai/` 的响应头：

- `server: Vercel`
- `x-powered-by: Next.js`
- `vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch`
- 首页 HTML 出现 `_next` 资源 787 处

本机抓取 `https://mastra.ai/docs` 的 HTML：

- `<meta name=generator content="Docusaurus v3.10.2">`
- `docusaurus_locale`、`docusaurus_version content=current`、`docsearch:language`、`docsearch:version` 等标记
- `robots.txt` 含 `# Algolia-Crawler-Verif` 与 `User-Agent: Algolia Crawler`

即：**Mastra 的营销/博客是 Next.js（Vercel），文档是 Docusaurus 3.10.2，搜索走 Algolia DocSearch**。这不是一个可以直接照抄的「单栈」样本，而是一个「两个成熟栈拼在一个域下」的样本。

#### 2.2 sitemap 规模（本机抓取 `https://mastra.ai/sitemap.xml` 及其子 sitemap）

| sitemap | URL 数 | 主要内容 |
| --- | ---: | --- |
| `sitemaps/pages.xml` | 73 | 营销页；其中 28 个 `/authors/*`、10 个 blog 相关，实际营销内容约 35 |
| `sitemaps/blog.xml` | 274 | 公司/产品博客，含分类页 |
| `sitemaps/articles.xml` | 82 | 长文/SEO 文章 |
| `sitemaps/templates.xml` | 26 | 模板 |
| `sitemaps/podcasts.xml` | 123 | 播客 |
| `sitemaps/workshops.xml` | 76 | Workshop |
| `sitemaps/customers.xml` | 31 | 客户案例 |
| `sitemaps/research.xml` | 3 | 研究 |
| `docs/sitemap.xml` | 963 | 文档：458 reference + 242 models + 125 docs + 121 integrations + 17 learn |

**对 Oribos 的意义**：Mastra 的 963 页文档体量主要来自 `reference`（458）、`models`（242）、`integrations`（121）。Oribos 的产品口径已经明确：Framework 真实；Platform / Studio / Agent Builder 计划中；MCP Registry 做但无独立产品页；AI Gateway 不做。因此 **不能把 Mastra 的页面数量当目标**，只能借它的内容类型与模板。

#### 2.3 Mastra 的内容类型与模板字段（从页面与 JSON-LD 读取）

| 类型 | 典型 URL | 观察到的字段/结构 | 对 Oribos 的取舍 |
| --- | --- | --- | --- |
| 营销首页 | `/` | 产品叙事、feature tabs、use-case cards、FAQ、CTA | 已有 11 页营销 SPEC，继续用 |
| 用例页 | `/customer-facing-agents`、`/developer-infrastructure`、`/financial-services`、`/healthcare` 等 | 角色/行业两种切法 | Oribos 已有 3 个角色页；行业页是否扩由 IA 票定 |
| 博客 | `/blog/[slug]` | `BlogPosting` JSON-LD：`headline`、`datePublished`、`dateModified`、`description`、`image`、`author`、`publisher`；分类页 `/blog/category/*`；作者页 `/authors/*` | Oribos 单维护者，可不建作者页；分类保留 |
| 长文/Articles | `/articles/[slug]` | 同样是 `BlogPosting`，另有 `FAQPage` JSON-LD；偏 SEO 长文 | 可与博客分开，也可合并；见 §9.6 |
| 模板 | `/templates/[slug]` | 模板名、描述、技术栈、仓库/演示链接 | 可映射到 `/resources/templates` |
| Learn | `/learn/[slug]` | 课程/课时，视频化 | Oribos 文档已有 walkthrough，不建议另起 `/learn` |
| 文档 | `/docs/**` | Docusaurus 侧栏、版本标记、DocSearch | Oribos 继续用 Starlight 五族 |
| Reference | `/reference/**` | 符号级 API 参考 | Oribos 现有 `/docs/reference/api/**` 已够 |
| Models / Integrations | `/models/**`、`/integrations/**` | 模型目录、集成目录 | **不抄**：Oribos 无 AI Gateway、无独立集成产品页 |
| 资源 hub | `/resources` | 聚合 workshops/books/research | Oribos 可做轻量 hub，不必复制全部栏目 |

#### 2.4 Mastra 的 agent 面

- `https://mastra.ai/llms.txt` 存在，按 `## Docs` / `## Models` / `## Integrations` / `## Reference` 分段，**不含 blog**。
- 文档页 `.md` twin 可用：`https://mastra.ai/docs/agents/overview.md` 返回 `200 text/markdown; charset=utf-8`；`https://mastra.ai/reference/agents/agent.md` 同样 200。
- 博客 `.md` twin 不可用：`https://mastra.ai/blog/agent-memory-guide.md` 返回 `404 text/markdown; charset=utf-8`。

**结论**：Mastra 把 agent 面限定在文档/参考，不覆盖博客。Oribos 若采用「全站 `.md` twin」会超出 Mastra 的先例，但也符合 llms.txt v2 的「页面可提供 Markdown 版本」；这是一个产品选择，不是技术限制。

### 3. 候选栈逐项对比

评分口径：**强** = 官方一等支持、开箱可用；**可** = 能做但需自建/拼装；**弱** = 缺官方支持或与现有资产冲突大。

| 维度 | Astro 7 + Starlight | Next.js 16 + Fumadocs 16 | Nuxt 4 + Nuxt Content 3 | Docusaurus 3.10 |
| --- | --- | --- | --- | --- |
| 营销页 | **强**：Astro 页面、零 JS 默认、Tailwind 4 | **强**：RSC/React，组件生态大 | **可**：Vue 页面，需重写 | **可**：React 自定义页，但 docs-first 布局要绕 |
| 博客 | **强**：content collections + `@astrojs/rss` + MDX；路由手写 | **强**：Fumadocs 官方 blog 集成（卡片/标签/作者） | **可**：collection + `ContentRenderer`，路由手写 | **强**：内置 blog 插件（列表/标签/作者/RSS/分页） |
| 文档 | **强**：Starlight 侧栏、MDX、i18n、Pagefind | **强**：Fumadocs UI/tree/search | **可**：Nuxt Content 是 CMS，不是 docs 主题；需自装 UI | **强**：docs 插件、侧栏、版本化 |
| 搜索 | **强**：Starlight 内置 Pagefind（零配置、纯静态） | **强**：默认 ZBSearch，静态 JSON；也支持 Algolia/Typesense 等 | **强**：内置 SQLite FTS5 / `useSearchCollection` | **可**：官方 Algolia DocSearch；本地搜索靠社区插件 |
| MDX 组件 | **强**：Astro 组件 + Starlight 内建组件 | **强**：React 组件 + Fumadocs MDX | **强**：MDC（Vue 组件） | **强**：React 组件 |
| 版本化 | **弱**：核心无版本化；`starlight-versions` 自述 early development | **强**：同站部分版本 + 全站多部署两种模式 | **弱**：无内置版本化；靠目录/多部署 | **强**：内置 `docs:version`、版本下拉、版本侧栏 |
| i18n | **强**：Starlight 内置路由、回退、RTL | **可**：路由由 Next/React Router 负责，Fumadocs 不是完整 i18n 库 | **可**：`@nuxtjs/i18n` + 分语言 collection | **强**：内置文件系统 i18n、hreflang、RTL |
| TypeDoc 生成树 | **强**：`starlight-typedoc` 已在本仓库跑通 249 页 | **弱/可**：`fumadocs-typescript` 是 Auto Type Table，不是符号级整树；需自建 TypeDoc→MDX 管线 | **弱**：可消费生成 Markdown，无官方插件 | **可**：社区 `docusaurus-plugin-typedoc` 或先生成 Markdown |
| `.md` twin / llms | **强**：`starlight-dot-md` + 自写 llms 生成器（仅 docs collection） | **强**：官方 `llms()` / `llms.txt` / `llms-full.txt` / `*.md` 路由 | **强**：`nuxt-llms` 自动生成 `/llms.txt` 与 `/raw/*.md` | **弱**：无第一方 llms 生成；需自写 |
| 静态导出 | **强**：`output: 'static'`，`dist/` 可移植 | **可**：`output: 'export'`，但无 redirects/headers/ISR | **强**：`nuxi generate` → `dist/` | **强**：静态构建 |
| 从现有两站迁移 | **强**：同栈，复制/合并为主 | **弱**：营销 + 文档全部重写 | **弱**：整站改 Vue | **弱**：整站改 React，文档内容可复制但配置重写 |
| 主要风险 | 版本化弱、Starlight 覆盖边界、单应用构建耦合 | 静态导出限制、TypeDoc 自建、Next 16/React 19 升级面 | Node 版本、Vue 重写、docs UI 自装 | React 重写、Algolia 外部依赖、llms 自建 |

#### 3.1 Astro + Starlight（推荐候选）

官方能力：

- Starlight 是 Astro 集成，`src/content/docs/` 下 Markdown/MDX 自动成页；同时保留 `src/pages/` 自定义页面能力（[Starlight Pages](https://starlight.astro.build/guides/pages/)）。
- 内建 Pagefind 搜索，零配置；可用 `pagefind: false` 关页或 `pagefind` 选项调 ranking（[Starlight Configuration](https://starlight.astro.build/reference/configuration/)）。
- i18n 内建：locale 目录、root locale、缺译回退、RTL、UI 翻译（[Starlight i18n](https://starlight.astro.build/guides/i18n/)）。
- Markdown/MDX + Expressive Code；Asides、代码高亮、文件标题等（[Starlight Authoring](https://starlight.astro.build/guides/authoring-content/)）。
- Astro content collections 支持 `glob()`、Zod schema、`getStaticPaths()` 静态路由（[Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)）。
- `@astrojs/rss` 可从 collection 生成 RSS（[Astro RSS](https://docs.astro.build/en/guides/rss/)）；`@astrojs/mdx` 提供 MDX 组件（[Astro MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/)）。
- Astro 静态站 `dist/` 可部署到任意静态主机（[Astro Deploy](https://docs.astro.build/en/guides/deploy/)）。

本地已验证：

- 文档站 269 页、249 页 API 树、`.md` twin、llms、Pagefind、重定向台账、CI 门禁全部在 Astro 7.3.5 + Starlight 0.42.4 上成立（`../oribos-docs/docs/spec/handoff.md` §3.6、`../oribos-docs/astro.config.mjs`）。
- 营销站 11 页、静态输出、sitemap、origin 单点、零遥测门禁成立（`../oribos-website/docs/SPEC.md` §8、`../oribos-website/package.json`）。

不足：

- **版本化不是核心能力**。Starlight 配置参考里没有版本化选项；社区 `starlight-versions` 0.10.1 的 README 明确写「still in early development」（[repo](https://github.com/HiDeoo/starlight-versions)、`npm view starlight-versions`）。Oribos 0.x 采用 latest-only、只预留 `/docs/v<n>/`，所以这不是当前阻塞项；1.0 前要重开。
- **Starlight 的 docs collection 路径固定**在 `src/content/docs`，`/docs` 前缀要靠嵌套 `src/content/docs/docs/**` 表达，不能用 `base: '/docs'`（否则 `/llms.txt` 等站根文件被搬走）。这是本地已实测的约束（`../oribos-docs/docs/spec/stack.md` §3.2、§13.2）。
- **Pagefind 的索引范围有坑**：Starlight 会给文档页的 `<main>` 加 `data-pagefind-body`；Pagefind 官方规则是「一旦站内任何页面有 `data-pagefind-body`，没有该属性的页面不会被索引」（[Pagefind Indexing](https://pagefind.app/docs/indexing/)）。单应用里营销页/博客页必须也加这个属性，否则搜不到。

#### 3.2 Next.js + Fumadocs（次选）

官方能力：

- Fumadocs 支持 Next.js 16 / React 19；`fumadocs-mdx` 是官方内容源，提供 frontmatter schema、TOC、structured data（[Fumadocs MDX](https://fumadocs.dev/docs/mdx)）。
- 内置 blog 集成：`defineCollections`、`blogPageSchema`、作者/标签/封面/上下篇/RSS（[Fumadocs Blog](https://fumadocs.dev/docs/integrations/blog)）。
- 版本化：同站部分版本（`root: "version"` 文件夹 + 下拉切换）或全站多部署（[Fumadocs Navigation](https://fumadocs.dev/docs/navigation)）。
- 搜索默认 ZBSearch，静态站可缓存 JSON；也支持 Algolia、FlexSearch、Meilisearch、Orama Cloud、Typesense（[Fumadocs Search](https://fumadocs.dev/docs/search)、[ZBSearch](https://fumadocs.dev/docs/search/orama)）。
- LLM 面：`llms()` 生成 `llms.txt`、`llms-full.txt`、每页 `*.md`，并支持 `Accept` 内容协商与 MCP（[Fumadocs AI & LLMs](https://fumadocs.dev/docs/integrations/llms)）。
- 静态导出：Next.js `output: 'export'`；Fumadocs 说明静态站需配置搜索为静态索引（[Fumadocs Static Build](https://fumadocs.dev/docs/deploying/static)）。

关键限制：

- **Next.js 静态导出不支持 redirects / rewrites / headers / ISR / 动态路由未 `generateStaticParams` 等**，这些必须交给托管层（[Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)）。对 Oribos 意味着 `.md` 的 `Content-Type`、`_redirects`、站级 `Link`/`X-Llms-Txt` 头都不能在应用内解决，必须写 `vercel.json` 或 Cloudflare/EdgeOne 规则。
- Fumadocs 的 docs UI 是 React；营销站若也留在 Next，组件模型统一，但现有 Astro 组件（Header/Footer/FeatureTabs/CodeTabs/mocks）要全部重写。
- TypeDoc 没有 Starlight 等价的「整树生成 + 侧栏快照 + diff 门」插件。`fumadocs-typescript` 的 Auto Type Table 是从 TS 定义生成属性表（[Auto Type Table](https://fumadocs.dev/docs/markdown/typescript)），不是 249 页符号级参考树；要自建 TypeDoc→MDX→Fumadocs source 的管线。
- Contentlayer 不建议：`contentlayer` 最后发布 `0.3.4`（2023-06），GitHub 仓库 2024 年后无推送、93 个 open issues（`npm view contentlayer`、GitHub API `repos/contentlayerdev/contentlayer`）。Fumadocs MDX 已是维护中的替代。

#### 3.3 Nuxt 4 + Nuxt Content 3

官方能力：

- Git-based CMS，Markdown/MDC（Vue 组件）、collection schema、`queryCollection`、`ContentRenderer`（[Nuxt Content Markdown](https://content.nuxt.com/docs/files/markdown)）。
- 内置 SQLite FTS5 全文搜索 `useSearchCollection`，零外部服务（[Nuxt Content Full-Text Search](https://content.nuxt.com/docs/advanced/fulltext-search)）。
- `nuxi generate` 静态输出 `dist/`（[Nuxt Content Static Hosting](https://content.nuxt.com/docs/deploy/static)）。
- `nuxt-llms` 自动生成 `/llms.txt` 与 `/raw/<path>.md`（[Nuxt Content LLMs](https://content.nuxt.com/docs/integrations/llms)）。
- i18n 通过 `@nuxtjs/i18n` + 分语言 collection（[Nuxt Content i18n](https://content.nuxt.com/docs/integrations/i18n)）。

不足：

- 需要整站 Vue 重写；现有营销/文档组件、脚本、门禁全部是 Astro/TS。
- 没有 Starlight/Fumadocs 级别的 docs 主题；要用 Nuxt UI 或自装文档布局。
- `nuxt@4.6.2` 的 `engines` 是 `^22.22.3 || ^24.15.0 || >=26.0.0`（`npm view nuxt`），现有文档站 `.nvmrc` 是 `22.12.0`，直接不满足。
- 没有内置文档版本化；只能目录/多部署。

#### 3.4 Docusaurus 3.10

官方能力：

- docs 插件 + 侧栏 + 版本化（`docs:version`、`versions.json`、版本下拉、版本侧栏）（[Docusaurus Docs](https://docusaurus.io/docs/docs-introduction)、[Versioning](https://docusaurus.io/docs/versioning)）。
- 内置 blog：列表、标签、作者、RSS/Atom/JSON feed、分页（[Docusaurus Blog](https://docusaurus.io/docs/blog)）。
- 内置 i18n：文件系统翻译、hreflang、RTL（[Docusaurus i18n](https://docusaurus.io/docs/i18n/introduction)）。
- 搜索：官方 Algolia DocSearch；本地搜索靠社区插件（[Docusaurus Search](https://docusaurus.io/docs/search)）。

不足：

- 营销页要 React 重写；docs-first 布局对定制营销首页不友好。
- 无第一方 `.md` twin / llms 生成；要自写。
- TypeDoc 只有社区插件或先生成 Markdown，现有 249 页管线要重做。
- Mastra 自己就是「Next.js 营销 + Docusaurus 文档」的双栈；这证明 Docusaurus 适合文档，不证明它适合单站营销。

### 4. 单仓单应用 vs monorepo

| 形态 | 结构 | 优点 | 代价 | 适用判据 |
| --- | --- | --- | --- | --- |
| **A. 单包单应用（推荐）** | 一个 `package.json`、一个 `astro.config.mjs`、`src/pages/**` + `src/content/docs/docs/**` + `src/content/blog/**` | 一个部署、一个 sitemap、一个 Pagefind 索引、一个 `/llms.txt`、一套 CI；营销/文档链接同源 | 文档与营销发布节奏耦合；每次营销改动也跑文档门禁；单包依赖较多 | 只有一个站点、一个域名、一个团队 |
| B. monorepo `apps/www + apps/docs + packages/ui + packages/content` | pnpm workspace；两套 Astro 配置、两套部署 | 独立发布/预览；边界清晰；共享 UI/content 包 | 两套搜索索引、两套 sitemap/llms；跨应用链接与 token 同步；CI 复杂度上升 | 文档必须独立部署/独立节奏，或第二个产品站确定要来 |
| C. 两仓两域（现状） | `oribos-website` + `oribos-docs`，`oribos.dev` + `docs.oribos.dev` | 迁移风险最低；现有门禁不动 | 不是「单站」；两套搜索/导航/品牌；内容重复与链接漂移 | 短期过渡，不作为目的地 |
| D. monorepo + 构建期拼装 | `apps/docs` 构建到 `apps/www/dist/docs`，或反代 | 保留独立 docs 应用 | `base: '/docs'` 会搬走 `/llms.txt`；静态主机 path rewrite 能力有限；预览/回滚复杂 | 仅在不能合并应用、又必须同域时 |

**推荐 A，理由**：

1. 两站已经同栈；合并的主要工作是「把营销站导入文档站骨架」，不是重写。
2. 单应用天然满足「单站」：一个 `site` origin、一个 sitemap、一个 Pagefind 索引、一个 `/llms.txt`、一套 canonical/robots。
3. Oribos 只有一个产品线、一个维护者、一个发布节奏；monorepo 的独立性收益现在用不上。
4. 现有文档站的 CI 门禁已经按「单仓单应用」组织（`../oribos-docs/docs/spec/delivery.md` §5、`.github/workflows/verify.yml`），拆成 workspace 反而要改路径与 job。

**什么时候改判 B**：

- 文档需要独立于营销站发布（例如 docs 每日发版、营销周更），且独立预览/回滚是硬要求；
- 第二个产品站（Platform/Studio）确定要独立应用；
- 文档团队与营销团队分开，需要代码所有权边界。

即使选 B，也不要在同一域做路径拼装；更稳的是 `docs.oribos.dev` 子域 + 营销站深链，接受「两个站点」而不是「一个站点」。

### 5. 文档内容管线

#### 5.1 现有管线（文档站）

```
oribos-framework @ pinned SHA
  └─ packages/core/dist/*.d.ts
       └─ api-entry/*.d.ts (入口 shim，文件名 = 模块组名)
            └─ TypeDoc 0.28.20 + typedoc-plugin-markdown
                 └─ starlight-typedoc 0.23.1
                      └─ src/content/docs/docs/reference/api/** (249 页，入库)
                           ├─ Astro/Starlight 渲染 → /docs/reference/api/**
                           ├─ starlight-dot-md → 每页 .md twin
                           └─ 自写 gen-agent-surface.mjs → /llms.txt + /llms-manifest.json
```

关键事实：

- 生成树**入库**，CI 用 `git status` 做 diff 门；连续两次重生成逐字节相同（`../oribos-docs/docs/spec/api-reference.md` §4）。
- 生成页带 `generated: true`，与手写页的 frontmatter union 区分（`../oribos-docs/src/lib/frontmatter.ts:101-111`）。
- 无框架 checkout 的构建路径已实测：侧栏走 `api-sidebar.json` 快照，平台构建不需要框架仓库（`../oribos-docs/docs/spec/delivery.md` §2.1、§5）。
- `starlight-dot-md` 只读 Starlight 默认 `docs` collection；子项目/其他 collection 不覆盖（`../oribos-docs/docs/spec/stack.md` §8、`agent-surface.md` §10）。

#### 5.2 单应用建议布局

```
oribos-www/
├─ astro.config.mjs          # Starlight + sitemap + Tailwind + TypeDoc + dot-md + redirects
├─ package.json
├─ pnpm-lock.yaml
├─ redirects.json            # 唯一台账
├─ pinned-ref.json           # 框架 SHA（与 docs 现有机制同构）
├─ public/
│  ├─ _headers               # .md MIME、llms 头、immutable 缓存（按托管层改写）
│  ├─ favicon.svg
│  └─ og.png
├─ src/
│  ├─ pages/                 # 营销页、blog/resources 路由、404、rss.xml
│  ├─ layouts/               # BaseLayout / MarketingLayout / BlogLayout / ResourceLayout
│  ├─ components/            # Header/Footer/FeatureTabs/CodeTabs/... + blog/resource 组件
│  ├─ content/
│  │  ├─ docs/docs/**        # Starlight：/docs/**（嵌套 docs/ 表达前缀）
│  │  ├─ blog/**             # 博客 collection
│  │  ├─ resources/**        # 文章/模板 collection（如启用）
│  │  └─ marketing/**        # 现有 JSON 锁定文案（或保留 src/content/*.json）
│  ├─ lib/                   # site/links/frontmatter/agent-surface/api-tree/ledger/brand-tokens
│  └─ styles/global.css      # 单一品牌 token 源
└─ scripts/                  # verify / regen-api / gen-agent-surface / check-*
```

#### 5.3 frontmatter 字段

**文档页（沿用现有 + 可能需要扩展）**：

| 字段 | 必填 | 值域/说明 | 消费方 |
| --- | --- | --- | --- |
| `title` | 是 | 页面标题 | 侧栏、搜索、llms |
| `description` | 是 | 一句话摘要 | meta、搜索、llms |
| `project` | 否（默认 `oribos`） | 小写 slug | 多项目缝、manifest |
| `subtype` | 否 | `walkthrough` / `migration` | Guides 侧栏子分组 |
| `order` | 否 | 组内整数 | 人工排序 |
| `packages` | 是 | `@oribos/core` 及子路径；**建议由 pinned exports 生成** | manifest、包→页映射 |
| `source` | 派生页必填 | `{ file, ref? }[]` | 漂移检查 |
| `generated` | 生成页 | `true` | 与手写页 union |

**博客/资源页（新增建议）**：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` / `description` | 是 | 标题、摘要 |
| `slug` | 是 | URL；建议与文件名一致，避免双真相 |
| `pubDate` / `updatedDate` | 是 / 否 | ISO 日期；RSS、排序、JSON-LD |
| `author` | 是 | 单维护者可用固定值 `0xnicholas`，不建作者页 |
| `category` | 是 | `announcements` / `engineering` / `changelog` / `guides` 等 |
| `tags` | 否 | 标签页/筛选 |
| `hero` / `ogImage` | 否 | 社交卡；没有则用站点默认 OG |
| `draft` | 否 | 生产构建过滤 |
| `canonical` | 否 | 仅转载/外部首发时使用 |
| `faq` | 否 | `{ q, a }[]`，生成 FAQPage JSON-LD |
| `relatedDocs` | 否 | 文档深链，保持营销→docs 的链接方向 |
| `packages` | 否 | 文章涉及的包，可进 manifest 的扩展面 |

**模板页（如做 `/resources/templates`）**：`title`、`description`、`slug`、`stack`、`packages`、`repoUrl`、`demoUrl`、`difficulty`、`draft`。

#### 5.4 TypeDoc 与包→页映射

- TypeDoc 的 Markdown 输出需要 `typedoc-plugin-markdown`；TypeDoc 官方 `outputs` 支持 `markdown`，但注明「requires typedoc-plugin-markdown」（[TypeDoc Output](https://typedoc.org/documents/Options.Output.html)）。
- `starlight-typedoc` 的 peer 是 `@astrojs/starlight >=0.39.0`、`astro >=6.0.0`、`typedoc >=0.28.0`、`typedoc-plugin-markdown >=4.6.0`（`npm view starlight-typedoc`）；现有组合 0.23.1 / 0.28.20 / 4.13.1 在窗内。
- **包→页映射不要手写 enum**。现有 `packageValues` 是 10 项硬编码（`../oribos-docs/src/lib/frontmatter.ts:21-32`），而框架现在是 11 项（`agent-run`）。迁移时应：
  1. 从 pinned checkout 的 `packages/core/package.json` 读 `exports`；
  2. 生成 `package-surface.json`（或直接生成 Zod enum）；
  3. 让 `llms-manifest.json` 的 `packages` 键与生成结果逐项比对；
  4. 保留 `pnpm verify:pin` 的「packages == exports」红门。
- 版本真相双字段：`pin`（SHA）+ `version`（npm 版本）。现有 docs 是 `0.5.0` + `81483bd`；框架已是 `0.9.0` + `3ecacc2`。新站必须先升 pin、重生成 API 树，再谈内容迁移。

#### 5.5 `.md` twin / llms.txt / manifest

- llms.txt v2 规范允许 `/llms.txt` 放站根或任意路径，页面 Markdown 可以是「原 URL + `.md`」或「扩展名替换为 `.md`」；推荐用 `<link rel="alternate" type="text/markdown">` 和 `rel="describedby"` 宣告（[llms.txt v2](https://llmstxt.org/)）。
- 文档站现有实现：`starlight-dot-md` 每页 twin + 自写 `/llms.txt` 逐页索引 + `/llms-manifest.json` 包→页映射；`llms.txt` 只列 10 个 API 模块组入口，不列 249 个符号页（`../oribos-docs/docs/spec/agent-surface.md` §3）。
- **单应用扩展点**：
  - 文档：继续用 `starlight-dot-md` + 现有生成器；
  - 博客/资源：新增 `src/pages/blog/[...slug].md.ts`（或等价静态端点），从 collection 读原始 body 输出 `text/markdown; charset=utf-8`；
  - `/llms.txt`：若要保持文档契约，增加 `## Blog` / `## Resources` 段，但**不要改变 `## Docs` 的现有形状**；或者保持 docs-only，另发 `/blog/llms.txt`（llms.txt v2 允许路径级文件）。这是一个 owner 决策，见 §9.6。
  - `/llms-manifest.json`：建议保持 docs-only 的包→页契约；博客/资源另加 `content` 索引或单独的 `blog-manifest.json`，不要让包映射混入非文档页。

### 6. 搜索方案与成本

| 方案 | 索引位置 | 运行时 | 成本 | 优点 | 缺点 |
| --- | --- | --- | --- | --- | --- |
| **Pagefind** | 构建期静态索引 `dist/pagefind/**` | 纯浏览器，按需加载 chunk | 开源免费；无服务、无请求费 | Starlight 内置；零配置；静态主机可用；支持多语言/过滤/排序 | 索引随页面增长；相关性与分析弱；`data-pagefind-body` 规则要显式处理 |
| Algolia DocSearch | Algolia 云端，Crawler 每周抓取 | Algolia API | 合格文档站免费；非合格需 Algolia 付费 | 相关性/分析成熟；Docusaurus/Starlight 都有官方插件 | 外部服务/账号审批；数据出境与隐私；爬虫延迟；偏离「零 SaaS」 |
| Fumadocs ZBSearch | 构建期静态 JSON 或服务端 API | 浏览器/服务端 | 开源免费 | Fumadocs 默认；静态站可用 | 只在 Fumadocs/React 栈；不是 Astro 原生 |
| Orama / Orama Cloud | 自托管索引或云端 | 浏览器/云 | 开源库免费；Cloud 当前为销售联系页，无公开自助价 | 全文/向量检索能力强 | 与 Astro 需自接；Cloud 成本不透明 |
| Nuxt Content FTS5 | 构建期 SQLite 数据库，浏览器 WASM 加载 | 浏览器 | 开源免费 | 零依赖、前缀/BM25/片段 | 数据库体积随内容增长；只在 Nuxt |
| Typesense | 自托管/Cloud | 服务端 | 自托管运维或 Cloud 费用 | 开源、即时搜索 | 多一套服务；与静态站取向冲突 |

**推荐**：首发用 **Pagefind 单索引**，覆盖营销 + 博客 + 文档。理由：

1. Starlight 已经内建，文档站已验证索引完整性、检索质量、线上可用（`../oribos-docs/docs/spec/delivery.md` §10.8）。
2. 静态站零服务、零请求费，符合 Oribos 的「无 SaaS 运行时」取向。
3. 单应用里 Pagefind 的 `addDirectory` 会扫描整个 `dist/`（本机源码 `@astrojs/starlight/dist/integrations/pagefind.js` 的 `index.addDirectory({ path: dist })`），所以营销/博客只要加 `data-pagefind-body` 就能进同一索引。
4. 若未来相关性不够，Starlight 有官方 `@astrojs/starlight-docsearch` 插件可原位切 Algolia（[Starlight Site Search](https://starlight.astro.build/guides/site-search/)），不需要改内容。

**成本记账**：

- Pagefind：0 美元；构建时间增加（249 页文档 + 博客/营销，预计数秒到十几秒）；索引体积随页面增长，但按 chunk 懒加载。
- Algolia DocSearch：合格文档站免费，但需要申请与审批；不合格则按 Algolia 定价（[DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch/)、[Algolia Pricing](https://www.algolia.com/pricing)）。
- Orama Cloud：当前 `/pricing` 跳到销售联系页（[orama.com/pricing](https://orama.com/pricing/)），没有公开自助价，不适合作为首发可预算项。

### 7. 部署与运行时

#### 7.1 静态导出的共同前提

- Astro `output: 'static'` + 无 adapter → `dist/` 可移植；`redirects` 配置在无 adapter 的静态站上只生成 `<meta http-equiv="refresh">`，**不支持状态码**（[Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/)）。真 301/308 必须由托管层提供。
- Next.js `output: 'export'` 同样不支持 redirects / rewrites / headers / ISR / 动态路由未预生成等（[Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)）。
- 因此无论选 Astro 还是 Next，**重定向台账 + 托管层适配器**都是必需项；不能把「静态导出」当成「URL 语义完整」。

#### 7.2 托管候选

| 平台 | 静态托管 | 重定向 | 响应头 / MIME | 预览/回滚 | 成本 | 与 Oribos 的匹配 |
| --- | --- | --- | --- | --- | --- | --- |
| **Cloudflare Workers 静态资产** | `assets.directory`，无 Worker 脚本也可 | `_redirects` 原生，301/302/303/307/308，2,100 条 | `_headers` 原生，100 条规则 | Workers Builds / 版本预览 / rollback | 静态请求免费不限量；无存储费 | 技术最合适；但 owner 2026-10-02 已裁决本期不用 CF |
| Cloudflare Pages | 等价备胎 | `_redirects` 同语法 | `_headers` 同语法 | PR 预览 | 500 builds/月，20,000 文件免费 | 与 Workers 等价；同样被暂停 |
| Vercel | Astro/Next 静态输出 | `vercel.json` redirects（推荐 307/308） | `vercel.json` headers | 预览/回滚成熟 | Hobby 100GB + 100 万请求；**Hobby 禁商用**；Pro $20/用户/月 | 开发体验好，但公司站不能用 Hobby；Pro 成本与锁定要 owner 认 |
| 腾讯云 EdgeOne + COS | 静态加速/源站 | 规则引擎支持「访问 URL 重定向」、强制 HTTPS、URL 重写 | 规则引擎支持修改头部、缓存配置 | 需按腾讯云产品能力配置 | 需询价；大陆节点需 ICP 备案 | owner 指定方向；具体形态未定，301/headers/预览/回滚都要实测 |
| 通用静态主机/Nginx | `dist/` | 手写 Nginx/平台规则 | 手写 | 自建 | 低 | 可作为兜底；运维成本转嫁给自己 |

关键事实：

- Cloudflare Workers 静态资产的请求**免费且不限量**，只有 Worker 脚本请求计费；静态文件上限免费 20,000 / 付费 100,000，单文件 25 MiB（[Workers Static Assets Billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)、[Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)）。
- Workers 原生支持 `_headers` / `_redirects`（[Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)）；Pages 的限制是 2,000 静态 + 100 动态重定向、100 条 header 规则、单行 2,000 字符（[Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)）。
- Vercel Hobby 的资源是 100 GB Fast Data Transfer + 100 万 CDN 请求，且明文「Hobby plan restricts users to non-commercial, personal use only」（[Vercel Hobby](https://vercel.com/docs/plans/hobby)、[Vercel Limits](https://vercel.com/docs/limits)）。Vercel 的 redirects 建议用 307/308，301 也可配置（[Vercel Redirects](https://vercel.com/docs/redirects)）。
- 腾讯云 EdgeOne 规则引擎支持按路径/子域/后缀匹配，执行 URL 重定向、强制 HTTPS、缓存、修改头部、URL 重写；跳转类操作是 Break 语义（[EdgeOne 规则引擎概览](https://cloud.tencent.com/document/product/1552/70901)）。
- 腾讯云 ICP 备案：大陆节点提供互联网信息服务需要备案；未备案不得从事非经营性互联网信息服务（[腾讯云 ICP 备案](https://cloud.tencent.com/document/product/243)）。香港/海外节点免备案，但访问速度与合规形态不同（`../oribos-website/docs/SPEC.md` §10.1）。
- `oribos.dev` 未注册（RDAP 404），三个主机均 NXDOMAIN；因此「从 docs.oribos.dev 迁移」目前没有真实线上 URL 债，只有域名注册、DNS、证书、备案的外部等待。

#### 7.3 域名与路径形态

| 形态 | URL | 优点 | 代价 |
| --- | --- | --- | --- |
| **单源 `/docs`（推荐）** | `https://oribos.dev/docs/**` | 一个 canonical、一个 sitemap、一个搜索、一个 llms；最符合「单站」 | 文档与营销同部署；Starlight 必须用嵌套 `src/content/docs/docs/**`，`base` 为空 |
| docs 子域 | `https://docs.oribos.dev/**` | 文档独立部署/回滚；现有 docs 站形态不变 | 两个站点、两个 sitemap/搜索；营销→docs 跨域；不是「单站」 |
| 子路径反代 | `oribos.dev/docs/**` → docs 应用 | 表面同域 | 静态主机 rewrite 能力有限；`base: '/docs'` 会搬走 `/llms.txt`；预览/回滚复杂 |

**建议**：新站首发用单源 `/docs`；如果 owner 坚持 docs 独立部署，则保留 `docs.oribos.dev`，并在营销站把 `/docs` 深链到子域，不要做路径反代。若未来从子域切到单源，用托管层 301 `docs.oribos.dev/*` → `oribos.dev/docs/:splat`，并在 `redirects.json` 登记；当前因域名未上线，这项可后置。

#### 7.4 Analytics

- 文档站现行裁决是**零遥测**，且有机器门禁（无第三方子资源、无厂商特征、无 cookie）（`../oribos-docs/docs/spec/delivery.md` §7）。
- 营销站 analytics 仍未定（`../oribos-website/docs/SPEC.md` §10.1③）；一旦上线，需要同步改 Privacy。
- 静态站兼容任何「一行 script」方案：Cloudflare Web Analytics（无 cookie、所有计划可用，[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/)）、Vercel Web Analytics（无 cookie、平台集成，[Vercel Analytics](https://vercel.com/docs/analytics)）、自托管 Umami（开源、无 cookie，[Umami Docs](https://umami.is/docs)）。
- 若保持零遥测，单应用不需要任何额外运行时；若加 analytics，必须把文档站的 `check-telemetry` 规则改成「允许指定厂商、但仍禁止 cookie/跨站追踪」，否则会与全站脚本冲突。

### 8. 迁移风险与工作量粗估

#### 8.1 风险清单

| 风险 | 影响 | 证据 | 缓解 |
| --- | --- | --- | --- |
| 文档 pin 过期 | 内容/API 树与框架 0.9.0 不一致 | `pinned-ref.json` = `81483bd`（0.5.0）；框架 HEAD `3ecacc2`（0.9.0） | 升 pin、重生成 249 页树、重跑 `verify:pin`、更新版本文案 |
| `packages` enum 漂移 | 新增 `agent-run` 页无法通过 schema；manifest 漏页 | `frontmatter.ts` 10 项 vs `core/package.json` 11 项 | 从 pinned `exports` 生成 enum/manifest，取消手写列表 |
| 两套品牌 token | 文档与营销视觉分裂；对比度门禁各自为政 | `../oribos-docs/src/styles/global.css` vs `../oribos-website/src/styles/global.css`；两套 `check-contrast`/`check-tokens` | 选一套为唯一源；另一套只做映射；重跑两套对比度门禁 |
| Pagefind 漏索引 | 营销/博客搜不到 | Starlight 给 docs `<main>` 加 `data-pagefind-body`；Pagefind 规则是「有该属性的页面才索引」 | 给营销/博客 layout 的 `<main>` 加 `data-pagefind-body`，nav/footer 加 `data-pagefind-ignore` |
| `.md` twin 只覆盖 docs | 博客/资源没有 agent 面 | `starlight-dot-md` 只读默认 docs collection（`stack.md` §8） | 为 blog/resources 写独立 `.md` 静态端点；扩展 llms 生成器 |
| llms.txt 形状冲突 | 现有 docs 契约被破坏 | `agent-surface.md` §3 固定五族 + 10 模块入口 | 保持 `## Docs` 原形；新增 `## Blog`/`## Resources` 或路径级 llms |
| 静态 redirect 是 meta-refresh | SEO/URL 语义不达 301 | Astro 配置参考明确静态无 adapter 只出 meta-refresh | 托管层 301/308；`redirects.json` 只做台账，生成 `_redirects`/EdgeOne 规则 |
| Starlight header/footer 统一 | 覆盖清单从 0 变多；升级需复验 | `../oribos-docs/docs/spec/brand-visual.md` §4、ADR-0003 | 首发保留 Starlight chrome；要统一时按覆盖登记制逐项加 |
| 404 冲突 | 两套 404 只能留一个 | 营销 `src/pages/404.astro`；文档 `src/content/docs/404.md` | 选一个；另一个删/重定向；Starlight `disable404Route` 可让自定义 404 生效 |
| 单应用构建耦合 | 营销小改动触发 249 页 API 构建 | 文档构建 6–9s（`api-reference.md` §3），全站可能更久 | 可接受则单应用；不可接受则 monorepo/独立 docs |
| 旧营销红线与新站需求冲突 | 旧 SPEC 明确「无 blog / 不装 RSS / 无站内搜索」；新站要博客与全站搜索 | `../oribos-website/docs/SPEC.md` §1/§8.1 | 在新站 SPEC 中显式废止这三条，并同步 `check-copy`/`check-static`/页面壳门禁 |
| 腾讯云形态未定 | 301/headers/预览/缓存无法验收 | owner SPEC fog；`delivery.md` 文首注记 | 先定托管形态（EdgeOne/COS/其他）+ ICP；把托管适配器做成一层 |
| Vercel Hobby 禁商用 | 公司站不能合规使用 | Vercel Hobby 明文 | 选 Pro 或不用 Vercel |
| Next 静态导出限制 | 无 headers/redirects/ISR | Next.js 官方 | 若选 Next，必须配 Vercel/Cloudflare/EdgeOne 规则；不要承诺纯静态自包含 |

#### 8.2 工作量粗估（工程侧，不含内容写作/设计/ICP 等待）

| 工作流 | 规模 | 人日 | 说明 |
| --- | --- | --- | --- |
| 新 app 脚手架 + 合并两套 Astro 配置 | M | 2–3 | Starlight + TypeDoc + dot-md + sitemap + redirects + Tailwind |
| 营销 11 页 + 组件/内容导入 | S | 1–2 | 主要是路径、链接、404、origin 调整 |
| 文档 269 页 + Starlight 配置导入 | M | 3–5 | 嵌套 `docs/`、frontmatter schema、侧栏、重定向 |
| pin 升级 + API 树重生成 | M | 2–4 | 0.5.0→0.9.0、10→11 exports、全树 diff 复验 |
| agent 面扩展（blog/resources `.md` + llms） | M | 2–4 | 新 collection 的 twin/索引/断言 |
| blog/resources 管线（collection/路由/RSS/JSON-LD） | M | 3–5 | 分类、标签、分页、SEO、草稿 |
| 品牌 token / header/footer 统一 | M | 2–4 | 选源、映射、对比度/视觉回归 |
| CI 门禁合并/去重 | L | 4–6 | 两套 20+ 脚本、路径/基准/origin 适配 |
| 托管/域名/重定向/预览 | M | 2–3 | 不含 ICP 等待与 DNS 生效 |
| **合计** | — | **约 20–35 人日** | 粗估，不作为排期；若保留两套独立部署可减 5–8；若上 monorepo 加 3–5 |

---

## 对 Oribos 的启示

### 9.1 推荐技术形态（供 owner 裁决）

**首选：Astro 7 + Starlight，单仓单应用，`oribos.dev` 单源 + `/docs/**`。**

理由按权重：

1. **同栈复用**：两站已同为 Astro 7.3.5 / Tailwind 4 / Node 22.12 / pnpm 10.33.2；换栈要把 249 页 API 树、`.md` twin、llms、重定向台账、Pagefind、20+ 门禁全部重做，收益不抵成本。
2. **文档管线是硬资产**：`starlight-typedoc` 的整树生成 + 侧栏快照 + diff 门已经在真实仓库跑通；Fumadocs/Docusaurus/Nuxt 都没有同等现成度。
3. **营销站很轻**：11 页、38 个 JSON 内容文件，导入成本远低于文档管线重建。
4. **单应用直接满足「单站」**：一个 origin、一个 sitemap、一个搜索、一个 `/llms.txt`、一套 canonical/robots，不需要反代或双域。
5. **退出路径仍在**：内容仍是 Markdown/MDX + frontmatter + JSON 台账；换渲染层时 URL 与内容可保留（`../oribos-docs/docs/spec/stack.md` §11）。

**次选：Next.js 16 + Fumadocs 16**，仅在以下条件同时成立时考虑：

- owner 决定营销/文档都走 React，接受两站重写；
- 需要 Fumadocs 的内置 blog/版本化/LLM 路由，且愿意自建 TypeDoc 整树管线；
- 托管层能提供 redirects/headers（Vercel Pro、Cloudflare、EdgeOne），不要求纯静态自包含。

**不建议作为主栈**：

- Nuxt Content：Vue 重写 + Node 版本 + docs UI 自装，收益不足。
- Docusaurus：版本化/blog 最强，但营销站 React 重写、llms/TypeDoc 自建；Mastra 自己也是双栈，不是单站样板。

### 9.2 推荐 IA 树（新站）

```
/                                  首页（营销）
/about                             About
/privacy-policy                    Privacy
/terms-of-service                  Terms
/ai-agent-framework                Framework / 关键词页
/ai-agents                         Agents / 关键词页
/ai-workflows                      Workflows / 关键词页
/ai-agent-observability            Observability / 关键词页
/in-product-agents                 用例页
/operations-agents                 用例页
/developer-infrastructure          用例页
/blog                              博客索引（公司/产品/工程）
/blog/[slug]                       博客文章
/blog/category/[category]          博客分类
/resources                         资源 hub
/resources/templates               模板/示例索引
/resources/templates/[slug]        模板详情
/resources/articles                长文索引（可选，见 §9.6）
/resources/articles/[slug]         长文详情（可选）
/changelog                         发布说明（可选；也可放 /blog/category/changelog）
/docs                              文档 landing（Starlight）
/docs/get-started/**               上手
/docs/concepts/**                  概念
/docs/guides/**                    指南
/docs/reference/import-map         Reference 门面
/docs/reference/api/**             TypeDoc 生成树（249 页）
/docs/project/**                   项目与生态
/llms.txt                          agent 索引
/llms-manifest.json                包→页机器契约
<route>.md                         每页 Markdown twin
```

**取舍**：

- **不建** `/pricing`、`/customers`、`/careers`、`/contact`、`/hackathon`、`/models`、`/integrations`、`/ai-gateway`、`/studio`、`/agent-builder` 等 Mastra 有但 Oribos 本期无独立产品页的栏目（与 `../oribos-website/docs/SPEC.md` §11 的 out-of-scope 一致）。
- **不建** `/learn`：文档的 walkthrough 已承载教学；Mastra 的 learn 是视频课程，Oribos 没有对应产能。
- **不建** `/authors/*`：Oribos 单维护者，博客作者用固定署名，作者页是空壳。
- **可后置** `/resources/articles`：如果博客已经能承载长文，不必再开一套；如果要做 SEO 长文，再拆，且同一篇内容只在一个 canonical URL 下。

### 9.3 页面清单与模板字段

#### 页面清单（首发）

| 组 | 页面 | URL | 模板 | 数据源 |
| --- | --- | --- | --- | --- |
| 营销 | 首页 | `/` | MarketingLayout | 现有 `src/content/*` |
| 营销 | About | `/about` | 文本页 | 现有 JSON |
| 营销 | 法务 ×2 | `/privacy-policy`、`/terms-of-service` | 文本页 | 现有 JSON |
| 营销 | 用例 ×3 | `/in-product-agents` 等 | UseCaseLayout | 现有 JSON |
| 营销 | 关键词 ×4 | `/ai-agent-framework` 等 | KeywordLayout | 现有 JSON |
| 博客 | 索引 | `/blog` | BlogIndex | `blog` collection |
| 博客 | 文章 | `/blog/[slug]` | BlogPost | `blog` collection |
| 博客 | 分类 | `/blog/category/[category]` | BlogCategory | `blog` collection |
| 资源 | Hub | `/resources` | ResourceHub | 静态数据 + collection |
| 资源 | 模板索引/详情 | `/resources/templates/[slug]` | TemplateIndex/Detail | `templates` collection |
| 文档 | 五族 | `/docs/**` | Starlight | `docs` collection |
| 文档 | API 树 | `/docs/reference/api/**` | Starlight/TypeDoc | 生成树 |
| 机器面 | llms/manifest | `/llms.txt`、`/llms-manifest.json` | 生成器 | 内容树 |
| 错误 | 404 | `/404` | 自定义 | — |

#### 模板字段（直接可落 schema）

**博客**：

```ts
{
  title: string;
  description: string;
  slug: string;
  pubDate: date;
  updatedDate?: date;
  author: string;            // 固定 "0xnicholas" 或显示名
  category: 'announcements' | 'engineering' | 'changelog' | 'guides';
  tags?: string[];
  hero?: string;
  ogImage?: string;
  draft?: boolean;
  canonical?: string;
  faq?: { q: string; a: string }[];
  relatedDocs?: string[];
  packages?: string[];
}
```

**资源文章**（如启用）：在博客字段基础上加 `keywords: string[]`、`relatedDocs: string[]`，去掉 `category` 的 changelog 取值。

**模板**：

```ts
{
  title: string;
  description: string;
  slug: string;
  stack: string[];           // e.g. ['typescript', 'node']
  packages: string[];        // '@oribos/core' 子路径
  repoUrl: string;
  demoUrl?: string;
  difficulty?: 'starter' | 'intermediate' | 'advanced';
  draft?: boolean;
}
```

**文档**：沿用 `title` / `description` / `project` / `subtype` / `order` / `packages` / `source` / `generated`（§5.3）。

**搜索记录**：`title`、`description`、`url`、`section`（docs/blog/resources）、`headings`、`body`、`packages`。

**llms manifest**：`site`、`framework.pin`、`framework.version`、`generatedAt`、`packages`（仅文档页）。

### 9.4 映射表

#### 现有仓库 → 新站

| 现有资产 | 新位置 | 动作 |
| --- | --- | --- |
| `oribos-website/src/pages/*.astro` | `src/pages/*.astro` | 复制；改 origin/links；删 `public/llms.txt`（改用生成器） |
| `oribos-website/src/components/**` | `src/components/**` | 复制；与 docs 品牌 token 对齐 |
| `oribos-website/src/content/*.json` | `src/content/marketing/**` 或保留 | 复制；schema 合并 |
| `oribos-website/scripts/check-*` | `scripts/check-*` | 合并/去重；保留 copy/origin/telemetry 红线 |
| `oribos-docs/src/content/docs/docs/**` | `src/content/docs/docs/**` | 复制；保持嵌套 `docs/` |
| `oribos-docs/astro.config.mjs` | `astro.config.mjs` | 以它为骨架，合并营销 sitemap/i18n |
| `oribos-docs/src/lib/*` | `src/lib/*` | 复制；改 origin、frontmatter、api-tree 路径 |
| `oribos-docs/scripts/*` | `scripts/*` | 复制；改 repo 路径/CI |
| `oribos-docs/redirects.json` | `redirects.json` | 保留 `/` → `/docs/`；新增营销 URL 变更（如有） |
| `oribos-docs/public/_headers` | `public/_headers` | 保留五条；按托管层调整 |
| `oribos-docs/wrangler.jsonc` | 托管配置 | 若不用 CF，改写为 EdgeOne/Vercel 配置；`assets` 语义保留 |
| `oribos-docs/pinned-ref.json` | `pinned-ref.json` | 升到 `3ecacc2`（0.9.0）后重生成 |

#### Mastra 内容类型 → Oribos

| Mastra | Oribos | 说明 |
| --- | --- | --- |
| `/blog` + categories + authors | `/blog` + categories，无作者页 | 单维护者 |
| `/articles` | `/resources/articles`（可选） | 长文 SEO；不与 blog 重复 |
| `/templates` | `/resources/templates` | 模板/示例 |
| `/learn` | `/docs/guides` | 不另起 |
| `/docs/**` | `/docs/**` | 五族保持 |
| `/reference/**` | `/docs/reference/api/**` | 不升格 |
| `/models/**`、`/integrations/**` | 不建 | 无 AI Gateway/独立集成产品 |
| `/customers/**` | 不建 | 无客户案例 |
| `/pricing` | 不建 | 开源/无定价 |
| `/resources` | `/resources` | 轻量 hub |
| `/llms.txt`（docs/models/integrations/reference） | `/llms.txt`（docs + 可选 blog/resources） | 见 §9.6 |

### 9.5 验收项（可直接进建站票）

**构建与产物**

- [ ] `pnpm build` 通过，`dist/` 无服务端脚本、无 adapter；页面总数 = 营销 11 + 博客/资源 + 文档 269 + 404（以实际路由表为准）。
- [ ] `pnpm verify` 全绿；营销门禁与文档门禁去重后仍覆盖：contrast、tokens、copy、links、origin、telemetry、frontmatter、ledger、routes、brand、platform。
- [ ] `pnpm verify:api` 零 error / 零 warning / 重生成 diff 为空。
- [ ] `pnpm verify:pin` 通过；`packages` 与 pinned `exports` 逐项一致（11 项）。
- [ ] `pnpm check:pin-freshness` 只出黄灯，不拦合并。

**URL / 重定向 / 头**

- [ ] `redirects.json` 每条目标可解析；无手写 `public/_redirects`；生成器幂等。
- [ ] 托管层 `/` → `/docs/` 为 301/308，不是 meta-refresh。
- [ ] `<route>.md` 返回 `text/markdown; charset=utf-8`。
- [ ] `/llms.txt` 返回 `text/plain; charset=utf-8`；站级 `Link: </llms.txt>; rel="llms-txt"` 与 `X-Llms-Txt` 存在。
- [ ] 每个页面 canonical / og:url / sitemap / robots 同源（`site` 单点）。
- [ ] 尾斜杠归一由托管层负责，台账不重复登记。

**搜索**

- [ ] `dist/pagefind/**` 含 runtime/wasm/词索引/片段。
- [ ] 索引 page_count = 所有应索引页面（docs + blog + resources + marketing；404/跳板除外）。
- [ ] 真浏览器查询：`createWorkflow` 命中 API 树；博客标题命中博客；营销页关键词命中营销。
- [ ] 营销/博客 layout 的 `<main>` 有 `data-pagefind-body`；nav/footer 有 `data-pagefind-ignore`。

**agent 面**

- [ ] 每个应发布的 HTML 路由有 `.md` twin（docs + blog + resources）。
- [ ] `/llms.txt` 链接集合 == 内容集合；无死链、无漏页。
- [ ] `/llms-manifest.json` 的 `packages` 键 == pinned exports；`site`/`pin`/`version` 正确。
- [ ] 每页 head 有 `<link rel="alternate" type="text/markdown" href="<route>.md">`。

**迁移/内容**

- [ ] pin 从 `81483bd`（0.5.0）升到 `3ecacc2`（0.9.0）；API 树 249 页重生成并入库。
- [ ] 内容中的 `0.5.0` / 旧 scope / 旧域扫描通过（`check-retired-names` / `check-copy`）。
- [ ] 两套品牌 token 收敛为一套；对比度 16 项与视觉回归通过。
- [ ] 文档 `/docs` 嵌套路由与侧栏逐行对上 `ia.md` §7。
- [ ] 营销 11 页 URL 不变（除非 IA 票明确改）；改则登台账。

### 9.6 需要 owner 裁决的开放点

1. **单源还是 docs 子域**：推荐 `oribos.dev/docs/**`；若 docs 必须独立发布，选 `docs.oribos.dev` 并接受两个站点。
2. **博客与资源文章是否分开**：推荐先 `/blog` + `/resources/templates`；`/resources/articles` 等内容产能确定后再开，避免同一篇内容两个 canonical。
3. **changelog 放哪**：`/changelog`（营销面）或 `/blog/category/changelog`（博客分类）或 `/docs/project/changelog`（文档面）。三选一，不能三处都长。
4. **`/llms.txt` 是否覆盖博客/资源**：推荐保持 `## Docs` 原形，新增 `## Blog`/`## Resources` 段；或 docs-only + 路径级 `/blog/llms.txt`。这是 agent 契约变更，需明确。
5. **Starlight chrome 是否统一**：首发保留 Starlight header/sidebar + 营销 Header/Footer 两套壳；若要统一，按覆盖登记制逐项加，别一次性 fork。
6. **托管形态**：Cloudflare（技术最优但已暂停）vs 腾讯云 EdgeOne/COS（owner 指定但未验证）vs Vercel Pro（体验好但成本/锁定）。在托管未定前，不要把 `.md` MIME/301 写成应用内逻辑。
7. **analytics**：继续零遥测，还是上无 cookie 的 Cloudflare/Umami/Vercel Analytics；后者要改 Privacy 与 `check-telemetry`。
8. **版本化触发**：0.x latest-only；1.0 前评估 `starlight-versions` 或独立 `/docs/v<n>/` 快照。
9. **旧营销 SPEC 红线**：`无 blog / 不装 RSS / 无站内搜索` 是旧营销站的范围裁决；新站需求已越过，需在新站 SPEC 中正式废止这三条，并同步更新 `check-copy` / `check-static` / 页面壳门禁，避免建站时被旧门禁拦住。

---

## 来源清单

### 本地仓库（一手）

| 路径 | 用途 |
| --- | --- |
| `../oribos-website/astro.config.mjs` | 营销站静态输出、i18n、sitemap、Shiki、brand token |
| `../oribos-website/package.json` | Astro 7.3.5、Tailwind 4.3.3、无 MDX/RSS/adapter |
| `../oribos-website/CONTEXT.md` | 站点根 `https://oribos.dev`、定位、术语 |
| `../oribos-website/docs/SPEC.md` | 11 页 IA、§8 技术方案、§10 部署 TBD、§11 out-of-scope |
| `../oribos-website/docs/SPEC-revamp.md` | v2 视觉 token、`/resources` 3 卡、用例/关键词页 |
| `../oribos-website/src/lib/site.ts` | `SITE.origin = 'https://oribos.dev'` |
| `../oribos-docs/astro.config.mjs` | Starlight、嵌套 `docs/`、TypeDoc、dot-md、redirects |
| `../oribos-docs/package.json` | Astro 7.3.5、Starlight 0.42.4、starlight-typedoc 0.23.1、dot-md 0.2.1 |
| `../oribos-docs/wrangler.jsonc` | assets-only、`html_handling`、`not_found_handling` |
| `../oribos-docs/redirects.json` | `/` → `/docs/` 301 台账 |
| `../oribos-docs/pinned-ref.json` | 框架 pin `81483bd` |
| `../oribos-docs/src/content.config.ts` | docs/i18n collection + `docsSchema({ extend })` |
| `../oribos-docs/src/lib/frontmatter.ts` | 7 字段 + `packageValues` 10 项 + `generated` union |
| `../oribos-docs/src/lib/site.ts` | `https://docs.oribos.dev`、title/description |
| `../oribos-docs/docs/spec/stack.md` | 栈裁决、组合清单、实测约束、退出路径 |
| `../oribos-docs/docs/spec/api-reference.md` | TypeDoc 249 页、入库 + diff 门、入口 shim |
| `../oribos-docs/docs/spec/agent-surface.md` | `.md` twin、`/llms.txt`、manifest、写作约束 |
| `../oribos-docs/docs/spec/ia.md` | 五族、URL、版本化、多项目缝、站点树 |
| `../oribos-docs/docs/spec/delivery.md` | CF 静态资产、重定向、预览、零遥测、否决记录 |
| `../oribos-docs/docs/spec/content-boundary.md` | 内容族、`packages` 字段、竞品红线 |
| `../oribos-docs/docs/spec/handoff.md` | 建站 checklist、最终验收 |
| `../oribos-docs/docs/spec/content-inventory.md` | 35 条候选页/原料映射（草稿） |
| `../oribos-docs/docs/spec/brand-visual.md` | 文档站 token/覆盖清单/品牌接入点 |
| `../oribos-docs/docs/adr/0003-theme-customization-boundary.md` | 覆盖清单登记制 |
| `../oribos-docs/.github/workflows/verify.yml` | Repo gates / Pinned-ref gates / API tree gates |
| `../oribos-docs/src/styles/global.css` | 文档站品牌 token 层 |
| `../oribos-website/src/styles/global.css` | 营销站品牌 token 层（与 docs 为两套真相源） |
| `../oribos-framework/packages/core/package.json` | `@oribos/core 0.9.0`、11 exports（含 `agent-run`） |
| `../oribos-framework/pnpm-workspace.yaml` | 框架侧 pnpm workspace 先例（`packages/*`、`examples/*`） |
| `../oribos-framework/package.json` | pnpm 10.33.2、Node `>=22.13.0` |
| `../oribos-docs/node_modules/@astrojs/starlight/dist/integrations/pagefind.js` | Pagefind 对 `dist/` 全目录建索引 |
| `../oribos-docs/node_modules/@astrojs/starlight/dist/components/Page.astro` | 文档页 `<main data-pagefind-body>` |

### 官方文档与一手网页

| URL | 用途 |
| --- | --- |
| https://mastra.ai/ | Mastra 首页；响应头 Next.js/Vercel |
| https://mastra.ai/sitemap.xml | sitemap 索引 |
| https://mastra.ai/sitemaps/pages.xml | 营销页清单（73） |
| https://mastra.ai/sitemaps/blog.xml | 博客（274） |
| https://mastra.ai/sitemaps/articles.xml | 长文（82） |
| https://mastra.ai/sitemaps/templates.xml | 模板（26） |
| https://mastra.ai/sitemaps/podcasts.xml | 播客（123） |
| https://mastra.ai/sitemaps/workshops.xml | Workshop（76） |
| https://mastra.ai/sitemaps/customers.xml | 客户案例（31） |
| https://mastra.ai/sitemaps/research.xml | 研究（3） |
| https://mastra.ai/docs/sitemap.xml | 文档 963 页（reference/models/docs/integrations/learn） |
| https://mastra.ai/docs | Docusaurus 3.10.2 / DocSearch 标记 |
| https://mastra.ai/llms.txt | Mastra 的 docs/models/integrations/reference 索引 |
| https://mastra.ai/blog | 博客索引 |
| https://mastra.ai/articles | 长文索引 |
| https://mastra.ai/resources | 资源 hub |
| https://mastra.ai/blog/category/announcements | 博客分类 |
| https://mastra.ai/blog/category/changelogs | changelog 分类 |
| https://mastra.ai/authors/sam-bhagwat | 作者页样本 |
| https://mastra.ai/docs/agents/overview.md | 文档 `.md` twin 200 |
| https://mastra.ai/reference/agents/agent.md | Reference `.md` twin 200 |
| https://mastra.ai/blog/agent-memory-guide.md | 博客 `.md` twin 404 |
| https://mastra.ai/robots.txt | Algolia Crawler 标记 |
| https://starlight.astro.build/reference/configuration/ | Starlight 配置、Pagefind、i18n、sidebar、404 |
| https://starlight.astro.build/guides/i18n/ | Starlight i18n |
| https://starlight.astro.build/guides/authoring-content/ | Markdown/MDX、Asides、代码块 |
| https://starlight.astro.build/guides/pages/ | 自定义页面与 `<StarlightPage>` |
| https://starlight.astro.build/guides/site-search/ | Pagefind 内置、DocSearch 替代 |
| https://docs.astro.build/en/guides/content-collections/ | Astro collections、Zod、静态路由 |
| https://docs.astro.build/en/guides/integrations-guide/mdx/ | MDX 集成 |
| https://docs.astro.build/en/guides/rss/ | RSS |
| https://docs.astro.build/en/guides/internationalization/ | Astro i18n |
| https://docs.astro.build/en/guides/deploy/ | 静态部署 |
| https://docs.astro.build/en/reference/configuration-reference/ | `output`、`redirects`（静态 meta-refresh）、`site` |
| https://pagefind.app/docs/indexing/ | `data-pagefind-body` 规则 |
| https://pagefind.app/docs/ | Pagefind 构建期索引概述 |
| https://github.com/HiDeoo/starlight-versions | 版本化插件 early development |
| https://github.com/morinokami/starlight-dot-md | `.md` twin 插件 |
| https://github.com/delucis/starlight-llms-txt | llms 插件（本项目未采用） |
| https://fumadocs.dev/docs | Fumadocs 入口 |
| https://fumadocs.dev/docs/comparisons | Fumadocs vs Nextra/Docusaurus/Mintlify |
| https://fumadocs.dev/docs/mdx | Fumadocs MDX / collections |
| https://fumadocs.dev/docs/integrations/blog | 内置 blog 集成 |
| https://fumadocs.dev/docs/navigation | 版本化导航（同站/全站） |
| https://fumadocs.dev/docs/search | 搜索选型（默认 ZBSearch） |
| https://fumadocs.dev/docs/search/orama | ZBSearch 默认引擎、静态 JSON |
| https://fumadocs.dev/docs/integrations/llms | `llms.txt` / `*.md` / MCP |
| https://fumadocs.dev/docs/deploying/static | 静态导出 + 静态搜索 |
| https://fumadocs.dev/docs/manual-installation/astro | Fumadocs on Astro（React islands） |
| https://fumadocs.dev/docs/manual-installation/next | Fumadocs on Next.js 16 |
| https://fumadocs.dev/docs/markdown/typescript | Auto Type Table（非整树 TypeDoc） |
| https://nextjs.org/docs/app/guides/static-exports | 静态导出限制（无 redirects/headers/ISR） |
| https://docusaurus.io/docs/docs-introduction | Docusaurus docs 结构 |
| https://docusaurus.io/docs/versioning | 内置版本化 |
| https://docusaurus.io/docs/blog | 内置 blog |
| https://docusaurus.io/docs/search | Algolia DocSearch / 本地搜索 |
| https://docusaurus.io/docs/i18n/introduction | 内置 i18n |
| https://content.nuxt.com/docs/getting-started | Nuxt Content v3 |
| https://content.nuxt.com/docs/files/markdown | Markdown/MDC、collection |
| https://content.nuxt.com/docs/advanced/fulltext-search | SQLite FTS5 搜索 |
| https://content.nuxt.com/docs/deploy/static | `nuxi generate` 静态托管 |
| https://content.nuxt.com/docs/integrations/llms | `nuxt-llms` / `/raw/*.md` |
| https://content.nuxt.com/docs/integrations/i18n | `@nuxtjs/i18n` |
| https://typedoc.org/documents/Options.Output.html | TypeDoc markdown 输出需 `typedoc-plugin-markdown` |
| https://llmstxt.org/ | llms.txt v2 规范（站根/路径级、`.md` twin） |
| https://docsearch.algolia.com/docs/what-is-docsearch/ | DocSearch 免费资格、Crawler |
| https://www.algolia.com/pricing | Algolia 定价 |
| https://orama.com/pricing/ | Orama Cloud 当前为销售联系页 |
| https://docs.orama.com/open-source/ | Orama 开源库入口 |
| https://developers.cloudflare.com/workers/static-assets/ | Workers 静态资产 |
| https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/ | 静态请求免费不限量 |
| https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/ | Workers 原生 `_headers`/`_redirects` |
| https://developers.cloudflare.com/workers/platform/limits/ | 静态文件数/单文件大小/`_headers`/`_redirects` 上限 |
| https://developers.cloudflare.com/workers/platform/pricing/ | 静态资产请求免费 |
| https://developers.cloudflare.com/pages/platform/limits/ | Pages 构建/文件/重定向/header 限制 |
| https://developers.cloudflare.com/pages/configuration/redirects/ | Pages `_redirects` 语法与限制 |
| https://developers.cloudflare.com/pages/configuration/headers/ | Pages `_headers` 语法与限制 |
| https://vercel.com/docs/limits | Vercel 资源限制 |
| https://vercel.com/docs/plans/hobby | Hobby 100GB/100 万请求、禁商用 |
| https://vercel.com/docs/redirects | Vercel redirects 307/308 |
| https://vercel.com/docs/project-configuration | `vercel.json` redirects/headers |
| https://vercel.com/docs/analytics | Vercel Web Analytics（无 cookie） |
| https://cloud.tencent.com/document/product/1552 | 腾讯云 EdgeOne 产品文档入口 |
| https://cloud.tencent.com/document/product/1552/70901 | EdgeOne 规则引擎：URL 重定向、强制 HTTPS、缓存、改头 |
| https://cloud.tencent.com/document/product/243 | 腾讯云 ICP 备案（未备案不得提供非经营性互联网信息服务） |
| https://cloud.tencent.com/document/product/436 | 腾讯云 COS 文档入口 |
| https://developers.cloudflare.com/web-analytics/ | Cloudflare Web Analytics（无 cookie） |
| https://umami.is/docs | Umami 开源、无 cookie 分析 |
| https://registry.npmjs.org/@oribos%2Fcore | `@oribos/core` 最新 0.9.0（本机 `npm view`） |
| https://registry.npmjs.org/nuxt/latest | Nuxt 4.6.2 的 `engines`（`^22.22.3`） |
| https://registry.npmjs.org/@docusaurus%2Fcore/latest | Docusaurus 3.10.2 的 `engines`（`>=20.0`） |
| https://registry.npmjs.org/fumadocs-core/latest | Fumadocs 16.17.7 的 React/Next peer 范围 |
| https://rdap.org/domain/oribos.dev | RDAP 404（未找到，与未注册一致） |
| https://registry.npmjs.org/contentlayer | Contentlayer 最后发布 0.3.4（2023-06） |
| https://github.com/contentlayerdev/contentlayer | Contentlayer 仓库（2024 后无推送、93 open issues） |

### 本机核对命令（可复现）

```bash
# 域名与注册状态
dig +short oribos.dev A
dig +short docs.oribos.dev A
curl -sSIL --max-time 15 https://oribos.dev/
curl -sSL --max-time 20 https://rdap.org/domain/oribos.dev

# 版本与 pin
npm view @oribos/core version
node -e "const p=require('../oribos-framework/packages/core/package.json'); console.log(p.version, Object.keys(p.exports).length)"
git -C ../oribos-framework show 81483bd:packages/core/package.json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const p=JSON.parse(s);console.log(p.version,Object.keys(p.exports).length)})"

# 页面/内容规模
find ../oribos-docs/src/content/docs -type f \( -name '*.md' -o -name '*.mdx' \) | wc -l
find ../oribos-docs/src/content/docs/docs/reference/api -type f -name '*.md' | wc -l
find ../oribos-website/src/content -type f | wc -l

# Pagefind 行为（本机依赖源码）
grep -R "data-pagefind-body" ../oribos-docs/node_modules/.pnpm/@astrojs+starlight@*/node_modules/@astrojs/starlight/dist/components/Page.astro
```

---

_本报告只使用一手来源；所有 URL 与本地路径均在 2026-10-20 核对。报告不修改任何其他文件，不代替 owner 对栈、仓库形态、托管与 IA 的最终裁决。_
