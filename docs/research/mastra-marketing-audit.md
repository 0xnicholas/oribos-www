# Mastra 营销站结构审计（票 #2 · mastra-marketing-audit）

> 研究日期：2026-10-20
> 范围：`mastra.ai` 的非 docs 营销面（首页、Product、Solutions、资源/博客、Pricing、公司页）＋ Oribos 本地三仓库。
> 方法：读取 `mastra.ai/sitemap.xml` 及其 8 个子 sitemap、逐页抓取 HTML（含 RSC payload）、对 pages sitemap 逐 URL 做 HTTP 状态扫描；本地只读 `oribos-website`、`oribos-docs`、`oribos-framework` 的源文件。
> 口径：Mastra 是快速变化的站点，本报告是 **2026-10-20 的快照**。所有“真实/占位/孤儿”的判断都以当天 HTTP 状态、页面可见正文和全站链接为准。

---

## TL;DR

1. **Mastra 的营销 IA 是“产品下拉 ×4 ＋ 解决方案下拉 ×7 ＋ 资源下拉 ×5 ＋ 三个直达项（Pricing / Customers / Docs）”，但 header 与 footer 并不一致**：Studio、Agent Builder、Factory 只在 footer 的 Product 组出现；Articles、Podcast、Patterns book 只在 footer 的 Resources 组出现；Workshops 只在 header 出现；`/resources` 这个资源总览页在首页 header/footer 里都没有入口。
2. **首页是 9 个 section 的固定叙事**：Hero（Get a demo + Quickstart）→ 客户 logo/故事轮播 → 6 个 feature tabs（Agents / Workflows / Harness / Memory / Server / Factory）→ 5 个 observability tabs（Evals / Metrics / Datasets / Traces / Signals）→ 客户故事带 → 3 张解决方案卡（Real-world / Customer-facing / Developer Infra）→ Resources（2 本书 + 4 条 release）→ 11 题 FAQ → Final CTA（agent prompt chip + Quickstart）。
3. **Product 页有一套很稳定的骨架**：Hero → 1–3 个 feature section（H2 + 3–7 个 H3 行）→ 定价（2–3 档）→ 客户案例带 → FAQ（5–9 题）→ Final CTA。Framework 是唯一“完整旗舰页”（约 722 词正文、3 个 feature section、9 题 FAQ）；Agent Builder（约 68 词、仅 Enterprise、FAQ 复用首页通用题）和 Factory（约 78 词）是明显的薄落地页。
4. **Solutions 页几乎是“空壳 + 客户故事”**：8 个页面每个只有 eyebrow、H1、一句 subhead、3 张客户故事卡、Get a demo、全站复用的 7 题 FAQ、Final CTA；除 hero 与故事标题外，独立正文约 46–63 个英文词。它们靠 Mastra 的客户案例库撑起“可信度”，模板本身没有解决方案论证。
5. **资源面是内容运营，不是页面模板**：sitemap 列出 blog 274 条、articles 82 条、templates 26 条、podcasts 123 条、workshops 76 条、customers 31 条、research 3 条，docs sitemap 963 条。Mastra 把 `/blog`（公司/工程/发布）与 `/articles`（SEO 长文/对比/list）拆成两条内容线，文章模板带 TOC、FAQ、Reviewed by、作者 bio。
6. **Mastra 自己有一批 IA 缺陷，正好是 Oribos 的反面教材**：`/mcp-registry` 在 pages sitemap 里但返回 404；`/mcp-registry-registry` 是 200，但首页 header/footer 无链接（本次抓取页面未见入口）；`/fde-support` 在 header/footer 里但不在 pages sitemap；`/hackathon` 是 2025 年的过期活动页；`/resources` 是 200，但在本次抓取范围内只有 `/course` 链到它。
7. **对 Oribos 的核心结论**：抄 Mastra 的“结构骨架”和“产品页/能力页分层”，不要抄它的“内容体量”和“客户证明方式”。Oribos 没有客户案例、没有销售团队、Platform / Studio / Agent Builder 还在计划中，因此首页应复用旧站已经落地的“事实带 + 场景卡 + 3 卡资源 + 全局 FAQ + agent prompt CTA”，Solutions 用“场景卡”替代客户故事，资源面只上有真实内容跑道（首发 blog + templates + research），不要把 Articles / Podcasts / Workshops / Books / Customers 做成空栏目。
8. **单站承载 docs 有一个现成冲突**：`oribos-docs` 当前把站根 `/` 301 到 `/docs`，并把 `docs.oribos.dev` 作为 canonical；并入 `oribos-www` 单站时必须取消这条 301、把 `/` 交给营销首页，否则营销站首页会被文档站重定向吃掉。

---

## 详细发现

### 1. 全局 IA

#### 1.1 顶部导航（header）

Mastra 的 header 是“3 个下拉 + 3 个直达 + GitHub stars + demo CTA”：

| 一级 | 类型 | 二级项（按 DOM 顺序） | 目标 |
|---|---|---|---|
| Product | 下拉 | Framework（副标题 Build agents） | `/ai-agent-framework` |
| | | Deployment | `/ai-agent-deployment` |
| | | Observability | `/platform-observability` |
| | | FDE / Support | `/fde-support` |
| Solutions | 下拉 | Sales agents | `/sales-agents` |
| | | Marketing agents | `/marketing-agents` |
| | | Company Brain | `/company-brain` |
| | | Financial Services | `/financial-services` |
| | | Healthcare | `/healthcare` |
| | | Customer-facing agents | `/customer-facing-agents` |
| | | Developer Infra | `/developer-infrastructure` |
| Resources | 下拉 | Blog | `/blog` |
| | | Templates | `/templates` |
| | | Principles book | `/books/principles-of-building-ai-agents` |
| | | Workshops | `/workshops` |
| | | Research | `/research` |
| 直达 | 链接 | Pricing | `/pricing` |
| | 链接 | Customers | `/customers` |
| | 链接 | Docs | `/docs` |
| 右侧 | 链接 | GitHub（显示 `28.9k` stars） | `github.com/mastra-ai/mastra` |
| | CTA | 页面配置注入（首页为 Get a demo） | `/contact` |

要点：
- 每个下拉是一组列表（不是多栏 mega menu）；Product 项带 44×44 的缩略图，Solutions/Resources 项带 sprite 图标。
- **Product 下拉只有 4 项**，没有 Studio、Agent Builder、Factory。这三个产品只在 footer 出现。
- **Resources 下拉没有 Articles、Patterns book、Podcast**；这三项也只在 footer 出现。
- 顶部还有一条 announcement bar，当前指向 Luma 活动（“Wake, Notify, and Steer Long-Running Agents with Signals”，22 Oct）。它是运营位，不是 IA 的一级结构。

#### 1.2 Footer

Footer 是 7 个导航组 + newsletter 表单 + 法务/状态行：

| 组 | 项（按 DOM 顺序） |
|---|---|
| Product | Factory、Studio、Observability、Agent Builder、Server、FDE + Support |
| Framework | Overview、Agents、RAG、Workflows、Observability |
| Developers | Docs、Changelog（GitHub Releases）、Templates、Learn · MCP Course、Learn · Video Course |
| Solutions | Sales agents、Marketing agents、Company Brain、Financial Services、Healthcare、Customer-facing agents、Developer Infra、Real-world agents |
| Resources | Blog、Research、Articles、Book · Principles、Book · Patterns、Podcast · Agents Hour |
| Company | Customers、About、Careers、Contact Us、Newsletter |
| Connect | Contact Us、GitHub、Discord、YouTube、X (Twitter) |
| 表单 | “Get weekly updates” 邮箱订阅 |
| 法务/状态 | Security（trust.mastra.ai，显示 “Checking status”）、Privacy、Terms、DPA、llms.txt |

**Header/footer 的关键差异（对 Oribos 是直接警告）**：

| 页面/能力 | Header | Footer | 后果 |
|---|---|---|---|
| Studio | 无 | Product 组有 | 主产品入口缺失 |
| Agent Builder | 无 | Product 组有 | 主产品入口缺失 |
| Factory | 无 | Product 组有 | 主产品入口缺失 |
| Articles | 无 | Resources 组有 | 内容线被藏 |
| Patterns book | 无 | Resources 组有 | 第二本书被藏 |
| Podcast | 无 | Resources 组有 | 播客被藏 |
| Workshops | Resources 组有 | 无 | 资源入口不对称 |
| Real-world agents | 无 | Solutions 组有 | 解决方案入口缺失 |
| `/resources` | 无 | 无 | 资源总览页成为孤儿（本次抓取范围内仅 `/course` 链到） |
| `/fde-support` | Product 组有 | Product 组有 | 但不在 pages sitemap |

#### 1.3 Sitemap 规模

| Sitemap | URL 条目数 | 说明 |
|---|---:|---|
| `sitemaps/pages.xml` | 73 | 首页、Product/能力页、Solutions、Pricing、Customers、About/Careers/Contact、Books、Blog 索引/分类、28 个作者页、legal、MCP 两页 |
| `sitemaps/blog.xml` | 274 | blog 文章 |
| `sitemaps/articles.xml` | 82 | SEO 长文 |
| `sitemaps/templates.xml` | 26 | templates 索引 + 详情 |
| `sitemaps/podcasts.xml` | 123 | podcasts 索引 + 单集 |
| `sitemaps/workshops.xml` | 76 | workshops 索引 + 单场 |
| `sitemaps/customers.xml` | 31 | customers 索引 + 客户故事 |
| `sitemaps/research.xml` | 3 | research 索引 + 2 篇报告 |
| `docs/sitemap.xml` | 963 | docs + `/learn` 课程 |

营销面合计约 **688 条 sitemap 条目**（含各索引页与重复分类，去重后略少）；docs 另有 963 条。这个数字是“内容运营规模”，不是“页面模板数量”。

#### 1.4 Mastra IA 树（按 header/footer + sitemap 还原）

```
/
├─ Product (header dropdown)
│  ├─ Framework / Build agents        /ai-agent-framework
│  │  └─ Framework group (footer)     Overview / Agents / RAG / Workflows / Observability
│  ├─ Deployment                      /ai-agent-deployment   (footer 叫 Server)
│  ├─ Observability                   /platform-observability
│  └─ FDE / Support                   /fde-support
├─ Product (footer-only)
│  ├─ Factory                         /factory
│  ├─ Studio                          /studio
│  ├─ Agent Builder                   /agent-builder
│  └─ Server                          /ai-agent-deployment
├─ Solutions (header dropdown)
│  ├─ Sales agents                    /sales-agents
│  ├─ Marketing agents                /marketing-agents
│  ├─ Company Brain                   /company-brain
│  ├─ Financial Services              /financial-services
│  ├─ Healthcare                      /healthcare
│  ├─ Customer-facing agents          /customer-facing-agents
│  └─ Developer Infra                 /developer-infrastructure
│     └─ Real-world agents            /real-world-agents   (footer-only)
├─ Resources (header dropdown)
│  ├─ Blog                            /blog
│  │  ├─ /blog/category/{announcements,features,examples,foundations,memory,case-studies,changelogs}
│  │  └─ /blog/[slug]
│  ├─ Templates                       /templates
│  │  ├─ Official ×21
│  │  ├─ Partner ×4
│  │  └─ /templates/[slug]
│  ├─ Principles book                 /books/principles-of-building-ai-agents
│  ├─ Workshops                       /workshops
│  │  └─ /workshops/[slug]
│  └─ Research                        /research
│     └─ /research/[slug]
├─ Resources (footer-only)
│  ├─ Articles                        /articles
│  │  ├─ /articles/category/foundations
│  │  └─ /articles/[slug]
│  ├─ Patterns book                   /books/patterns-of-building-ai-agents
│  └─ Podcast · Agents Hour           /podcasts
│     └─ /podcasts/[slug]
├─ Pricing                             /pricing
├─ Customers                           /customers
│  └─ /customers/[slug]
├─ Docs                                /docs  (963 URLs, 含 /learn；/course 为独立课程页)
├─ Resources hub                       /resources   (orphan: 仅 /course 链到)
├─ Company
│  ├─ About                            /about
│  ├─ Careers                          /careers
│  ├─ Contact                          /contact
│  ├─ Newsletter                       /newsletter
│  └─ Hackathon                        /hackathon   (2025 过期活动页, orphan)
├─ MCP
│  ├─ MCP Registry                     /mcp-registry   (sitemap 有, HTTP 404)
│  └─ MCP Registry Registry            /mcp-registry-registry   (200, orphan)
└─ Legal
   ├─ Privacy                          /privacy-policy
   ├─ Terms                            /terms-of-service
   └─ DPA                              /legal/dpa
```

#### 1.5 导航层发现的缺陷

| # | 缺陷 | 证据 | 对 Oribos 的教训 |
|---|---|---|---|
| N1 | Header Product 少三个产品 | header 只有 Framework/Deployment/Observability/FDE；footer Product 有 Factory/Studio/Agent Builder/Server | 主产品不能只靠 footer |
| N2 | Header Resources 少三条内容线 | header 只有 Blog/Templates/Principles book/Workshops/Research；footer 有 Articles/Patterns/Podcast | 内容线入口要一致 |
| N3 | Footer Resources 少 Workshops | header 有，footer 无 | 用一份 nav 数据源生成两处 |
| N4 | `/resources` 是孤儿 | 首页 header/footer 均无 `href="/resources"`；本次抓取范围内仅 `/course` 链到 | 总览页必须有全局入口 |
| N5 | `/fde-support` 不在 pages sitemap | 73 条 pages sitemap 无此 URL，但 header/footer 有 | sitemap 必须由 nav/route 清单生成 |
| N6 | `/mcp-registry` sitemap 里有、页面 404 | `curl` 返回 404 | sitemap 不能收录 404 |
| N7 | `/mcp-registry-registry` 200 但无入口 | 首页 header/footer 无 mcp 链接；本次抓取页面未见入口 | 孤儿页要么入 nav，要么删 |
| N8 | `/hackathon` 是 2025 活动页 | 标题 “MASTRA.BUILD July 28th - August 11th”，2025 文案 | 过期活动页要下线/归档 |
| N9 | 产品命名不一致 | header “Deployment” vs footer “Server” vs H1 “Mastra Server”；“Gateway” vs “AI Gateway” | 一个产品一个 canonical 名称 |
| N10 | Observability 双页重叠 | `/platform-observability`（平台产品）与 `/ai-agent-observability`（框架能力）都在 | 产品页 vs 能力页要明确分工，避免互抢关键词 |

---

### 2. 首页区块

首页可见 9 个 section（另有 announcement bar；header/footer 不计）：

| # | Section | 内容类型 | 关键文案/模块 | CTA |
|---|---|---|---|---|
| 1 | Hero | 产品价值主张 + 代码/产品窗 | H1 “Build AI agents”；sub “Build, observe, and improve agents that run for days…”；右侧产品窗（agents/tools/workflows/scorers + Observability: Traces/Metrics/Logs/Evals/Experiments/Scorers/Datasets） | **Get a demo**（`/contact`）＋ **Quickstart**（docs quickstart） |
| 2 | 客户 logo / 故事轮播 | 社会证明 | 9 个客户（Salesforce、Marsh、Sanity、SoftBank、WorkOS、Range、MongoDB、Factorial、Replit）logo + 故事卡；每卡 “Read →” | 每卡 `/customers/[slug]` |
| 3 | Feature tabs ×6 | 产品能力 + 代码 | H2 “Workflows. Memory. Harness. Mastra agents have the tools you need to ship fast.”；tabs = **Agents / Workflows / Harness / Memory / Server / Factory**；每 tab 有 claim、4–5 条支撑、1–2 个代码文件（`agent.ts`、`workflow.ts`、`harness.ts`、`memory.ts`、`server.ts`、`factory.ts`） | 无 CTA（tab 交互） |
| 4 | Observability tabs ×5 | 平台能力 | H2 “Best-in-class, built-in observability…”；tabs = **Evals / Metrics / Datasets / Traces / Signals**，每个一句解释 | 无 CTA |
| 5 | 客户故事带 | 案例 | H2 “Great AI teams move fast…”；5 张故事卡（Range、Salesforce、Sanity、WorkOS、MongoDB）＋ Case Studies 链接 | **Case Studies**（`/blog/category/case-studies`） |
| 6 | 解决方案卡 ×3 | 场景分流 | H2 “Empower your customers, turbo-charge your company.”；3 卡 = **Real-world agents / Customer-facing agents / Developer Infra**，每卡一张宿主界面 mock + 一句 claim | 整卡链接到 solution 页 |
| 7 | Resources | 内容导流 | H2 “Resources”；2 本书（Principles 240K+ copies、Patterns 100K+ copies）＋ 4 条最新 release（Studio SSO、Trace Queries、Trace Imports、Metrics API） | **Latest Releases**（`/blog/category/changelogs`）＋ 书页 |
| 8 | FAQ | 11 题 | “What is Mastra?”、“Is Mastra an agent builder?”、“What can you build?”、“What models?”、“What workflows?”、“How memory?”、“MCP?”、“Testing/observability?”、“Deploy?”、“Why not Python?”、“Open source?” | 无 |
| 9 | Final CTA | 转化 | H2 “Start building with Mastra today”；**Copy agent prompt** chip（隐藏 payload）＋ Quickstart | **Quickstart** |

关键观察：
- 首页的主 CTA 是 **demo + quickstart 双轨**；到了页面末尾变成 **agent prompt + quickstart**。这说明 Mastra 同时服务“企业买家”和“开发者”两种转化。
- 首页没有独立的“产品矩阵”区；Product 的六个能力被拆进 feature tabs，商业产品（Studio/Server/Factory）在 tabs 里也出现，但 header 并不全列。
- 社会证明的密度很高：logo 墙、9 卡轮播、5 卡故事带、3 个客户故事 CTA，四处复用同一批客户资产。Oribos 没有这批资产，不能照搬结构。

---

### 3. Product 页骨架

#### 3.1 商业产品页

| URL | Header 标签 | H1 | Feature section | 定价 | 案例带 | FAQ | Final CTA | 独立正文约 |
|---|---|---|---|---|---:|---|---:|---:|
| `/ai-agent-framework` | Framework | “Mastra Framework - Everything you need to build AI agents in TypeScript” | 3 段：Agents（7 行）、Workflows（5 行）、Studio（5 行） | Free / Enterprise | 3 卡 | 9 | Copy agent prompt + Quickstart | 722 词 |
| `/ai-agent-deployment` | Deployment（footer: Server） | “Mastra Server - Deploy your Mastra agents and workflows” | 1 段：Ship Your Mastra Agent in One Command（4 行） | Starter / Teams / Enterprise | 3 卡 | 6 | Get Started + Documentation | 109 词 |
| `/platform-observability` | Observability | “AI observability platform - Full Visibility Into Every Agent Run in Production” | 1 段：Metrics / Logs / Traces（3 行） | Starter / Teams / Enterprise | 3 卡 | 5 | Get Started + Documentation | 100 词 |
| `/studio` | footer-only | “Mastra Studio - Iterate Faster, Ship Better Agents” | 2 段：Collaborate With Your Team（3 行）、Own your agent loop（3 行） | Starter / Teams / Enterprise | 案例带 | 6 | Get Started + Documentation | 189 词 |
| `/ai-gateway` | footer-only | “Gateway - Memory and model routing for any AI agent” | 2 段：Give any agent human-like memory（4 行）、Route all traffic through one gateway（5 行） | Starter / Teams / Enterprise | 3 卡 | 5 | Get Started + Documentation | 313 词 |
| `/agent-builder` | footer-only | “PLATFORM AGENT BUILDER - Your Internal Agent Platform” | 1 段：Composable agent studio / Write Code Modules / Let non-dev teammates create agents（3 行） | **仅 Enterprise** | 案例带 | 7（复用首页通用题） | Get Started（外部 `agent-builder.mastra.ai`）＋ Documentation | 68 词 |
| `/factory` | footer-only | “Software Factory - Agent-powered software delivery” | 1 段：Fully configurable, agent-powered（1 行） | Starter / Teams / Enterprise | 案例带 | 7 | Deploy on Mastra Platform + `npm create factory` + Documentation | 78 词 |
| `/fde-support` | FDE / Support | “Get your agent into prod faster” | 1 段：Direct line to the team / Product roadmap insights / 4 hour SLA（3 行） | 无 | 案例带 | 无 | Contact Us | 153 词 |

> “独立正文约”= 去掉 header/footer、FAQ、客户案例带、定价区后的页面可见英文词数（脚本统计），用于判断页面厚度，不是官方字数。

#### 3.2 能力/关键词页

| URL | H1 | 三段论证 | FAQ | CTA | 独立正文约 |
|---|---|---|---|---:|---:|
| `/ai-agents` | “AI Agent Platform - Build stateful AI agents with memory, tools and MCP, using any LLM” | Built-in agent primitives / Orchestrate agent networks / Context and guardrails | 5 | Quickstart | 1062 词 |
| `/ai-workflows` | “Agent Orchestration Platform - Orchestrate complex, multi-step agentic processes” | Precisely define your execution graph / Compose with agentic primitives / Observability | 5 | Quickstart | 932 词 |
| `/ai-agent-observability` | “Mastra Observability - Observe and evaluate your AI agent performance” | AI agent and workflow monitoring / Agent tracing and telemetry / build custom agent evals | 7 | Quickstart | 1054 词 |
| `/rag-pipeline` | “RAG Pipeline - The simplest way to build a full agent RAG pipeline in TypeScript” | Build your full RAG pipeline / Give agents knowledge of your data / Advanced RAG techniques | 5 | Quickstart | 1246 词 |

关键观察：
- **商业产品页**和**能力/关键词页**是两套模板：前者有定价、案例、demo CTA；后者没有定价、没有案例，只有三段论证、FAQ、Quickstart。Mastra 用这套分层同时吃“买家”和“搜索/开发者”。
- Framework 是唯一把“产品页 + 能力页”合在一页的：Agents/Workflows/Studio 三段既是产品能力，也是框架能力。
- Agent Builder 是“薄产品页”的典型：68 词、只有 Enterprise、FAQ 直接复用首页通用题、CTA 指向外部子域。Oribos 如果要做计划中产品页，必须避免这种形态。
- Gateway 页面实际讲的是“Memory + model routing”，不是传统 AI Gateway；Oribos 不做 Gateway，但可以把“模型路由”留在 Framework 的 model-router 文档里。
- `/mcp-registry` 不在上表：它返回 404；`/mcp-registry-registry` 是另一个“MCP 注册表目录”页，不是产品页。

#### 3.3 Product 页模板骨架（可复用）

```
Header（公告条可选）
→ Hero：eyebrow（可选）/ H1 / subhead / 1–2 CTA / 右侧产品窗或代码卡
→ Feature section ×1–3：
     H2 + 一段 intro
     → 3–7 个 H3 行（每行：H3 标题 + 1–2 句正文 + 代码/截图/示意图 + 可选 docs 链接）
→ Pricing：2–3 档（Free/Starter/Teams/Enterprise）；或仅 Enterprise；或无定价（服务页）
→ Proof：客户 logo 带 / 案例卡 ×3（Mastra 实测每页 3 张）/ “Case studies” CTA
→ FAQ：5–9 题 accordion
→ Final CTA：H2 + agent prompt chip 或 Get Started/Documentation 双按钮
→ Footer
```

模板字段建议（给后续 spec）：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `slug` | string | 是 | 路由 |
| `navLabel` | string | 是 | header/footer 用同一名称（避免 Deployment/Server 漂移） |
| `status` | enum | 是 | `live` / `planned` / `beta` |
| `hero.eyebrow` | string | 否 | 如 “PLATFORM” |
| `hero.h1` | string | 是 | 产品名 + 一句话价值 |
| `hero.subhead` | string | 是 | 1–2 句 |
| `hero.primaryCta` | object | 是 | label + href |
| `hero.secondaryCta` | object | 否 | label + href |
| `hero.visual` | enum/ref | 否 | 产品窗、代码卡、示意图 |
| `sections[]` | array | 是 | `{ title, intro, items[] }`；items = `{ title, body, codeRef?, visualRef?, link? }` |
| `pricing.mode` | enum | 是 | `none` / `free-enterprise` / `three-tier` / `enterprise-only` |
| `pricing.plans[]` | array | 否 | `{ name, price, description, features[], cta }` |
| `proof.type` | enum | 是 | `customers` / `scenarios` / `none` |
| `proof.items[]` | array | 否 | 客户故事或场景卡 |
| `faq[]` | array | 是 | `{ question, answer }` |
| `finalCta` | object | 是 | `{ heading, primaryCta, secondaryCta?, agentPrompt? }` |

---

### 4. Solutions 页骨架

Mastra 有 8 个 Solutions 页；其中 6 个是任务点名的角色/行业分类，另外 2 个是横切场景（Real-world agents、Company Brain）。

| URL | Eyebrow（hero 小标签） | H1 | Subhead | 3 张客户故事卡 | 独立正文约 |
|---|---|---|---|---|---:|
| `/sales-agents` | Prospect enrichment | Sales agents | “Automate manual work, so your team can spend more time talking to prospects” | WorkOS / Morning Brew / Genius AI | 63 词 |
| `/marketing-agents` | Campaign drafting | Marketing agents | “Find leads, streamline content, experiment with messaging” | Sanity / PLAID / Riverside | 52 词 |
| `/customer-facing-agents` | Support triage | Customer-facing agents | “Answer your users. Act inside your product. Hand off to a human” | Sanity / Factorial / Range | 60 词 |
| `/developer-infrastructure` | Incident response | Developer Infra | “Agents that watch production, triage CI, and become the primitives other product teams build on.” | Salesforce / Replit / StarSling | 59 词 |
| `/financial-services` | Portfolio review | Financial Services | “Help users eliminate busywork. Turbocharge internal staff” | Range / Brex / Translucent | 46 词 |
| `/healthcare` | Patient intake | Healthcare | “Serve more patients better and faster” | Counsel Health / Vetnio / Chapter | 50 词 |
| `/real-world-agents` | Expense review | Real-world agents | “Build a company brain, Slack/Teams agents, or automate important business processes” | MongoDB / SoftBank / WorkOS | 62 词 |
| `/company-brain` | Knowledge search | Company Brain | “Organize information. Agentically search. Unify knowledge silos” | Marsh / SoftBank / Palette | 49 词 |

模板骨架：

```
Header
→ Hero：eyebrow pill（如 “Prospect enrichment”）+ 一张 666×202 的场景插画 + H1 + 一句 subhead
→ 3 张客户故事卡（3 列网格；每卡：背景图 + 客户名/标题 + “Read story →”）
→ “Get a demo” 按钮
→ 全局 FAQ（7 题，首页 FAQ 的子集，所有 solution 页逐字相同）
→ Final CTA（Quickstart）
→ Footer
```

关键判断：
- **Solutions 页不是“解决方案内容页”，而是“行业/角色落地页 + 客户证明墙”。** 页面没有“痛点—方案—架构—实施步骤”的论证；唯一的差异化内容是 eyebrow、H1、subhead 和三张故事卡。
- 每个 solution 页的 FAQ 都是同一组 7 题（What is Mastra / agent builder / what can you build / models / workflows / memory / MCP），没有行业/角色专属问题。
- 三张故事卡是页面唯一“证据”，所以 Mastra 的 Solutions 页高度依赖 `/customers` 的 31 篇故事。Oribos 没有客户故事，直接套这个模板会得到“只有标题和 CTA 的空页”。
- 适合 Oribos 的替代物是旧站 CONTEXT 里定义的 **“场景卡”**：场景名 + 2–3 句“用 Oribos 怎么搭” + 用到的子系统/包名，而不是客户 logo/故事。

模板字段建议：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `slug` | string | 是 | 如 `sales-agents` |
| `taxonomy` | enum | 是 | `role` / `industry` / `cross-functional` |
| `eyebrow` | string | 是 | 一个具体场景名，如 “Prospect enrichment” |
| `h1` | string | 是 | 角色/行业名 |
| `subhead` | string | 是 | 一句价值 |
| `heroVisual` | ref | 否 | 场景插画/宿主界面 mock |
| `scenarioCards[]` | array | 是 | 首发 3 张；`{ title, body, packages[], href? }` |
| `proof` | object | 否 | 有真实客户才填；否则 `type: none` |
| `faq[]` | array | 是 | 至少 3 题页面专属，不能只复用全局 FAQ |
| `cta` | object | 是 | demo 或 quickstart；按 Oribos 实际能力选 |

---

### 5. 资源面

#### 5.1 总表

| URL | 角色 | 规模/模板 | 关键区块 | 真实内容判断 |
|---|---|---|---|---|
| `/blog` | 公司/工程/发布博客 | 274 篇；23 页分页；分类 announcements/features/examples/foundations/memory/case-studies/changelogs | Hero + 分类 tabs + 文章网格 + 分页 + Final CTA | 真实、持续更新 |
| `/articles` | SEO 长文/对比/list | 82 篇；7 页分页；分类 foundations | Hero + 分类 + 文章网格 + 分页 + Final CTA | 真实、SEO 内容线 |
| `/customers` | 客户故事索引 | 31 条 sitemap；页面显示 “Showing 10 of 34”；筛选 All use cases / All industries / Search | Hero + 6 张精选故事 + 可筛选网格 + CTA | 真实、销售资产 |
| `/pricing` | 定价 | Platform / Self-Hosted 两个 tab；3+2 档；6 类矩阵；Enterprise Support | Hero + 计费 tab + 计划卡 + 功能矩阵 + Enterprise Support + Final CTA | 真实、商业页 |
| `/books/principles-of-building-ai-agents` | 书/lead magnet | 3rd Edition；email gate；189,500 印刷量；TOC；testimonials；FAQ | 书封 hero + 邮箱表单 + 数据 + 作者 + 视频 + 评价 + 目录 + FAQ | 真实、lead gen |
| `/books/patterns-of-building-ai-agents` | 第二本书 | 100K+ distributed | 同上（简化） | 真实、lead gen |
| `/podcasts` | 播客 | 123 集；11 页分页 | Hero + 主持人/订阅 + 单集网格 + FAQ + CTA | 真实、媒体运营 |
| `/workshops` | 工作坊 | 76 场；7 页分页 | Hero + Upcoming + Past + 分页 + FAQ + CTA | 真实、活动运营 |
| `/research` | 研究/benchmark | 2 篇报告 | Hero + 2 张报告卡 + CTA | 真实但量少 |
| `/templates` | 代码模板 | 26 条；21 Official + 4 Partner + Mastra Code 外部 | Hero + Official 组 + Partner 组 + FAQ + CTA | 真实、开发者资产 |
| `/resources` | 资源总览 | 6 张卡（Templates / Workshops / Book / Agents Hour / Research / Customers） | H1 + 6 卡网格 | 真实但孤儿（无全局入口） |
| `/newsletter` | 订阅 | 单页邮箱表单 + X/Discord | H1 + 表单 + 社群 | 真实、轻量 |
| `/careers` | 招聘 | Values、团队内容、Latest podcasts、Ashby open roles、talent community | Hero + values + 文化 + 播客 + 职位 + CTA | 真实、公司页 |
| `/contact` | 销售线索 | 表单：Full name / Work email / How can we help? + Discord/X | H1 + 表单 + 社群 | 真实、demo 线索 |
| `/about` | 公司 | 故事、投资人、团队、CTA | Hero + Our story + investors + team + CTA | 真实、公司页 |
| `/hackathon` | 活动 | 2025 年 7/28–8/11 的旧活动页 | Hero + 规则 + 提交 + 注册 | 过期、orphan |

#### 5.2 各资源线的模板细节

**Blog 索引**
- H1 “The Mastra blog”；分类 tabs：All Posts / Announcements / Features / Examples / Foundations；分页 23 页。
- 文章卡：标题、日期、分类、作者/阅读时长（列表页可见）。
- 页末固定 Final CTA。
- 内容类型：发布公告、工程深潜、教程、案例研究、changelog。

**Blog 文章**
- 面包屑：Blog / Category / Title。
- 标题 + 一句 dek（meta description 同文）+ 作者 + 日期 + 阅读时长。
- 正文（MDX/富文本），代码块、图片、引用。
- 文末：Share on X / LinkedIn、作者 bio、All articles by 作者、Newsletter 订阅。
- 没有强制 TOC；发布类文章通常短（2 min read）。

**Articles 索引 / 文章**
- H1 “Mastra Articles”；分类 Foundations；分页 7 页。
- 文章模板比 blog 更“SEO”：
  - 面包屑 Articles / Foundations / Title；
  - “Written by / Reviewed by” 双作者；
  - 日期 + 阅读时长（如 17 min read）；
  - 右侧/文首 “On this page” TOC；
  - 正文含对比表、内部链接、FAQ；
  - 文末 FAQ（5 题）+ 作者 bios + Newsletter。
- 这是 Mastra 的“搜索流量内容线”，与 blog 的公司叙事分开。

**Customers 索引 / 客户故事**
- 索引：H1 “Join 10,000+ teams building agents”；6 张精选故事；筛选器（All use cases / All industries / Search）；“Showing 10 of 34”；Show more。
- 故事模板：
  - 面包屑 Customers / Customer / Title；
  - H1 + 一句 summary；
  - 2 个 KPI 数字（如 100,000 Developers / 100+ Skills）；
  - Get a demo；
  - 元数据表：HQ、Market Cap、Industry、Use Cases、Tech Challenges；
  - 正文 H2 分节（无 TOC）；
  - 相关故事 3 张 + Explore more case studies；
  - Final CTA（agent prompt + Quickstart）。

**Pricing**
- H1 “Pricing that scales with your agents”；两个 tab：Mastra Platform / Self-Hosted。
- Platform：Starter $0、Teams $250/mo、Enterprise custom；用量项 = Observability events、CPU time、Data retention；Teams 含 SSO/SOC 2。
- Self-Hosted：Free（Apache 2.0）、Enterprise（licensed；on-prem platform、Studio SSO/RBAC、SRE support）。
- 功能矩阵：Observability / Studio / Server / Gateway / Databases / Platform 六类。
- Enterprise Support 区：Agent Lifecycle Support、Collaboration & SLAs、On-prem deployments。
- Final CTA。

**Books**
- 书封 hero + edition + 主题 chips（Agents/Memory/Workflows/RAG/Tools/Traces）。
- 邮箱表单 “Get your copy”（`email` + honeypot `website`），不是直接下载。
- 印刷量数字（189,500 / 100K+）、作者、视频、读者评价、目录、FAQ。
- 角色 = lead magnet，不是 docs。

**Podcasts**
- 索引：H1 “Weekly conversations about building AI agents”；主持人 Shane/Abhi；YouTube/Spotify/Apple 订阅；单集网格；11 页；FAQ。
- 单集：标题 + 日期 + 长 description；Watch on YouTube；Listen on Spotify/Apple；完整 transcript（带时间戳/说话人）；More episodes；Back to all episodes。

**Workshops**
- 索引：H1 “Mastra Workshops”；Upcoming（Luma 注册）＋ Past（7 页）；FAQ。
- 单场：标题 + 日期/时间/时长；长 description + “We'll cover” 列表；Hosts；录像/代码（注册后）；More workshops；Back to all workshops。

**Research**
- 索引：H1 “Research”；2 篇报告卡。
- 报告：面包屑 Research / Title；标题 + dek；作者 + 日期 + 阅读时长；On this page TOC；正文含 benchmark 表/图；docs/GitHub 链接；Share；作者 bio。

**Templates**
- 索引：H1 “Mastra Templates”；Official 组（21）＋ Partner 组（4）；每卡：标题、一句 description、类型 badge、use case tag、详情链接。
- 详情：Back to all templates；标题 + description；`npx create-mastra@latest --template <slug>`；Repository 链接；Type（Official/Partner）；Use Case；正文 TOC（Why we built this / Demo / Features / Prerequisites / Quickstart / Making it yours / About Mastra templates）；GitHub 链接。

**Resources hub**
- H1 “Mastra Resources”；6 张卡：Templates、Workshops、Book、Agents Hour Livestream、Research、Customers；每卡一句描述 + 链接。
- 132 词，纯导航页；但全局无入口，实际是 orphan。

**Newsletter / Careers / Contact / About**
- Newsletter：单页邮箱表单 + X/Discord。
- Careers：Values（4 条）、Get to know us（播客/书/视频）、Latest podcasts、Open positions（Ashby）、Don't see your role（talent community）。
- Contact：demo 表单（Full name / Work email / How can we help?）+ Discord/X。
- About：Our story、投资人、团队（35+）、Join the team。

---

### 6. 页面模板清单

> 模板编号用于后续 spec 引用；同一模板可能被多个 URL 复用。

| ID | 模板 | 代表 URL | 区块骨架 | 关键内容字段 |
|---|---|---|---|---|
| T1 | 首页 | `/` | Hero → 社会证明 → feature tabs → observability tabs → 客户故事 → 解决方案卡 → Resources → FAQ → Final CTA | hero、logos/stories、tabs、story cards、solution cards、resource cards、FAQ、finalCta |
| T2 | 旗舰产品页 | `/ai-agent-framework` | Hero → 3 feature sections → pricing → proof → FAQ → Final CTA | 同 §3.3 字段；feature items 可带代码 |
| T3 | 平台产品页 | `/studio`、`/platform-observability`、`/ai-agent-deployment`、`/ai-gateway` | Hero → 1–2 feature sections → 3-tier pricing → proof → FAQ → Final CTA | 同上；pricing 必须三档 |
| T4 | 薄/计划产品页 | `/agent-builder`、`/factory` | Hero → 1 feature section → Enterprise-only 或无定价 → proof → FAQ → Final CTA | `status`、`waitlist`、无假定价 |
| T5 | 能力/关键词页 | `/ai-agents`、`/ai-workflows`、`/ai-agent-observability`、`/rag-pipeline` | Hero → 3 段论证 → FAQ → Final CTA | 无 pricing/proof；3–4 张论证卡 |
| T6 | 解决方案页 | `/sales-agents` 等 | Hero（eyebrow + 插画 + H1 + subhead）→ 3 张故事/场景卡 → demo CTA → 全局 FAQ → Final CTA | taxonomy、eyebrow、scenarios[3]、faq |
| T7 | 定价页 | `/pricing` | Hero + 计费 tab → 计划卡 → 功能矩阵 → Enterprise Support → Final CTA | plans、usage rows、matrix、support |
| T8 | 客户索引 | `/customers` | Hero → 精选故事 → 筛选器 + 网格 → CTA | filters（use case/industry/search）、stories[] |
| T9 | 客户故事 | `/customers/[slug]` | 面包屑 → H1 + summary + KPI ×2 + CTA → 元数据表 → 正文 → 相关故事 → Final CTA | customer、summary、stats[2]、meta{HQ,marketCap,industry,useCases,challenges}、body |
| T10 | Blog 索引 | `/blog` | Hero + 分类 tabs → 文章网格 → 分页 → Final CTA | categories、posts[]、pagination |
| T11 | Blog 文章 | `/blog/[slug]` | 面包屑 → 标题 + dek + 作者/日期/时长 → 正文 → Share + 作者 bio + Newsletter | title、description、category、author、date、readTime、body |
| T12 | Articles 索引/文章 | `/articles`、`/articles/[slug]` | 同 T10/T11，但文章有 TOC + Reviewed by + FAQ | 同 T11 + reviewers、toc、faq |
| T13 | Templates 索引/详情 | `/templates`、`/templates/[slug]` | Hero → Official/Partner 组 → 卡片网格；详情：Back + 标题 + install + metadata + TOC + 正文 | title、description、install、repo、type、useCase、sections、demo |
| T14 | Podcasts 索引/单集 | `/podcasts`、`/podcasts/[slug]` | Hero + 主持人/订阅 → 单集网格 → 分页 → FAQ；单集：视频 + 收听链接 + transcript + more | title、date、description、youtube、spotify、apple、transcript[] |
| T15 | Workshops 索引/单场 | `/workshops`、`/workshops/[slug]` | Hero → Upcoming/Past → 分页 → FAQ；单场：日期/时长 + 描述 + hosts + 录像 + more | title、date、duration、description、hosts[]、video、registerUrl |
| T16 | Research 索引/报告 | `/research`、`/research/[slug]` | Hero → 报告卡；报告：面包屑 + 标题 + dek + 作者/日期/时长 + TOC + 正文 + Share | title、description、authors[]、date、readTime、toc、body、links |
| T17 | 书 landing | `/books/principles...`、`/books/patterns...` | 书封 hero + 主题 chips + email 表单 + 印刷量 + 作者 + 视频 + 评价 + 目录 + FAQ | edition、title、description、topics[]、emailForm、printCount、author、testimonials、toc |
| T18 | 资源总览 | `/resources` | H1 + 6 卡网格 | resourceCards[] {label, description, href} |
| T19 | 公司页 | `/about`、`/careers` | About：story/investors/team；Careers：values/culture/podcasts/jobs | sections[]、team[]、jobs[] |
| T20 | 线索/订阅页 | `/contact`、`/newsletter` | H1 + 表单 + 社群链接 | form fields、social links |
| T21 | 法务页 | `/privacy-policy`、`/terms-of-service`、`/legal/dpa` | 标题 + 正文 + Last updated | title、body、lastUpdated |
| T22 | 404 | 任意错误路由 | 创意 404 + Popular paths + What is Mastra + Customers + Recent blog | popular links、about、stories、posts |
| T23 | 活动页 | `/hackathon` | 旧活动 hero + 规则 + 提交 + 注册 | event date、rules、submission、register |

---

### 7. 内容类型清单

| 内容类型 | 典型 URL | 结构特征 | Oribos 适配判断 |
|---|---|---|---|
| 发布公告 / release | `/blog/announcing-*` | 短篇、作者/日期/时长、结尾 CTA/Newsletter | 建；首发 1–2 篇真实公告 |
| 工程深潜 | `/blog/*` | 长文、代码、架构图、作者 bio | 建；从框架架构文档改写 |
| 客户故事 | `/customers/[slug]` | KPI + 元数据 + 正文 + 相关故事 | 弃（无客户）；用场景卡替代 |
| 教程 | `/blog/*`、`/workshops` | 步骤、代码、可复现 | 建；放 docs 或 blog |
| SEO 长文/对比 | `/articles/[slug]` | TOC、Reviewed by、FAQ、内部链接 | 缓；先合并进 blog，等内容量起来再拆 |
| 代码模板 | `/templates/[slug]` | install 命令、repo、type/useCase、TOC | 建；Oribos 有 23 个 examples，最佳适配 |
| 播客 | `/podcasts/[slug]` | 视频、收听链接、transcript | 弃/缓；无媒体运营 |
| 工作坊 | `/workshops/[slug]` | 日期/时长、hosts、录像 | 弃/缓；无活动运营 |
| 研究报告 | `/research/[slug]` | 作者、TOC、benchmark 图表 | 缓；只发可复现、已批准的 1–2 篇 |
| 书 / lead magnet | `/books/*` | 邮箱 gate、印刷量、评价、目录 | 弃；无书 |
| 产品页 | `/ai-agent-framework` 等 | hero + features + pricing + proof + FAQ | 建；Framework 旗舰，Platform 系列缓 |
| 解决方案页 | `/sales-agents` 等 | eyebrow + 3 卡 + FAQ | 建/改；用场景卡，不全量首发 |
| 定价页 | `/pricing` | tabs + plans + matrix | 建；只写真实 free + planned |
| FAQ | 首页/产品/方案 | accordion | 建；全局 + 页面两级 |
| 作者页 | `/authors/[slug]` | bio + 文章列表 | 弃；Oribos 单人署名到 GitHub handle |
| Newsletter | `/newsletter` | 邮箱表单 | 缓/弃；旧 SPEC 明确不做 |
| 招聘 | `/careers` | values + jobs | 弃/缓；无团队 |
| 活动页 | `/hackathon` | 日期 + 规则 + 提交 | 弃；过期活动页 |
| 法务 | `/privacy-policy` 等 | 静态正文 | 建；现有两页可复用 |

---

### 8. 真实内容 vs 占位/孤儿/缺陷

#### 8.1 判断表

| 类别 | 页面 | 证据 | 判断 |
|---|---|---|---|
| 完整真实内容 | `/`、`/ai-agent-framework`、`/ai-agent-deployment`、`/platform-observability`、`/studio`、`/ai-gateway`、`/ai-agents`、`/ai-workflows`、`/ai-agent-observability`、`/rag-pipeline`、`/pricing`、`/customers`、`/blog`、`/articles`、`/templates`、`/podcasts`、`/workshops`、`/research`、`/books/*`、`/about`、`/careers`、`/contact`、`/newsletter`、legal | 200 + 完整模板 + 可交互内容 | 真实、可维护 |
| 真实但薄 | `/sales-agents`、`/marketing-agents`、`/customer-facing-agents`、`/developer-infrastructure`、`/financial-services`、`/healthcare`、`/real-world-agents`、`/company-brain` | 独立正文 46–63 词；仅 3 张客户故事卡 + 通用 FAQ | 营销落地页，不是解决方案内容 |
| 真实但薄（产品） | `/agent-builder`、`/factory`、`/fde-support`、`/resources`、`/research` | Agent Builder 68 词 / 仅 Enterprise / 通用 FAQ；Factory 78 词；FDE 153 词；Resources 132 词；Research 索引 245 词 | 产品/服务/导航页，厚度不足 |
| 孤儿 | `/mcp-registry-registry`、`/resources`、`/hackathon`、`/real-world-agents` | 首页 header/footer 无 mcp/ resources 链接；hackathon 无入链；real-world 仅 footer | 有页面但无导航 |
| 坏链/过期 | `/mcp-registry`（404）、`/fde-support`（不在 pages sitemap）、`/hackathon`（2025 活动） | HTTP 404；sitemap 缺失；文案日期 2025 | 需要修复/归档 |
| 外部产品面 | `agent-builder.mastra.ai`、`gateway.mastra.ai`、`factory.mastra.ai`、`projects.mastra.ai`、`trust.mastra.ai` | 产品页 CTA 指向外部子域 | 营销页是“brochure”，真实产品在别处 |
| 重叠页面 | `/platform-observability` vs `/ai-agent-observability`；`/ai-agent-deployment` vs `/platform`；`/ai-agent-framework` vs `/ai-agents` 等 | 同关键词/同能力，两套模板 | 需要明确“产品页 vs 能力页”分工 |

#### 8.2 页面厚度（脚本统计，仅作相对判断）

| 页面 | 独立正文约 |
|---|---:|
| `/ai-agent-framework` | 722 词 |
| `/ai-gateway` | 313 词 |
| `/studio` | 189 词 |
| `/fde-support` | 153 词 |
| `/ai-agent-deployment` | 109 词 |
| `/platform-observability` | 100 词 |
| `/factory` | 78 词 |
| `/agent-builder` | 68 词 |
| Solutions 8 页 | 46–63 词 |

> 这说明 Mastra 的“产品页”并不都厚；真正撑起产品页的是 feature rows + 代码/截图 + 定价 + 客户案例。Oribos 如果只抄 hero + 三段文字，会得到比 Mastra 更薄的页面。

#### 8.3 站内质量缺陷（可直接变成 Oribos 的验收项）

| # | 缺陷 | 证据 |
|---|---|---|
| Q1 | sitemap 含 404 | `/mcp-registry` 在 pages sitemap，HTTP 404 |
| Q2 | 导航页不在 sitemap | `/fde-support` 在 header/footer，但不在 pages sitemap |
| Q3 | 孤儿资源总览 | `/resources` 在本次抓取范围内仅 `/course` 链到 |
| Q4 | 孤儿 MCP 目录 | `/mcp-registry-registry` 在首页 header/footer 无 nav 入口 |
| Q5 | 过期活动页 | `/hackathon` 是 2025 年活动 |
| Q6 | 命名漂移 | Deployment / Server；Gateway / AI Gateway |
| Q7 | 首页/页脚导航不一致 | 见 §1.2 |
| Q8 | Books 资源卡指向 redirect | `/resources` 的 Book 卡 href=`/books`，最终 301 到 principles book |
| Q9 | 作者页数量大 | pages sitemap 28 个作者页；单人维护的 Oribos 不需要 |
| Q10 | 分类 slug 异常 | sitemap 有 `/blog/category/foundations, case-studies` 这种组合 slug |

---

### 9. Mastra 页面 → Oribos 映射初判

> 初判标签：**建** = 首发建；**改** = 用 Mastra 骨架但换 Oribos 内容；**缓** = 产品/内容成熟后再建；**弃** = 不建。
> Oribos 产品口径（任务输入）：Framework 真实；Platform / Studio / Agent Builder 计划中；MCP Registry 做但无独立产品页；AI Gateway 不做；Solutions 沿用 Mastra 的角色/行业分类。

#### 9.1 Product / 能力页

| Mastra URL | 模板 | 初判 | Oribos 目标 | 理由 |
|---|---|---|---|---|
| `/` | T1 | 改 | `/` | 复用旧站九区：Hero → 事实带 → feature tabs ×5 → observability → 用例卡 ×3 → Resources → FAQ ×9 → Final CTA；用事实带替 logo 墙、用例卡替客户故事 |
| `/ai-agent-framework` | T2 | 建/改 | `/ai-agent-framework` | Framework 真实；把现有关键词页升级为旗舰产品页（hero + 3 feature sections + free/planned pricing + FAQ + chip CTA） |
| `/ai-agents` | T5 | 建 | `/ai-agents` | 旧站已有同 slug 关键词页；保留并补 FAQ/论证卡 |
| `/ai-workflows` | T5 | 建 | `/ai-workflows` | 同上 |
| `/ai-agent-observability` | T5 | 建 | `/ai-agent-observability` | 同上；这是框架能力页，不是 Platform Observability |
| `/rag-pipeline` | T5 | 缓/建 | `/rag-pipeline` | `@oribos/rag` 是能力包，但需内容基线批准；未批准前不建 |
| `/platform-observability` | T3 | 缓 | `/platform/observability` 或不建 | Platform 计划中；避免与 `/ai-agent-observability` 互抢 |
| `/studio` | T3 | 缓 | `/studio` | Studio 计划中；有真实 demo/截图再建 |
| `/agent-builder` | T4 | 缓 | `/agent-builder` | Agent Builder 计划中；首发最多做“planned”状态页，不列定价 |
| `/ai-agent-deployment` | T3 | 缓 | `/platform` 的一个 section | Platform 计划中；不单独做 Server 产品页 |
| `/ai-gateway` | T3 | 弃 | 无 | AI Gateway 不做；模型路由留在 Framework/docs |
| `/factory` | T4 | 弃/缓 | 无 | 无对应产品 |
| `/fde-support` | T20 | 弃 | 无 | 无 FDE/支持团队 |
| `/mcp-registry` | — | 弃 | 无独立页；docs `/docs/mcp` 或 `/ecosystem/mcp` | 任务口径：MCP Registry 做但无独立产品页；Mastra 自己的 `/mcp-registry` 也是 404 |
| `/mcp-registry-registry` | — | 弃 | 无 | 与 Oribos 无关的目录页 |

#### 9.2 Solutions 页

| Mastra URL | 初判 | Oribos 目标 | 说明 |
|---|---|---|---|
| `/sales-agents` | 建/改 | `/sales-agents` | 保留角色分类；用场景卡替客户故事 |
| `/marketing-agents` | 建/改 | `/marketing-agents` | 同上 |
| `/customer-facing-agents` | 建/改 | `/customer-facing-agents` | 可承接旧站 `/in-product-agents` 的内容 |
| `/developer-infrastructure` | 建/改 | `/developer-infrastructure` | 旧站已有同 slug；优先保留 |
| `/financial-services` | 建/改 | `/financial-services` | 行业页；场景卡 |
| `/healthcare` | 建/改 | `/healthcare` | 行业页；场景卡 |
| `/company-brain` | 缓/改 | `/company-brain` | 横切场景；有内容再建，或并入 `/real-world-agents` |
| `/real-world-agents` | 缓 | `/real-world-agents` | 可承接旧站 `/operations-agents`；首发不必全量 |

建议：**分类全保留，页面分批上线**。首发 3–4 个（customer-facing、developer-infrastructure、sales、marketing），其余先不发布或 noindex；不要为了 IA 完整而发空页。

#### 9.3 资源 / 公司页

| Mastra URL | 初判 | Oribos 目标 | 说明 |
|---|---|---|---|
| `/blog` + `/blog/[slug]` + categories | 建 | `/blog` | 首发 3–5 篇真实文章；分类 Announcements / Engineering / Guides；RSS |
| `/articles` + `/articles/[slug]` | 缓/并 | 先并入 `/blog`，后续再拆 `/articles` | Oribos 无 SEO 内容存量；避免两条空线 |
| `/customers` + `/customers/[slug]` | 弃/缓 | 无；有真实社区项目再做 `/showcase` | 无客户案例；不伪造 logo/故事 |
| `/pricing` | 建/改 | `/pricing` | Framework free + Platform planned；不抄 Mastra 的 $250 Teams / usage 价格 |
| `/books/principles...`、`/books/patterns...` | 弃 | 无 | 无书；不要做空书页 |
| `/podcasts` + `/podcasts/[slug]` | 弃/缓 | 无 | 无媒体运营 |
| `/workshops` + `/workshops/[slug]` | 弃/缓 | 无 | 无活动运营 |
| `/research` + `/research/[slug]` | 缓/建 | `/research` | 只发可复现、已批准的研究；首发 1–2 篇 |
| `/templates` + `/templates/[slug]` | 建 | `/templates` | 最佳适配：Oribos 有 23 个 examples；先做 Official，不做 Partner |
| `/resources` | 建 | `/resources` | 资源总览：Docs / Blog / Templates / Research；必须在 header/footer 有入口 |
| `/newsletter` | 缓/弃 | 可选 `/newsletter` | 旧 SPEC 明确不做；如要做，先定邮件服务与隐私 |
| `/careers` | 弃/缓 | 无 | Oribos 单人维护，无招聘 |
| `/contact` | 改 | `/contact` 或 GitHub Issues | 无销售团队；用 GitHub/Discussions 替代 demo 表单 |
| `/about` | 建/改 | `/about` | 保留旧站文本页；不抄投资人/团队 |
| `/hackathon` | 弃 | 无 | 过期活动页 |
| `/docs` + `/learn`（`/course` 视需要） | 建/接 | `/docs` | 接入现有 `oribos-docs`；不要复制 Mastra 的 963 页/6 tab |
| `/authors/[slug]` | 弃 | 无 | 单人署名到 GitHub handle，不做作者页 |
| legal | 建 | `/privacy-policy`、`/terms-of-service` | 复用旧站两页；DPA 视需要 |

#### 9.4 Oribos 首发 IA 建议（树）

```
/                                  Home
/ai-agent-framework                Framework（旗舰产品页）
/ai-agents                         Capability: Agents
/ai-workflows                      Capability: Workflows
/ai-agent-observability            Capability: Observability
/rag-pipeline                      Capability: RAG（内容基线批准后）
/solutions                         解决方案总览（可选，利于内链）
  /sales-agents
  /marketing-agents
  /customer-facing-agents
  /developer-infrastructure
  /financial-services
  /healthcare
  /company-brain                   （缓）
  /real-world-agents               （缓）
/pricing                           Free framework + Platform planned
/resources                         资源总览
  /blog
  /blog/[slug]
  /templates
  /templates/[slug]
  /research                        （缓）
/docs                              oribos-docs（现有 257 页）
/docs/...
/about
/contact                           GitHub Issues / 联系页
/privacy-policy
/terms-of-service
```

后续再开：

```
/platform                          Platform（planned → live）
  /platform/observability
  /platform/deployment
/studio
/agent-builder
/articles
/podcasts
/workshops
/books
/newsletter
/careers
/showcase
```

#### 9.5 Oribos 导航建议

- **Header 首发**：Framework ▾（`/ai-agent-framework`、`/ai-agents`、`/ai-workflows`、`/ai-agent-observability`）→ Solutions ▾（6 项）→ Resources ▾（Blog、Templates、Resources、Research）→ Pricing → Docs → GitHub。**不要**放 Customers（无客户）、Podcasts/Workshops/Books（无内容）、Studio/Agent Builder（未发布）。
- **如果必须露出计划中产品**：在 Product 下拉里加一个 “Platform (Planned)” 分组，包含 Platform / Studio / Agent Builder，并统一带 `Planned` 状态；不要分别做三个一级项。
- **Footer**：Product、Framework、Developers、Solutions、Resources、Company、Connect 七组；与 header 共用一份 nav 数据源；法务行保留 Privacy/Terms；`llms.txt` 可选。
- **CTA**：主 CTA 用旧站的 **agent prompt chip**（隐藏 payload）＋ Quickstart/GitHub；没有销售团队就不要复制 “Get a demo”。
- **Nav 数据源**：单一 `navigation.ts`，header/footer/sitemap/链接检查全部从它派生；这条直接对应 Mastra 的 N1–N5 缺陷。

#### 9.6 Oribos 内容模型建议

| Collection | 字段 | 用途 |
|---|---|---|
| `productPages` | `slug, navLabel, status, hero{eyebrow,h1,subhead,primaryCta,secondaryCta,visual}, sections[], pricing{mode,plans[]}, proof{type,items[]}, faq[], finalCta` | Framework / Platform / Studio / Agent Builder |
| `solutionPages` | `slug, taxonomy, eyebrow, h1, subhead, heroVisual, scenarios[3]{title,body,packages[],href?}, faq[], cta` | 6 个角色/行业页 |
| `blogPosts` | `title, description, category, author, date, readTime, body, related[], newsletter` | Blog |
| `templates` | `title, description, install, repo, type, useCase, sections[], demo` | Templates |
| `research` | `title, description, authors[], date, readTime, body, toc[], links[]` | Research |
| `resourceCards` | `label, description, href, status, count` | `/resources` 总览 |
| `pricing` | `tabs[], plans[], matrix[], support[]` | `/pricing` |

---

### 10. 验收项（给后续 spec / 建站票）

| ID | 验收项 | 判定方式 |
|---|---|---|
| A1 | Header/footer 由同一份 nav 数据生成 | 两处渲染的 href 集合相等；无“header 有/footer 无”或反之 |
| A2 | 所有 nav/footer 链接 200 | `curl -I` 或链接检查脚本；计划中页面允许 200 但必须带 `status: planned` |
| A3 | sitemap 只含已发布 canonical | sitemap URL 集合 == 路由集合；无 404；无 draft/noindex |
| A4 | 无孤儿页 | 每个已发布页面从首页 ≤2 次点击可达；`/resources` 必须有全局入口 |
| A5 | 首页九区顺序固定 | Hero → 事实带 → feature tabs → observability → 用例卡 → Resources → FAQ → Final CTA |
| A6 | 首页无客户 logo/故事伪造 | 搜索 “customer story / logo wall / testimonial”；Oribos 只允许真实素材 |
| A7 | Framework 页达到旗舰厚度 | ≥2 个 feature section、≥6 题 FAQ、pricing 状态、final CTA；正文 ≥300 词 |
| A8 | Solutions 页不是空壳 | 每页 ≥3 张场景卡（含包名）、≥150 词独立正文、≥3 题页面专属 FAQ |
| A9 | 计划中产品页有状态 | `status: planned`、无价格、无“Buy/Get started”假 CTA；CTA = follow/waitlist/GitHub |
| A10 | 资源面无空栏目 | 每个 `/resources` 卡片至少链到 1 条已发布内容；空分类不渲染 |
| A11 | Blog 可运营 | RSS、分类、分页、作者/日期/阅读时长；首发 ≥3 篇真实文章 |
| A12 | Templates 可复现 | 每张卡有 install 命令 + repo；CI 至少校验链接与命令格式 |
| A13 | Docs 单站接入 | `/docs` 200；`/` 不再 301 到 `/docs`；docs sitemap 不与营销 sitemap 冲突 |
| A14 | 重定向台账 | 删/移页面必须登记；404 页有 Popular paths |
| A15 | 移动端 nav 与桌面一致 | 同一组一级/二级项；无仅桌面可见的入口 |
| A16 | 元数据 | 每页 title/description/canonical/og；无重复 title |
| A17 | 命名一致 | 同一产品在 nav、H1、footer、pricing 中同名（避免 Deployment/Server 漂移） |

---

## 对 Oribos 的启示

1. **抄骨架，不抄体量。** Mastra 的营销站是 ~688 条 URL 的内容机器，Oribos 目前是 11 个内容页 + 404 + 257 页 docs。首发应该只建“骨架 + 真实内容”，不要把 Mastra 的每个栏目都做成空壳。可直接复用旧站 `SPEC-revamp` 的首页九区决策：事实带替 logo 墙、用例卡替客户故事、3 卡 Resources 替书+changelog、全局 FAQ ×9、agent prompt chip CTA（`oribos-website/docs/SPEC-revamp.md:152-220`）。

2. **产品页与能力页必须分层。** Mastra 用 `/ai-agent-framework`、`/studio`、`/platform-observability` 等做“商业产品页”（定价 + 案例 + demo），用 `/ai-agents`、`/ai-workflows`、`/ai-agent-observability`、`/rag-pipeline` 做“框架能力/关键词页”（三段论证 + FAQ + Quickstart）。Oribos 已有 4 个关键词页，应该保留这套分层；Platform / Studio / Agent Builder 只做 `planned` 页，不挤进能力页。

3. **Solutions 的分类可以全要，页面不能全发。** Mastra 8 个 Solutions 页每个只有 46–63 词独立正文 + 3 张客户故事卡；它的“内容”其实在 `/customers`。Oribos 没有客户故事，照搬会得到空页。正确做法是：保留 Mastra 的角色/行业 taxonomy（sales、marketing、customer-facing、developer infra、financial services、healthcare，外加 company brain / real-world），但正文用旧站定义的“场景卡”（场景名 + 2–3 句怎么搭 + 包名）替代客户故事；首发只发 3–4 个有真实场景的页面，其余 noindex/hold。

4. **MCP Registry 不要做独立产品页。** Mastra 自己的 `/mcp-registry` 在 sitemap 里但 404，`/mcp-registry-registry` 是无人链接的目录页。这正好印证任务口径：MCP 是框架能力，应该出现在 `/docs/mcp` 或 `/ecosystem/mcp`，不要进 Product 下拉，也不要做“Registry”营销页。

5. **AI Gateway 直接不做。** Mastra 的 `/ai-gateway` 是“Memory + model routing”的商业产品页，和 Oribos 的 `@oribos/model-router` 不是一回事。Oribos 只需在 Framework/docs 里讲模型路由，不要建 `/ai-gateway`，否则会和“零运行时依赖/嵌入宿主”的定位冲突，也会制造一个没有产品支撑的定价页。

6. **资源面只上有跑道的三条：Blog、Templates、Research。** Templates 最适配：`oribos-framework/examples/` 已有 23 个可运行示例（minimal-agent、memory-chat、workflow-approval、agent-supervisor、mcp-tools、model-router、observability 相关等），可以直接生成 `/templates` 卡片与详情页。Blog 首发 3–5 篇真实文章（公告、架构、教程），Research 只发可复现的 1–2 篇。Articles / Podcasts / Workshops / Books 全部缓或弃，不要为了“看起来像 Mastra”而建空栏目。

7. **不要复制“Get a demo”主 CTA。** Mastra 有销售团队和 FDE 服务，所以首页、产品页、Solutions 页、Contact 页全是 demo 线索。Oribos 没有销售团队，主 CTA 应该是 agent prompt chip + Quickstart + GitHub；`/contact` 可以改成 GitHub Issues/Discussions 入口，而不是一个假装有销售跟进的表单。

8. **计划中产品页要有“状态”，不能有“价格”。** Mastra 的 Agent Builder 页是反面教材：68 词、仅 Enterprise、FAQ 复用首页通用题、CTA 指向外部子域。Oribos 如果要在导航里露出 Platform / Studio / Agent Builder，统一用 “Planned” 状态页：说明将做什么、受哪些架构约束、如何跟进（GitHub/roadmap），不写价格、不写“Get started”、不放假截图。

9. **单站 docs 要先解决三个冲突。** ① `oribos-docs` 当前 `/` → `/docs` 301（`redirects.json`），并入单站后必须取消，否则营销首页被重定向；② `oribos-docs` 的 canonical 是 `docs.oribos.dev`，单站要统一到 `oribos.dev`；③ docs 的 IA 是“单车道 + 五族 + 257 页”（`oribos-docs/docs/spec/ia.md:8-42`），不要照抄 Mastra 的 963 页/6 tab。营销 nav 可以丰富，docs 侧栏保持单车道。

10. **用一份 nav 数据源消灭 Mastra 的 IA 缺陷。** 旧站 Header 只有 Use cases / Docs / GitHub / version（`oribos-website/src/components/Header.astro:25-46`），新站的 Product / Solutions / Resources / Pricing / Customers 五组是净新增；而 Mastra 的 header/footer/sitemap 明显不是同一份数据：Studio/Agent Builder/Factory 只在 footer，Articles/Podcast/Patterns 只在 footer，Workshops 只在 header，`/resources` 孤儿，`/fde-support` 不在 sitemap，`/mcp-registry` 404。Oribos 应把 header、footer、sitemap、链接检查全部从 `navigation.ts` 派生，把 A1–A4 作为 CI 门禁。

11. **内容运营 gap 要在 spec 里明说。** Mastra 的资源面是 274 blog + 82 articles + 76 workshops + 123 podcasts + 31 customer stories；Oribos 目前没有 blog/newsletter（旧 SPEC 甚至把“无 blog/newsletter/订阅面”列为红线，见 `oribos-website/docs/SPEC-revamp.md:27`）。新单站要扩到营销 + 资源 + docs，必须在 spec 里显式解除/改写这些旧红线，并给出首发内容清单与 6 个月内容跑道；否则会出现“栏目建好了但没有内容”的空站。

12. **证明方式要换。** Mastra 的可信度来自客户 logo + KPI + 案例；Oribos 没有这些，应改用：架构事实带（0 runtime dependencies、subpath exports、no DB/queue/long-running process、byte budget）、可运行代码、真实 benchmark/研究、场景卡。旧站的 FactsBand 就是这个思路，应该保留并强化，而不是补假 logo。

---

## 来源清单

### Mastra 一手来源（2026-10-20 抓取）

**总览 / sitemap**
- <https://mastra.ai/>
- <https://mastra.ai/sitemap.xml>
- <https://mastra.ai/sitemaps/pages.xml>
- <https://mastra.ai/sitemaps/blog.xml>
- <https://mastra.ai/sitemaps/articles.xml>
- <https://mastra.ai/sitemaps/templates.xml>
- <https://mastra.ai/sitemaps/podcasts.xml>
- <https://mastra.ai/sitemaps/workshops.xml>
- <https://mastra.ai/sitemaps/customers.xml>
- <https://mastra.ai/sitemaps/research.xml>
- <https://mastra.ai/docs/sitemap.xml>

**Product / 能力页**
- <https://mastra.ai/ai-agent-framework>
- <https://mastra.ai/ai-agent-deployment>
- <https://mastra.ai/platform-observability>
- <https://mastra.ai/studio>
- <https://mastra.ai/agent-builder>
- <https://mastra.ai/ai-gateway>
- <https://mastra.ai/factory>
- <https://mastra.ai/fde-support>
- <https://mastra.ai/ai-agents>
- <https://mastra.ai/ai-workflows>
- <https://mastra.ai/ai-agent-observability>
- <https://mastra.ai/rag-pipeline>
- <https://mastra.ai/mcp-registry>（HTTP 404）
- <https://mastra.ai/mcp-registry-registry>

**Solutions**
- <https://mastra.ai/sales-agents>
- <https://mastra.ai/marketing-agents>
- <https://mastra.ai/customer-facing-agents>
- <https://mastra.ai/developer-infrastructure>
- <https://mastra.ai/financial-services>
- <https://mastra.ai/healthcare>
- <https://mastra.ai/company-brain>
- <https://mastra.ai/real-world-agents>

**资源 / 公司页**
- <https://mastra.ai/pricing>
- <https://mastra.ai/customers>
- <https://mastra.ai/customers/salesforce>
- <https://mastra.ai/blog>
- <https://mastra.ai/blog/announcing-mastra-launch>
- <https://mastra.ai/articles>
- <https://mastra.ai/articles/ai-agent-framework>
- <https://mastra.ai/templates>
- <https://mastra.ai/templates/deep-search>
- <https://mastra.ai/podcasts>
- <https://mastra.ai/podcasts/le-chonk-also-espionage-at-openai>
- <https://mastra.ai/workshops>
- <https://mastra.ai/workshops/build-a-chatgpt-extension-with-mastra-2026-10-08>
- <https://mastra.ai/research>
- <https://mastra.ai/research/observational-memory>
- <https://mastra.ai/books/principles-of-building-ai-agents>
- <https://mastra.ai/books/patterns-of-building-ai-agents>
- <https://mastra.ai/resources>
- <https://mastra.ai/newsletter>
- <https://mastra.ai/careers>
- <https://mastra.ai/contact>
- <https://mastra.ai/about>
- <https://mastra.ai/hackathon>

### Oribos 本地来源（只读）

| 路径 | 用途 |
|---|---|
| `/Users/nicholasl/Documents/build-whatever/oribos-www/AGENTS.md` | 报告仓库约定（issue tracker / domain docs / triage labels） |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/CONTEXT.md` | 营销站范围、术语、用例页/场景卡/关键词页/agent prompt CTA/无客户案例等定义 |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/docs/SPEC-revamp.md` | 旧营销站九区首页、Mastra 11 区裁定、旧红线（无 blog/newsletter/客户案例） |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/src/pages/index.astro` | 首页 9 区实际组件顺序 |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/src/components/Header.astro` | 旧 header（Use cases / Docs / GitHub / version） |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/src/components/Footer.astro` | 旧 footer（4 栏 + legal） |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/src/content.config.ts` | 旧 content collections（hero/features/useCases/keywordPages/faq 等） |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/src/lib/navigation.ts` | 旧 nav 数据源（3 个用例 + 4 栏 footer） |
| `/Users/nicholasl/Documents/build-whatever/oribos-website/src/lib/links.ts` | docs/examples/releases 等外链常量（docs 仍指 GitHub fallback） |
| `/Users/nicholasl/Documents/build-whatever/oribos-framework/CONTEXT.md` | Framework 真实能力、`@oribos/rag`、`@oribos/model-router`、Harness 定义 |
| `/Users/nicholasl/Documents/build-whatever/oribos-framework/docs/ROADMAP.md` | Studio/托管平台/AgentController 出域（约 :172、:290、:311） |
| `/Users/nicholasl/Documents/build-whatever/oribos-framework/examples/` | 23 个可运行示例（templates 的真实素材） |
| `/Users/nicholasl/Documents/build-whatever/oribos-docs/CONTEXT.md` | 文档站范围、单项目/多项目缝、英文优先 |
| `/Users/nicholasl/Documents/build-whatever/oribos-docs/docs/spec/ia.md` | docs 单车道、五族、`/docs` 路由、257 页口径 |
| `/Users/nicholasl/Documents/build-whatever/oribos-docs/redirects.json` | 当前 `/` → `/docs/` 301 |
| `/Users/nicholasl/Documents/build-whatever/oribos-docs/astro.config.mjs` | docs 的 `site`/`base`/Starlight 配置（base 未设，`/docs` 来自嵌套目录） |

### 复核命令（可复现）

```bash
# 页面状态
curl -sL -o /dev/null -w '%{http_code} %{url_effective}\n' https://mastra.ai/mcp-registry

# sitemap 计数
for s in pages blog articles templates podcasts workshops customers research; do
  printf '%s ' "$s"; grep -o '<loc>' "mastra-$s.xml" | wc -l
done

# 首页 nav/footer 的 href 集合（HTML 抓取后）
grep -o 'href="[^"]*"' home.html | sort -u
```

---

*本报告只新增 `docs/research/mastra-marketing-audit.md`，未修改其他文件、未执行 git 操作、未创建/编辑 issue。*
