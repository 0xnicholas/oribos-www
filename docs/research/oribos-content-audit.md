# Oribos 现有内容资产盘点（票 #4 / `oribos-content-audit`）

> **盘点日期**：2026-10-20
> **盘点对象**：`oribos-www`（目标仓）、`oribos-website`（营销站）、`oribos-docs`（文档站）、`oribos-framework`（框架仓）
> **外部一手对照**：mastra.ai 的 `sitemap.xml` 及其子 sitemap、首页、`/blog`、`/resources`、`/llms.txt`、`/docs/sitemap.xml`
> **方法**：只读源文件 + 构建产物 + 本机网络探测；不引用二手博客或第三方总结。
> **路径约定**：文中 `oribos-*` 前缀均指 `/Users/nicholasl/Documents/build-whatever/` 下的同级仓库；行号以盘点时工作树为准。
> **标记**：【事实】= 源文件、构建产物或网络实测可直接复核；【判断】= 盘点者的迁移初判，供下游 IA / 规格票裁决。

---

## TL;DR

- **目标仓是空仓**：`oribos-www` 只有 `LICENSE` 被 git 跟踪，`AGENTS.md` 与 `docs/` 尚未提交；没有应用代码、没有新站 SPEC。可复用的东西全部在两个兄弟仓。
- **两站同工具链，合并技术上可行**：营销站与文档站都是 Astro 7.3.5 / Tailwind 4.3.3 / Node ≥22.12 / pnpm 10.33.2；文档站多一层 Starlight 0.42.4。营销站产物 452 KB，文档站产物 33 MB（249 页 API 生成树是体量大头）。
- **可复用度最高的是机器面与视觉层**：文档站 268 页（19 手写 + 249 生成）、每页 `.md` twin、`/llms.txt`、`/llms-manifest.json`、重定向台账、15 道 gate；营销站 v2 设计 token（Inter + Swiss 盒式 + 26 项对比度门）、22 个组件、16 个内容集合、22 道 gate。
- **最大风险是事实债**：营销站版本常量 `0.6.0`，文档站 pin/Manifest 停在 `0.5.0`，而 npm 上 `@oribos/core` 已是 **0.9.0**、19 个包已发布；营销 FAQ 仍写 "RAG/evals 未内建"（`@oribos/rag` / `@oribos/evals` 已分别于 0.8/0.7 落地），文档 Installation 仍写 "until @oribos/core ships" 并让人安装已下架的 0.5.0。
- **Mastra IA 对照下缺口集中在三块**：8 个 Solutions 槽位只有 3 个有页；博客/资源/作者/分类/模板/课程全缺；Platform / Studio / Agent Builder 三个计划中产品没有任何内容原料（框架 ROADMAP 甚至仍把 Studio 与托管平台列为出域）。
- **域名/托管是硬阻塞**：`oribos.dev` 的 RDAP 返回 404（未注册），`dig` 无记录，两个站点均无法解析；文档站的 Cloudflare 配置自 2026-10-02 起挂起，迁移目标腾讯云，大陆节点需 ICP。
- **迁移建议**：先做“事实刷新 + 单站骨架 + token 统一”，再迁 docs 内容与 API 树，最后做博客/资源/解决方案与上线；不要先搬页面再改事实。

---

## 详细发现

### 1. 盘点快照

【事实】

| 仓库 | 角色 | HEAD | 日期 | 工作树 | 关键产物 |
| --- | --- | --- | --- | --- | --- |
| `oribos-www` | 新站目标仓 | `9998b14` | 2026-10-20 | 仅 `LICENSE` 被跟踪；`AGENTS.md`、`docs/` 未跟踪 | 无应用代码；无新站 SPEC |
| `oribos-website` | 营销站 | `5ab2f62` | 2026-10-11 | clean | 11 页 + 404；16 collections / 38 JSON；22 components；22 gates；`dist/` 452 KB |
| `oribos-docs` | 文档站 | `b03e3ce` | 2026-10-04 | clean | 19 手写页 + 249 API 页；15 gates；`dist/` 33 MB |
| `oribos-framework` | 框架仓 | `5745ee8` | 2026-10-20 | dirty：`CONTEXT.md` 修改；`docs/adr/0020-*.md`、`0021-*.md` 未跟踪 | 19 个已发布包（core + 18 能力包）；23 examples；20 ADRs；8 篇 architecture；README EN + zh-CN |
| npm registry | 发布事实 | `@oribos/core@0.9.0`、`@oribos/supervisor@0.9.0` | 2026-10-20 实测 | — | 19 包同一 `0.9.0` |
| mastra.ai | IA 对照 | 一手抓取 | 2026-10-20 | — | `pages` 73 / `blog` 274 / `articles` 82 / `customers` 31 / `docs` 963 |

【事实】框架仓的工作树领先 HEAD：`CONTEXT.md` 已有未提交修改，`ADR-0020`（Lease 共享包）与 `ADR-0021`（MemoryStore 包装表面）尚未提交。盘点以工作树为准，但下游若要做“框架版本可复现”的引用，应以已发布 npm 包和 git tag 为准，不应引用未提交文件。

---

### 2. Mastra IA 一手基线（对照用）

#### 2.1 顶栏与页脚分组

【事实】从 `https://mastra.ai/` 的页脚解析（顶栏是同一 IA 的折叠菜单，项目名以页脚为准）：

| 组 | 项目 |
| --- | --- |
| Product | Factory、Studio、Observability、Agent Builder、Server、FDE + Support |
| Framework | Overview、Agents、RAG、Workflows、Observability |
| Developers | Docs、Changelog、Templates、Learn · MCP Course、Learn · Video Course |
| Solutions | Sales agents、Marketing agents、Company Brain、Financial Services、Healthcare、Customer-facing agents、Developer Infra、Real-world agents |
| Resources | Blog、Research、Articles、Book · Principles、Book · Patterns、Podcast · Agents Hour |
| Company | Customers、About、Careers、Contact Us、Newsletter |
| Connect | Contact Us、GitHub、Discord、YouTube、X (Twitter) |
| 底部 | Status、Privacy、Terms、DPA、`llms.txt` |

#### 2.2 sitemap 与内容类型

【事实】`https://mastra.ai/sitemap.xml` 是 sitemap index，下挂 9 个子 sitemap：

| 子 sitemap | URL 数 | 内容 |
| --- | --- | --- |
| `pages.xml` | 73 | 36 个非作者/非分类页 + 28 个作者页 + 9 个博客分类页 |
| `blog.xml` | 274 | 博客文章 |
| `articles.xml` | 82 | 长文/SEO 文章 |
| `templates.xml` | — | 模板 |
| `podcasts.xml` | — | 播客 |
| `workshops.xml` | — | 工作坊 |
| `customers.xml` | 31 | 客户案例 |
| `research.xml` | — | 研究 |
| `docs/sitemap.xml` | 963 | 文档（含 `/learn`、`/docs`、`/reference`、`/models`、`/integrations`） |

【事实】Mastra 的营销页核心 URL（`pages.xml`）包括：

- 产品/平台：`/pricing`、`/studio`、`/agent-builder`、`/factory`、`/ai-agent-deployment`、`/platform-observability`、`/ai-gateway`、`/mcp-registry`、`/mcp-registry-registry`
- 解决方案：`/customer-facing-agents`、`/real-world-agents`、`/developer-infrastructure`、`/sales-agents`、`/marketing-agents`、`/company-brain`、`/financial-services`、`/healthcare`
- 资源：`/resources`、`/blog`、`/articles`、`/templates`、`/podcasts`、`/workshops`、`/research`、`/books/principles-of-building-ai-agents`、`/books/patterns-of-building-ai-agents`
- 公司：`/about`、`/careers`、`/contact`、`/customers`、`/newsletter`
- 法务：`/privacy-policy`、`/terms-of-service`、`/legal/dpa`

【事实】`/blog` 的分类 URL 有 9 个：`foundations`、`memory`、`features`、`case-studies`、`announcements`、`examples`、`changelogs`、`changelog`，以及一个合并分类 `foundations, case-studies`。作者页 28 个。

【事实】`https://mastra.ai/llms.txt` 的 Docs 段采用“Get Started → Develop → Build（Agents / Workflows / Harness / Memory / Subagents / Skills / Channels / Sandboxes / Browser / Connections / Storage / Server / Studio / Auth / Deploy / Traces / Metrics / Evals / Guides）→ Mastra Platform（16 个顶层页，Connect 另含 3 个子页）→ Models → Integrations → Reference”的分组；每页都有 `.md` 形态。

#### 2.3 对照结论

【判断】Mastra 的 IA 不是“页面清单”，而是四层内容所有权：

1. **产品矩阵**（Product：Factory / Studio / Agent Builder / Server / Observability）；
2. **解决方案矩阵**（Solutions：角色 + 行业）；
3. **内容引擎**（Blog / Articles / Research / Templates / Books / Podcast / Workshops）；
4. **文档**（Docs / Reference / Models / Integrations / Learn）。

Oribos 目前只有“框架 + 3 个用例页 + 4 个关键词页 + 文档”，对应第 1 层只有 Framework 一角、第 2 层只有 3/8、第 3 层为 0、第 4 层只有 core 概念。**新站缺的不是页面数量，而是后三类内容的所有权与生产流程。**

**产品槽位映射（Mastra → Oribos 口径）**

| Mastra Product 槽位 | Oribos 口径 | 现有资产 | 处置 |
| --- | --- | --- | --- |
| Factory / Server / Platform | Platform（计划中） | 无 | `/roadmap` + 产品事实卡；不建空页 |
| Studio | Studio（计划中） | 无 | 同上 |
| Agent Builder | Agent Builder（计划中） | 无 | 同上 |
| Observability | Framework 能力（真实） | `/ai-agent-observability/` + docs `concepts/observability` | 复用 / 改写 |
| FDE + Support | 不做 | 无 | 不建 |
| MCP Registry | 做但无独立产品页 | 三个仓库无内容资产 | docs / resources 承载；不建独立页 |
| AI Gateway | 不做 | 无 | 不建 |

**Solutions 槽位映射（Mastra → Oribos 现有页）**

| Mastra Solutions 槽位 | Oribos 现有页 | 处置 |
| --- | --- | --- |
| Sales agents | — | 新建 |
| Marketing agents | — | 新建 |
| Company Brain | — | 新建 |
| Financial Services | — | 新建（行业） |
| Healthcare | — | 新建（行业） |
| Customer-facing agents | `/in-product-agents/` | 复用，或改名并 301 |
| Developer Infra | `/developer-infrastructure/` | 复用 |
| Real-world agents | `/operations-agents/`（近似） | 复用，或改名并 301 |

---

### 3. `oribos-website`（营销站）

#### 3.1 页面清单（11 页 + 404）

【事实】

| 路由 | 页面类型 | 布局 / 组件 | 内容源 | title |
| --- | --- | --- | --- | --- |
| `/` | 首页（9 区） | `MarketingLayout` + Hero / FactsBand / FeatureTabs / Observability / UseCaseCards / ResourcesStrip / FaqList / FinalCta | 16 个 collections | `Oribos — TypeScript AI agent framework` |
| `/about/` | 文本页 | `MarketingLayout` | `src/content/about/default.json` | `About — Oribos` |
| `/privacy-policy/` | 法务 stub | `LegalLayout` | `src/content/legal-pages/privacy-policy.json` + `legal-meta/shared.json` | `Privacy policy — Oribos` |
| `/terms-of-service/` | 法务 stub | `LegalLayout` | `src/content/legal-pages/terms-of-service.json` + `legal-meta/shared.json` | `Terms of service — Oribos` |
| `/in-product-agents/` | 用例页 | `UseCaseLayout` | `src/content/use-cases/in-product-agents.json` + 全局 FAQ ×9 + final CTA | `In-product agents — Oribos` |
| `/operations-agents/` | 用例页 | `UseCaseLayout` | `src/content/use-cases/operations-agents.json` + 全局 FAQ ×9 + final CTA | `Operations agents — Oribos` |
| `/developer-infrastructure/` | 用例页 | `UseCaseLayout` | `src/content/use-cases/developer-infrastructure.json` + 全局 FAQ ×9 + final CTA | `Platform & developer infra — Oribos` |
| `/ai-agent-framework/` | 关键词页 | `KeywordLayout` | `src/content/keyword-pages/ai-agent-framework.json` | `AI agent framework for TypeScript — Oribos` |
| `/ai-agents/` | 关键词页 | `KeywordLayout` | `src/content/keyword-pages/ai-agents.json` | `AI agents for TypeScript — Oribos` |
| `/ai-workflows/` | 关键词页 | `KeywordLayout` | `src/content/keyword-pages/ai-workflows.json` | `AI workflows for TypeScript — Oribos` |
| `/ai-agent-observability/` | 关键词页 | `KeywordLayout` | `src/content/keyword-pages/ai-agent-observability.json` | `AI agent observability for TypeScript — Oribos` |
| `404` | 错误页 | `BaseLayout` | `src/pages/404.astro` | — |

【事实】没有 `/blog`、`/resources`、`/pricing`、`/customers`、`/careers`、`/contact`、`/docs`；`sitemap-0.xml` 只有上述 11 个 URL。

#### 3.2 内容数据（16 collections / 38 JSON）

【事实】`src/content.config.ts` 定义 16 个集合，全部用 Zod schema 在构建期校验：

| 集合 | 文件数 | 关键字段 | 消费页面 |
| --- | --- | --- | --- |
| `hero` | 1 | `h1`、`sub` | 首页 Hero |
| `finalCta` | 1 | `heading`、`sub` | 首页 + 3 用例页 + 4 关键词页共用 |
| `agentPrompt` | 1 | `tag`、`button`、`task`、`cmeta`、`payload` | Hero + final CTA 的 chip CTA |
| `features` | 5 | `order`、`tab`、`claim`、`bullets[3–5]`、`files[1–2]{file,code,highlight}` | 首页 5 个 feature tab |
| `facts` | 4 | `order`、`text` | 首页架构事实带 |
| `observability` | 1 | `kicker`、`claim`、`lead`、`codeClaim` | 首页 Observability 区 |
| `useCaseIntro` | 1 | `heading`、`sub` | 首页 use-case 卡区引言 |
| `useCases` | 3 | `order`、`title`、`claim`、`route`、`mock`、`page{tagline,scenarios[3]{name,text,packages[]}}` | 首页 3 卡 + 3 用例页 |
| `resources` | 1 | `kicker`、`links[3]{label,key,description}` | 首页 Resources 细带 |
| `faq` | 9 | `order`、`question`、`answer` | 首页 + 3 用例页共用 |
| `keywordPages` | 4 | `title`、`description`、`h1`、`intro`、`sections[3–4]`、`learnMore`、`faq[6]`、`backAnchor` | 4 个关键词页 |
| `about` | 1 | `title`、`description`、`h1`、`story[2]`、`behind[2]`、`closing` | `/about` |
| `legalPages` | 2 | `title`、`description`、`h1`、`paragraphs[]` | 两个法务页 |
| `legalMeta` | 1 | `lastUpdated` | 两个法务页共用 |
| `snippets` | 2 | `file`、`code`、`highlight` | Hero `agent.ts`（17 行）+ Observability `app.ts` |
| `traces` | 1 | `meta`、`rows[7]`、`summary` | Hero + Observability 共用的 trace waterfall |

【事实】具体内容规模：

- 全局 FAQ 9 题；5 个 feature tab 共 9 个代码文件；3 个用例页共 9 张场景卡；4 个关键词页共 24 道页内 FAQ；架构事实带 4 格；Resources 3 卡；2 个法务页；1 个 about。
- 首页代码共 11 块：hero `agent.ts`（17 行）+ 5 个 tab 的 9 个文件 + observability `app.ts`（规格锁定的“不减”口径）。
- `agentPrompt.payload` 是 6 行压缩版 Agent + stream，不含 tool / zod；与产品窗的 17 行版并存是刻意的。

#### 3.3 组件与视觉资产

【事实】`src/components/` 共 22 个 `.astro`（含 4 个 mock、4 个图标）；`src/layouts/` 另有 5 个布局，一并列在表末（不计入 22）：

| 组件 | 作用 | 复用判断 |
| --- | --- | --- |
| `Header.astro` | wordmark + Use cases 下拉 + Docs + GitHub + 版本 pill | 结构可复用；导航数据必须改（新增 Framework / Solutions / Resources / Blog） |
| `Footer.astro` | 4 栏：Framework / Use cases / Developers / Project + 法务行 | 结构可复用；栏目需按新 IA 重排 |
| `Hero.astro` | 两栏：H1 + sub + chip CTA / 产品窗（`agent.ts` / `trace` 双 tab） | 直接复用 |
| `AgentPromptCta.astro` | 盒式 chip；可见四行 + 隐藏 payload；复制直拷 | 直接复用；payload 文案要更新到 0.9 |
| `FeatureTabs.astro` | 5 tab、claim + bullets + 代码卡；`#agents` 等 hash 直达 | 直接复用；内容要补能力包 |
| `CodeTabs.astro` | 文件 tab + copy；Shiki 高亮 + 行高亮 | 直接复用 |
| `TraceWaterfall.astro` | mono 表 + 归一化 bar；accent / trace-green | 直接复用 |
| `FactsBand.astro` | 一行 4 格事实带 | 直接复用；4 条事实仍成立 |
| `Observability.astro` | Observability 三件组之一 | 直接复用 |
| `UseCaseCards.astro` | 3 张用例卡 + mock | 直接复用；可扩展到 Solutions |
| `ResourcesStrip.astro` | 3 个资源链接 | 建议换成 Resources 3 卡组 / hub 入口 |
| `FaqList.astro` | `<details>` FAQ 列表 | 直接复用 |
| `FinalCta.astro` | H2 + sub + 同款 chip + GitHub 文字链 | 直接复用 |
| `SegmentText.astro` | 文本 / 链接片段渲染（about、legal） | 直接复用 |
| `MockWindow.astro` | 宿主窗框（三点 + 标题栏） | 直接复用 |
| `MockChat.astro` | 聊天窗 mock（用户气泡 + `lookupOrder` 工具签 + 流式光标） | 直接复用 |
| `MockThread.astro` | 团队线程 + 审批卡（`Refund order A-4471` + Approve / Reject + suspended） | 直接复用 |
| `MockTraceConsole.astro` | trace 控制台（span 行 + 状态 + 时长） | 直接复用 |
| `icons/`×4 | Check / Chevron / Copy / Menu | 直接复用 |
| `BaseLayout.astro` | head / meta / OG / canonical | 直接复用；canonical 需按合并站改 |
| `MarketingLayout.astro` | header + main + footer | 直接复用 |
| `UseCaseLayout.astro` / `KeywordLayout.astro` / `LegalLayout.astro` | 三种内页骨架 | 直接复用；用例页可升级为 Solutions 模板 |

#### 3.4 品牌 token 与资产（v2）

【事实】`src/styles/global.css` 是营销站自持的 token 真相源（SPEC-revamp §2.9 终止了“docs 为真相源”的继承关系）：

- **13 个颜色角色**：`--bg`、`--bg2`、`--ink`、`--ink2`、`--ink3`、`--line`、`--acc`、`--acc-h`、`--acc-lo`、`--acc-inv`、`--code-bg`、`--syn-green`、`--syn-blue`。
- 亮色：`--bg #ffffff`、`--acc #9e630a`（4.86:1）、`--acc-h #7a4c07`、`--acc-lo #f4e8d3`、`--line #e6e6e0`、`--ink #161513`。
- 暗色：`--bg #101010`、`--acc #ea9f2e`、`--acc-h #f5b456`、`--acc-lo #3a2c14`、`--line #2a2925`、`--ink #f2f1ee`。
- **8 档字阶**（1:1.333）：13/20、16/24、21/28、28/36、38/44、50/56、67/72、89/96；字重只 400 / 600。
- 桌面 12 栏 / 移动 4 栏，gutter 32 / 16，容器 1200px；24px 纵向节奏；1px hairline 盒、零圆角零阴影。
- **自托管 Inter 可变字重**，latin 子集 woff2 48 KB，OFL 1.1；mono 走系统栈。
- 双主题只随 `prefers-color-scheme`，无手动切换、无 localStorage；26 项 WCAG AA 对比度门。
- 资产：`public/favicon.svg` + `favicon-32.png` + `favicon-16.png` + `apple-touch-icon.png`（180）；`public/og.png`（1200×630 暗色卡）；`scripts/make-og.mjs`；`theme-color` 双 meta。
- 品牌文案单点：`src/lib/brand.ts` 的 `wordmark = 'Oribos'` 与 `publicTagline`。

#### 3.5 质量门与测试

【事实】`pnpm verify` 串联 22 个 `check-*.mjs`；`src/**/*.test.ts` 23 个测试文件：

| 组 | 脚本 | 作用 |
| --- | --- | --- |
| 内容 / claims | `check-copy`、`check-install`、`check-version`、`check-faq`、`check-features`、`check-keyword`、`check-scenarios`、`check-usecases`、`check-text-pages`、`check-verbatim`、`check-provenance`、`check-residuals` | 红线扫描、逐字文案、代码块出处、页型槽位 |
| 视觉 | `check-contrast`（26 项）、`check-tokens`、`check-type-scale`、`check-bands` | AA、token 单点、字阶、区带结构 |
| 结构 / 部署 | `check-shell`、`check-hero`、`check-links`、`check-origin`、`check-static`、`check-telemetry` | 壳层、锚点、外链、origin 单点、静态无服务端、零遥测 |

【事实】`check-copy` 的规则直接影响迁移：

- `coming-soon`：全站禁止 `coming soon`（旧态已退役）。
- `competitor-name`：禁止 Mastra / LangChain / LangGraph / LlamaIndex / CrewAI / AutoGen / Semantic Kernel / Haystack。
- `retired-positioning`：禁止 `ultralight` / `lightweight`。
- `counting-figure`：禁止 KB / MB / 测试数 / 星数 / 下载数 / 用户数等计数式表述。
- `mit-license`：禁止 `MIT`。
- `retired-scope`：禁止 `@balsa/*`、`@balsats/*`。
- `retired-name`：禁止旧仓库名、旧域名。
- `rag-evals`：关键词页禁止出现 `RAG` / `evals`（旧口径的“未实现”防线）。

【判断】这些 gate 是很好的骨架，但 **`rag-evals` 与 `retired-positioning` 的规则必须重写**：RAG / evals 现在是真能力，关键词页需要能写；`lightweight` 在 docs 仍被使用，合并时要么统一退役、要么把这条规则限定在营销面。

#### 3.6 已有 SPEC 资产

【事实】

| 文件 | 体量 | 状态 | 用途 |
| --- | --- | --- | --- |
| `oribos-website/docs/SPEC.md` | 1381 行 | v1，2026-10-02 | 历史；被 revamp 取代 |
| `oribos-website/docs/SPEC-revamp.md` | 483 行 | v2，2026-10-07 | 当前视觉 / CTA / 9 区 / token 的唯一现行依据；新站规格落地后退役 |
| `oribos-website/CONTEXT.md` | 95 行 | 术语表 | 用例页 / 场景卡 / 关键词页 / 全局 FAQ / 页内 FAQ / 架构事实带 / agent prompt CTA 等术语 |
| `oribos-website/prototype/brand-direction/` | 原型 | throwaway | 只作视觉参照，不得折进真站 |

【判断】新站规格不要从 v1 SPEC 重新起稿；以 `SPEC-revamp.md` §2（token / 网格 / 字体 / 代码块 / mock）为视觉底稿，以本报告的资产清单为内容底稿，另写一份合并站规格。

---

### 4. `oribos-docs`（文档站）

#### 4.1 内容清单（19 手写页 + 249 生成页）

【事实】

| 族 | URL | 标题 | 文件 | `order` | `packages` |
| --- | --- | --- | --- | --- | --- |
| Get started | `/docs/` | Introduction | `src/content/docs/docs/index.mdx` | 0 | `@oribos/core` |
| Get started | `/docs/get-started/installation/` | Installation | `.../get-started/installation.md` | 1 | `@oribos/core` |
| Get started | `/docs/get-started/quickstart/` | Quickstart | `.../get-started/quickstart.md` | 2 | `core`、`agent`、`observability`、`tools` |
| Get started | `/docs/get-started/concepts-overview/` | Concepts overview | `.../get-started/concepts-overview.md` | 3 | `@oribos/core` |
| Concepts | `/docs/concepts/agents/` | Agents | `.../concepts/agents.md` | 1 | `agent`、`tools` |
| Concepts | `/docs/concepts/tools/` | Tools | `.../concepts/tools.md` | 2 | `tools`、`agent` |
| Concepts | `/docs/concepts/models/` | Models | `.../concepts/models.md` | 3 | `model`、`agent` |
| Concepts | `/docs/concepts/memory/` | Memory | `.../concepts/memory.md` | 4 | `memory`、`agent` |
| Concepts | `/docs/concepts/workflows/` | Workflows | `.../concepts/workflows.md` | 5 | `workflows` |
| Concepts | `/docs/concepts/observability/` | Observability | `.../concepts/observability.md` | 6 | `observability`、`core` |
| Concepts | `/docs/concepts/durable-execution/` | Durable execution & background work | `.../concepts/durable-execution.md` | 7 | `durable-agent`、`signals`、`schedules` |
| Concepts | `/docs/concepts/suspend-resume/` | Suspend & resume | `.../concepts/suspend-resume.md` | 8 | `workflows` |
| Concepts | `/docs/concepts/processors/` | Processors | `.../concepts/processors.md` | 9 | `agent` |
| Guides | `/docs/guides/examples/` | Examples | `.../guides/examples.md` | 1 | `@oribos/core` |
| Guides | `/docs/guides/minimal-agent/` | Walkthrough: minimal-agent | `.../guides/minimal-agent.md` | 2 | `core`、`observability` |
| Guides | `/docs/guides/durable-approval/` | Walkthrough: durable-approval | `.../guides/durable-approval.md` | 3 | `durable-agent` |
| Guides | `/docs/guides/signals-desk/` | Walkthrough: signals-desk | `.../guides/signals-desk.md` | 4 | `signals`、`schedules` |
| Reference | `/docs/reference/import-map/` | Import map / package surface | `.../reference/import-map.md` | 1 | `@oribos/core` |
| Project | `/docs/project/docs-for-agents/` | Docs for AI agents | `.../project/docs-for-agents.md` | 1 | `[]` |
| — | `/docs/reference/api/**` | API reference（生成） | `.../reference/api/**` | — | 不适用（`generated: true`） |

【事实】`packages` 列为缩写，省略 `@oribos/core/` 前缀；`core` = `@oribos/core`。另有 `src/content/docs/404.md`。总路由 268 条：19 手写 + 249 生成；`dist` 里 269 个 `.md`（含 404）与 270 个 HTML（含站根跳板）。

#### 4.2 当前 IA 树

【事实】

```text
/                                  301 → /docs/          （redirects.json 唯一一条）
/docs                              Introduction           [Get started · 兼 landing]
/docs/get-started/
  installation                     Installation
  quickstart                       Quickstart
  concepts-overview                Concepts overview
/docs/concepts/
  agents                           Agents
  tools                            Tools
  models                           Models
  memory                           Memory
  workflows                        Workflows
  observability                    Observability
  durable-execution                Durable execution & background work
  suspend-resume                   Suspend & resume
  processors                       Processors
/docs/guides/
  examples                         Examples（索引）
  minimal-agent                    Walkthrough: minimal-agent
  durable-approval                 Walkthrough: durable-approval
  signals-desk                     Walkthrough: signals-desk
/docs/reference/
  import-map                       Import map / package surface
  api/**                           API reference（249 页，深度豁免）
/docs/project/
  docs-for-agents                  Docs for AI agents
```

【事实】保留命名空间：`/docs/reference/api/**`、`/docs/v<n>/**`、`/<slug>/docs/**`、`/llms.txt`、`/llms-manifest.json`、`<route>.md`。单车道（只有 Documentation 入口）；五族是 ownership 轴，不是导航轴；无版本段；两段 URL 封顶。

#### 4.3 agent 面（机器可读文档面）

【事实】这是文档站最成熟、最可复用的资产：

| 产物 | 路径 / 形态 | 规模 | 生成 / 校验 |
| --- | --- | --- | --- |
| 每页 `.md` twin | 页面路由 + `.md`（扩展名端点无尾斜杠） | 268 页 → 268 twin；`dist` 269 个 `.md`（含 404） | `starlight-dot-md` 0.2.1；`scripts/check-agent-surface.mjs` 两向断言 |
| `/llms.txt` | 站根；llmstxt.org v2 形状：H1 → 摘要 → 五族 `##` → 逐页链接 → `## Optional` | 31 条链接：19 手写页 + 10 个 API 模块组入口 + 2 条 Optional | 自写 `src/lib/agent-surface.ts` + `scripts/gen-agent-surface.mjs`；构建尾生成，不入库 |
| `/llms-manifest.json` | 站根；`site` / `framework{pin,version}` / `generatedAt` / `packages` | 10 个 package 键；`pin = 81483bd…`；`version = 0.5.0` | 同上；断言重算后逐项比对 |
| head 发现链 | `<link rel="alternate" type="text/markdown" href="<route>.md">` | 每个渲染页（除站根跳板） | `src/lib/agent-surface-head-link.ts`（Starlight `routeMiddleware`） |
| HTTP 头 | `_headers`：`/*.md` → `text/markdown; charset=utf-8`；`/llms.txt` → `text/plain; charset=utf-8`；`/*` → `Link: </llms.txt>; rel="llms-txt"` + `X-Llms-Txt` | 5 条规则 | `scripts/check-platform.mjs` |

【事实】写作约束（`agent-surface.md` §6）：每页在纯 Markdown 下语义完整；代码围栏必须带语言；单一 H1、标题不跳级；信息不靠图承载；Tabs 类必须在正文给出等价信息。

【判断】这套机器面与 Mastra 的 `.md` + `llms.txt` 形态同构，是合并站最应该“原样保留、扩展到全站”的资产。营销页、博客、资源页也应产出 `.md` twin，并汇入同一份 `/llms.txt`，而不是只服务 `/docs`。

#### 4.4 Starlight 主题与品牌 token

【事实】

- `@astrojs/starlight` 0.42.4 + `@astrojs/starlight-tailwind` + Tailwind 4；`customCss: ['./src/styles/global.css']`。
- token 仍是 v1 `--sl-*` 集：亮 accent `hsl(36,88%,33%)`（#9e630a）、暗 accent-high `hsl(38,72%,78%)`（#efd29f）；暖中性 7 级灰；系统字体栈；无 Inter。
- **组件覆盖数 = 0**；品牌观感全部由 token 层承载；`check-brand.mjs` 断言 `astro.config.mjs` 无 `components:` 键。
- 搜索 = Pagefind（Starlight 内置）；`theme-color` 双值由构建期从同一份 CSS 解析；OG 单张静态；favicon 单字形。
- 暗色 = Starlight `ThemeSelect` 默认 `auto` + 保留切换按钮；与营销站“只随 OS、无切换”不同。

【判断】文档站与营销站目前是**两套视觉真相**：

| 维度 | 营销站 v2 | 文档站 v1 |
| --- | --- | --- |
| 强调色（暗） | `#ea9f2e` | `#efd29f`（accent-high） |
| 字体 | 自托管 Inter | 系统栈 |
| 网格 / 盒式 | 12 栏 / 1px hairline / 零圆角 | Starlight 默认 |
| 代码高亮 | 三色（琥珀 / 绿 / 蓝）+ 行高亮 | Expressive Code 默认 |
| 对比度门 | 26 项 | 16 项 |
| 主题切换 | 仅 OS | 有手动切换 |

合并站必须选一个：要么 docs 换 v2 token + Inter（推荐，视觉统一），要么承认 docs 是独立子品牌（不推荐，与“单站承载”冲突）。

#### 4.5 重定向台账

【事实】`redirects.json` 只有一条：

```json
[{ "from": "/", "to": "/docs/", "code": 301, "note": "Site root is the docs landing ..." }]
```

- 构建尾 `scripts/gen-redirects.mjs` 生成 `dist/_redirects`；`--check` 幂等；四条 gate（目标可解析 / schema / 未登记即红 / 单一真相源守卫）。
- 平台尾斜杠归一（`/docs/foo` → 307 `/docs/foo/`）不进台账。

【判断】合并站把 `/` 改为营销首页后，这条 `/` → `/docs/` 必须退役；否则根路径会被 301 到文档。文档站旧 URL `/docs/**` 全部保留即可。若继续保留 `docs.oribos.dev` 子域，需要一条主机级 301 到 `oribos.dev/docs`（或反向代理），这是托管层动作，不在路径台账里。

#### 4.6 API reference 生成树

【事实】

- 249 页，10 个模块组：`@oribos/core`、`agent`、`durable-agent`、`memory`、`model`、`observability`、`schedules`、`signals`、`tools`、`workflows`。
- `api-entry/` 10 个一行 shim（根 shim `@oribos/core.d.ts`）；`typedoc.json` 的 `entryPoints` 指向这些 shim；`api-sidebar.json`（9 KB）是侧栏快照。
- `scripts/regen-api-tree.mjs` 四步：钉定 checkout → `astro sync` 生成 → 清理根 README 并打 `generated: true` → `git status` diff 门。
- 生成树入库；CI 三红一黄（errors / warnings / diff 非空 = 红；pin 落后 = 黄）。
- 无框架 checkout 的平台构建路径成立：侧栏靠 `api-sidebar.json`，正文靠入库树。
- 当前 pin：`pinned-ref.json` = `81483bd…`（2026-10-03，0.5.0 时代）；manifest version = `0.5.0`。

【判断】API 树是高质量资产，但只覆盖 core。合并站必须：

1. 把 pin 升到 0.9.0（或发布 tag）；
2. 重新生成 core 树（补 `restart`、并发工具调用、推理增量等新符号）；
3. 为 18 个能力包增加入口 shim 与生成树（至少公开表面）；
4. 把 `api-sidebar.json` 从 10 组扩到 28 组；
5. 把 `frontmatter.ts` 的 `packageValues` 从 10 个扩到 28 个（core 10 + 能力包 18）；
6. 把 `llms-manifest.json` 的 `packages` 键从 10 扩到 28。

#### 4.7 部署配置

【事实】

- `wrangler.jsonc`：Cloudflare Workers 静态资源，`assets.directory = ./dist/`，`html_handling: auto-trailing-slash`，`not_found_handling: 404-page`，无 Worker 脚本。
- `public/_headers`：5 条（`.md` MIME、`/llms.txt` MIME、`/_astro/*` immutable、站级 `Link` + `X-Llms-Txt`）。
- `redirects.json` → 构建尾生成 `dist/_redirects`。
- `dist/robots.txt` 由 `src/lib/site.ts` 渲染；`dist/sitemap-index.xml` + `sitemap-0.xml` 268 条。
- 2026-10-02 owner 决定本期不使用 Cloudflare；CF 路径挂起，迁移目标腾讯云；大陆节点需 ICP 备案。
- 零遥测：`check-telemetry` 三规则（无第三方子资源 / 无厂商特征 / 无 cookie 写入）。

【判断】`wrangler.jsonc` 与 `_headers` 是 Cloudflare 专用；迁腾讯云时不能照搬。需要一套等价的静态托管配置（COS 静态网站 / EdgeOne / CDN 缓存与 MIME 规则），并把 `_redirects` 的生成物映射到目标平台的规则格式。

#### 4.8 文档站的事实漂移（逐条）

【事实】

| 位置 | 现文 | 框架事实（0.9.0） | 影响 |
| --- | --- | --- | --- |
| `oribos-docs/src/content/docs/docs/index.mdx:3` | “Oribos is an **ultralight** TypeScript agent framework…” | 公开叙事已退役 `ultralight` / `lightweight`（ADR-0016/0017；框架 README 已改写） | 直接违反营销站 `retired-positioning` gate |
| `.../index.mdx:43,49` | 正文继续用 “ultralight” 与 “Two properties carry the ‘ultralight’ claim” | 同上 | 同上 |
| `.../index.mdx:65-66` | “**0.5.0** shipped as the previous scope's `@balsats/core`… `@oribos/*` is the scope from the next release on” | 0.5.0 已下架；`@oribos/*` 0.6 / 0.7 / 0.8 / 0.9 已发布；当前 0.9.0 | 状态块整体过期 |
| `.../get-started/installation.md:31-35` | 只列 6 个能力包；“Until `@oribos/core` ships, the install line is … `@balsats/core`” | 18 个能力包；`@oribos/core@0.9.0` 已上线；0.5.0 已下架 | **会引导读者安装不存在的包** |
| `.../get-started/installation.md:35-38` | “published 0.5.0 packages are what that installs” | 0.5.0 已 unpublished | 同上 |
| `.../guides/examples.md:3,12` | “The **five** runnable examples…” | 23 个 examples | 索引与事实不符 |
| `.../reference/import-map.md:13,18` | “ten entry points” 只覆盖 core | core 仍是 10 入口，但能力包 18 个未列 | 不假，但不完整 |
| `.../project/docs-for-agents.md:53,65` | manifest 示例 `version: "0.5.0"`；“if and when they ship” 指 skills 包 | 0.9.0；`skills/oribos/SKILL.md` 已随仓发布 | 机器契约示例过期 |
| `oribos-docs/pinned-ref.json` | `81483bd…` | 0.9.0 已发布（`77e5824` tag） | API 树停留在 0.5 时代 |
| `oribos-docs/dist/llms-manifest.json` | `version: "0.5.0"` | 0.9.0 | 机器可读面过期 |
| `oribos-docs/src/lib/site.ts` | `siteDescription = 'Documentation for Oribos, a lightweight TypeScript agent framework.'` | 公开叙事退役 `lightweight` | 站点描述与 llms.txt 摘要带旧词 |

【判断】文档站不是“有一点旧”，而是**状态块、安装路径、示例数量、能力包清单、manifest 版本五处系统性过期**。它不能作为新站的直接内容源，只能作为“已写好的叙事骨架 + 需要事实刷新的正文”。

---

### 5. `oribos-framework`（框架仓）

#### 5.1 包与导出面

【事实】`packages/` 下 20 个目录，其中 `testing` 是私有测试桩；已发布 19 个包：

| 类别 | 包 | 数量 |
| --- | --- | --- |
| 核心 | `@oribos/core`（10 个子路径：`.`、`model`、`agent`、`tools`、`observability`、`workflows`、`memory`、`signals`、`durable-agent`、`schedules`） | 1 |
| 首批能力包 | `@oribos/otlp`、`@oribos/otel-bridge`、`@oribos/mcp-server`、`@oribos/mcp-client`、`@oribos/sqlite`、`@oribos/ai-sdk`、`@oribos/croner` | 7 |
| 追赶面能力包 | `@oribos/supervisor`、`@oribos/evals`、`@oribos/rag`、`@oribos/resumable-stream`、`@oribos/model-router`、`@oribos/checkpoints`、`@oribos/distributed-signals`、`@oribos/inngest`、`@oribos/observational-memory`、`@oribos/background-tasks` | 10 |
| 叶子包 | `@oribos/semconv`（被 otlp / otel-bridge 复用） | 1 |
| 合计 | core + 18 能力包 | **19** |

【事实】`@oribos/core` 的 `package.json`：`version 0.9.0`、`dependencies` 为空、`exports` 10 项、ESM、Node ≥22.13。npm 实测 `@oribos/core@0.9.0`、`@oribos/supervisor@0.9.0`。

【事实】`lease` 包在 ADR-0020 中被描述为共享叶子包，但当前 `packages/` 目录里还没有它；实施状态应以 `ADR-0020`（未提交）与后续票为准，不应在站点上宣称它已发布。

#### 5.2 可改写的内容资产

【事实】

| 资产 | 体量 | 语言 | 可复用类 | 去向 |
| --- | --- | --- | --- | --- |
| `README.md` | 25.7 KB | 英文 | 营销 + 文档改写源 | 首页 / Framework 页 / Installation / Quickstart |
| `README.zh-CN.md` | 24.0 KB | 中文 | i18n 种子 | 未来的中文站，不进本期 |
| `CONTEXT.md` | 25.6 KB | 中文 | 内部术语真相源 | 英文 Glossary 的上游（P2） |
| `docs/architecture/*` | 8 篇，189 KB | 中文 | 文档改写源 | Concepts / Guides；**零直译** |
| `docs/adr/*` | 20 篇 | 中文 | 内部背景 | 立场吸收进“Why”段；不公开 ADR 编号 / 链接 |
| `docs/ROADMAP.md` | 94 KB | 中文 | Release status 原料 | 只载当前版本 + 版本序列 + 每版一句话；延后清单不公开 |
| `examples/*` | 23 个 | 英文 README | 文档 walkthrough / Templates | 每个 example 一页走读或一张模板卡 |
| `skills/oribos/SKILL.md` | 1 篇 | 英文 | 直接可用的 agent skill | 站点可提供下载 / 指路 |
| `packages/*/README.md` | 18 篇（core + 17 个能力包；`otel-bridge` 无 README） | 英文 | 能力包文档种子 | 每个能力包一页 overview |
| `.github/workflows/ci.yml` + `scripts/check-*` | — | — | 质量模型 | 合并站 gate 的参照，不直接复用 |

【事实】examples 的语言已英文化：`grep -P '[\x{4e00}-\x{9fff}]' examples` 命中 0；`docs/architecture` 也命中 0。文档站旧 spec 中“examples 含中文串”的 gating 已解除（框架 #81 已关）。

#### 5.3 可公开的事实基线

【事实】以下事实均可从框架仓源文件复核；括号内是建议的公开口径：

| 事实 | 值 | 来源 | 公开口径 |
| --- | --- | --- | --- |
| 当前版本 | 0.9.0 | `packages/core/package.json`；npm | 可写 |
| 已发布包数 | 19（core + 18 能力包） | README / npm | 可写（但注意“计数式表述”旧红线；新站应重新裁定） |
| core 子路径 | 10 | `packages/core/package.json` | 可写 |
| 运行时依赖 | core 0 | `package.json` | 可写 |
| Node | ≥22.13 | `package.json` engines / README | 可写 |
| 模块格式 | ESM only | `package.json` | 可写 |
| 许可 | Apache-2.0 | `LICENSE` | 可写 |
| examples | 23 | `examples/*/` | 可写 |
| 测试规模 | 1216 例 / 97 文件（0.9.0 release note） | ROADMAP | **仅内部**，不对外写数字 |
| ADR | 20 篇 | `docs/adr/` | 仅内部；不公开 ADR 面 |
| architecture | 8 篇 | `docs/architecture/` | 仅改写原料 |
| 公开叙事 | 品类语言 + 能力广度 + 零依赖事实；“lightweight / ultralight” 退为内部轴名 | ADR-0016/0017、README | 可写；但需产品侧确认 |
| Studio / 托管平台 | 框架 ROADMAP 仍列为**出域**（2026-10-11 重判） | `docs/ROADMAP.md` | **与新站“Platform / Studio 计划中”冲突，需产品侧裁定** |

【判断】框架仓是事实真相源，但不是“可直接搬上站”的文案源。它的 README 是英文、面向开发者、篇幅长；architecture / ADR / ROADMAP 是中文内部文档，必须按 docs 的改写规则（用户视角、剥离内部物、主张限于已实现面）重写。

#### 5.4 只能作内部原料的部分

【事实】以下内容不应直接出现在公开站：

- ADR 编号、路径、裁决记录、内部 issue 号；
- architecture 文档中的“砍单与承载缝”“重开条件”“实施期裁决”等内部术语；
- ROADMAP 的延后清单、重开条件、内部排期；
- 测试数、字节预算、基准数字（ADR-0001 / 0015 明确只作内部回归参考）；
- 与 Mastra 的对比、追赶叙事（公开面竞品红线，营销站 `competitor-name` gate 会红）；
- `docs/research/*` 的原文（结论已被规范吸收，站点不引用）。

---

### 6. 域名、部署与分析

【事实】

| 项 | 现状 | 证据 | 影响 |
| --- | --- | --- | --- |
| `oribos.dev` | RDAP 404 “Object not found”；`dig` 无 A/AAAA/CNAME；HTTP 无法解析 | `https://rdap.identitydigital.services/rdap/domain/oribos.dev`（2026-10-20）；`dig +short oribos.dev` | **域名未注册 / 未上线**；所有 canonical、OG、sitemap 的绝对 URL 目前指向不存在的主机 |
| `docs.oribos.dev` | 同样无 DNS / 无 HTTP | `dig +short docs.oribos.dev`；`curl` 失败 | 文档站只在本地 `dist/` 存在；线上不可达 |
| 历史文档主机 | `https://balsats-docs.balsats-docs.workers.dev`（CF 临时域） | `delivery.md` §3.4 / §13.5 | 未对外传播，无 SEO 资产；迁移时可不做 301 |
| 旧域名 | `docs.balsats.com`、`balsajs.dev`、`balsats.com` | 各 SPEC 记录；已退役 | 不应出现在新站 |
| 营销站 origin | `https://oribos.dev`，单点在 `src/lib/site.ts` | `oribos-website/src/lib/site.ts` | canonical / sitemap / robots 全由它派生 |
| 文档站 origin | `https://docs.oribos.dev`，单点在 `src/lib/site.ts` | `oribos-docs/src/lib/site.ts` | canonical / sitemap / llms / manifest / robots 全由它派生 |
| 营销站部署 | 静态 `dist/`；无 adapter；无 `.github/`、无部署配置 | `astro.config.mjs`；仓库根 | 目标腾讯云（SPEC 记录），但托管形态与节点未定 |
| 文档站部署 | `wrangler.jsonc`（CF Workers 静态资源）+ `_headers` + `_redirects` | 仓库根 / `public/` | CF 路径 2026-10-02 起挂起；迁移腾讯云需重写托管配置 |
| 大陆节点 | 需 ICP 备案；上线后 footer 需展示备案号 | `oribos-website/docs/SPEC.md` §10.1② | 影响上线时间与 footer 法务行 |
| 分析 | **零遥测**：无 GA / Plausible / Umami / PostHog / cookie | 营销 `check-telemetry`；文档 `check-telemetry`；privacy 页 | 若新增分析，必须同 PR 改 Privacy；Terms 只在出现托管服务/账号时改 |
| sitemap / robots | 营销 11 URL；文档 268 URL；文档有 `llms.txt` + `llms-manifest.json` | `dist/sitemap-0.xml`、`dist/sitemap-index.xml`、`dist/llms*` | 合并站需要统一 sitemap index 与 llms 索引 |

【判断】域名未注册是最大的非内容阻塞。新站规格可以先把 `SITE.origin` 作为单点常量（沿用两站模式），但上线前必须完成：注册 → DNS → TLS → 托管 → ICP（若大陆）→ canonical/OG/sitemap/llms 的绝对 URL 复验。否则会重演文档站“canonical 指向未解析主机”的问题（`delivery.md` §13.1b 已明确警告）。

---

### 7. 四类资产清单

> 编号说明：`A` = 可直接复用；`B` = 需改写；`C` = 应退役；`D` = 缺失。每条都给出源路径，供后续票直接引用。

#### 7.1 A · 可直接复用 / 可直接作为输入

表内 A-18、A-20、A-27 是内容源：搬的是骨架与正文，事实刷新见 B 类。

| 编号 | 资产 | 来源 | 为什么可直接用 | 迁移注意 |
| --- | --- | --- | --- | --- |
| A-01 | 营销站 v2 token 层 | `oribos-website/src/styles/global.css` | 13 色角色 + 8 字阶 + 网格 + 盒式 + focus + 暗色，已是成品 | 合并站作为唯一 token 源；docs 必须跟 |
| A-02 | 自托管 Inter 可变字重 | `oribos-website/public/fonts/inter-latin-wght-normal.woff2` + `inter-OFL.txt` | 48 KB latin 子集，OFL 1.1 | 保留 `@font-face` + preload |
| A-03 | favicon / OG / theme-color 资产 | `oribos-website/public/favicon*`、`og.png`、`scripts/make-og.mjs` | 四件套 + 单张 1200×630 | OG 文案若改 tagline 需重生成 |
| A-04 | 布局原语 | `global.css` 的 `.wrap` / `.cols` / `.box` / `.btn` / `.astro-code` | 1200px / 12 栏 / hairline / 代码面 | 直接搬 |
| A-05 | Shiki 双主题 + 行高亮 | `src/lib/shiki-theme.ts`、`shiki-css.ts`、`highlight-lines.ts` | 三色语法 + 行高亮，与 token 同源 | 直接搬 |
| A-06 | Hero 组件 | `src/components/Hero.astro` | 两栏 + 产品窗 + 代码/trace tab + copy | 直接搬 |
| A-07 | CodeTabs | `src/components/CodeTabs.astro` | 文件 tab + copy + Shiki | 直接搬 |
| A-08 | FeatureTabs | `src/components/FeatureTabs.astro` | 5 tab + hash 直达 + 无 JS 降级 | 直接搬；内容另刷 |
| A-09 | TraceWaterfall + 真实 trace 数据 | `src/components/TraceWaterfall.astro` + `content/traces/hero.json` | 真实 run 截取、7 行、两处复用 | 直接搬 |
| A-10 | 宿主界面 mock 四件 | `src/components/mocks/*` | 聊天 / 审批 / trace / 窗框，通用无第三方名 | 直接搬 |
| A-11 | FactsBand | `src/components/FactsBand.astro` + `content/facts/*.json` | 4 条架构事实仍成立 | 直接搬 |
| A-12 | FaqList | `src/components/FaqList.astro` | `<details>` 语义列表 | 直接搬；内容另刷 |
| A-13 | FinalCta | `src/components/FinalCta.astro` | 首页 / 用例 / 关键词共用 | 直接搬；文案另刷 |
| A-14 | AgentPromptCta | `src/components/AgentPromptCta.astro` + `content/agent-prompt/default.json` | 隐藏 payload chip，行为完整 | payload 更新到 0.9；README 指针可改 docs |
| A-15 | UseCaseCards / 场景卡骨架 | `src/components/UseCaseCards.astro` + `UseCaseLayout.astro` | 3 卡 + 3 场景卡 + 包名 chip | 可升级为 Solutions 模板 |
| A-16 | About / legal 内容 + SegmentText | `src/content/about/default.json`、`legal-pages/*`、`SegmentText.astro` | 逐字锁定、链接 key 化 | 只改“未来子项目”与日期 |
| A-17 | 营销内容集合 schema | `src/content.config.ts` | 16 集合、Zod 校验、字段齐全 | 直接作为新站 marketing collections 的底稿 |
| A-18 | 4 个关键词页内容 | `src/content/keyword-pages/*.json` | H1 / 引言 / 3–4 论证卡 / 6 FAQ / Learn more | 事实刷新到 0.9；RAG/evals 可写 |
| A-19 | 营销 22 道 gate 的骨架 | `oribos-website/scripts/check-*.mjs` + `src/lib/*-rules.ts` | 内容 / 视觉 / 结构三层门禁 | 规则要重写（见 B-23） |
| A-20 | 文档站 19 手写页 | `oribos-docs/src/content/docs/docs/**` | 叙事骨架完整、英文、逐字质量高 | 迁移+事实刷新；不要重写 |
| A-21 | 文档 frontmatter schema | `src/content.config.ts` + `src/lib/frontmatter.ts` | `title/description/project/subtype/order/packages/source` 七字段 | 扩 `packageValues` 到 28 |
| A-22 | agent 面三件套 | `src/lib/agent-surface.ts`、`scripts/gen-agent-surface.mjs`、`scripts/check-agent-surface.mjs` | twin / llms / manifest 全自动 | 扩到全站；manifest 扩到 28 |
| A-23 | API 生成树管线 | `scripts/regen-api-tree.mjs`、`api-entry/`、`typedoc.json`、`api-sidebar.json` | 249 页、diff 门、无框架构建路径 | 升 pin + 扩能力包树 |
| A-24 | 重定向台账机制 | `redirects.json` + `gen-redirects.mjs` + `check-ledger.mjs` | 单一真相源 + 四条 gate | 合并站继承；删 `/`→`/docs/` |
| A-25 | Pagefind 搜索 | Starlight 内置 + `dist/pagefind/**` | 纯静态、零 SaaS | 合并站扩展索引范围 |
| A-26 | 文档写作约束 | `docs/spec/agent-surface.md` §6 | 纯 Markdown 语义完整四条 | 直接作为全站写作规范 |
| A-27 | 框架 README 的 quick start / Why / package surface | `oribos-framework/README.md` | 英文、事实最新、代码可跑 | 改写成站面文案，不整段搬 |
| A-28 | 23 个 examples | `oribos-framework/examples/*` | 英文 README、可运行、自断言 | 一页走读或模板卡 |
| A-29 | `skills/oribos/SKILL.md` | `oribos-framework/skills/oribos/SKILL.md` | 面向 coding agent 的现成 skill | 站点提供指路 / 下载 |
| A-30 | 框架 CI 的检查思路 | `.github/workflows/ci.yml`、`scripts/check-*` | 零依赖 / 导出面 / 字节预算 | 只作参照，不直接复制 |

#### 7.2 B · 需改写

| 编号 | 位置 | 现内容 | 为什么要改 | 改成什么 |
| --- | --- | --- | --- | --- |
| B-01 | `oribos-website/src/lib/version.ts:14` | `VERSION = '0.6.0'` | npm 已 0.9.0 | 单一常量升到 `0.9.0` |
| B-02 | `oribos-website/src/content/faq/rag-or-evals.json:4` | “No — neither is built in…” | `@oribos/rag`（0.8）、`@oribos/evals`（0.7）已发布 | 改为“通过能力包提供”；写清包名与用法 |
| B-03 | `.../faq/on-npm.json:4` | “Yes — Oribos is on npm…” | 没写版本 / 包数；0.6 已旧 | 改为 0.9.0 + 19 包 + `@oribos/*` |
| B-04 | `.../faq/mcp.json:4` | “Both ship with the first release.” | 口径过时；现在是 18 个能力包 | 改为“当前 0.9 全部可用；MCP 只是其中两个包” |
| B-05 | `.../features/*.json`（5 tab） | 只有 Agents / Workflows / Harness / Memory / MCP | 缺 supervisor / evals / RAG / checkpoints 等能力面 | 保留 5 tab，另加“Capability packages”带或第 6 tab；不要塞进现有 tab |
| B-06 | `.../use-cases/*.json`（9 场景卡） | 包名只到 core / sqlite / mcp / croner | 能力包已扩到 18 | 场景卡补 `rag` / `evals` / `supervisor` / `checkpoints` / `resumable-stream` 等 |
| B-07 | `.../keyword-pages/*.json` | 0.6 时代的能力枚举 | 缺 RAG / evals / 18 包 | 重写论证卡的“能力广度”；保留 H1 / 结构 / Learn more |
| B-08 | `.../about/default.json` | “The framework came first, the documentation site is next, and future subprojects live alongside them” | docs 已存在；Platform/Studio/Agent Builder 计划中 | 改为“framework → docs → platform products in development”并加状态限定 |
| B-09 | `.../resources/default.json` | 3 个链接：Docs / Examples / Architecture | 新站需要 Resources hub | 换成 Resources 3 卡组 / hub 入口；Architecture 可降为资源之一 |
| B-10 | `oribos-website/src/lib/links.ts` | `docs` 仍指 GitHub 仓库 | 文档站已存在（本地构建） | 切换为 `https://docs.oribos.dev`（域名上线后）或合并站 `/docs` |
| B-11 | `oribos-website/src/lib/links.ts` | `learnMoreLinks.pre` 仍指 GitHub / README 锚 | 关键词页 Learn more 应进 docs | 切到 `post` 值（docs 深链） |
| B-12 | `oribos-website/public/llms.txt` | 11 条营销页的扁平清单 | 合并站需要一份全站索引 | 改为构建期生成的 `/llms.txt`（marketing + blog + docs） |
| B-13 | `oribos-docs/src/content/docs/docs/index.mdx` | “ultralight” + 0.5.0 状态块 | 定位词退役；版本过期 | 改品类语言 + 0.9.0 状态；删除 “ultralight” |
| B-14 | `.../get-started/installation.md` | 6 个能力包 + “until @oribos/core ships” + 0.5.0 | 0.9.0 已上线；0.5.0 已下架 | 重写为 0.9.0 / 19 包 / 无 scope window |
| B-15 | `.../guides/examples.md` | “five runnable examples” | 23 个 examples | 改为 23 个的索引表；每行标题 + 一句 + 源码链接 |
| B-16 | `.../reference/import-map.md` | 只列 core 10 入口 | 18 个能力包无入口 | 加“Capability packages”表；每包一行 |
| B-17 | `.../concepts/*` | 9 页只覆盖 core | 缺 RAG / evals / supervisor / checkpoints / resumable-stream / background-tasks / distributed-signals / inngest / model-router / observational-memory / otel-bridge / time-travel | 新增 8–12 页；或先做“Capability packages overview”一页 + 分包页 |
| B-18 | `.../project/docs-for-agents.md` | manifest 示例 0.5.0；“if and when they ship” | 0.9.0；skills 已发布 | 更新示例与分工描述 |
| B-19 | `oribos-docs/src/styles/global.css` | v1 `--sl-*` + 系统字体 | 与营销 v2 分叉 | 换成 v2 token + Inter；保留 Starlight 派生槽 |
| B-20 | `oribos-docs/src/lib/site.ts` | “a lightweight TypeScript agent framework” | 定位词退役 | 改为品类语言 |
| B-21 | `oribos-docs` API 树 | pin 0.5.0；只 core | 0.9.0；18 能力包 | 升 pin、重生成、扩树、扩 sidebar |
| B-22 | `oribos-docs/src/lib/frontmatter.ts` | `packageValues` 10 个 | 18 个能力包未进值域 | 扩到 28；与 exports 对账 |
| B-23 | `oribos-website/src/lib/copy-rules.ts` | `rag-evals` 禁止关键词页出现 RAG/evals | 现在是真能力 | 删除该规则；保留竞品 / 数字 / 旧名红线 |
| B-24 | `oribos-docs` 的 `docs-for-agents` 页 | 独立 Project 页 | 合并站需要全站 agent 面说明 | 可保留并扩为 `/docs/project/docs-for-agents`，或并入新站的 `/llms.txt` 说明页 |
| B-25 | `oribos-website` 的 `publicTagline` | “The TypeScript agent framework: agents, workflows, memory, and durable execution…” | 仍准确，但缺少能力包广度 | 保留主句，可在 about / OG 加第二句能力包；不要改成计数式 |

#### 7.3 C · 应退役

| 编号 | 资产 | 来源 | 退役原因 |
| --- | --- | --- | --- |
| C-01 | `SPEC.md` v1 | `oribos-website/docs/SPEC.md` | 已被 `SPEC-revamp.md` 取代；不要再作为施工依据 |
| C-02 | `SPEC-revamp.md` 作为施工依据 | `oribos-website/docs/SPEC-revamp.md` | 新站规格落地后退役；§2 视觉部分可作为参考保留 |
| C-03 | 双站架构（两个 Astro 应用、两套 token） | `oribos-website` + `oribos-docs` | 与“单站承载营销 + 资源/博客 + 文档”冲突 |
| C-04 | 文档站 v1 `--sl-*` token 集 | `oribos-docs/src/styles/global.css` | 与营销 v2 分叉；合并后只保留一套 |
| C-05 | 文档站 Cloudflare 配置 | `oribos-docs/wrangler.jsonc`、`public/_headers` | CF 路径挂起；迁移腾讯云需重写 |
| C-06 | 营销站扁平 `llms.txt` | `oribos-website/public/llms.txt` | 只列 11 个营销页；合并站需要全站索引 |
| C-07 | `links.docs` 的 GitHub 回退 | `oribos-website/src/lib/links.ts` | 文档站已存在；保留回退会造成“Docs 指向 README” |
| C-08 | `learnMoreLinks.pre` 的 GitHub / README 锚 | 同上 | 同上；切到 docs 深链 |
| C-09 | `coming soon` pill | `oribos-website` 旧代码 / SPEC v1 | 已在 revamp 退役；不要复活 |
| C-10 | Social proof 占位带 | `SPEC.md` §3.4 | 已在 revamp 废止；无客户案例 |
| C-11 | `Copy quick start` 次 CTA | `SPEC.md` §6.1 | 已由 agent prompt chip 取代 |
| C-12 | `ultralight` / `lightweight` 公开文案 | `oribos-docs` index / site.ts；框架 README 已改 | 公开叙事退役（ADR-0016/0017） |
| C-13 | 品牌原型目录 | `oribos-website/prototype/brand-direction/` | throwaway，不得折进真站 |
| C-14 | `/` → `/docs/` 台账条目 | `oribos-docs/redirects.json` | 合并站 `/` 是营销首页，不能 301 到 docs |
| C-15 | MCP Registry 独立产品页 | 无源文件（Mastra 有 `/mcp-registry`） | 产品口径：做但无独立产品页；不要照搬 Mastra |
| C-16 | AI Gateway 页 | 无源文件（Mastra 有 `/ai-gateway`） | 产品口径：不做 |
| C-17 | Mastra 的 Customers / Careers / Contact / Newsletter / Hackathon / DPA 模板 | 无源文件 | Oribos 无团队 / 无客户案例 / 无 email 收集；不要照搬。Pricing 另见 D-22（当前无定价面） |
| C-18 | 旧域名 / 旧仓库名 / 旧 scope | 两站旧文案 / SPEC | 已退役；CI gate 已禁 |
| C-19 | “五个 examples”的框架 | `oribos-docs/src/content/docs/docs/guides/examples.md` | 23 个 examples；保留页面，换框架 |
| C-20 | `brand-visual.md` 的“token 真相源 = docs”条款 | `oribos-docs/docs/spec/brand-visual.md` §3.4 / §2.2 | 已被营销 SPEC-revamp §2.9 终止；合并站应单点 token |

#### 7.4 D · 缺失

| 编号 | 缺口 | Mastra 对照 | 依赖 / 备注 |
| --- | --- | --- | --- |
| D-01 | 博客引擎与文章模板 | `/blog` 274 篇 | 新 Astro content collection + 列表/详情/分页 |
| D-02 | 博客分类 | 9 个分类 URL | 先做 3–4 个：announcements / engineering / guides / changelog |
| D-03 | 作者页 / byline | 28 个作者页 | Oribos 只有 `@0xnicholas`；可做单作者页或只留 byline |
| D-04 | RSS / feed | Mastra 未在 `/blog/rss.xml`、`/rss.xml`、`/blog/feed.xml` 提供（2026-10-20 探测 404） | 新站若要 RSS 是新增能力，不是照搬；建议做 `/blog/rss.xml` |
| D-05 | 逐篇 OG | 未逐页验证 Mastra 的 OG 形态 | 可先共用静态 OG，P2 再做逐篇 |
| D-06 | Resources hub | `/resources` | 建议先做 Blog / Guides / Examples / Changelog 四入口 |
| D-07 | Articles（长文/SEO） | 82 篇 | 4 个关键词页可作种子，但不够 |
| D-08 | Templates | `/templates` | 23 个 examples 可转成模板卡 |
| D-09 | Research（公开） | `/research` | 框架 `docs/research` 仅内部；需重写或不做 |
| D-10 | Learn / 课程 | `/learn` + 2 门课 | 可从 docs guides 起；课程是重资产，P2 |
| D-11 | Books / Podcast / Workshops | 2 本书 + 播客 + 工作坊 | 无素材；不建议首发做 |
| D-12 | Sales agents 解决方案页 | `/sales-agents` | 需角色场景 + 能力包映射 |
| D-13 | Marketing agents 解决方案页 | `/marketing-agents` | 同上 |
| D-14 | Company Brain 解决方案页 | `/company-brain` | 同上；概念较抽象 |
| D-15 | Financial Services 行业页 | `/financial-services` | 需行业合规审慎 |
| D-16 | Healthcare 行业页 | `/healthcare` | 需行业合规审慎 |
| D-17 | Real-world agents 页 | `/real-world-agents` | 可用 `/operations-agents` 近似；是否改名待 IA 票 |
| D-18 | Platform 产品页 | `/factory` / `/ai-agent-deployment` / `/platform-observability` | **无内容原料**；需产品事实卡 |
| D-19 | Studio 产品页 | `/studio` | **无内容原料**；框架 ROADMAP 仍出域 |
| D-20 | Agent Builder 产品页 | `/agent-builder` | **无内容原料** |
| D-21 | MCP Registry 页 | `/mcp-registry`、`/mcp-registry-registry` | 产品口径：做但无独立页；建议 docs / resources 承载 |
| D-22 | Pricing 页 | `/pricing` | 框架免费；Platform 若收费再定 |
| D-23 | Changelog / Releases 页 | `/blog/category/changelogs` + Developers/Changelog | 可从 GitHub Releases 生成（源 = `oribos-framework` Releases）；不要手写双份 |
| D-24 | 英文 Glossary | `/reference` 下有术语面 | 文档 spec P2；`CONTEXT.md` 是上游 |
| D-25 | 18 个能力包文档页 | `/docs/...` | 源 = `packages/*/README.md`（18 篇）；每包至少一页 overview + 安装 + 示例 + API 链接 |
| D-26 | 19 个 example walkthrough | `/learn` + docs guides | 源 = `examples/*/README.md`（23 个）；现有 4 个（minimal-agent / durable-approval / signals-desk / examples 索引） |
| D-27 | 新能力概念页 | docs 的 Agents / Workflows / Harness / Memory / Evals / RAG | 源 = `docs/architecture/*` + `CONTEXT.md`；缺 RAG / evals / supervisor / checkpoints / resumable-stream / background-tasks / distributed-signals / inngest / model-router / observational-memory / otel-bridge / time-travel |
| D-28 | 部署文档 | `/docs/deployment` | 源 = `docs/architecture/harness.md` 运行时立场 + `delivery.md` 部署 spec；需腾讯云配方 |
| D-29 | Release status 页 | `/docs/project/releases` | 源 = `docs/ROADMAP.md` + GitHub Releases；文档树预留但未建 |
| D-30 | Contributing 页 | `/docs/project/contributing` | 文档树预留但未建 |
| D-31 | 域名 / DNS / TLS / 托管 / ICP | — | **硬阻塞**；`oribos.dev` 未注册 |
| D-32 | 分析决策 | — | 零遥测现状；若加分析需改 Privacy |
| D-33 | i18n（中文） | — | `README.zh-CN.md` 可作种子；本期英文优先 |
| D-34 | 客户案例 / logo 墙 | `/customers` 31 篇 | Oribos 无客户案例；**不要伪造**；有真实故事再做 |
| D-35 | 产品截图 / 架构图 | — | Studio / Platform 无实物；营销站只有 mock |
| D-36 | 作者头像 / 团队照片 | 28 个作者页 | 维护者署名只到 GitHub handle；不要照片 |
| D-37 | 全站搜索（营销 + 博客 + 资源） | — | 文档站 Pagefind 只覆盖 docs；需扩索引/加搜索 UI |
| D-38 | 旧站 URL 重定向 | — | 合并站需处理 `/`、docs 子域、可能的 solutions 改名 |

---

### 8. 迁移初判

#### 8.1 形态选择

【判断】三种可行形态：

| 方案 | 形态 | 优点 | 代价 | 建议 |
| --- | --- | --- | --- | --- |
| A | **单 Astro app**：Starlight 占 `/docs/**`，营销 / 博客 / 资源为普通 Astro 页面；共享 `global.css` token 层 | 一次构建、一个 sitemap、一个 llms 索引、一套 token；与两站现有工具链完全兼容 | Starlight 壳与营销壳不同；docs 的 header/footer 要么接受独立，要么做 1–2 个覆盖；Pagefind 需覆盖 blog | **推荐**，先接受 docs 独立壳 |
| B | **两个 app 同一域**：营销 `/`，docs `/docs` 反代 / 子域 | docs 零改造；风险最低 | 两个构建、两个 sitemap、两套 token、两个搜索；与“单站”目标只到 URL 层 | 备选；若上线时间优先 |
| C | **单 repo 双构建**：营销与 docs 各自 build，产物合并到同一 `dist/` | 保留两套代码结构；可共享 token | 部署与路由复杂；sitemap/llms 需合并；预览困难 | 不推荐 |

【事实】两站版本完全对齐：`astro 7.3.5`、`tailwindcss 4.3.3`、`@tailwindcss/vite 4.3.3`、`pnpm 10.33.2`、Node `>=22.12.0`；文档站多 `@astrojs/starlight 0.42.4` + `starlight-dot-md 0.2.1` + `starlight-typedoc 0.23.1`。合并不会引入新的运行时版本冲突。

【判断】推荐 A 的具体结构：

```text
src/
  pages/                    营销 / 博客 / 资源 / 法务（普通 Astro）
  content/
    docs/docs/**            Starlight docs collection（保留 /docs URL）
    marketing/**            现有 16 集合（hero / features / faq / ...）
    blog/**                 新博客集合
    resources/**            新资源集合
    solutions/**            新解决方案集合
  components/               营销组件（Header / Hero / FeatureTabs / ...）
  layouts/                  MarketingLayout / BlogLayout / Docs（Starlight）
  styles/global.css         唯一 token 层（v2 + Inter）
```

需要 IA 票先拍的 6 个决策：

1. docs 是否复用营销 Header/Footer？若复用，需要覆盖 Starlight `Header`/`Footer`（打破当前“0 覆盖”登记）；若不复用，接受 docs 独立壳，只统一 token/字体。
2. docs 是否保留手动主题切换？营销站只有 OS；docs 有 `ThemeSelect`。建议 docs 保留（可访问性），但在新站规格中登记为 docs 专属。
3. `/docs` 是路径还是子域？建议主站路径 `oribos.dev/docs`，`docs.oribos.dev` 做 301 或反代；canonical 只能有一个。
4. Solutions 是否改用 Mastra 式 slug（`/customer-facing-agents` 等）？若改，旧 3 个 URL 做 301；若不改，保留 `/in-product-agents` 等，新增页用 Mastra 式命名。
5. 计划中产品（Platform / Studio / Agent Builder）是建 `planned` 状态页，还是只做 `/roadmap` 一页？建议先做 `/roadmap` + 产品卡，不建空产品页；状态词用 `planned` / `in development`，不用已退役的 `coming soon`。
6. MCP Registry 放哪？建议 docs / resources，不建独立产品页（与产品口径一致）。

#### 8.2 迁移批次

【判断】

| 批次 | 任务 | 输入 | 完成判据 |
| --- | --- | --- | --- |
| P0 · 事实刷新 | 建立单一 `facts/claims` 模块；VERSION 升 0.9.0；RAG/evals 改写；18 包 / 23 examples / 0.9.0 状态；删除 `ultralight` / `lightweight` | 框架 README / npm / CONTEXT | `grep` 无 0.5/0.6/ultralight；FAQ 不再否认 RAG/evals；install 不再指 0.5.0 |
| P0 · 单站骨架 | 新建 Astro app；搬 v2 token / Inter / 布局原语 / Hero / CodeTabs / FeatureTabs / FaqList / FinalCta / mocks；搬 11 页 + 404 | 营销站源码 | 11 页 + 404 在新站可构建；视觉走查通过 |
| P0 · docs 迁移 | 搬 docs collection + Starlight；保留 `/docs/**`；按 B-13–B-20 刷新 19 页事实（0.9.0 / 18 包 / 23 examples / 去 ultralight）；升 pin 到 0.9.0；重生成 core API 树 | 文档站源码 + 框架 0.9.0 | 19 页 + 249 API 页可构建；`/docs` 与 `.md` twin 正常；无旧版本 / 旧定位词 |
| P0 · URL / sitemap / llms | 合并重定向台账；删 `/`→`/docs/`；生成统一 sitemap / robots / llms；决定 docs 子域 | 两站配置 | 营销 11 URL + docs 268 URL 全部 200；sitemap 268+11；llms 索引覆盖全站 |
| P1 · 文档扩展 | 18 能力包页；23 examples 索引；8–12 个新概念页；glossary；release status；deployment；contributing | 框架 README / architecture / examples | 能力包全部有页；examples 全部可查；manifest 28 键 |
| P1 · 博客 / 资源 | 博客引擎 + 3–5 篇种子；分类 / 作者 / RSS / OG；Resources hub；Templates | 框架发布记录 / docs 内容 | `/blog` 可列表/详情；RSS 可读；3 篇以上真实文章 |
| P1 · Solutions | 现有 3 页 + 5 个新角色/行业页；统一模板 | 产品/行业输入 | 8 个 Solutions 槽位有页或明确不建 |
| P1 · 产品占位 | `/roadmap` + Platform / Studio / Agent Builder 产品卡；不建空页 | 产品事实卡 | 状态、能力、可用性三栏可核 |
| P2 · 上线 | 域名注册 / DNS / TLS / 腾讯云托管 / ICP；canonical/OG 复验；分析决策 | 人工 + 托管 | 域名可解析、TLS 有效、canonical 正确 |
| P2 · 深化 | 逐篇 OG；i18n zh；客户故事；全站搜索 | — | 按需 |

#### 8.3 模板字段（提案）

【判断】以下字段以现有 schema 为底稿；标“新”的是建议新增，需 IA / 规格票确认。

| 页面类型 | 字段 | 来源 / 说明 |
| --- | --- | --- |
| 首页 | 现有 `hero` / `facts` / `features` / `observability` / `useCaseIntro` / `useCases` / `resources` / `faq` / `finalCta` / `agentPrompt` | 直接沿用 |
| 关键词页 | `title` / `description` / `h1` / `intro` / `sections[3–4]` / `learnMore` / `faq[6]` / `backAnchor` | 直接沿用 |
| 用例 / 解决方案页 | `title` / `claim` / `route` / `mock` / `page{tagline, scenarios[3]{name,text,packages[]}}`；**新** `solutionType`（role / industry）、`status`（live / planned）、`heroMock` | 现有 `useCases` 扩展 |
| 博客文章（新） | `title`、`description`、`date`、`author`（handle）、`category`、`tags[]`、`draft`、`ogImage`、`canonical`、`hero`、`related[]`、`readingTime`（派生） | 参考 Mastra 博客；作者只到 handle |
| 资源（新） | `title`、`description`、`type`（article / template / research / book / podcast / workshop）、`url` 或 `body`、`author`、`date`、`tags[]`、`featured` | 先做 article / template / research |
| 产品页（新） | `name`、`status`（planned / beta / ga）、`summary`、`capabilities[]`、`availability`、`cta`、`docsLink`、`screenshot` | 计划中产品必须有 `status`，不得写成已可用 |
| 文档页 | 现有 `title` / `description` / `project` / `subtype` / `order` / `packages` / `source`；**新** `reviewed`（最近事实复核日期） | 建议加 freshness 字段 |
| 作者（新） | `handle`、`displayName`、`avatar`、`bio`、`links` | 只做 `@0xnicholas` 也可 |
| Release（新） | `version`、`date`、`packages[]`、`highlights[]`、`breaking`、`links` | 从 GitHub Releases 生成，避免双写 |
| 法务 | 现有 `title` / `description` / `h1` / `paragraphs[]` + `lastUpdated` | 分析/托管变化时同 PR 更新 |

#### 8.4 URL / 重定向初判

【判断】

| 旧 URL / 主机 | 新 URL | 动作 |
| --- | --- | --- |
| `oribos.dev/` | `oribos.dev/` | 保持；营销首页 |
| `docs.oribos.dev/docs/**`（或旧 docs 主机） | `oribos.dev/docs/**` | 选一个 canonical；另一个 301 / 反代 |
| `/docs/**` | 同路径 | 全部保留；`/docs/reference/api/**` 深度不变 |
| `/` → `/docs/` | 删除 | 合并站 `/` 是营销；不能 301 |
| `/in-product-agents/` | 同路径或 `/solutions/customer-facing-agents/` | 若改名，301 |
| `/operations-agents/` | 同路径或 `/solutions/real-world-agents/` | 若改名，301 |
| `/developer-infrastructure/` | 同路径或 `/solutions/developer-infrastructure/` | 若改名，301 |
| `/ai-agent-framework/` 等 4 页 | 同路径 | 保留 SEO 资产 |
| `/about/`、两法务页 | 同路径 | 保留 |
| 新 `/blog`、`/resources`、`/solutions`、`/product` | 新增 | 新页面 |
| 旧 `balsats-docs.*.workers.dev` | `oribos.dev/docs` | 未公开传播，可不做；若做，301 |
| 旧 `docs.balsats.com`、`balsajs.dev` | `oribos.dev/docs` | 未上线，记录即可 |

【判断】重定向台账应继续用 `redirects.json` 作为唯一真相源；主机级跳转（子域 → 路径）不进台账，写在托管配置里。合并站上线前，CI 必须验证：旧页面集合 − 新页面集合 ⊆ 台账 `from` 集合。

#### 8.5 验收项（可直接进 checklist）

【判断】

**内容事实**
- [ ] `npm view @oribos/core version` = `0.9.0`；站点所有版本字面与它一致。
- [ ] 全站无 `0.5.0` / `0.6.0` 作为“当前版本”。
- [ ] 全站无 `ultralight` / `lightweight`（公开面）。
- [ ] FAQ 不再写 “RAG/evals not built in”；至少给出 `@oribos/rag` / `@oribos/evals` 的入口。
- [ ] 18 个能力包在 Import map / docs / manifest 中全部出现。
- [ ] 23 个 examples 在 docs / resources 中全部可查。
- [ ] 安装命令只使用 `@oribos/*`；无 `@balsats/*`、无已下架 0.5.0。
- [ ] 无竞品名；无伪造客户 / logo / 数字。

**结构 / 链接**
- [ ] 营销 11 个 URL + 404 全部 200；`/` 不再 301 到 `/docs/`。
- [ ] 文档 268 个 URL 全部 200；`/docs/**` 不变。
- [ ] 每个 docs 页面有 `<route>.md` twin；每个 twin 可 200。
- [ ] 每个渲染页（含博客 / 资源）有 `rel="alternate" type="text/markdown"`。
- [ ] `/llms.txt` 的链接集合 == 页面集合；`/llms-manifest.json` 的 `packages` 键 == 28。
- [ ] sitemap 包含营销 + docs + blog + resources；不含 `.md` / 404 / 站根跳板。
- [ ] 重定向台账覆盖所有被删/改 URL；`check-ledger` 绿。
- [ ] 站内链接零断链；锚点可解析。

**视觉 / 可访问性**
- [ ] 合并站 token 值 == v2 表；docs 与营销同源。
- [ ] 亮/暗 × 桌面/移动走查；26 项对比度门绿。
- [ ] focus 可见；键盘可达；`prefers-reduced-motion` 正常。
- [ ] 零第三方子资源；无 cookie；无 analytics（或按决策更新 Privacy）。
- [ ] 无 CLS；字体 swap 正常。

**机器面 / 运维**
- [ ] `pnpm verify` 全绿（营销 + docs 合并后的 gate）。
- [ ] `pnpm verify:api` 绿：API 树 == 0.9.0 重生成。
- [ ] `check-agent-surface` 五条断言绿。
- [ ] 目标平台的头 / 重定向 / 缓存规则有等价 gate（现有 `check-platform` 是 Cloudflare 专用，需按腾讯云重写）。
- [ ] 域名可解析；TLS 有效；`https://oribos.dev/` 与 `/docs/` 200。
- [ ] canonical / `og:url` / sitemap / robots 全部指向正式域。
- [ ] ICP 备案号（若大陆节点）已进 footer 法务行。

---

## 对 Oribos 的启示

1. **新站最值钱的资产不是营销文案，而是文档站的机器面。** 268 页 `.md` twin、`/llms.txt`、`/llms-manifest.json`、249 页 API 树、重定向台账、15 道 gate——这套东西是 Mastra 也在做的“agent 可读文档”形态，且 Oribos 已经跑通。合并站应把它升级为**全站**能力（博客 / 资源 / 营销页也有 `.md` 与索引），而不是缩回 `/docs`。

2. **品牌真相源已经分叉，合并的第一件事是统一 token。** 营销站 v2（Inter + Swiss 盒式 + `#ea9f2e` 暗色）是唯一现行视觉真相；文档站仍是 v1（系统字体 + `#efd29f` + 16 项审计）。如果先搬页面不统一 token，会得到“营销站换了皮、文档站还是旧站”的分裂观感。

3. **事实债是最大的上线风险，不是设计债。** 三条硬伤：营销版本 0.6.0 vs npm 0.9.0；营销 FAQ 否认 RAG/evals（已发布）；文档 Installation 让读者安装已下架的 0.5.0。任何“先迁页面、后改文案”的顺序都会把假话带上线。**先做事实刷新，再做视觉迁移。**

4. **Mastra IA 的本质是“产品矩阵 + 解决方案矩阵 + 内容引擎”。** Oribos 目前只有“框架 + 3 用例 + 4 关键词页”。缺的不是 30 个页面，而是三类内容的所有权：产品页（Platform/Studio/Agent Builder）、解决方案页（8 个角色/行业）、资源页（博客/文章/模板/研究）。这三类需要不同的生产流程与负责人，不能靠一次迁移补齐。

5. **计划中产品没有内容原料，且与框架路线图冲突。** 框架 ROADMAP 仍把 Studio / 托管平台列为出域（2026-10-11 重判），而新站计划把 Platform / Studio / Agent Builder 作为“计划中”产品。需要产品侧先给事实卡（能力、状态、可用性、与 Framework 的关系），否则页面只能写空话。**不要用框架文档冒充产品文档。**

6. **MCP Registry 在三个仓库中没有内容资产。** 现有只有 `@oribos/mcp-server` / `@oribos/mcp-client` 两个能力包；没有 registry 产品页、没有 registry 文档、没有截图。若它确实已做，需要单独的内容源；若没有独立产品页，建议在 docs / resources 承载，不要照搬 Mastra 的 `/mcp-registry` 双子页。

7. **博客不是“加一个 `/blog` 路由”，而是一套内容引擎。** 需要：文章模板、分类法、作者模型、RSS、逐篇 OG、列表/分页、搜索、草稿/发布流程、旧文迁移。Oribos 的作者只有 `@0xnicholas`，可以先做单作者 + 3–4 个分类，不要复制 Mastra 的 28 个作者页与 9 个分类。

8. **文档 IA 要从“core 概念”扩到“能力包 + 示例 + 运维”。** 现有 9 个 concepts 只覆盖 core；18 个能力包、23 个 examples、time-travel、RAG、evals、supervisor、checkpoints、resumable-stream、background-tasks、distributed-signals、inngest、model-router、observational-memory、otel-bridge 都没有页。Mastra 的 963 个 docs URL 不可照搬，但“Build / Operate / Reference / Learn”的分组法可以借用。

9. **质量门是护城河，但必须重写 claims 规则。** 营销 22 道 + 文档 15 道 gate 是现成的骨架；但 `rag-evals` 规则会把真话判红，`retired-positioning` 与 docs 的 `lightweight` 文案冲突，`counting-figure` 会把部分计数式表述判红（例如 `eighteen capability packages`）。合并站需要一份新的 claims 政策：**允许能力枚举与版本事实，禁止体积/测试/用户数等营销数字，禁止竞品名，禁止伪造客户。**

10. **域名/托管是唯一不能靠写代码解决的阻塞。** `oribos.dev` 未注册、无 DNS、无 TLS；文档站的 CF 配置已挂起，腾讯云托管与 ICP 未定。新站规格可以先把 origin 作为单点常量，但上线前必须完成注册 → DNS → TLS → 托管 → ICP → canonical/OG/sitemap/llms 复验；否则会重演“canonical 指向未解析主机”。

---

## 来源清单

### 本地源文件（一手）

| 来源 | 路径 | 用途 |
| --- | --- | --- |
| 新站目标仓 | `oribos-www/`（`LICENSE` 已跟踪；`AGENTS.md`、`docs/` 未跟踪） | 目标仓现状 |
| 营销站 SPEC v1 | `oribos-website/docs/SPEC.md` | 历史页面 / 红线 / 域名 / 部署 |
| 营销站 SPEC v2 | `oribos-website/docs/SPEC-revamp.md` | token / 9 区 / CTA / 视觉 |
| 营销站术语 | `oribos-website/CONTEXT.md` | 用例页 / 场景卡 / 关键词页 / FAQ |
| 营销站内容 schema | `oribos-website/src/content.config.ts` | 16 集合字段 |
| 营销站内容 | `oribos-website/src/content/**/*.json` | 9 FAQ / 5 features / 3 use cases / 4 keyword pages / about / legal / snippets / trace |
| 营销站组件 | `oribos-website/src/components/**` | 22 个组件 / 4 mock |
| 营销站 token | `oribos-website/src/styles/global.css` | v2 颜色 / 字阶 / 网格 / 字体 |
| 营销站 trace 色 | `oribos-website/src/styles/trace-ink.css` | `--trace-green` 别名 |
| 营销站 origin / 链接 / 版本 | `oribos-website/src/lib/site.ts`、`links.ts`、`version.ts` | 单点常量 |
| 营销站 gate | `oribos-website/scripts/check-*.mjs`、`src/lib/*-rules.ts` | 22 道门禁与规则 |
| 营销站产物 | `oribos-website/dist/` | 11 页 / sitemap / robots / llms |
| 文档站规范 | `oribos-docs/docs/spec/{ia,content-inventory,content-boundary,stack,api-reference,delivery,agent-surface,brand-visual,handoff}.md` | IA / 内容 / 栈 / API / 交付 / agent 面 / 品牌 |
| 文档站术语 | `oribos-docs/CONTEXT.md` | 文档站术语 |
| 文档站内容 | `oribos-docs/src/content/docs/**` | 19 手写页 + 249 API 页 |
| 文档站 frontmatter | `oribos-docs/src/content.config.ts`、`src/lib/frontmatter.ts` | 七字段 / `packageValues` |
| 文档站 agent 面 | `oribos-docs/src/lib/agent-surface.ts`、`scripts/gen-agent-surface.mjs`、`scripts/check-agent-surface.mjs` | twin / llms / manifest |
| 文档站 API 管线 | `oribos-docs/scripts/regen-api-tree.mjs`、`api-entry/`、`typedoc.json`、`api-sidebar.json` | 生成树 / shim / 侧栏快照 |
| 文档站重定向 | `oribos-docs/redirects.json`、`scripts/gen-redirects.mjs`、`scripts/check-ledger.mjs` | 台账 / 生成 / 四条 gate |
| 文档站 origin | `oribos-docs/src/lib/site.ts` | `https://docs.oribos.dev` |
| 文档站部署 | `wrangler.jsonc`、`public/_headers`、`dist/robots.txt`、`dist/sitemap-*.xml` | 托管 / 头 / sitemap |
| 文档站产物 | `oribos-docs/dist/llms.txt`、`dist/llms-manifest.json` | 31 链接 / 10 包键 / pin 0.5.0 |
| 框架 README | `oribos-framework/README.md` | 0.9.0 / 19 包 / 23 examples / 快速开始 |
| 框架中文 README | `oribos-framework/README.zh-CN.md` | i18n 种子 |
| 框架术语 | `oribos-framework/CONTEXT.md` | 内部术语真相源 |
| 框架架构 | `oribos-framework/docs/architecture/*.md`（8 篇） | 概念 / 指南改写源 |
| 框架 ADR | `oribos-framework/docs/adr/*.md`（20 篇） | 内部背景 / 定位 |
| 框架路线图 | `oribos-framework/docs/ROADMAP.md` | 版本 / 发布 / 出域 / 追赶面 |
| 框架 examples | `oribos-framework/examples/*/README.md`（23 个） | 走读 / 模板 |
| 框架 skills | `oribos-framework/skills/oribos/SKILL.md` | agent skill 资产 |
| 框架包清单 | `oribos-framework/packages/*/package.json` | 19 包 / 10 core 子路径 |

### 网络一手来源

| 来源 | URL | 用途 |
| --- | --- | --- |
| Mastra sitemap index | `https://mastra.ai/sitemap.xml` | 9 个子 sitemap |
| Mastra pages | `https://mastra.ai/sitemaps/pages.xml` | 73 URL（36 + 28 作者 + 9 分类） |
| Mastra blog | `https://mastra.ai/sitemaps/blog.xml` | 274 篇 |
| Mastra articles | `https://mastra.ai/sitemaps/articles.xml` | 82 篇 |
| Mastra customers | `https://mastra.ai/sitemaps/customers.xml` | 31 篇 |
| Mastra docs | `https://mastra.ai/docs/sitemap.xml` | 963 URL |
| Mastra llms | `https://mastra.ai/llms.txt` | 文档分组 / `.md` 形态 |
| Mastra 首页 | `https://mastra.ai/` | 顶栏 / 页脚分组 |
| Mastra 博客 | `https://mastra.ai/blog` | 分类 / 列表形态 |
| Mastra 资源 | `https://mastra.ai/resources` | Resources hub 形态 |
| npm `@oribos/core` | `https://registry.npmjs.org/@oribos/core`（`npm view @oribos/core version`） | 0.9.0 |
| npm `@oribos/supervisor` | `https://registry.npmjs.org/@oribos/supervisor`（`npm view`） | 0.9.0 |
| `oribos.dev` RDAP | `https://rdap.identitydigital.services/rdap/domain/oribos.dev` | 404 Object not found |
| `oribos.dev` DNS | `dig +short oribos.dev` | 无记录 |
| `docs.oribos.dev` DNS | `dig +short docs.oribos.dev` | 无记录 |

### 复核命令

```bash
# 版本事实
npm view @oribos/core version
npm view @oribos/supervisor version

# 域名事实
dig +short oribos.dev
dig +short docs.oribos.dev
curl -sS -o /dev/null -w '%{http_code}\n' https://oribos.dev/
curl -sS -H 'Accept: application/rdap+json' \
  https://rdap.identitydigital.services/rdap/domain/oribos.dev | head

# 内容规模
find oribos-website/src/pages -name '*.astro' | wc -l          # 12（含 404）
find oribos-website/src/content -name '*.json' | wc -l         # 38
find oribos-docs/src/content/docs -name '*.md' -o -name '*.mdx' | grep -v '/reference/api/' | wc -l  # 20（含 404）
find oribos-docs/src/content/docs/docs/reference/api -name '*.md' | wc -l  # 249
find oribos-framework/examples -mindepth 1 -maxdepth 1 -type d | wc -l     # 23

# 事实漂移
rg -n '0\.5\.0|0\.6\.0|ultralight|lightweight|neither is built in|five runnable' \
  oribos-website/src oribos-docs/src/content oribos-docs/src/lib

# 构建与门禁（各自仓库）
cd oribos-website && pnpm verify
cd oribos-docs && pnpm verify
```

---

_本报告只盘点现状与迁移初判，不替代 IA / 规格 / 产品事实票的裁决。_
