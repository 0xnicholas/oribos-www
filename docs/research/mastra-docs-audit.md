# Mastra 文档站 IA 与内容模型审计（票 #3 / `mastra-docs-audit`）

> **研究日期**：2026-10-20
> **范围**：`mastra.ai` 的文档面——`/docs`、`/reference`、`/models`、`/integrations`、`/learn`——以及 Oribos 本地四仓（`oribos-www`、`../oribos-website`、`../oribos-docs`、`../oribos-framework`）的源文件。
> **方法**：只读抓取 `https://mastra.ai/docs/sitemap.xml`（963 条 URL）、根 `/llms.txt`、代表性页面 HTML 与 `.md` twin；读取 Mastra 的 Docusaurus 侧栏配置、前端主题组件与模型文档生成器；本地只读三仓的规范、内容树、frontmatter schema 与构建产物。未使用任何二手博客或第三方总结。
> **口径**：Mastra 是快速变化站点，本报告是 **2026-10-20 的快照**；所有页数、分类数、链接数均以当日 sitemap、HTML 与 `.md` 输出为准。Mastra 手写 docs 页的 “Edit this page” 指向 `mastra-ai/mastra` 仓库的 `docs/src/content/en/**`，本报告把该源文件当作 docs 的一手内容源引用（页面结论均可在对应 `mastra.ai` URL 复核；生成页以生成器源码为准）。

---

## TL;DR

1. **Mastra 的“docs”不是单站，而是 6 个顶层入口的合集**：Docs 125 页、Reference 458 页、Models 242 页、Integrations 121 页、Learn 17 页，合计 **963 条 URL**；其中 `/docs/mastra-platform/**` 的 19 页产品文档已包含在 Docs 125 页内。实现上是 **4 个 Docusaurus docs 实例**（default / reference / models / integrations）＋ 1 个独立课程页（Learn）。
2. **Docs 主体只有 125 页，但用了三层导航**：5 个不可折叠的一级组（Build / Extend / Develop·Deploy / Observe / More）→ 19 个二级项（其中 13 个是 contextual category）→ 进入后侧栏整体切换成该子系统的页面列表，带返回按钮。二级项被刻意控制在 19，避免 125 页平铺。
3. **页面模板是“任务优先的长页”**：18 个 overview；45/125 页有 `## When to use`，37/125 页有 `## Quickstart`，71/125 页以 `## Related` 收尾；docs 正文中位数 **1,318 词**，p90 2,841 词，最长 7,423 词。Reference 是另一套：458 页、中位数 555 词，60 页抽样中 38 页有 `Usage example`，以“用法 + 参数/返回”为主。
4. **规模控制靠“分域 + 折叠 + 索引 + 生成”**：Models 的 230 个 provider 页由 `generate-model-docs.ts` 生成，侧栏 220 项（7 个 popular 置顶）；Models 首页只放精选卡 + “+N more”；Integrations 12 类、默认折叠、索引页带客户端搜索；Reference 36 个一级分类、默认折叠。代价是出现 **9 个 provider 孤儿页**、1 个 deprecated 孤儿页、没有人类可读的全站索引。
5. **阅读面是“文档 + agent 双面”**：Algolia 搜索（⌘K）＋ Kapa “Ask AI”；Copy page 默认复制 `.md`，菜单可打开 ChatGPT / Claude / T3 Chat / Copilot / Cursor；每页有 `.md` twin、`/llms.txt`、`Accept: text/markdown`；但**没有页面级 feedback、没有 last updated、没有版本选择器**。
6. **版本策略是 latest-only**：URL 无版本段，迁移指南放 `/reference/migrations/**`；侧栏用 `customProps.tags` 渲染 New/Advanced/Beta/Alpha/Deprecated 徽标，当前只有 4 个 `new` 标签、2 个 deprecated 标签；changelog 不在 docs，而在 GitHub Releases 与 blog 的 `changelogs` 分类。
7. **docs 与营销站是双向深链**：5 个产品页共 27 个不同 docs 链接，其中 8 个是 308 重定向（旧 slug 全部有重定向，无 404）；docs 首页 44 个链接里 26 个指向 `/customers/*` 与 `/templates/*`，7 个指向 integrations；docs 右栏每页有 Platform 卡，顶栏有 Platform tab，footer 有 14 个营销链接。
8. **对 Oribos 的直接结论**：Oribos 目前 19 手写页 + 249 生成 API 页，远未到 Mastra 的规模；应保留“单 Documentation 车道 + 五族侧栏”，**不要抄** 6 个 tab、220 项模型侧栏、121 页集成目录、458 页手写 reference。**要抄**的是 contextual sidebar、overview 的“能力表”、页尾 Related、Copy page + `.md` twin、重定向台账，以及“计划中产品只留一个占位页”的克制。

---

## 详细发现

### 1. 站点骨架：6 个顶层入口，4 个 docs 实例

Mastra 的文档面顶部有一条 6 项 tab 栏。它不是 6 个独立站点，而是 Docusaurus 多实例 + 一个自定义课程页拼出来的：

| Tab | URL 根 | 实现 | 页数 | 侧栏 |
| --- | --- | --- | ---: | --- |
| Docs | `/docs` | docs 实例，`docusaurus_tag=docs-default-current` | 125 | `docsSidebar` |
| Models | `/models` | docs 实例，`docs-models-current` | 242 | `modelsSidebar` |
| Integrations | `/integrations` | docs 实例，`docs-integrations-current` | 121 | `integrationsSidebar` |
| Reference | `/reference` | docs 实例，`docs-reference-current` | 458 | `referenceSidebar` |
| Learn | `/learn` | 自定义页面（非 docs 插件） | 17 | 无 |
| Platform | `/docs/mastra-platform/overview` | 同一个 docs 实例，`platformSidebar` | 19 | `platformSidebar` |

> 注：Platform 的 19 页是 Docs 125 页的子集（URL 在 `/docs/mastra-platform/**`），不另计入 963。6 个 tab 中只有 Models / Integrations / Reference 是独立 URL 根；Learn 是独立页面集合；Platform 是 Docs 内部的独立侧栏区。

证据：

- 每个页面的 `<meta name=docusaurus_tag>` 不同，等于告诉 Algolia 这 4 个内容域是 4 个索引分区（`https://mastra.ai/docs/agents/overview`、`https://mastra.ai/models/providers/openai`、`https://mastra.ai/integrations/channels/slack`、`https://mastra.ai/reference/agents/agent`）。
- 顶栏 tab 的源码数组在 `docs/src/theme/Navbar/tab-switcher.tsx`（由页面 bundle 内联）：`Docs / Models / Integrations / Reference / Learn / Platform`，其中 Platform 的 `basePath` 是 `/docs/mastra-platform`。
- Platform 的 URL 仍挂在 `/docs` 下，但侧栏完全独立（`platformSidebar`），是“产品文档区嵌在 docs URL 树里”的做法。

**关键判断**：Mastra 的 6 tab 是“900+ 页 + 多产品”的函数，不是文档 IA 的默认形态。Oribos 的 `oribos-docs` 规范已经明确写过这一点（`../oribos-docs/docs/spec/ia.md:10`）：6 tab 是 ~900 页 + 多产品的函数，首发 12–17 页不照抄。本次审计支持这个判断。

---

### 2. Docs IA 树（125 页）

下面是从 `docs/sidebars.js` 与 `/docs/sitemap.xml` 逐项对齐后的完整树。括号内是该二级项的页面数；“†”表示该页不在 docs 侧栏（但仍可访问）。

```text
/docs                                      Get Started（兼 docs landing）        1
/docs/develop                              Develop（本地开发循环）              1
/docs/license †                            License（footer 链接，不在侧栏）      1

Build
  Agents (8)            overview, tools, structured-output, human-in-the-loop,
                        guardrails, processors, code-mode, networks †(deprecated)
  Workflows (11)        overview, workflow-state, control-flow, agents-and-tools,
                        dynamic-workflows, snapshots, suspend-and-resume,
                        human-in-the-loop, time-travel, error-handling,
                        scheduled-workflows
  Harness (8)           overview, durable-agents, background-tasks, goals, schedules,
                        signals, signal-providers, agent-controller
  Memory (7)            overview, message-history, observational-memory,
                        working-memory, semantic-recall, memory-processors,
                        multi-user-threads

Extend
  Subagents (1)         subagents
  Skills (1)            skills
  Channels (1)          channels
  Sandboxes (6)         overview, filesystem, search, skills, computer, lsp
  Browser (1)           browser
  Connections (5)       overview, mcp, a2a, acp, sdk-agents

Develop / Deploy
  Storage (1)           storage
  Server (8)            overview, server-adapters, custom-adapters, middleware,
                        request-context, pubsub, custom-api-routes, mastra-client
  Studio (5)            overview, deployment, auth, observability, editor
  Auth (7)              overview, composite-auth, custom-auth-provider, fga, jwt,
                        simple-auth, workers
  Deploy (8)            overview, mastra-server, monorepo, cloud-providers, sandbox,
                        web-framework, workflow-runners, workers

Observe
  Traces (5)            observability/overview, tracing/overview, logging, feedback,
                        integrations/exporters/mastra-storage
  Metrics (1)           observability/metrics/overview（与 Traces 共用同一条 URL，只计 1 页）
  Evals (11)            overview, built-in-scorers, quick-checks, gates-and-verdicts,
                        multi-turn, custom-scorers, running-in-ci,
                        vitest-integration, evals-with-memory, datasets, experiments

More
  Guides (8)            overview, multi-agent-systems, context-engineering,
                        agent-lifecycle, authentication-identity,
                        mcp-authentication-authorization, streaming,
                        build-an-eval-loop

Platform（独立侧栏，URL 仍在 /docs 下）
  Overview, Deploy, Environments, System environment variables, Regions,
  Connect/{overview, providers, tools, channels}, Observability, Alerts,
  Trace Intelligence, Studio, Server, GitHub integration, Hosted databases,
  Workspaces, Configuration, API Reference                                 19
```

合计：3（Get Started / Develop / License）+ 34（Build）+ 15（Extend）+ 29（Develop·Deploy）+ 17（Observe，Traces 5 + Metrics 1 + Evals 11）+ 8（Guides）+ 19（Platform）= **125**。

**页面清单层面的两个异常**：

- `/docs/agents/networks` 在 sitemap 里（200），但**不在侧栏**。页面开头是 `> **Deprecated:** Agent networks are deprecated...`，并指向 `/reference/migrations/network-to-supervisor`。这是 Mastra 的“弃用但保留 URL”模式：正文保留、侧栏移除、靠搜索/旧链/迁移指南到达。
- `/docs/license` 同样不在 docs 侧栏，只从 footer 的 “License” 链接进入。它不是文档内容，而是法务页被放进了 docs 路由树。

**Docs 的 18 个 overview 页**（`*/overview` 或 `index`）占 125 页的 14%，承担“二级项落地页 + 子页面卡片/表格”的职责；并非每个二级项都有 overview（Subagents / Skills / Channels / Browser / Storage 是单页）。

---

### 3. 侧栏机制与分组逻辑

#### 3.1 全局侧栏 vs 上下文侧栏

Docs 侧栏不是一棵展开的 125 页大树，而是两层结构：

1. **全局面板（root pane）**：2 个直达链接（Get Started、Develop）＋ 5 个不可折叠的分组标题（`collapsed: false, collapsible: false`）＋ 19 个二级项。
2. **上下文面板（contextual pane）**：点击 13 个 contextual category 之一后，整个侧栏切换成“返回按钮 + 该子系统页面列表”；返回后回到全局面板。

这 13 个 contextual category 是：Agents、Workflows、Harness、Memory、Sandboxes、Connections、Server、Studio、Auth、Deploy、Traces、Evals、Guides。其余二级项是单页链接（Subagents、Skills、Channels、Browser、Metrics），没有第三层。

实现证据：

- `docs/sidebars.js` 中每个 category 带 `customProps: { contextualSidebar: true }`，并带 `link: { type: 'doc', id: '<section>/overview' }`。
- `docs/src/theme/contextual-sidebar.ts` 负责从当前 pathname 反查所属 category、收集该 category 下所有 pathname，并在点击时切换面板；`ContextualContent` 组件渲染“Back to global sidebar”按钮。
- 侧栏配置里 `Build / Extend / Develop / Deploy / Observe / More` 五个一级组都是 `collapsible: false`，所以全局面板永远只有 19 行，不会因为某个子系统很长而把整棵树撑开。

**分组逻辑**：不是按字母、不是按产品模块，而是按“用户旅程 + 关注面”：

| 一级组 | 回答的问题 | 放什么 |
| --- | --- | --- |
| Build | 构建 agent 的核心原语 | Agents、Workflows、Harness、Memory |
| Extend | 让 agent 接触外部世界 | Subagents、Skills、Channels、Sandboxes、Browser、Connections |
| Develop / Deploy | 把 agent 跑起来、管起来 | Storage、Server、Studio、Auth、Deploy |
| Observe | 上线后的质量与可观测性 | Traces、Metrics、Evals |
| More | 跨子系统的设计/任务指南 | Guides |

这套分组把“概念、任务、运行时、运维”混在同一层，但用一级组给出了阅读顺序。它的代价是：`Storage` 这种基础概念被放进 Develop/Deploy，`Metrics` 与 `Traces` 共用一个 overview，边界并不完全干净。

#### 3.2 面包屑、上一篇/下一篇

- 面包屑是 **2 层**：category > page。例如 `/docs/agents/tools` 的 JSON-LD 是 `Agents > Tools`；overview 页只有 category 自身（`Build` 这一级不在 JSON-LD 里，UI 上会显示 `Build > Agents`）。
- 上一篇/下一篇在正文末尾，由侧栏顺序生成；`pagination_next: null` / `pagination_prev: null` 可以关闭（Integrations 索引页就关闭了两端）。
- Docs 首页只有 “Next: Develop”，没有 Previous。

#### 3.3 为什么是 19 个二级项

19 个二级项对应 5 个组：Build 4、Extend 6、Develop/Deploy 5、Observe 3、More 1。这是一个可扫描的宽度；再多的子系统会被塞进某个二级项的上下文面板，而不是继续加全局行。对比：Reference 的 36 个一级分类、Models 的 220 个 provider 则采用“折叠分类”而不是 contextual pane，因为它们是查阅型、不是阅读型。

---

### 4. 页面模板清单

Mastra 没有在 frontmatter 里声明 `template`；模板是从目录位置 + 正文骨架 + 组件用法中体现的。抽样后可以归纳为 11 类。下表“标题模式”用 `Page · Parent` 表示页面 `<title>` 实际拼接的 `Page | Parent`；完整标题还会再追加 `| Mastra Docs`。

| # | 模板 | 典型 URL | 规模 | 标题模式 | 正文骨架（H2） |
| --- | --- | --- | ---: | --- | --- |
| 1 | Docs landing / Get Started | `/docs` | 1 | `Get started with Mastra`（H1 是 `Get started`） | Quickstart → Integrate with your framework → Templates → Use cases → Video |
| 2 | Section overview | `/docs/agents/overview` | 18 | `Agents` | 简介 → When to use → Quickstart → “Expand your agent”能力表 → Multi-agent systems → Related |
| 3 | Concept / how-to 混合页 | `/docs/agents/tools` | ~80 | `Tools · Agents` | 简介 → When to use → Quickstart → 多个任务 H2 → Related |
| 4 | Guide | `/docs/guides/multi-agent-systems` | 7 | `Multi-agent systems` | 简介 → When to use → 各模式（Handoffs / Workflows / Supervisors / Council）→ Choosing a pattern → Related |
| 5 | Integration 页 | `/integrations/channels/slack` | 121 | `Slack · Channels` | 简介 → Installation → Create app → Credentials → Webhook route → Try it → Auth → Request context → Production → Related |
| 6 | Model provider 页（生成） | `/models/providers/openai` | 230 | `OpenAI Models: IDs, Pricing & Usage` | Logo H1 → 简介 + 环境变量 → `.env` → 最小 agent 示例 → Models 表 → Advanced configuration → Provider Options |
| 7 | Model 目录 / 索引（生成） | `/models`, `/models/providers` | 2 | `Model Providers` / `Providers` | 编辑正文（Features / Basic usage / Model directory / …）+ 精选卡 + “+N more”；Providers 索引是纯 CardGrid |
| 8 | API reference 页 | `/reference/agents/agent` | 458 | `Reference: Agent class · Agents` | 简介 → Usage examples → Model strings / Constructor parameters → Methods → Returns → Related |
| 9 | Migration 页 | `/reference/migrations/upgrade-to-v1/overview` | 23 | `Overview · v1 Migration Guide` | 简介 → Migration strategy → Breaking changes by area → Migration checklist（High/Medium/Low） |
| 10 | Platform 产品文档 | `/docs/mastra-platform/overview` | 19 | `Overview · Mastra platform` | 简介 → Get started → Key concepts → Going to production |
| 11 | Learn 课程页（自定义） | `/learn/create-an-agent` | 17 | `Create an Agent · Mastra · Mastra Docs`（重复 Mastra，见 §10） | 课程正文 → Mentioned in the lesson → Join the community |

#### 4.1 Docs landing（`/docs`）的实际结构

这是“文档首页 = 上手页 + 营销页”的混合体：

1. **Quickstart**：`npm create mastra@latest`，npm/pnpm/Yarn/Bun 四个 tab；“Open Studio immediately” 链到 `/docs/studio/overview`。
2. **Integrate with your framework**：6 个框架卡（Next.js / React + Vite / Astro / Express / SvelteKit / Hono），加 “integration guides” 链到 `/integrations`。
3. **Templates**：一个卡链到 `https://mastra.ai/templates`。
4. **Use cases**：26 张卡，混合 `/customers/*`（16 张）与 `/templates/*`（10 张），外加 `https://factory.mastra.ai/` 与 YouTube 视频。
5. **Video**：`A quick tour of the Mastra platform`。

内容链接统计：44 个链接中，26 个是营销站（customers/templates），7 个是 integrations，5 个外部，4 个页内锚点，1 个 docs 自身。**docs 首页不是“文档目录”，而是第二个产品首页**；全局导航完全交给侧栏 + 搜索。

#### 4.2 Section overview 的“能力表”

`/docs/agents/overview` 在 Quickstart 之后有一张 “Expand your agent” 表，列为 `Goal | Start here`，12 行目标 → 链接（Tools、Memory、Structured output、Human-in-the-loop、Supervisor、Processors、Guardrails、Rubric scorer、Dynamic configuration、Voice、Channels）。这是 Oribos 概念页可以直接借用的“下一步路由表”：读者不必猜下一个该读什么。

#### 4.3 Concept / how-to 页的长度与结构

- 125 页的正文中位数 1,318 词，p90 2,841 词，最大 7,423 词；12 页超过 3,000 词。
- 45 页有 `## When to use`，37 页有 `## Quickstart`，12 页有 `## Next steps`。
- 这些页不是“纯概念”：概念解释通常只占开头 2–4 段，随后是 Quickstart、配置、边界情况、与其他子系统的组合。Mastra 把“学”和“做”压在同一页，用 `When to use` 做分流，用 `Related` 做出口。
- 71/125 页以 `## Related` 收尾，Related 是普通 bullet list，不是卡片；`/docs/agents/tools` 的 Related 有 12 条，等于一个小型 hub。

#### 4.4 Integration 模板

以 Slack 为例，H2 序列是：`Installation → Create a Slack app → Set Slack credentials → Configure the webhook route → Try it in Slack → Authentication → Request context → Production deployment → Related`。每个 integration 页都遵循“安装 → 在第三方后台建应用 → 放凭据 → 配路由 → 试一次 → 认证/上下文 → 生产注意”的路径；这是“外部系统接入”的稳定模板，不是通用 concept 模板。

#### 4.5 Model provider 模板（生成）

`packages/core/scripts/generate-model-docs.ts` 是唯一真相源：

- 生成注释：`{/* This file is auto-generated by generate-model-docs.ts - DO NOT EDIT MANUALLY */}`。
- 正文顺序固定：带 logo 的 H1 → `Access N <Provider> models through Mastra's model router...` → `.env` 代码块 → 最小 agent 示例 → `## Models`（`<ProviderModelsTable>` 组件，含 ID、能力、上下文窗口、价格）→ `## Advanced configuration`（Custom headers / Dynamic model selection）→ `## Provider Options`。
- 标题/描述由 `model-doc-metadata.ts` 按“是否有价格 / 是否有上下文窗口”三档生成：
  - 有价格：`<Provider> Models: IDs, Pricing & Usage`
  - 只有上下文：`<Provider> Models: IDs, Context & Usage`
  - 都没有：`<Provider> | Models`
- 模型数据来自 `models.dev`，页面末尾有 attribution。
- Provider 索引页是生成的 `CardGrid`，每张卡是 `title + "N models" + logo + href`；侧栏也是生成的，7 个 popular provider 置顶，其余按字母序。

#### 4.6 API reference 模板

Reference 不是 TypeDoc 生成，而是**手写 MDX 为主**：抽样 60 页中只有 3 页出现 `auto-generated` 标记（且是局部表格），其余页面有完整的 `Usage example` / `Parameters` / `Returns` / `Related` 叙述。H2 频率：`Usage example` 38/60、`Related` 33/60、`Parameters` 21/60、`Returns` 16/60、`Methods` 13/60、`Constructor parameters` 10/60。

这意味着 Mastra 的 reference 同时承担“查签名”和“看用法”两个职责，页面中位数 555 词，比 docs 页短，但仍有可运行示例。

补充：`/reference` 索引页是手写 MDX，但卡片由 `ReferenceCards` 组件渲染；`/docs/guides/overview` 用 `CardGrid` 组件；`/docs` 的 Use cases 卡是手写链接网格。也就是说，“索引页”可以是手写页面 + 组件渲染，不必把卡片数据写进正文。

#### 4.7 Migration 模板

`/reference/migrations/upgrade-to-v1/overview` 的结构：简介（含“先升到最新 0.x”前置）→ `Migration strategy`（升级包、Node 版本、走 checklist）→ `Breaking changes by area` → `Migration checklist`（High / Medium / Low Impact Changes）。迁移页不是按版本号分 URL，而是按“迁移主题”分页（mcp-v2、ai-sdk-v4-to-v5、mastra-cloud、network-to-supervisor、upgrade-to-v1/*）。

#### 4.8 Platform 模板

`/docs/mastra-platform/overview` 只有三个 H2：`Get started`、`Key concepts`、`Going to production`。Platform 的 19 页是产品文档，不是框架文档；它复用 docs 的渲染器与侧栏机制，但内容边界是“托管产品的使用说明”。

#### 4.9 Learn 模板

`/learn` 是 17 课的线性课程，分 5 个 track（Agents / Tools / Workflows / Memory / Production），每课标 3–9 分钟；索引页有 “Head to the first lesson”；课程页没有 docs 侧栏、没有 TOC、没有 Copy page、没有 `.md` twin，也不在 `/llms.txt` 里。它是“课程/教程”内容类型，不是 docs 插件的一部分。

---

### 5. 内容模型与 frontmatter 字段

#### 5.1 页面级 frontmatter（作者可写）

Mastra 的 frontmatter 非常薄。抽样 20+ 个代表页 + 校验脚本后，字段如下（示例中的 `·` 代表实际标题里的 `Page | Parent` 分隔符）：

| 字段 | 出现范围 | 必填 | 示例 | 用途 |
| --- | --- | --- | --- | --- |
| `title` | 所有页 | 是 | `"Tools · Agents"`、`"Reference: Agent class · Agents"` | `<title>`、OG、搜索；可与正文 H1 不同 |
| `description` | 所有页 | 是 | `"Create schema-validated Mastra tools..."` | meta description、搜索摘要、OG |
| `packages` | docs / reference / integrations 多数页 | 是（有例外） | `["@mastra/core", "@mastra/evals"]` | 包→文档映射；校验脚本要求非空且匹配 `@mastra/*` / `mastra` / `create-mastra` |
| `sidebar_position` | `/docs` 首页 | 否 | `1` | docs 首页排序 |
| `sidebar_label` | `/docs` 首页 | 否 | `Get Started` | 侧栏显示名 |
| `hide_table_of_contents` | `/integrations` 索引 | 否 | `true` | 隐藏右栏 TOC |
| `pagination_next` / `pagination_prev` | `/integrations` 索引 | 否 | `null` | 关闭上一篇/下一篇 |
| `custom_edit_url` | `/integrations` 索引 | 否 | `null` | 关闭 “Edit this page” |
| `slug` / `draft` / `date` / `author` / `tags` / `version` / `order` | 未观察到 | — | — | Mastra 不在 frontmatter 里表达这些 |

`packages` 的校验脚本是 `docs/scripts/validate-frontmatter.ts`，它显式跳过了以下路径（这些页面不要求 `packages`）：`guides/`、`integrations/deploy`、`docs/license.mdx`、`docs/getting-started/`、`docs/mastra-platform/`、`docs/index.mdx`、`models/`、`docs/studio/cloud.mdx`。这说明 `packages` 是“需要被包→页映射消费的页面”字段，不是全站必填。

#### 5.2 侧栏级元数据（不是 frontmatter）

Mastra 把导航形态、徽标、图标都放在 `sidebars.js` 的 `customProps` 里：

| 字段 | 作用 | 例子 |
| --- | --- | --- |
| `label` | 侧栏显示名 | `Agents`、`Connect` |
| `collapsed` | 分类是否默认折叠 | Integrations 全部 `true`；Models 的 Gateways/Providers `false` |
| `link` | 分类标题点击后落到哪 | `{ type: 'doc', id: 'agents/overview' }` |
| `customProps.contextualSidebar` | 是否启用上下文侧栏 | Agents / Workflows / … / Guides 为 `true` |
| `customProps.tags` | 徽标 | `['new']`；当前只用了 4 次 |
| `customProps.icon` / `iconDark` / `customCSS` | Integration 卡片/侧栏图标 | 来自 `cdn.simpleicons.org` 或 `svgl.app` |

徽标组件 `docs/src/components/SidebarBadge.tsx` 支持 5 种：`new`、`advanced`、`beta`、`alpha`、`deprecated`；当前实际使用：4 个 `new`（Guides 的 Agent lifecycle / Build an eval loop、Platform 的 Connect / Alerts），2 个 `deprecated` 写在 Reference 的 label 字符串里（`CloudExporter (deprecated)`、`DefaultExporter (deprecated)`）。

#### 5.3 生成标记与手工/生成边界

| 内容面 | 手工 | 生成 | 证据 |
| --- | --- | --- | --- |
| Docs 125 页 | 是 | 否 | `docs/src/content/en/docs/**` |
| Integrations 121 页 | 是（单页 MDX） | 索引页由 `sidebars.js` 数据驱动 | `integrations/index.mdx` 引入 `IntegrationsPage`；`components/integrations/data.ts` 读侧栏 |
| Models 242 页 | 索引正文是手写 | 230 个 provider URL + 9 个 gateway URL + 3 个单页；索引与 `models/sidebars.js` 由 `generate-model-docs.ts` 生成 | 生成注释 + 生成器源码 |
| Reference 458 页 | 以手写 MDX 为主 | 未见整树生成标记 | 60 页抽样，3 页有局部 auto-generated |
| Learn 17 页 | 是 | 否 | 自定义课程页 |
| 根 `/llms.txt` | — | 由 `docusaurus-plugin-llms-txt` 从侧栏生成 | 插件目录 `docs/src/plugins/docusaurus-plugin-llms-txt/` |

#### 5.4 `.md` twin 与页面正文的差异

Mastra 的 `.md` twin 不是“源文件原文”，而是“面向 agent 的整理版”：

- 开头固定两段 blockquote：`> Mastra docs are the canonical, current reference...` 和 `> Discover all available pages from the documentation index: https://mastra.ai/llms.txt`。
- 正文中会出现 HTML 上不可见的 “**For AI agents:**” 注入块。例如 `/docs/agents/overview.md` 在简介后有一段很长的“condensed instructions”；对应 HTML 里是 `<div data-mid=inject style=display:none aria-hidden=true>`，人类看不见，但 `.md` 里有。
- 页面上的 Platform 促销卡带 `data-llms-ignore`，不会进入 `.md` / LLM 抽取；Newsletter 是没有正文的表单，也不在 `.md` 里。
- `.md` 不保留 frontmatter（没有 `---` 头），标题/描述只出现在页面 `<title>` / meta 中。

这一点与 Oribos 的 `.md` twin 规范相反：`../oribos-docs/docs/spec/agent-surface.md` §2 明确要求 twin = 源文件原文 + frontmatter，不做后处理。**Oribos 不应无意中引入 Mastra 的“twin 与 HTML 不一致”模式**；如果要在 twin 里放 agent 专用指令，应单独定义字段/区块，而不是靠隐藏 div。

#### 5.5 与 Oribos 现有内容模型的对照

| 维度 | Mastra | Oribos 现状（`../oribos-docs/src/lib/frontmatter.ts`） |
| --- | --- | --- |
| 核心字段 | `title`、`description`、`packages` | `title`、`description`、`project`、`subtype`、`order`、`packages`、`source` |
| 导航顺序 | 全部在 `sidebars.js` | `order` 写在页面 frontmatter，侧栏显式声明 |
| 生成页 | 模型页用注释标记，无 schema | `generated: true` + `editUrl:false` + `next:false` + `prev:false` |
| 版本/日期 | 无 | 无（用 `source.ref` / 钉定 pin 回答“对应哪个框架版本”） |
| 包映射 | `packages` 仅部分页面 | `packages` 所有 authored 页必填，值域与 `package.json` exports 对齐 |
| 迁移子型 | 独立 `/reference/migrations/**` | `subtype: migration`，仍在 Guides 族 |
| 多项目 | 无 | `project` 字段 + `/<slug>/docs/**` 预留 |

Oribos 的 schema 比 Mastra 更严格、更适合“内容真相源 + 包→页映射”；新站应**保留 Oribos schema**，只补 Mastra 的“侧栏徽标 / Related / Copy page”这些表现层机制。

---

### 6. 规模控制：963 页怎么组织

#### 6.1 总量

| 内容域 | 页数 | 组织方式 | 侧栏默认状态 |
| --- | ---: | --- | --- |
| Docs | 125 | 5 组 + 19 二级 + 13 上下文面板 | 全局 19 行，永远可见 |
| Reference | 458 | 36 个一级分类（含嵌套共 52 个） | 分类全部折叠 |
| Models | 242 | Gateways 9（索引 + 8）+ Providers 230 + 3 个单页（Models 索引 / Embeddings / Environment Variables） | Gateways/Providers 均展开 |
| Integrations | 121 | 12 个分类 | 分类全部折叠 |
| Learn | 17 | 5 个 track 的线性课程 | 无侧栏 |

#### 6.2 Models：生成 + 精选 + “+N more”

- 230 个 provider URL（含索引页，即 **229 个 provider 页**）；220 个 provider 页在侧栏，**9 个不在侧栏**：`crof`、`firepass`、`firmware`、`github-models`、`io-intelligence`、`kimi-for-coding`、`kiro`、`scx`、`venice`。它们仍可通过 sitemap、搜索、直接 URL 到达，但导航里没有入口。
- 侧栏 `Providers` 分类是 `collapsed: false`，即 **220 项全部展开**；前 7 个是 popular（openai、anthropic、google、deepseek、groq、mistral、xai），其余字母序。这是一个可用的“长列表 + 置顶”方案，但在 220 项时已经很难扫描。
- `/models` 首页的 “Model directory” 只放 4 个 gateway 卡 + “+4 more”、3 个 provider 卡 + “+209 more”；页面底部的 “All providers” 又列了 **212 个链接**（3 个精选 + 209 more）。也就是说，**同一个目录在侧栏、首页卡片、首页底部列表出现了三次**，且数量口径不一致：页面正文说 **219 providers / 8405 models**，sitemap 有 **230 个 provider 页**，侧栏 **220 项**，底部列表 **212 条**。
- 生成器 `generate-model-docs.ts` 同时生成 `models/sidebars.js`，所以侧栏顺序与 provider 列表不会手工漂移；这是“生成页 + 生成侧栏”的正确做法，但无法解决 220 项的可读性。

#### 6.3 Integrations：12 类 + 折叠 + 索引搜索

- 12 个分类（按 sitemap 页面数）：Channels 7、Frameworks 10、Agentic UI 4、Sandboxes 12、Observability 11、Databases 21、Deploy 14、Tools 5、Voice 16、Auth 8、Browsers 4、File storage 8（+ Overview 共 121）。侧栏在这 4 个分类里各多一个指向 Platform 文档的交叉链接（Sandboxes / Observability / Databases / Deploy 的 “Mastra”），所以侧栏项数比页面数多 4。
- 所有分类 `collapsed: true`，所以侧栏初始只显示 12 行。
- `/integrations` 索引页不是简单卡片墙：它有一个 `<input type=search placeholder="Search integrations...">`，按分类分组渲染 121 张卡（图标 + 标题 + 描述）。索引数据从 `sidebars.js` 读取（`components/integrations/data.ts`），所以新增一个 integration 只需要改侧栏，不用改索引页。
- 单个 integration 页是手写 MDX，模板见 §4.4。

#### 6.4 Reference：458 页、36 个一级分类

| 分类 | 页数 | 分类 | 页数 | 分类 | 页数 |
| --- | ---: | --- | ---: | --- | ---: |
| ACP | 2 | AgentController | 2 | Agents | 25 |
| AI SDK | 14 | Auth | 11 | Browser | 5 |
| Channel Providers | 4 | Classifier | 1 | CLI | 2 |
| Client SDK | 13 | Code SDK | 2 | Coding Agent | 2 |
| Connect | 4 | Core | 39 | Deployer | 4 |
| Editor | 12 | Evals | 59 | File-based Agents | 16 |
| Memory | 15 | Migrations | 23 | Observability | 29 |
| Processors | 28 | PubSub | 8 | RAG | 14 |
| Schedules | 1 | Server | 12 | Signals | 4 |
| Storage | 4 | Streaming | 10 | Templates | 1 |
| Tools and MCP | 13 | Vectors | 20 | Voice | 19 |
| Workers | 1 | Workflows | 25 | Workspaces | 9 |

（36 个一级分类；嵌套分类如 Evals 的 Built-in scorers / Datasets、Observability 的 Tracing/Bridges/Exporters、Workflows 的 Methods/Run Methods、Editor 的 Browser/Workspace 另计，合计 52 个分类。上表只统计 36 个分类内的 **453** 页；另有 5 个顶层单页——Overview、Configuration、Build with AI、Manual Install、Project Structure——合计 **458**。）

- 分类全部 `collapsed: true`；`Core` 39 页、`Evals` 59 页是最大的两个，展开后仍然很长。
- Reference 的侧栏不启用 contextual pane，而是在同一棵折叠树里展开；这与 Docs 的“进入后切换面板”不同，因为 reference 是查阅型，用户需要同时看到兄弟分类。
- Reference 的侧栏覆盖完整：458 页里没有发现“页面在 sitemap、但分类里完全没有入口”的情况；`Deployer` 分类把 `deployer/index` 作为一个普通 doc 项列出。

#### 6.5 Docs：125 页为什么不需要折叠

Docs 的 125 页主要被 19 个二级项吸收，最大的 Workflows 11 页、Agents 8 页、Evals 11 页；进入某个二级项后，上下文面板最多 11 行。因此 Docs 不需要“分类折叠”这种机制，contextual pane 已经足够。

#### 6.6 生成 vs 手写矩阵

| 内容面 | 手写 | 生成 | 规模控制手段 |
| --- | --- | --- | --- |
| Docs | 125 | 0 | 5 组 + 19 二级 + contextual pane |
| Integrations | 121 单页 | 索引页 + 侧栏数据 | 12 类折叠 + 索引搜索 |
| Models | 索引正文 | 230 provider 页 + 索引卡 + 侧栏 | popular 置顶 + “+N more” + 生成器 |
| Reference | 458 | 0（以手写为主） | 36 分类折叠 |
| Learn | 17 | 0 | 线性课程 + track |

#### 6.7 规模控制的代价（可复用的反面教材）

1. **220 项展开的侧栏**：Models 的 Providers 分类 `collapsed: false`，220 项全部展开；扫描成本高，且与首页的 212 项列表重复。
2. **9 个 provider 孤儿页**：不在侧栏，只能靠搜索/sitemap；如果用户不知道名字，就找不到。
3. **1 个 deprecated 孤儿页**：`/docs/agents/networks` 不在侧栏，但仍是 200；弃用页面没有统一的“deprecated 索引”。
4. **没有人类可读的全站索引**：`/docs/sitemap`、`/docs/all` 都是 404；唯一的完整索引是给机器看的 `/llms.txt`（721 条链接，57 KB）。人类只能靠侧栏 + 搜索。
5. **`llms.txt` 的覆盖面不一致**：Reference 458 页全部列入，Integrations 120 页全部列入，但 Models 只列 5 条（索引/embeddings/env/gateways/providers），230 个 provider 页不在其中。这不是错误，但说明“索引规模”没有统一规则。
6. **数量口径漂移**：`/models` 正文说 “219 providers / 8405 models”，sitemap 有 230 个 provider 页，侧栏 220 项，底部 “All providers” 列表 212 条。生成器、侧栏、文案之间缺少一致性断言。

---

### 7. 阅读面：搜索、复制、Markdown twin、版本标记

#### 7.1 搜索与 Ask AI

- **搜索**：顶栏 “Search ⌘K” 打开自定义搜索弹窗，底层是 `docusaurus-plugin-algolia`（`main.js` 里读取 `algoliaAppId` / `algoliaSearchApiKey`，用 Algolia 的 search client）。UI 支持 suggested links、结果列表、`hasMore` / `loadMore` 分页。
- **Ask AI**：顶栏 “Ask AI” 是 `docusaurus-plugin-kapa`（Kapa AI），有对话面板、来源、答案反馈（thumbs up/down）；反馈只发生在 Ask AI 会话里，不是页面级 feedback。
- **没有搜索范围筛选**：搜索覆盖 4 个 docs 实例（963 页），但没有按 Docs/Reference/Models/Integrations 分区的显式过滤 UI（依赖 Algolia 的索引与查询）。

#### 7.2 Copy page

- 每页正文右上角有 `Copy page` 按钮 + `Show more options` 菜单。
- 默认 `Copy page` 会 `fetch(<page>.md)` 并复制到剪贴板（`copy-page-button.tsx` 的 `CopyButton`）；有 1.5 秒 “Copied” 状态。
- 菜单项：`View as markdown`、`Open in GitHub`、`Open in ChatGPT`、`Open in Claude`、`Open in T3 Chat`、`Open in Copilot`、`Open in Cursor`。后 5 项会拼接 `Read <url>, I want to ask questions about it.` 作为 prompt。
- 这是 2026 年 docs 的“agent 入口”标准形态：复制正文 + 把页面喂给外部 AI。Oribos 已有 `.md` twin，补一个同样的按钮即可，不需要后端。

#### 7.3 Markdown twin / llms.txt

- 每个 docs / reference / models / integrations 页都有 `<link rel="alternate" type="text/markdown" href="https://mastra.ai/<path>.md">`。
- `.md` 端点返回 `text/markdown`；`Accept: text/markdown` 请求同一 URL 也会返回 Markdown（内容协商）。
- 每页还有 `/<path>/llms.txt`，内容与 `.md` 相同（如 `/docs/agents/overview/llms.txt`）。
- 根 `/llms.txt`：57,383 B、838 行、721 条链接；按 Docs / Models / Integrations / Reference 分节，Docs 131 条、Reference 458 条、Integrations 120 条、Models 5 条。
- `/llms-full.txt` 返回 404；没有全量拼接文件。
- Learn 不在根 `/llms.txt`，也没有 `.md` twin。

**与 Oribos 的差异**：Oribos 的 `/llms.txt` 是 31 条链接的规范形状索引，另有 `/llms-manifest.json`（包→页映射）；Oribos 明确否决了 per-page `llms.txt`、`llms-full.txt`、`Accept` 内容协商（`../oribos-docs/docs/spec/agent-surface.md` §1/§8）。Mastra 的做法更“重”，但没有 manifest；两者是不同取舍，不建议 Oribos 回头补 per-page `llms.txt`。

#### 7.4 TOC、面包屑、上一篇/下一篇

- 右栏 `On this page` 是 h2/h3 的 TOC，移动端折叠为按钮。
- 面包屑 2 层，带 JSON-LD `BreadcrumbList`；SEO 友好。
- 上一篇/下一篇在正文末尾，按侧栏顺序生成；Docs 首页只显示 Next，Integrations 索引两端都关闭。
- 没有 “Was this page helpful?”、没有评分、没有评论；唯一的反馈入口是 GitHub “Edit this page” 与 Ask AI 的答案反馈。

#### 7.5 版本与更新标记

- **没有版本选择器**：URL 里没有 `/v1/`、`/v0.x/`；sitemap 中 0 条版本化 URL。
- **latest-only**：当前文档永远对应最新版；旧版升级通过 `/reference/migrations/**` 的迁移指南解决（v1、MCP v2、AI SDK v4→v5、Mastra Cloud→platform 等）。
- **侧栏徽标**：`customProps.tags` 支持 `new` / `advanced` / `beta` / `alpha` / `deprecated`；当前只有 4 个 `new`、2 个 label 里的 `deprecated`。
- **页面级弃用**：`/docs/agents/networks` 用 `> **Deprecated:**` blockquote + 迁移链接；Reference 里用 `generateLegacy`、`CloudExporter (deprecated)` 这类命名标记。
- **没有 last updated**：页面 footer 的 `lastUpdated` 容器是空的；docs sitemap 也没有 `<lastmod>`（0 条）。唯一的时间信号是 GitHub 的 Edit 链接与 blog changelog。
- **changelog 不在 docs**：footer 的 “Changelog” 指向 `https://github.com/mastra-ai/mastra/releases`；blog 有 `changelogs` 分类，按日期发版。

#### 7.6 SEO / 结构化数据

- 每页有 canonical、OG title/description/image；OG image 由 `/api/og/page?title=...` 动态生成。
- Docs 页有 `BreadcrumbList` JSON-LD；没有 `TechArticle` / `FAQPage` 结构化数据（至少抽样页没有）。
- 标题模板统一追加 `| Mastra Docs`；Learn 页出现 `Create an Agent | Mastra | Mastra Docs` 的重复 “Mastra”，是模板拼接缺陷（见 §10）。
- 尾斜杠不一致：docs 页 canonical 无尾斜杠，`/models/providers/` 与 `/models/gateways/` 的 canonical/sitemap 带尾斜杠。对 SEO 不是致命问题，但新站应统一。

---

### 8. Docs 与营销站产品页如何互链

#### 8.1 顶栏与 footer

- Docs 顶栏：`Docs / Models / Integrations / Reference / Learn / Platform` + 搜索 + Ask AI + GitHub + 主题切换 + `Deploy agents`（注册 CTA）。
- Docs footer 是营销 footer 的复用：Framework、Observability、Studio、Factory、Agent Builder、Blog、Changelog、Research、Podcast、License、About、Customers、Careers、Newsletter、Contact、GitHub、kapa.ai。
- Docs 右栏每页有 `Mastra Platform` 卡：`Managed hosting for your agents and a shared workspace for your team.` + `Deploy your agents` 按钮（`platform-cta.tsx`，仅 `/docs` 路径渲染）。这张卡带 `data-llms-ignore`，不会进入 `.md`。
- 右栏还有 Newsletter 订阅框。

#### 8.2 Docs 首页的营销含量

如 §4.1 所述，`/docs` 的 44 个内容链接中 26 个指向营销站（16 customers + 10 templates），7 个指向 integrations，只有 1 个指向 docs 自身。Mastra 把 docs 首页当成“产品上手 + 社会证明”入口，而不是文档目录。这是 Oribos 不能直接复制的：Oribos 没有客户案例，也没有 10 个模板库；如果照搬会变成空卡或假 proof。

#### 8.3 营销产品页 → docs 深链

对 5 个产品页（`/ai-agent-framework`、`/studio`、`/agent-builder`、`/platform-observability`、`/ai-agent-deployment`）做链接抽取，共 **27 个不同的 docs URL**；其中 **8 个是 308 重定向**，其余 200，没有 404：

| 营销页 | 典型 docs 深链 | 备注 |
| --- | --- | --- |
| `/ai-agent-framework` | `/docs/agents/overview`、`/docs/memory/overview`、`/docs/workflows/overview`、`/docs/evals/overview`、`/docs/observability/tracing/overview`、`/docs/studio/overview`、`/docs/editor/overview` | 18 个不同 docs 链接；`/docs/editor/overview` 308 → `/docs/studio/editor` |
| `/studio` | `/docs/studio/overview`、`/docs/studio/auth`、`/docs/studio/deployment`、`/docs/evals/built-in-scorers`、`/docs/evals/datasets/overview` | 数据集链接 308 → `/docs/evals/datasets` |
| `/ai-agent-deployment` | `/docs/mastra-platform/overview`、`/docs/mastra-platform/server`、`/docs/deployment/mastra-server`、`/docs/server/mastra-client` | `/docs/server/mastra-server` 308 → `/docs/server/overview` |
| `/platform-observability` | `/docs/observability/overview` | 单一入口 |
| `/agent-builder` | `/docs` | 只有 tab 入口，没有深链 |

这套互链的优点是“产品页的每个 feature 都能落到一个 docs 页”；缺点是对 docs slug 的稳定性有强依赖。Mastra 用 308 重定向兜住了旧 slug（8/27 = 30%），说明 docs IA 改动很频繁。Oribos 已有 `redirects.json` 台账，应把“营销→docs 深链”纳入同一台账的校验。

#### 8.4 Docs → 营销站的方向

- Docs 首页 → `/templates`、`/customers/*`、`factory.mastra.ai`。
- Docs footer → 产品页、Blog、Changelog、Research、Podcast、About、Customers 等 14 个营销链接。
- Docs 右栏 → Platform 注册 CTA。
- Docs 顶栏 → `Deploy agents` 注册 CTA；Platform tab → Platform 产品文档。

**方向性判断**：Mastra 允许 docs → 营销的多入口（footer、右栏、首页卡），但正文内很少插营销 CTA（Platform 卡是全局 UI，不在正文）。Oribos 的内容边界规范更严格：docs → 营销只保留 Introduction 的 “Why Oribos” 一支稳定外链（`../oribos-docs/docs/spec/content-boundary.md` §5）。新站应沿用这个更克制的方向，最多增加一个“产品 CTA 卡”，且只对已上线产品显示。

---

### 9. Mastra docs 板块 → Oribos 现状映射

**判定图例**：

- **已有**：能力已实现，且站内已有对应页面。
- **文档缺口**：能力已实现，但站内没有页面或只有一行提及。
- **能力缺失**：框架没有这个能力，短期也不计划做。
- **计划中**：产品/能力在路线图上，但当前没有可写的内容。
- **出域**：框架 ROADMAP 明确不做，或产品口径明确不做。
- **不复制**：Mastra 特有的规模/产品面，Oribos 不应建设。

| Mastra docs 板块 | Mastra 规模 | Oribos 现状（证据） | 判定 | 对 docs 的动作 |
| --- | ---: | --- | --- | --- |
| Get Started / Develop | 2 页 + landing | `../oribos-docs/src/content/docs/docs/index.mdx`、`get-started/{installation,quickstart,concepts-overview}.md` 已有；没有 CLI / `mastra dev` / Studio | 已有（Get Started）/ 能力缺失（Develop） | 保留 4 页 Get Started；把“本地运行”并入 Quickstart 或 examples，不建 Develop 页 |
| Agents | 8 页 | `concepts/agents.md` 已有；agent/tools/processors 已覆盖 | 已有 | 保留；补“能力表”和 Related |
| Workflows | 11 页 | `concepts/workflows.md`、`concepts/suspend-resume.md` 已有 | 已有 | 保留；控制流/时间旅行等细节可后置 |
| Harness（durable agents / signals / schedules / background tasks / goals / agent controller） | 8 页 | `concepts/durable-execution.md` 覆盖 durable agents + signals + schedules；`@oribos/background-tasks` 已发布但未文档化；Goals / AgentController 不存在 | 部分已有 | 保留 1 页 durable execution；background tasks 可加一节；不建 goals/controller |
| Memory | 7 页 | `concepts/memory.md` 已有；`@oribos/rag`、`@oribos/observational-memory` 已发布但未文档化 | 部分已有 | Memory 页补 RAG / observational memory 小节，或各加 1 页（按内容量决定） |
| Subagents | 1 页 | `@oribos/supervisor` 已发布；README 有 as-tool 组合说明，docs 无页 | 文档缺口 | 新增 1 页“Multi-agent composition / Supervisor”，或在 Agents 页加一节 |
| Skills | 1 页 | 没有产品化的 skills 能力；框架仓库的 `skills/` 是给 coding agent 的仓库技能，不是用户功能 | 不复制 | 不建页 |
| Channels | 1 页 | 无 channels 包；ROADMAP 出域 | 出域 | 不建页 |
| Sandboxes | 6 页 | 无 sandbox 包；ROADMAP 将 workspaces/sandboxes 列为出域 | 出域 | 不建页 |
| Browser | 1 页 | 无 browser 包 | 出域 | 不建页 |
| Connections（MCP / A2A / ACP / SDK agents） | 5 页 | `@oribos/mcp-client`、`@oribos/mcp-server` 已发布但无 docs；A2A/ACP 无 | 部分已有 | 新增 1 页 MCP（client + server）；A2A/ACP 不建 |
| Storage | 1 页 | 四个 storage port + `@oribos/sqlite` 已发布；docs 无页（内容盘点把 Storage & adapters 列为候选页，当前树里没有） | 文档缺口 | 新增 1 页 Storage（ports + sqlite + 适配器写法） |
| Server | 8 页 | 没有 HTTP server 包；框架嵌入宿主应用 | 能力缺失 | 不建页；等真有 server 面再开 |
| Studio | 5 页 | 产品计划中；框架 ROADMAP 把 Studio/editor 列作出域 | 计划中 / 出域 | 建站期不写内容；产品上线时再加一个 `/docs/platform/studio` 或等价页 |
| Auth | 7 页 | 无 auth 包；Mastra 的 auth 是 server/studio 的认证面 | 出域 | 不建页 |
| Deploy | 8 页 | 无托管部署面；docs 规范的 Deployment 页是 P2 | 计划中 / 能力缺失 | 等有真实部署路径再写 1 页 Project 族页面 |
| Traces | 6 页 | `concepts/observability.md` 已有；`@oribos/otlp`、`@oribos/otel-bridge` 已发布但无用法页 | 部分已有 | 保留概念页；补 1 页“Exporters / OTel”指南 |
| Metrics | 1 页 | 没有 metrics API；只有 span | 能力缺失 | 不建页 |
| Evals | 11 页 | `@oribos/evals` 已发布；docs 无页 | 文档缺口 | 新增 1 页 Evals（scorers、processor、scoreRun） |
| Guides | 8 页 | `guides/{examples,minimal-agent,durable-approval,signals-desk}.md` 已有；无 multi-agent / context engineering / streaming 等 pattern 指南 | 部分已有 | 保留 4 页；按真实内容加 pattern 指南，不凑数 |
| Mastra Platform（19 页） | 19 页 | Oribos Platform 计划中，无内容原料 | 计划中 | 不建 19 页；产品上线时最多 1 个入口页 + 按需子页 |
| Models（242 页） | 242 页 | `concepts/models.md` 已有；`@oribos/model-router` 已发布；没有 provider 目录；AI Gateway 明确不做 | 部分已有 / 不复制 | 保留 1 页 Models；不建 `/models` 目录、不建 gateway 文档、不做 8,405 模型目录 |
| Integrations（121 页） | 121 页 | MCP / AI SDK / SQLite / OTel 是能力包，不是集成目录；docs 规范 G9 明确 MVP 零独立页 | 不复制（当前）/ 部分能力 | 不建 12 类目录；用 1 页“Ecosystem / integrations”讲包即可，或分散到对应概念页 |
| Reference（458 页） | 458 页 | `reference/import-map.md` 手工页 + `reference/api/**` 249 页 TypeDoc 生成树 | 已有 | 保留生成树 + import map；补 usage 层（见 §启示 B） |
| Learn（17 页） | 17 页 | 无课程；营销站有 4 个关键词页，不是课程 | 不复制 | 不做 17 课课程；教程放 Blog/Resources，或 Guides 索引 |
| Agent Builder / Factory | 2 个产品页 | Agent Builder 计划中；Factory 未列入 Oribos 已定产品口径 | 计划中 / 出域 | 不建 docs |
| Workspaces | 9 页 reference + Platform 页 | ROADMAP 出域（workspaces/sandboxes） | 出域 | 不建 |
| Voice | 16 页 integrations + 19 页 reference | 无 voice 包；ROADMAP 出域 | 出域 | 不建 |
| MCP Registry | docs 无此板块；registry 只在营销面出现 | Oribos “做但无独立产品页” | 产品面，非 docs 板块 | 建 1 页 `/docs/project/mcp-registry` 或 `/docs/guides/mcp-registry`，不建 section |
| AI Gateway | Models 下的 gateways 8 页 | Oribos 明确不做 | 出域 | 不建任何 gateway 文档 |

**映射结论**：

- Oribos 真正需要补的文档缺口只有 4 个能力面：**Storage、Evals、MCP、Supervisor/多 agent**；再加 2 个“用法层”补充：**OTel exporters、background tasks**。
- 需要明确不做的：Models 目录、Integrations 目录、Learn 课程、Studio/Platform/Auth/Server/Channels/Voice/Sandboxes/Workspaces 的完整 docs、AI Gateway。
- 计划中产品（Platform / Studio / Agent Builder）在 docs 里最多留 1 个入口页，且要标 “Planned”；不要建空 section。

---

### 10. Mastra 的设计缺陷（新站的反面教材）

1. **侧栏规模失控**：Models 的 Providers 分类 `collapsed: false`，220 项全部展开；首页底部又列 212 个 provider。扫描成本高，且与侧栏重复。
2. **孤儿页**：9 个 provider 页不在侧栏；`/docs/agents/networks` 是 deprecated 孤儿。孤儿页只能靠搜索/sitemap 到达，等于“存在但不可发现”。
3. **没有人类可读的全站索引**：`/docs/sitemap`、`/docs/all` 404；唯一的完整索引是 57 KB 的 `/llms.txt`（机器向，721 条链接）。人类用户只能靠侧栏 + 搜索。
4. **`llms.txt` 覆盖不一致**：Reference 458 全列，Integrations 120 全列，Models 只列 5 条；没有“为什么这几个域全列、那个域不列”的规则。
5. **没有 last updated / lastmod**：页面 footer 的 lastUpdated 为空，docs sitemap 0 条 `<lastmod>`；读者无法判断内容新鲜度，只能看 GitHub。
6. **Learn 不在 agent 面**：17 页课程没有 `.md` twin、不在 `/llms.txt`、没有 Copy page；如果课程是重要入口，这是明显的机器可读性缺口。
7. **标题模板重复**：Learn 页 `<title>` 是 `Create an Agent | Mastra | Mastra Docs`，品牌名重复；docs 页是 `Tools | Agents | Mastra Docs`，正常。
8. **尾斜杠不一致**：docs canonical 无尾斜杠，`/models/providers/` 与 `/models/gateways/` 带尾斜杠；sitemap 同样混用。新站应统一一种形态。
9. **产品口径漂移**：`/models` 正文说 219 providers / 8405 models，sitemap 有 230 个 provider 页，侧栏 220 项，底部列表 212 条；生成器、侧栏、文案之间没有一致性断言。
10. **deep link 依赖重定向**：5 个营销页的 27 个 docs 链接里 8 个是 308；虽然都能到，但说明 docs slug 改动频繁，营销页的“feature → docs”映射没有稳定契约。

**审计边界**：Algolia 索引的实际条目数、Kapa 的回答质量未做账号级验证；搜索行为来自页面 UI 与 `main.js` 中的插件调用。“Reference 以手写为主”来自 60 页抽样（57 页无整页生成标记），不是 458 页逐页断言；“没有 last updated”来自页面 footer 空容器与 sitemap 无 `<lastmod>` 的抽样事实。Mastra 的模型数量与页面数会随 `models.dev` 更新，数字应按日复核。

---

## 对 Oribos 的启示

### A. IA：保留单车道，按规模加“上下文侧栏”，不要加 tab

Oribos 当前是 **19 手写页 + 249 生成 API 页**（`../oribos-docs/src/content/docs`，`find` 计数），远低于 Mastra 的 963 页。`oribos-docs` 的 IA 规范已经裁决“单 Documentation 车道 + 五族侧栏”（`../oribos-docs/docs/spec/ia.md:10`），本次审计支持这个裁决，并给出三条增量建议：

1. **保留五族，不建 6 tab**。Docs / Models / Integrations / Reference / Learn / Platform 是 Mastra 的规模与多产品函数；Oribos 当前 19 页，建 6 tab 只会制造空栏目。
2. **为“未来大 section”预留 contextual sidebar 机制**。Oribos 现在不需要，但应在组件层留一个 seam：当某个 section 超过 ~15 页时，侧栏切换成该 section 的页面列表 + 返回按钮，而不是把全局侧栏撑长。Mastra 的 13 个 contextual category 是成熟参考。
3. **Reference 升格判据需要重写**。`../oribos-docs/docs/spec/ia.md:14` 写的是“API 参考生成页超过 ~50 页时，升格为 `/reference/**`”；但当前生成树已经是 **249 页**，远超 50，却仍在 `/docs/reference/api/**`。这说明“生成页”不应按“侧栏可管理页数”计算：TypeDoc 树是按模块分组的，不是手工导航。建议把判据改成 **“手工维护的 reference 页超过 ~50 页”**，生成树继续留在 `/docs/reference/api/**`；如果未来要让 Reference 成为一级查阅入口，再整体 301 到 `/reference/**`，并同步营销链接与 `llms.txt`。

**建议的 Oribos docs 树（在现有 19 页上增量，标注状态）**：

```text
/docs                                   Introduction（已有，兼 landing）
/docs/get-started/installation          已有
/docs/get-started/quickstart            已有
/docs/get-started/concepts-overview     已有
/docs/concepts/agents                   已有
/docs/concepts/tools                    已有
/docs/concepts/models                   已有
/docs/concepts/memory                   已有
/docs/concepts/workflows                已有
/docs/concepts/observability            已有
/docs/concepts/durable-execution        已有
/docs/concepts/suspend-resume           已有
/docs/concepts/processors               已有
/docs/concepts/storage                  新增（ports + sqlite；能力已发布）
/docs/concepts/evals                    新增（scorers / processor / scoreRun）
/docs/concepts/mcp                      新增（client + server；或并入 tools）
/docs/concepts/multi-agent              新增（supervisor / as-tool composition）
/docs/guides/examples                   已有
/docs/guides/minimal-agent              已有
/docs/guides/durable-approval           已有
/docs/guides/signals-desk               已有
/docs/guides/tracing                    新增（OTel / exporters；能力已发布）
/docs/guides/storage-adapter             P2（按内容盘点）
/docs/guides/upgrade-0-1                P2（1.0 前）
/docs/reference/import-map              已有
/docs/reference/api/**                  已有（249 页生成树）
/docs/reference/glossary                P2
/docs/project/docs-for-agents           已有
/docs/project/releases                  P2
/docs/project/deployment                P2（等真实部署路径）
/docs/project/mcp-registry              新增（1 页；产品做但无独立产品页）
/docs/project/platform                  仅在 Platform 上线时建 1 页入口
```

**不建议新增**：`/docs/models`、`/docs/integrations`、`/docs/learn`、`/docs/studio`、`/docs/auth`、`/docs/server`、`/docs/channels`、`/docs/voice`、`/docs/sandboxes`、`/docs/workspaces`、`/docs/ai-gateway`。这些要么是 Mastra 的规模产物，要么是 Oribos 明确出域/计划中的能力。

### B. 模板：落地 7 种，不复制 11 种

Oribos 不需要 Mastra 的 11 类模板；按当前内容可以收敛为 7 种：

| 模板 | 用于 | 必备结构 | frontmatter | 备注 |
| --- | --- | --- | --- | --- |
| Docs landing | `/docs` | 一句定位 → Quickstart → 3 个入口卡（Concepts / Guides / Reference）→ 能力表 → “Docs for AI agents” | `title`、`description`、`packages` | 不要放 customers/templates 卡；Oribos 没有客户案例 |
| Concept | `/docs/concepts/*` | 定义 → 为什么需要 → 核心心智模型 → 最小示例 → 与其他子系统的关系 → Related | `title`、`description`、`packages`、`order` | 纯概念页，不写成长教程；任务型内容放 Guides |
| Guide / walkthrough | `/docs/guides/*` | 目标 → 前置 → 步骤 → 验证 → 失败模式 → Related | `title`、`description`、`packages`、`subtype: walkthrough` | 沿用现有 4 页的结构 |
| Reference 入口 | `/docs/reference/import-map` | 入口表 → 怎么选 → 每个入口的承诺 → 生成树入口 → Next steps | `title`、`description`、`packages` | 这是“选择层”，不是签名层 |
| Generated API | `/docs/reference/api/**` | TypeDoc 输出 | `generated: true` | 不手工编辑；不要求 `packages` |
| Project / ecosystem | `/docs/project/*` | 项目状态 → 安装/使用 → 贡献/发布 → 相关链接 | `title`、`description`、`packages` | MCP Registry、部署、releases 都放这里 |
| Migration | `/docs/guides/upgrade-*` | 前置版本 → 破坏性变更 → checklist → 回滚 | `title`、`description`、`packages`、`subtype: migration` | 0.x 期可空置，1.0 前再写 |

**从 Mastra 借的三个结构**：

1. **overview 的“Goal → Start here”能力表**：Oribos 的 `/docs/concepts/agents` 可以在末尾加一张 8–12 行的表，把“想做 X → 读 Y”讲清楚，减少侧栏跳转。
2. **页尾 `Related`**：Mastra 71/125 页有，Oribos 目前没有统一约定。建议每个 concept/guide 页至少 2 条 Related，链接到 canonical 页/生成树入口；CI 检查死链。
3. **Integration 模板的“第三方后台步骤”**：如果 Oribos 将来写 MCP Registry 或 storage adapter，采用“安装 → 配置 → 验证 → 生产注意 → Related”的骨架，而不是概念页骨架。

### C. 内容模型：保留 Oribos schema，补 3 个表现层机制

Oribos 的 frontmatter schema 已经比 Mastra 严格（`../oribos-docs/src/lib/frontmatter.ts`）：`title`、`description`、`project`、`subtype`、`order`、`packages`、`source`，生成页用 `generated: true`。**不要为了学 Mastra 把它削减成 title/description/packages 三件套**。

建议补的 3 个机制（都不改 schema）：

1. **侧栏徽标**：在侧栏配置里加 `tags: ['new' | 'beta' | 'deprecated']`，由组件渲染；不要写进 frontmatter。Mastra 的 `customProps.tags` 是正确的位置。
2. **Related 约定**：可以继续用正文 `## Related` 手写，不新增字段；如果要机器校验，加一个 CI 脚本检查“每页至少 2 条站内 Related 链接”，而不是加 frontmatter。
3. **Copy page UI**：复用 `.md` twin，前端 fetch 当前路由 + `.md` 并复制；菜单可加 `View as Markdown`、`Open in GitHub`、`Open in ChatGPT/Claude/Cursor`。Oribos 零遥测：不引入第三方脚本；只有用户主动点击外链时，页面 URL 才会作为查询参数带到外部服务。

**不建议加**：`date` / `updated`（Oribos 用 `source.ref` + 钉定 pin 回答版本对应）、`author`（Oribos 没有作者体系）、`tags`（分类由族/侧栏承担）、`version`（0.x latest-only）、`template`（模板由族 + 目录决定）。

**必须做的一次性动作**：重生成 `llms-manifest.json`。当前 `dist/llms-manifest.json` 的 `version` 还是 `0.5.0`、`pin` 是旧 SHA，而 npm 已到 0.9.0、19 包；新站合并时必须用当前 pin/version 重新生成，否则 agent 面会给出过期版本。

### D. 规模与阅读面：用 Pagefind + 自有 `.md`，不要引入 Algolia/Kapa

| 能力 | Mastra | Oribos 建议 |
| --- | --- | --- |
| 搜索 | Algolia（第三方）+ Kapa Ask AI（第三方） | 保留 Starlight/Pagefind 本地搜索；零遥测、零第三方脚本；⌘K 打开 |
| 页面复制 | Copy page + 7 个 AI 打开项 | 加 Copy page；菜单只保留 View as Markdown / Open in GitHub / Open in ChatGPT / Claude / Cursor（可选） |
| 机器面 | 每页 `.md` + per-page `llms.txt` + root `llms.txt` + Accept | 保留每页 `.md` + root `llms.txt` + `llms-manifest.json`；**不补** per-page `llms.txt` / `llms-full.txt` / Accept（已有裁决） |
| 版本 | latest-only + migrations | 同样 latest-only；0.x 不建版本段；migration 子型留给 1.0 |
| 更新标记 | New/Deprecated 徽标；无 last updated | 加 `new`/`deprecated` 徽标；不加日期；页脚显示 “Written against `<pin>`” 可选 |
| 反馈 | 无页面反馈；只有 Kapa 答案反馈 | 不做页面评分（无后端/无遥测）；保留 GitHub Edit |
| 全站索引 | 无人类索引；`llms.txt` 是唯一全量索引 | 19 页阶段不需要；页面多了再加 `/docs/all` 或侧栏展开 |

**规模规则**（给后续建站票）：

- 单个 section ≤ 15 页：平铺在全局侧栏；> 15 页：上下文侧栏。
- 手工 reference 页 ≤ 50：留在 `/docs/reference`；> 50 或需要独立查阅入口：评估 `/reference/**` 升格。
- 生成页永远不进入手工排序，不要求 `packages`。
- 任何“目录型”内容（模型、集成）如果超过 50 条，必须有搜索/筛选；否则不做目录页。

### E. 互链与计划中产品

**营销 ↔ docs 链接契约**（建议写进新站规格）：

1. 营销页只能链到 docs 的 canonical URL；不允许链到 `.md`、生成树内部页或临时 slug。
2. 每个“产品 feature → docs 页”的映射登记在一张表里（marketing 页 → docs URL），CI 检查 HTTP 200；docs 改 slug 必须同步改表 + 登 `redirects.json`。
3. docs → 营销只保留一个稳定入口（Introduction 的 “Why Oribos” 或一个产品 CTA 卡）；不要在每个 concept 页插营销卡。
4. 计划中产品（Platform / Studio / Agent Builder）在产品上线前不建 docs section；最多一个 `/docs/project/platform` 入口页，正文标 “Planned”，并且不进入 `.md`/`llms.txt` 的“已发布”索引（或明确标注状态）。
5. MCP Registry：按已定产品口径“做但无独立产品页”，docs 只建 **1 页**（建议 `/docs/project/mcp-registry`），讲“发现/发布/消费 registry”；不做产品 tab，不做 121 页集成目录，也不在营销站建独立产品页。入口可以放在文档侧栏的 Project 组，或从首页/资源页的一个链接进入。
6. AI Gateway：**0 页**。Models 页只讲 `@oribos/model-router` + AI SDK provider 实例，不建 gateway 分类。

**docs 首页**：不要复制 Mastra 的 26 张 customers/templates 卡。Oribos 的 `/docs` 应是“上手页”：

- 一句定位 + `npm install @oribos/core`；
- 3 个入口卡：Quickstart / Concepts overview / Examples；
- 一张“能力 → 页面”表（Agents、Workflows、Memory、Durable execution、Observability、Reference）；
- 一行 “Docs for AI agents” 链接到 `/docs/project/docs-for-agents`；
- 可选：一个 “Why Oribos” 外链。

### F. 验收清单（可直接交给建站票）

- [ ] URL 树与批准的 IA 一致；每个页面只有一个 canonical URL；没有孤儿页（sitemap ⊆ 侧栏，除非显式登记为 deprecated/generated）。
- [ ] 每个 authored 页通过 frontmatter schema：`title`、`description`、`packages` 必填；`project`/`subtype`/`order`/`source` 按规范；生成页 `generated: true` 且不要求 `packages`。
- [ ] 侧栏人工排序；分组标签使用五族；没有字母序；没有空分组。
- [ ] 面包屑 2 层（族 > 页）；上一篇/下一篇由侧栏顺序生成；首尾禁用。
- [ ] 每个页面有 `.md` twin；head 有 `rel=alternate`；`/llms.txt` 与 `llms-manifest.json` 用当前 pin/version 重新生成。
- [ ] 搜索索引覆盖全部页面（Pagefind）；不加载 Algolia/Kapa/任何第三方分析。
- [ ] 每个 concept/guide 页有 `Related`（≥2 条站内链接），CI 检查死链。
- [ ] Copy page 可用；默认复制 `.md`；菜单外链不携带页面内容以外的数据。
- [ ] 营销→docs 深链全部 200；旧 slug 有 301/308；`redirects.json` 与链接表一致。
- [ ] Deprecated 页：正文顶部有 Deprecated 提示 + 迁移链接；从侧栏移除；仍可通过旧 URL 到达；是否保留在 sitemap 需明确。
- [ ] 计划中产品：没有空 section；最多 1 个入口页；标注 “Planned”；不进“已发布”索引。
- [ ] 不建 Models 目录、Integrations 目录、Learn 课程、AI Gateway 文档；MCP Registry 只有 1 页。

---

## 来源清单

### Mastra 线上页面（访问日期 2026-10-20）

- Docs 入口：https://mastra.ai/docs
- Docs sitemap：https://mastra.ai/docs/sitemap.xml
- 根 sitemap 索引：https://mastra.ai/sitemap.xml
- 根 llms.txt：https://mastra.ai/llms.txt
- 根 llms-full.txt（404，用于确认不存在全量文件）：https://mastra.ai/llms-full.txt
- Docs 首页 `.md`：https://mastra.ai/docs.md
- 代表性 docs 页：
  - https://mastra.ai/docs/agents/overview
  - https://mastra.ai/docs/agents/tools
  - https://mastra.ai/docs/workflows/overview
  - https://mastra.ai/docs/memory/overview
  - https://mastra.ai/docs/harness/overview
  - https://mastra.ai/docs/evals/overview
  - https://mastra.ai/docs/guides/multi-agent-systems
  - https://mastra.ai/docs/studio/overview
  - https://mastra.ai/docs/deployment/overview
  - https://mastra.ai/docs/mastra-platform/overview
  - https://mastra.ai/docs/agents/networks（deprecated 孤儿页）
- Integrations：
  - https://mastra.ai/integrations
  - https://mastra.ai/integrations/channels/slack
  - https://mastra.ai/integrations/frameworks/next-js
- Models：
  - https://mastra.ai/models
  - https://mastra.ai/models/providers
  - https://mastra.ai/models/providers/openai
  - https://mastra.ai/models/gateways
  - https://mastra.ai/models/gateways/openrouter
- Reference：
  - https://mastra.ai/reference
  - https://mastra.ai/reference/agents/agent
  - https://mastra.ai/reference/configuration
  - https://mastra.ai/reference/migrations/upgrade-to-v1/overview
- Learn：
  - https://mastra.ai/learn
  - https://mastra.ai/learn/create-an-agent
- 营销产品页（用于互链审计）：
  - https://mastra.ai/ai-agent-framework
  - https://mastra.ai/studio
  - https://mastra.ai/agent-builder
  - https://mastra.ai/platform-observability
  - https://mastra.ai/ai-agent-deployment

### Mastra docs 源文件 / 前端源码（Mastra 官方仓库，经页面 “Edit this page” 与 raw 文件核对）

- 侧栏配置：
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/docs/sidebars.js
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/models/sidebars.js
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/integrations/sidebars.js
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/reference/sidebars.js
- 页面内容：
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/docs/index.mdx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/docs/agents/overview.mdx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/docs/guides/overview.mdx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/integrations/index.mdx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/models/providers/index.mdx
- 校验 / 生成：
  - https://github.com/mastra-ai/mastra/blob/main/docs/scripts/validate-frontmatter.ts
  - https://github.com/mastra-ai/mastra/blob/main/packages/core/scripts/generate-model-docs.ts
  - https://github.com/mastra-ai/mastra/blob/main/packages/core/scripts/model-doc-metadata.ts
- 主题 / 组件：
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/components/copy-page-button.tsx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/components/platform-cta.tsx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/components/SidebarBadge.tsx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/components/integrations/data.ts
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/components/integrations/page.tsx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/theme/Navbar/tab-switcher.tsx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/theme/contextual-sidebar.ts
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/theme/DocSidebar/ContextualContent/index.tsx
  - https://github.com/mastra-ai/mastra/blob/main/docs/src/plugins/docusaurus-plugin-llms-txt/sidebars-handler.ts

### Oribos 本地源文件（只读）

- 目标仓：`/Users/nicholasl/Documents/build-whatever/oribos-www`（空骨架，仅 `LICENSE` 被跟踪）
- 文档站：
  - `../oribos-docs/docs/spec/ia.md`（单车道、五族、Reference 升格判据 §1/§2/§4）
  - `../oribos-docs/docs/spec/content-boundary.md`（五族、G9 Integration 家族零独立页、packages 字段）
  - `../oribos-docs/docs/spec/agent-surface.md`（`.md` twin、`/llms.txt`、manifest、不做 per-page llms.txt/Accept 的裁决）
  - `../oribos-docs/docs/spec/stack.md`（frontmatter 契约 §5）
  - `../oribos-docs/src/lib/frontmatter.ts`（schema：`contentFields` / `generatedFields`）
  - `../oribos-docs/src/content/docs/docs/**`（19 个手写页）
  - `../oribos-docs/src/content/docs/docs/reference/api/**`（249 个 TypeDoc 生成页）
  - `../oribos-docs/dist/llms.txt`、`../oribos-docs/dist/llms-manifest.json`（当前构建产物；manifest 仍是 0.5.0，需重生成）
- 框架仓：
  - `../oribos-framework/README.md`（19 包、能力包清单、quick start）
  - `../oribos-framework/CONTEXT.md`（术语与边界）
  - `../oribos-framework/docs/ROADMAP.md`（出域项：Studio/editor、channels/voice/workspaces & sandboxes/browser、托管平台、notification inbox、AgentController；见 :290–:311）
  - `../oribos-framework/packages/**`（core exports + 18 个能力包）
- 营销站：
  - `../oribos-website/src/pages/**`（11 页 + 404）
  - `../oribos-website/src/lib/links.ts`（当前 docs 链接仍指向 GitHub/旧域名）

### 复核命令（可重跑）

```bash
# Mastra docs 总量与分域
curl -sL https://mastra.ai/docs/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//'

# 根 llms.txt
curl -sL https://mastra.ai/llms.txt | wc -l

# 页面 Markdown twin
curl -sL https://mastra.ai/docs/agents/overview.md | head

# 文档源文件（GitHub raw）
curl -sL https://raw.githubusercontent.com/mastra-ai/mastra/main/docs/src/content/en/docs/sidebars.js

# Oribos 内容树
find ../oribos-docs/src/content/docs -type f | sort
```
