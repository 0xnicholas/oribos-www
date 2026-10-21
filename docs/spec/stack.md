# 技术栈与仓库形态

> 票：[技术栈与仓库形态](https://github.com/0xnicholas/oribos-www/issues/13)（wayfinder 地图 [Oribos 官网：Mastra 形态站点规格](https://github.com/0xnicholas/oribos-www/issues/1) 的子票）
> 日期：2026-10-21
> 状态：**accepted**；交接给 [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16)。
> 上游：`docs/research/stack-options.md`、`docs/spec/docs-ia.md`、`docs/spec/design-system.md`、`docs/spec/deploy-baseline.md`、`docs/spec/keyword-pages.md`、`docs/spec/brand-assets.md`。
> 边界：本文只裁决框架、仓库形态、内容模型、搜索、生成器、CI 脚手架与「不引入」项。页面 IA、文案、视觉、域名/托管开通不在本文。

## 0. 决策摘要

| # | 项 | 裁决 |
|---|---|---|
| 1 | 框架 | **Astro 7 + Starlight**，单应用 |
| 2 | 运行时 | Node **22.21 LTS** + pnpm **10.33**；TypeScript strict |
| 3 | 样式 | Tailwind 4 + design-system CSS 变量；不引 UI 组件库 |
| 4 | 仓库形态 | **单包单应用**；`oribos-website` 退役，`oribos-docs` 只读归档 |
| 5 | 营销内容 | **typed block 模型** + Markdown projector；HTML / `.md` twin 同源 |
| 6 | docs 内容 | Starlight Markdown/MDX；TypeDoc 树入库 + diff 门 |
| 7 | 搜索 | **Pagefind 单索引**，首次打开才加载 |
| 8 | docs shell | **Starlight-first + override registry** |
| 9 | OG | 构建期生成；营销页逐页，docs 用默认图，缺失回退 |
| 10 | sitemap / redirects / agent surface | 共享 **route inventory** + 自定义生成器 |
| 11 | Changelog / Templates | 入库策展数据 + 可选刷新脚本；构建不联网 |
| 12 | CI | `pnpm verify` + Playwright smoke/a11y；不做内容单测、Lighthouse、视觉回归 |
| 13 | 不引入 | 无 CMS / SSR / 客户端框架 / docs 版本化 / 多语言 / 分析 / Blog / Algolia / monorepo / Starlight fork |

---

## 1. 框架与运行时

### 1.1 裁决

- **Astro 7 + Starlight**，单应用、单次静态构建。
- `output: 'static'`，**不加 adapter**；产物是可移植的 `dist/`。
- `trailingSlash: 'always'`，`build.format: 'directory'`；非尾斜杠请求由托管层 308 到尾斜杠形式。
- Starlight 的 docs collection 固定在 `src/content/docs`；`/docs` 前缀用嵌套 `src/content/docs/docs/**` 表达，不用 `base: '/docs'`。
- 首发 **latest-only**：不装 `starlight-versions`，不建 `/docs/v<n>/`。
- Tailwind 4 + design-system 的 CSS 变量；不引 UI 组件库、不引 CSS-in-JS。
- TypeScript strict；路径别名 `@/*` → `src/*`。

### 1.2 为什么是 Astro + Starlight

1. 现有营销站与文档站都已是 Astro 7.3.5 + Tailwind 4；文档站的 249 页 TypeDoc 树、`.md` twin、llms、Pagefind、重定向台账、CI 门禁都在 Starlight 上跑通。
2. 静态 `dist/` 与部署基线（provisional EdgeOne Pages、无 adapter）一致；301/headers/404 由托管层负责，应用不假装自己能做。
3. 单应用直接满足单站：一个 origin、一个 sitemap index、一个 Pagefind 索引、一个 `/llms.txt`、一次部署。
4. 退出路径仍在：内容仍是 Markdown/MDX + JSON + frontmatter；换渲染层时 URL 与内容可保留。

### 1.3 明确不选

| 选项 | 不选理由 |
|---|---|
| Next.js 16 + Fumadocs | 营销与 docs 都要重写；TypeDoc 整树要自建；静态导出不提供 redirects/headers |
| Nuxt 4 + Nuxt Content | 整站 Vue 重写；Node 版本与现有资产冲突；docs UI 要自装 |
| Docusaurus 3 | 营销站 React 重写；`.md` twin / llms / TypeDoc 要自建；Mastra 自己是双栈，不是单站样板 |
| 双栈（营销 + 独立 docs） | 两个站点、两个 sitemap/搜索；与「单站单 canonical」目的地冲突 |

### 1.4 版本钉死

- 在 scaffold 时按兼容矩阵钉死 Astro 7.x / Starlight 0.4x / `starlight-typedoc` / `typedoc` / `typedoc-plugin-markdown` 的**精确版本**，写进 `package.json` + lockfile。
- Node 22.21.x；`packageManager` 钉 pnpm 10.33.x；`.nvmrc` 写 `22.21`。
- 升级只走显式票；不在内容 PR 里顺手升框架。

---

## 2. 仓库形态与目录树

### 2.1 裁决

- **单包单应用**，仓库根就是站点；不建 pnpm workspace。
- 一个 `package.json`、一个 `astro.config.mjs`、一个 `dist/`、一次部署、一个 sitemap index、一个 Pagefind 索引、一个 `/llms.txt`。
- `oribos-website` 退役；`oribos-docs` 内容迁入后只读归档；`oribos-www` 是唯一 content truth source。
- 只有以下条件同时成立才改判 monorepo：docs 必须独立发布/回滚，或第二个产品站确定要独立应用。届时也优先独立部署，不在同域做路径拼装。

### 2.2 目录树

```
oribos-www/
├─ astro.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ .nvmrc
├─ tsconfig.json
├─ redirects.json                  # 路径级重定向唯一台账
├─ pinned-ref.json                 # oribos-framework 的 pin（v0.9.0）
├─ deploy/
│  ├─ host-rules.json              # www / docs / http 主机级规则
│  └─ edgeone.json                 # 生成物：EdgeOne 适配器（由 gen-redirects 生成）
├─ public/
│  ├─ fonts/inter-var.woff2
│  ├─ favicon.svg / favicon-16.png / favicon-32.png / apple-touch-icon.png
│  ├─ og/default.png
│  └─ robots.txt
├─ scripts/
│  ├─ verify/                      # 共享核心 + marketing/docs 族规则
│  ├─ gen-route-inventory.mjs
│  ├─ gen-sitemap.mjs
│  ├─ gen-agent-surface.mjs        # marketing/resources twin + llms + manifest
│  ├─ gen-redirects.mjs
│  ├─ gen-og.mjs
│  ├─ refresh-changelog.mjs        # 可选，不参与构建
│  └─ refresh-templates.mjs        # 可选，不参与构建
├─ src/
│  ├─ content.config.ts            # Zod schemas：marketing / changelog / templates / docs
│  ├─ pages/
│  │  ├─ index.astro               # 首页；读 marketing collection 的 `/` entry
│  │  ├─ [...slug].astro           # 其余营销页统一入口；Starlight 拥有 /docs/**
│  │  └─ 404.astro
│  ├─ layouts/
│  │  ├─ MarketingLayout.astro
│  │  ├─ KeywordLayout.astro
│  │  ├─ SolutionLayout.astro
│  │  ├─ ResourceLayout.astro
│  │  └─ LegalLayout.astro
│  ├─ components/
│  │  ├─ marketing/blocks/         # 每个 block 一个 HTML renderer
│  │  ├─ docs/                     # Starlight override registry 的组件
│  │  └─ seo/                      # head、JSON-LD、OG
│  ├─ content/
│  │  ├─ marketing/*.json          # 每页一个 entry：frontmatter + sections
│  │  ├─ changelog/*.json          # 策展 release 条目
│  │  ├─ templates/*.json          # example 卡片数据
│  │  └─ docs/docs/**              # Starlight 嵌套 collection：/docs/**
│  ├─ lib/
│  │  ├─ site.ts                   # SITE_ORIGIN 单点
│  │  ├─ routes.ts                 # route inventory 类型与读取
│  │  ├─ blocks.ts                 # block schema / registry
│  │  ├─ markdown-projector.ts     # block → Markdown
│  │  ├─ jsonld.ts                 # 页面类型 → JSON-LD
│  │  └─ search.ts                 # Pagefind 懒加载与 dialog
│  └─ styles/
│     ├─ tokens.css                # 单一 token 源
│     └─ global.css
└─ tests/
   └─ e2e/                         # Playwright
```

> `src/pages/index.astro` 渲染 `/`；`src/pages/[...slug].astro` 只生成 marketing collection 里登记的非首页 route；Starlight 的 `/docs/**` 与静态 `/404` 优先。CI 断言营销 route 不以 `/docs` 开头、不重复。

---

## 3. 内容模型

### 3.1 营销页：typed block 模型

每个营销页一个 entry（`src/content/marketing/<slug>.json`）：

```ts
{
  route: string;            // '/', '/ai-agents/', '/customer-facing-agents/'
  title: string;
  description: string;
  family: 'home' | 'keyword' | 'solution' | 'product' | 'resource' | 'support' | 'legal';
  seo: {
    canonical?: string;     // 默认从 route + SITE_ORIGIN 派生
    ogImage?: string;       // 覆盖生成图
    jsonLd: JsonLdType[];   // Organization / WebSite / BreadcrumbList / FAQPage / SoftwareApplication
    faq?: { q: string; a: string }[];
    updated?: string;       // ISO；没有真实日期就不写
  };
  sections: Block[];
}
```

Block 类型（与 design-system 组件一一对应）：

| Block | 用途 | Markdown 投影 |
|---|---|---|
| `hero` | 首页 / keyword / solution 首屏 | H1 + 副标题 + CTA 文本 |
| `prose` | About / 法务 / 长说明 | 原始 Markdown 正文 |
| `facts` | 事实带（0.9.0 / 19 包 / 23 examples） | 列表 |
| `capability` | 能力面 / tabs | H2 + 段落 + 链接 |
| `cardGrid` | Solutions 卡 / 资源卡 | H3 + 摘要 + 链接 |
| `scenarioCards` | Solution 的 3 张场景卡 | H3 + 2–3 句 + 包列表 |
| `referenceArchitecture` | 参考架构图 | 组件清单 + 数据流文字 + 图 alt |
| `packageMap` | 包映射表 | 表格 |
| `boundaries` | 边界 / 不适用 | 列表 |
| `examples` | 1–3 个 runnable example | 名称 + 链接 + 说明 |
| `code` | 5–15 行代码 | 代码围栏（语言必填） |
| `comparison` | 比较矩阵 | 表格 |
| `trace` | trace 可视化 | 表格 fallback |
| `faq` | FAQ | Q/A 列表 |
| `cta` | 结尾 CTA | 链接文本 |

规则：

- **页面文案只存在 JSON 里**；`.astro` 文件只做 layout、block renderer 和投影，不写页面文案。
- `src/lib/blocks.ts` 维护 block registry；CI 断言每个 block 同时有 HTML renderer 与 Markdown projector，缺一即失败。
- `prose` block 的 body 是 Markdown；投影时原样输出，渲染时走 Markdown 管线。
- 任何 block 的 Markdown 投影不得包含 HTML 结构或组件标签；只输出标题、段落、列表、表格、代码围栏和链接。
- 图片必须有 `alt`；没有 alt 的图片不进 `.md` twin。

### 3.2 docs 内容

- `src/content/docs/docs/**`：24 个手写页 + 249 个 TypeDoc 生成页。
- 既有 268 条 `/docs/**` 全部保留；首发 273 页。
- frontmatter 沿用 docs IA：`title` / `description` / `packages` / `generated` / `source`；`packageValues` 为 28 个导出面。
- TypeDoc 管线：`pinned-ref.json` → 入口 shim → `starlight-typedoc` → 生成树入库 → CI 重生成 diff 门；构建不需要 framework checkout（侧栏用快照）。
- pin 升到 v0.9.0：`77e582419c425f7d4d7cee2cd189b9f46f69ef84`；10 组 / 249 页。
- `.md` twin 由 `starlight-dot-md` 产出；不做 per-page `llms.txt`、`llms-full.txt`、`Accept` 内容协商。

### 3.3 Changelog / Templates

- **Changelog**：`src/content/changelog/*.json`，字段 = `version` / `date` / `title` / `summary` / `highlights[]` / `links`；只渲染策展事实，不渲染原始 release body。
- **Templates**：`src/content/templates/*.json`，字段 = `title` / `description` / `slug` / `stack[]` / `packages[]` / `repoUrl` / `demoUrl?` / `difficulty?`；23 个 example 索引，至少 12 卡；不建详情页。
- 刷新脚本可读 GitHub Releases / `oribos-framework/examples`，但只写上述 JSON；构建与 CI 不联网。

---

## 4. 内容管线

```
content sources
  ├─ src/content/marketing/*.json      → Zod → block registry ─┐
  ├─ src/content/changelog/*.json      → Zod ──────────────────┤
  ├─ src/content/templates/*.json      → Zod ──────────────────┤
  ├─ src/content/docs/docs/**          → Starlight + TypeDoc ─┤
  └─ pinned-ref.json                   → TypeDoc 生成树 ──────┘
                                                              │
                    ┌─────────────────────────────────────────┘
                    ▼
            Astro build (output: static)
                    │
                    ├─ HTML routes（营销 / docs / 404）
                    ├─ Pagefind 索引（Starlight 集成）
                    └─ route inventory
                    │
                    ▼
        post-build generators
                    ├─ marketing/resources .md twin
                    ├─ llms.txt + llms-manifest.json
                    ├─ sitemap-index.xml + pages.xml + docs.xml
                    ├─ og/*.png
                    └─ deploy/edgeone.json（从 redirects.json + host-rules.json）
                    │
                    ▼
                 dist/
                    │
                    ▼
        pnpm verify + Playwright
```

- `pnpm build` 的顺序固定：`astro build` → post-build generators → `pnpm verify`（CI 中）。
- 生成器幂等：同一输入连续两次输出逐字节相同；生成物不入库（OG 可按需缓存，但不作为源）。
- `route inventory` 是唯一路由真相源，sitemap / llms / manifest / link check / twin 全部消费它。

---

## 5. 搜索

### 5.1 引擎与索引范围

- **Pagefind 单索引**，构建期生成 `dist/pagefind/**`；不引 Algolia、不做服务端搜索。
- 索引所有可索引 HTML：首页、About、法务、4 个 keyword、5 个 Solutions、`/platform/`、`/templates/`、`/changelog/`、`/fde-support/`、273 页 docs。
- 排除：404、`.md` twin、sitemap、OG、任何 `noindex` 页。
- 营销 layout 的 `<main>` 加 `data-pagefind-body`；nav/footer 加 `data-pagefind-ignore`。Starlight 已给 docs 页加 body 标记，不重复覆盖。

### 5.2 UX

- 营销 header 与 docs top bar 共用同一个 search trigger（`<button>`，非 input）；点击打开 dialog。
- 结果按 **Docs / Pages / Resources** 分组；标题、摘要、路径、family 标签；键盘上下 + Enter；Esc 关闭；焦点回到 trigger。
- `Cmd/Ctrl+K` 可选；若实现，trigger 上显示快捷键提示。
- dialog 与结果样式使用 design-system token；不引第三方搜索 UI 库的默认样式。
- 不做搜索分析、不记 query。

### 5.3 性能预算

| 项 | 预算 |
|---|---|
| 首屏搜索请求 | **0**；Pagefind runtime 与索引只在首次打开 dialog 时加载 |
| 索引总量 | ≤ 5 MB（未压缩） |
| 单 chunk | ≤ 500 KB |
| 首次查询 | 中端笔记本 ≤ 300 ms |
| 阻塞渲染 | 无；搜索 JS 不进入 critical path |

- CI 断言 Pagefind 产物大小与 `page_count`；Playwright 跑一次真实查询。
- 若索引超预算：先排除低价值页（法务、404 邻页），再考虑 docs/marketing 双索引；双索引需要新票，不在首发默认。

---

## 6. docs shell 与 Starlight 覆盖

### 6.1 裁决

- **Starlight-first**：保留 Starlight 的路由、content collection、Pagefind 集成、正文 DOM。
- Token 按 design-system §10.1 映射；结构改动只做 §10.2 的六项。
- 需要 breadcrumb、Copy page、search trigger、三栏 grid 时，用 **官方 component override**；每项进 **override registry**（下表），写清原因与影响。
- 不改 Starlight 的路由、collection、Pagefind；一旦需要，停下来记到 #16，不静默 fork。
- 主题 storage key 统一 `oribos-theme`；保留 Starlight theme switch UI；双主题无 FOUC。

### 6.2 Override registry（首发）

| Slot | 覆盖内容 | 原因 |
|---|---|---|
| `Header` | 顶部栏：breadcrumb、theme toggle、search trigger、Copy page | design-system §8.10 的 docs top bar |
| `PageFrame` | 280 / 768 / 220 三栏；1024–1327 两栏；<768 单列 | §8.10 grid |
| `Sidebar` | group label mono / active 1px accent / sticky 偏移 | §8.10 + §10.2 |
| `ThemeSelect` | 与 marketing 共用 `oribos-theme` | 跨页主题一致 |
| `Search` | trigger 260×36；dialog 用 token | §8.10 |
| `Footer` | 与 marketing footer 同构或最小化 | 单站一致性 |

- 每个 override 只改 slot 允许的范围；不复制 Starlight 默认色板。
- 新增 override 必须更新本表并走 #16 验收；表外改动视为 fork。

---

## 7. Sitemap、redirects 与 agent surface

### 7.1 route inventory

- 构建期生成 `route-inventory.json`（不入库），字段：`url` / `family` / `indexable` / `mdTwin` / `sitemapShard` / `lastmod?` / `source`。
- 来源：marketing/changelog/templates collections + docs 内容树 + 静态路由（404、robots 等）。
- 消费方：sitemap、`llms.txt`、`llms-manifest.json`、link check、twin generator、OG generator。
- CI 断言：每个生成 HTML 路由在 inventory 中恰好一次；inventory 中每个 indexable 路由在 `dist/` 中有对应 HTML。

### 7.2 sitemap

- 产物：`dist/sitemap-index.xml`、`dist/sitemaps/pages.xml`、`dist/sitemaps/docs.xml`。
- `pages.xml`：首页、About、法务、4 keyword、5 Solutions、`/platform/`、`/templates/`、`/changelog/`、`/fde-support/`。
- `docs.xml`：273 页 docs。
- 不写 `changefreq` / `priority`；`lastmod` 只在有真实内容日期时写。
- 排除 `.md` twin、404、OG、站根跳板；`/sitemap.xml` 可 301 或 200-alias 到 `/sitemap-index.xml`。
- `robots.txt`：allow all + sitemap pointer；live 页不加 `noindex`。

### 7.3 redirects

- `redirects.json`：唯一**路径级**台账；每条含 `from` / `to` / `status` / `reason`。
- `deploy/host-rules.json`：主机级 `www` / `docs` / `http` 规则；不进 `redirects.json`。
- `scripts/gen-redirects.mjs` 从两者生成托管适配器；首发 EdgeOne 适配器（`deploy/edgeone.json`），保留 `_redirects` 适配器接口。
- CI：旧页面集合 − 新页面集合 ⊆ `redirects.json.from`；未登记即失败。
- 应用内不生成 meta-refresh 301；静态 Astro 的 `redirects` 配置不作为正式重定向。

### 7.4 agent surface

- docs：`starlight-dot-md` 产出 `<route>.md`。
- marketing / resources：`scripts/gen-agent-surface.mjs` 从 block 模型与资源数据投影出 `<route>.md`；与 HTML 同源。
- 每页 head：`<link rel="alternate" type="text/markdown" href="<route>.md">`。
- `/llms.txt`：站根；H1 → 摘要 → `## Docs`（五族 + 10 模块入口）→ `## Pages`（营销）→ `## Resources`（Templates / Changelog）→ `## Optional`；docs 段形状不变。
- `/llms-manifest.json`：`site` / `framework{pin,version}` / `generatedAt` / `packages`（**docs-only**，28 个导出面）/ `pages`（非 docs 页的 `{url,title,family}` 数组）。
- 站级 header：`Link: </llms.txt>; rel="llms-txt"` 与 `X-Llms-Txt`。
- JSON-LD：`src/lib/jsonld.ts` 按页面类型生成 `Organization` / `WebSite` / `BreadcrumbList` / `FAQPage` / `SoftwareApplication` / docs `TechArticle`；只标注页面上可见的内容；CI 校验 JSON 可解析且类型与 route 匹配。

---

## 8. OG 图片

- 构建期 `scripts/gen-og.mjs` 生成 1200×630 PNG；暗色模板来自品牌规格。
- 范围：首页、4 keyword、5 Solutions、`/platform/`、`/templates/`、`/changelog/`、`/fde-support/`、About；docs 首发统一用 `public/og/default.png`。
- 输入：`title` / `description` / `family` / 可选 `ogImage`；输出 `dist/og/<route>.png`；缺失或生成失败回退默认图。
- 实现：`satori` + `@resvg/resvg-js`（或等价、构建期依赖），确定性输出；不引外部 OG 服务、不运行时生成。
- `og:image` / `og:image:alt` / `twitter:image` 全部指向绝对 URL（`SITE_ORIGIN`）。
- 品牌资产（wordmark / O tile / 模板）来自 `docs/spec/brand-assets.md`；本文只定生成方式。

---

## 9. 构建、部署与 SITE_ORIGIN

- `pnpm build` = `astro build` + post-build generators；`dist/` 可直接部署到任意静态主机。
- 无 adapter、无 SSR、无运行时 API、无数据库。
- `SITE_ORIGIN` 单点：`src/lib/site.ts` 读 `astro.config.mjs` 的 `site`，允许 `SITE_ORIGIN` 环境变量覆盖；provisional `https://oribos.ai`。
- 正文、frontmatter、组件不得硬编码域名；canonical / og:url / sitemap / llms / manifest / JSON-LD 全部从 `SITE_ORIGIN` 派生。
- 部署目标：静态 `dist/`；EdgeOne Pages 适配器优先（`deploy/edgeone.json`），`_redirects` 适配器保留接口。真实主机验证已由 owner 搁置，移交建站/上线 effort（见地图 Out of scope）。
- `robots.txt` / `_headers` 的 MIME（`.md` → `text/markdown; charset=utf-8`）、HSTS、缓存策略由托管层配置；应用只生成内容与规则文件。

---

## 10. CI、门禁与测试

### 10.1 门禁结构

- **共享核心**（所有页面）：canonical 自指、required OG/Twitter、站内链接完整、`SITE_ORIGIN` 单点、退役名称扫描、零第三方遥测、CJK grep。
- **marketing 族**：禁 `coming soon`、`lightweight` / `ultralight`、客户证言/logo 墙、未定价格；FAQ 与可见内容一致。
- **docs 族**：事实基线、代码围栏语言、标题层级、旧版本号/旧 scope 扫描、RAG/evals 否认句、`packages` 值域 == 28。
- 旧营销 SPEC 的「无 blog / 不装 RSS / 无站内搜索」三条**正式废止**；Blog/RSS 已由资源票撤回，搜索由本文启用。
- 不把 marketing 的 copy 红线套到 docs；不让 docs 的 API 事实规则拦住营销页。

### 10.2 `pnpm verify`

| 脚本 | 检查 |
|---|---|
| `verify:links` | 站内链接、锚点、`.md` twin 双向 |
| `verify:redirects` | 旧−新 ⊆ 台账；主机规则不与路径台账冲突 |
| `verify:sitemap` | 两片 sitemap；URL 集合 == route inventory；无 `.md`/404 |
| `verify:agent-surface` | twin 双向 + head link；llms 链接集合 == 内容集合；manifest 重算 |
| `verify:content` | marketing schema、block registry 完整性、docs frontmatter |
| `verify:design` | token 完整性、无裸色值、无圆角/阴影、对比度 |
| `verify:copy` | 退役名称、family copy 规则、CJK |
| `verify:telemetry` | 无第三方脚本、无 cookie、无外域请求 |
| `verify:api` | TypeDoc 重生成 diff 为空；pin 与 `packages` 一致 |

### 10.3 Playwright

- 路由：关键 HTML 200；`/docs/**` 抽样 200；`/docs` → `/docs/` 归一。
- 主机级：`www` / `docs` / `http` → apex 单跳 301（在真实主机可用后跑；本地用 adapter fixture）。
- `.md`：抽样 twin 200 + `text/markdown; charset=utf-8`。
- SEO：canonical、og:url、JSON-LD 可解析且类型匹配。
- 搜索：Pagefind `page_count` > 0；打开 dialog 后输入一个词，结果非空；首屏无 Pagefind 请求。
- a11y：代表性页面（首页、keyword、solution、docs、Templates、Changelog）跑 axe；无 critical/serious。
- 不做内容单测；不引 Lighthouse CI；不做视觉回归（后续需要再立票）。

---

## 11. 不引入

- 不引 CMS / 数据库 / 运行时 API / serverless function。
- 不做 SSR，不加 adapter，只输出静态 `dist/`。
- 营销页不引 React/Vue 运行时；主题切换、搜索 dialog 用原生 TS；只有确实需要交互的组件才做 Astro island。
- 不做 docs 版本化（`/docs/v<n>/` 首发不建）。
- 不加 `en` 之外的 locale，不建 `/zh/`。
- 不做 analytics / consent / cookie。
- 不做 Blog / RSS / 作者页。
- 不引 Algolia 或第三方搜索 UI 库。
- 不建 monorepo。
- 不 fork Starlight 的 DOM/路由/collection/Pagefind；只按 override registry 做主题层。
- 不引 UI 组件库、CSS-in-JS、图标库（图标 inline SVG）。
- 不做内容单测、Lighthouse CI、视觉回归。

---

## 12. 交接给 #16

以下由「规格装配与交接验收标准」落成验收项：

- [ ] 目录树与 block registry 完整；每个 block 有 HTML renderer + Markdown projector。
- [ ] route inventory 与 sitemap 两片、`llms.txt`、manifest 完全一致。
- [ ] 273 页 docs + 营销页全部 200；268 条既有 `/docs/**` 保留；`/` 不跳 `/docs/`。
- [ ] `.md` twin 全站 200，MIME 正确；head alternate link 全站存在。
- [ ] `llms-manifest.json` 的 `packages` == 28 个导出面；`pages` 覆盖非 docs 页。
- [ ] JSON-LD 类型与可见内容一致；无不可见结构化数据。
- [ ] Pagefind 覆盖全部可索引页；首屏零搜索请求；索引 ≤ 5 MB。
- [ ] Starlight override registry 与实际改动一致；表外无覆盖。
- [ ] marketing / docs 门禁按族通过；旧三条红线不再出现。
- [ ] `SITE_ORIGIN` 单点；无硬编码域名。
- [ ] 构建离线可复现；无网络依赖（刷新脚本除外）。

## 13. 风险与未决

| 项 | 影响 | 处理 |
|---|---|---|
| Astro / Starlight 精确版本未定 | 升级可能破坏 TypeDoc / Pagefind / override | scaffold 时钉死并跑通最小构建 |
| TypeDoc pin v0.9.0 生成树 | 249 页 diff 可能很大 | 单独 PR；先升 pin 再迁内容 |
| block projector 维护成本 | 新 block 可能只做 HTML、漏 Markdown | CI 断言 registry 完整性 |
| Pagefind 索引可能超 5 MB | 首次查询变慢 | 先排除低价值页；超预算再议双索引 |
| OG 生成依赖（satori/resvg） | 构建环境二进制/字体问题 | 构建期依赖；失败回退默认图，不阻断发布 |
| Starlight override 扩散 | 变成事实 fork | registry + #16 验收；表外改动停 |
| 托管适配器未实测 | 301/headers 行为未知 | 已由 #18 搁置；上线 effort 验证 |
| 单构建耦合 | 营销改动也跑 docs/API 门禁 | 当前规模可接受；变慢再议拆分 |

## 14. 来源

- `docs/research/stack-options.md`
- `docs/spec/docs-ia.md`
- `docs/spec/design-system.md`
- `docs/spec/deploy-baseline.md`
- `docs/spec/keyword-pages.md`
- `docs/spec/brand-assets.md`
- `docs/spec/fact-baseline.md`
- Astro：<https://docs.astro.build/>
- Starlight：<https://starlight.astro.build/>
- Pagefind：<https://pagefind.app/docs/>
- llms.txt：<https://llmstxt.org/>
- satori：<https://github.com/vercel/satori>
- resvg：<https://github.com/thx/resvg-js>
- Playwright：<https://playwright.dev/>

---

_本文只裁决技术栈、仓库形态、内容管线、搜索、生成器与 CI 脚手架；页面 IA、文案、视觉、域名/托管开通不在本文。_
