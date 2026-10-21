# 文档 IA 与内容迁移策略

> 票：[文档 IA 与内容迁移策略](https://github.com/0xnicholas/oribos-www/issues/12)（wayfinder 地图 [Oribos 官网：Mastra 形态站点规格](https://github.com/0xnicholas/oribos-www/issues/1) 的子票）
> 日期：2026-10-21
> 状态：docs IA、页面迁移、URL/重定向、内容真相源、docs agent surface 的裁决。应用形态已由「技术栈与仓库形态」裁决：Astro 7 + Starlight 单包单应用（见 `docs/spec/stack.md`）；docs shell 视觉归「设计系统与组件规格（B · 仪器）」；部署规则归「域名、托管与备案基线」（已 provisional 搁置）。
> 上游：`docs/research/mastra-docs-audit.md`、`docs/research/oribos-content-audit.md`、`docs/research/seo-agent-surface-audit.md`、`docs/research/stack-options.md`、`docs/spec/fact-baseline.md`。
> **主机名约定（2026-10-21）**：canonical 用 `SITE_ORIGIN` 表示，provisional 值 `https://oribos.ai`（未注册；见「域名、托管与备案基线」）。`<apex>` 指 `SITE_ORIGIN` 的 host。`oribos.dev` 是历史候选，不再作为 canonical。

## 0. 裁决摘要

| # | 裁决 | 结果 |
|---|---|---|
| 1 | 内容真相源 | docs Markdown/MDX 迁入 `oribos-www`；`oribos-docs` 迁移后只读归档 |
| 2 | URL / 主机 | 保留全部 268 条 `/docs/**`；canonical `${SITE_ORIGIN}/docs/**`（provisional `https://oribos.ai`）；`docs.<apex>` 301；删除 `/` → `/docs/` |
| 3 | 首发 IA | 单车道五族；24 手写 + 249 生成；不留空 stub |
| 4 | API reference | 只覆盖 core；pin 升 `v0.9.0` 重生成 249 页；import-map 扩到 28 个导出面 |
| 5 | 迁移处置 | 19 个手写页直接迁移 + 事实刷新；不合并、不退役页面 |
| 6 | agent surface | 保留 `.md` twin、`/llms.txt`、`/llms-manifest.json`；manifest 与 frontmatter 扩到 28 个导出面 |

**票面校正**：票面写“30 个手写页”；实测 `oribos-docs` 为 **19 个手写页 + 249 个 TypeDoc 生成页 = 268 条路由**。本文按实测口径。

---

## 1. 内容真相源

### 1.1 裁决

docs 内容的唯一真相源迁到 **`oribos-www`**。迁移后：

- 手写内容落 `src/content/docs/docs/**`（Starlight 嵌套 collection 形态）。
- 生成内容落 `src/content/docs/docs/reference/api/**`。
- TypeDoc 生成管线、`.md` twin、`/llms.txt`、`/llms-manifest.json`、`redirects.json`、Pagefind、相关 CI gate 一并迁入。
- `oribos-docs` 保留为**只读归档**：不再接收内容更新，不再双写；其 `docs/spec/*` 标为历史，不再作为新站内容真相源。

### 1.2 与「技术栈与仓库形态」的边界

本文已由「技术栈与仓库形态」裁决为 Astro 7 + Starlight、单包单应用、`/docs/**` 同源（见 `docs/spec/stack.md`）。

- 若选单应用：按 §1.1。
- 若选 monorepo：内容仍离开 `oribos-docs`，落在 docs app 的 collection 中；本 IA、URL、迁移映射、agent surface 契约不变。
- 若选独立 docs 应用：内容仍在 `oribos-www` 仓库或 docs app；`docs.<apex>` 只能作为别名，不能做 canonical（与单站目的地冲突）。

**不因栈选择而改变的三条**：

1. `oribos-docs` 不再是内容真相源。
2. `/docs/**` 路径与 `.md` twin 契约保留。
3. 单站只有一个 canonical 主机 `SITE_ORIGIN`（provisional `https://oribos.ai`）。

### 1.3 迁移顺序

1. 冻结 `oribos-docs` 内容至一个迁移 commit。
2. 复制 19 个手写页 + 249 个生成页 + 管线到 `oribos-www`。
3. 按 `docs/spec/fact-baseline.md` §5.2 刷新事实。
4. 升 pin 到 `v0.9.0`，重生成 core API 树。
5. 重建 `.md` twin、`/llms.txt`、`/llms-manifest.json`、sitemap、redirects。
6. 删除 `/` → `/docs/` 台账条目；配置 `docs.<apex>` → `<apex>` 主机级 301。
7. 归档 `oribos-docs`（只读）。

### 1.4 迁移窗口与旧站维护

**结论：迁移完成后，旧 docs 不需要继续维护。** 旧站只保留为归档 / 301 源，不再是并行维护的第二份文档。

| 阶段 | 旧站 (`oribos-docs`) 的处置 |
|---|---|
| 迁移前 | 只接受**阻塞性修复**：安装命令错误、安全问题、严重事实错误。不做新内容、不做 IA 改动、不升版本；所有非阻塞改动直接进新站。 |
| 切换时 | 新站 `/docs/**` 通过验收后，`docs.<apex>` 全量 301 到 `<apex>/docs/**`；旧站不再作为 canonical。 |
| 切换后 | 仓库只读归档；不维护、不双写、不补内容；旧 issue tracker 关闭或迁移未决项。 |

**例外**：若切换因托管 / 备案延迟，旧站可继续在线，但必须加顶部横幅指向新站，且只做阻塞性修复；不得让两站长期并行。

**判断标准**：

- 任何修复如果新站也要做，只在新站做；旧站不复制。
- 只有“新站尚不可用、旧站仍在服务用户、且问题会误导或伤害用户”时，旧站才做一次性补丁。
- 旧站 pin 仍是 0.5.0，事实债是系统性的（安装路径、版本、RAG / evals）；维护旧站等于维护错误。
- 两站同时在线会制造重复 canonical、两套 `/llms.txt` 与过期 agent 答案；这是比“旧站暂时不更新”更大的风险。

**不做的动作**：

- 不把旧站作为长期备份继续更新。
- 不在旧站与 `oribos-www` 之间做内容同步。
- 不为旧站保留独立的内容 / SEO / agent surface 路线图。

---

## 2. URL 与主机

### 2.1 canonical 主机

- 唯一 canonical：`${SITE_ORIGIN}/docs/**`（provisional `https://oribos.ai/docs/**`）
- `https://docs.<apex>/**` → `https://<apex>/**`（301，主机级）
- `https://www.<apex>/**` → `https://<apex>/**`（301）
- `http://<apex>/**` → `https://<apex>/**`（301）
- 站根 `/` 是营销首页；**不再** 301 到 `/docs/`。

`<apex>` = `SITE_ORIGIN` 的 host；provisional 为 `oribos.ai`。主机级跳转写在托管配置里，不写进 `redirects.json`。台账只记人改的路径。

### 2.2 路径规则

- **保留全部 268 条 `/docs/**` 路径**：19 手写 + 249 生成。
- 新页只落现有五族：`/docs/concepts/<slug>/`、`/docs/guides/<slug>/`、`/docs/project/<slug>/`。
- 两段封顶：`/docs/<family>/<slug>`；`/docs/reference/api/**` 是生成树命名空间，深度豁免。
- 尾斜杠 canonical：`/docs/concepts/agents/`；`/docs` 也保留尾斜杠。
- `.md` twin：`<route>.md`，无尾斜杠（`/docs/concepts/agents.md`）。
- 不建版本段；0.x latest-only。

### 2.3 重定向台账

单一真相源：`redirects.json`（新站仓库根）。

| 旧 | 新 | 动作 | 位置 |
|---|---|---|---|
| `/` | `/`（营销首页） | 删除旧的 `/` → `/docs/` 条目 | `redirects.json` |
| `https://docs.<apex>/:path*` | `https://<apex>/:path*` | 301 | 托管配置，不进台账 |
| `https://www.<apex>/:path*` | `https://<apex>/:path*` | 301 | 托管配置，不进台账 |
| `http://<apex>/:path*` | `https://<apex>/:path*` | 301 | 托管配置，不进台账 |
| `/docs` | `/docs/` | 301/308 | 平台尾斜杠归一，不进台账 |
| 现有 268 条 docs URL | 同路径 | 无需重定向 | — |

**CI 规则**：旧页面集合 − 新页面集合 ⊆ 台账 `from` 集合。未登记即构建失败。

### 2.4 URL 验收

- 268 条 docs URL 全部 200。
- `/` 200，且不再 301 到 `/docs/`。
- `docs.<apex>` 全部 301 到 `<apex>` 对应路径。
- canonical 全部指向 `${SITE_ORIGIN}/...`（provisional `https://oribos.ai/...`）。
- 每页 `.md` twin 200，`Content-Type: text/markdown; charset=utf-8`。
- sitemap 不含 `.md`、404、站根跳板。

---

## 3. 首发 docs IA 树

### 3.1 树

```text
/docs                                  Introduction（兼 landing）
/docs/get-started/installation
/docs/get-started/quickstart
/docs/get-started/concepts-overview
/docs/concepts/agents
/docs/concepts/tools
/docs/concepts/models
/docs/concepts/memory
/docs/concepts/workflows
/docs/concepts/observability
/docs/concepts/durable-execution
/docs/concepts/suspend-resume
/docs/concepts/processors
/docs/concepts/storage              ← 新增
/docs/concepts/evals                ← 新增
/docs/concepts/mcp                  ← 新增
/docs/concepts/multi-agent          ← 新增
/docs/guides/examples
/docs/guides/minimal-agent
/docs/guides/durable-approval
/docs/guides/signals-desk
/docs/guides/tracing                ← 新增
/docs/reference/import-map
/docs/reference/api/**              ← 249 页生成树
/docs/project/docs-for-agents
```

计数：

| 族 | 手写页 | 生成页 | 合计 |
|---|---:|---:|---:|
| Get started | 4 | 0 | 4 |
| Concepts | 13 | 0 | 13 |
| Guides | 5 | 0 | 5 |
| Reference | 1 | 249 | 250 |
| Project & ecosystem | 1 | 0 | 1 |
| **合计** | **24** | **249** | **273** |

### 3.2 首发范围

**进首发**：

- core 的 9 个概念页 + 4 个能力面概念页（storage / evals / mcp / multi-agent）。
- 4 个现有 walkthrough + 1 个 tracing 指南。
- import-map（扩到 28 个导出面）+ core API 生成树。
- docs-for-agents。
- 24 个手写页都有真实内容；无空 stub。

**不进首发**：

| 项 | 处置 | 理由 |
|---|---|---|
| Platform / Studio / Agent Builder docs | 0 页；营销 `/platform` 方向页承载 | 无产品事实卡；框架 ROADMAP 仍出域 |
| MCP Registry 页 | 0 页；等产品事实卡/API 说明 | 三仓无内容原料 |
| Models / Integrations / Learn 目录 | 不建 | Mastra 规模产物；Oribos 无对应内容量 |
| AI Gateway | 0 页 | 产品口径不做 |
| channels / voice / workspaces / sandboxes / browser / auth / server / studio | 不建 section | 框架出域或能力缺失 |
| 18 个能力包的 API 生成树 | 首发不建 | 规模跳跃；先用概念页 + import-map 覆盖 |

**P1/P2 写进页面清单但不建**：

| 页面 | 族 | 状态 | 内容源 |
|---|---|---|---|
| streaming | Concepts | P1 | core 流 / output objects；等 0.9 后 API 稳定 |
| structured-output | Concepts | P2 | core agent |
| approval-gates | Concepts | P2 | durable-agent / suspend-resume |
| signals | Concepts | P2 | core signals |
| schedules | Concepts | P2 | core schedules |
| exporters | Guides | P2 | `@oribos/otlp` / `@oribos/otel-bridge`（首发 tracing 页覆盖基础） |
| storage-adapter | Guides | P2 | `@oribos/sqlite` + 四个 port |
| faq | Guides | P2 | 真实问题积累 |
| upgrade-0-1 | Guides | P2 | 1.0 前 |
| glossary | Reference | P2 | 英文 Glossary |
| releases | Project | P1 | GitHub Releases |
| changelog | Project | P2 | GitHub Releases / blog 分类 |
| deployment | Project | P2 | 部署基线 + 真实托管路径 |
| contributing | Project | P2 | 框架仓贡献文档 |
| why-oribos | Project | P2 | 外链营销站，唯一一支 |
| 18 个能力包 overview | Concepts/Reference | P1/P2 | `packages/*/README.md`；按需求逐包开 |

### 3.3 页面清单（首发）

| URL | 标题 | 族 | 来源 | 动作 |
|---|---|---|---|---|
| `/docs/` | Introduction | Get started | 现有 `index.mdx` | 迁移 + 事实刷新 + 改 landing 结构 |
| `/docs/get-started/installation/` | Installation | Get started | 现有 | 迁移 + 事实刷新 |
| `/docs/get-started/quickstart/` | Quickstart | Get started | 现有 | 迁移 + 事实刷新 |
| `/docs/get-started/concepts-overview/` | Concepts overview | Get started | 现有 | 迁移 + 补新概念入口 |
| `/docs/concepts/agents/` | Agents | Concepts | 现有 | 迁移 + 能力表 / Related |
| `/docs/concepts/tools/` | Tools | Concepts | 现有 | 迁移 + MCP 互链 |
| `/docs/concepts/models/` | Models | Concepts | 现有 | 迁移 + model-router 互链 |
| `/docs/concepts/memory/` | Memory | Concepts | 现有 | 迁移 + RAG / observational-memory 小节 |
| `/docs/concepts/workflows/` | Workflows | Concepts | 现有 | 迁移 + time-travel / checkpoints 互链 |
| `/docs/concepts/observability/` | Observability | Concepts | 现有 | 迁移 + OTLP / OTel bridge 小节 |
| `/docs/concepts/durable-execution/` | Durable execution & background work | Concepts | 现有 | 迁移 + 能力包边界小节 |
| `/docs/concepts/suspend-resume/` | Suspend & resume | Concepts | 现有 | 迁移 |
| `/docs/concepts/processors/` | Processors | Concepts | 现有 | 迁移 + evals 互链 |
| `/docs/concepts/storage/` | Storage | Concepts | 新写 | 新增 |
| `/docs/concepts/evals/` | Evals | Concepts | 新写 | 新增 |
| `/docs/concepts/mcp/` | MCP | Concepts | 新写 | 新增 |
| `/docs/concepts/multi-agent/` | Multi-agent composition | Concepts | 新写 | 新增 |
| `/docs/guides/examples/` | Examples | Guides | 现有 | 迁移 + 23 examples 索引 |
| `/docs/guides/minimal-agent/` | Walkthrough: minimal-agent | Guides | 现有 | 迁移 + 事实核对 |
| `/docs/guides/durable-approval/` | Walkthrough: durable-approval | Guides | 现有 | 迁移 + 事实核对 |
| `/docs/guides/signals-desk/` | Walkthrough: signals-desk | Guides | 现有 | 迁移 + 事实核对 |
| `/docs/guides/tracing/` | Exporters & tracing | Guides | 新写 | 新增 |
| `/docs/reference/import-map/` | Import map / package surface | Reference | 现有 | 迁移 + 扩到 28 导出面 |
| `/docs/reference/api/**` | API reference | Reference | 生成树 | 升 pin 重生成 |
| `/docs/project/docs-for-agents/` | Docs for AI agents | Project | 现有 | 迁移 + manifest 示例更新 |

---

## 4. API reference

### 4.1 首发范围

- **只覆盖 core**：10 个模块组、249 页。
- 路径保持 `/docs/reference/api/**`。
- pin 升到 `v0.9.0` tag commit `77e582419c425f7d4d7cee2cd189b9f46f69ef84`。
- 用现有 `regen-api-tree.mjs` 重生成；`git status` diff 门保留。
- 生成树作为仓库资产入库；平台构建仍可依赖 `api-sidebar.json`。

10 个模块组：`@oribos/core`、`agent`、`durable-agent`、`memory`、`model`、`observability`、`schedules`、`signals`、`tools`、`workflows`。

### 4.2 能力包覆盖

首发不为 18 个能力包生成 API 树。覆盖方式：

- `import-map` 扩到 **28 个导出面**：core 10 + 18 个能力包，每包一行（包名、一句话、入口链接）。
- 4 个能力面概念页（storage / evals / mcp / multi-agent）承载主要用法。
- 现有概念页补相关能力包小节：memory（RAG / observational-memory）、observability（OTLP / OTel bridge）、durable-execution（background-tasks / distributed-signals / inngest / checkpoints / resumable-stream）。
- 每个能力包的 README 作为后续独立页的原料，不在首发建空页。

### 4.3 未来升格触发

- 单个能力包出现 **> 15 个手写页**，或 **> 50 个 reference 页**：评估上下文侧栏或独立 `/reference/**` 根。
- 真实查阅需求出现前，不预生成 18 棵树。

---

## 5. 页面迁移映射

### 5.1 19 个手写页

| # | 旧 URL | 新 URL | 动作 | 事实刷新 / 备注 |
|---:|---|---|---|---|
| 1 | `/docs/` | 同路径 | 迁 + 刷新 | 删 `ultralight` / `lightweight`；0.5.0 状态块改 0.9.0；补 landing 结构（quickstart、3 入口卡、能力表、docs-for-agents 链接） |
| 2 | `/docs/get-started/installation/` | 同路径 | 迁 + 刷新 | `npm install @oribos/core`；Node >=22.13；18 能力包；删 `@balsats` / 0.5.0；说明能力包自带依赖 |
| 3 | `/docs/get-started/quickstart/` | 同路径 | 迁 + 刷新 | 代码与版本核对到 0.9.0 |
| 4 | `/docs/get-started/concepts-overview/` | 同路径 | 迁 + 刷新 | 补 storage / evals / mcp / multi-agent 入口 |
| 5 | `/docs/concepts/agents/` | 同路径 | 迁 + 刷新 | 加“Goal → Start here”能力表；链 supervisor、processors、evals |
| 6 | `/docs/concepts/tools/` | 同路径 | 迁 + 刷新 | 链 MCP；不写“tool registry” |
| 7 | `/docs/concepts/models/` | 同路径 | 迁 + 刷新 | 链 `@oribos/model-router`；不写 AI Gateway / provider 目录 |
| 8 | `/docs/concepts/memory/` | 同路径 | 迁 + 刷新 | 补 RAG / observational-memory；链 storage |
| 9 | `/docs/concepts/workflows/` | 同路径 | 迁 + 刷新 | 补 time-travel / checkpoints 互链 |
| 10 | `/docs/concepts/observability/` | 同路径 | 迁 + 刷新 | 补 OTLP / OTel bridge；区分 core span 与 OTel |
| 11 | `/docs/concepts/durable-execution/` | 同路径 | 迁 + 刷新 | 补 background-tasks / distributed-signals / inngest / checkpoints / resumable-stream；写清 at-least-once / at-most-once |
| 12 | `/docs/concepts/suspend-resume/` | 同路径 | 迁 + 刷新 | 与 durable-agent / approval gates 对齐 |
| 13 | `/docs/concepts/processors/` | 同路径 | 迁 + 刷新 | 链 evals processor |
| 14 | `/docs/guides/examples/` | 同路径 | 迁 + 刷新 | 23 examples；16 个离线 / 17 case；7 个需 model key；索引表 |
| 15 | `/docs/guides/minimal-agent/` | 同路径 | 迁 + 刷新 | 代码核对到 0.9.0 |
| 16 | `/docs/guides/durable-approval/` | 同路径 | 迁 + 刷新 | 代码核对到 0.9.0 |
| 17 | `/docs/guides/signals-desk/` | 同路径 | 迁 + 刷新 | 代码核对到 0.9.0 |
| 18 | `/docs/reference/import-map/` | 同路径 | 迁 + 扩 | 28 个导出面；core 10 + 18 包表 |
| 19 | `/docs/project/docs-for-agents/` | 同路径 | 迁 + 刷新 | manifest 示例 0.9.0 / pin v0.9.0；删 “if and when they ship” |

### 5.2 249 个生成页

- 不逐页改写；用 v0.9.0 pin 重生成。
- 预期符号变化：core 0.9.0 的公开表面；不要带 main 上的 `agent-run` / `output-object`。
- 生成页保留 `generated: true`，不要求 `packages`，不手工编辑。
- API 树 diff 门：生成后 `git status` 必须干净（除预期变更）；CI 三红一黄保留。

### 5.3 退役 / 不迁

| 项 | 处置 |
|---|---|
| `oribos-docs/redirects.json` 的 `/` → `/docs/` | 删除；新站 `/` 是营销首页 |
| `oribos-docs` 的 `docs/spec/*`（ia / content-inventory / api-reference / agent-surface / brand-visual / delivery 等） | 标历史；不作为新站内容真相源 |
| `ultralight` / `lightweight` 公开文案 | 退役 |
| 0.5.0 / 0.6.0 作为当前版本 | 退役 |
| `@balsats/*` 安装路径 | 退役 |
| “RAG / evals 未内建”口径 | 退役；改为可选能力包 |
| `docs.<apex>` 作为 canonical | 退役；降为 301 别名 |

---

## 6. Agent surface

### 6.1 保留的契约

- 每页 `.md` twin：`<route>.md`，无尾斜杠。
- 每页 head：`<link rel="alternate" type="text/markdown" href="<route>.md">`。
- 站根 `/llms.txt`：llmstxt.org v2 形状；H1 → 摘要 → 五族 `##` → 逐页链接 → `## Optional`。
- 站根 `/llms-manifest.json`：`site` / `framework{pin,version}` / `generatedAt` / `packages`。
- 构建期生成，产物不入库；CI 重算比对。
- 不做 per-page `llms.txt`、`llms-full.txt`、`Accept: text/markdown` 内容协商（沿用现有裁决）。

### 6.2 更新

| 项 | 旧 | 新 |
|---|---|---|
| `framework.version` | 0.5.0 | 0.9.0 |
| `framework.pin` | `81483bd…` | `77e582419c425f7d4d7cee2cd189b9f46f69ef84` |
| manifest `packages` 键 | 10 个 core 子路径 | 28 个导出面（core 10 + 18 能力包） |
| frontmatter `packageValues` | 10 个 core 值 | 28 个值 |
| `llms.txt` Docs 段 | 19 手写页 + 10 模块组 + 2 Optional | 24 手写页 + 10 模块组 + 2 Optional |
| `site` | `https://docs.<apex>` | `${SITE_ORIGIN}`（provisional `https://oribos.ai`） |

### 6.3 CI 断言

保留现有 5 条：

1. twin 双向 + head link。
2. llms 链接集合 == 内容集合 + 10 模块组。
3. manifest 重算比对。
4. 代码围栏语言。
5. 标题层级。

新增：

- `packages` 值域 == 28；页面 `packages` 必须在值域内。
- 无 `0.5.0` / `0.6.0` 作为当前版本；无 `ultralight` / `lightweight`；无 `@balsats/*`。
- 无“RAG / evals 未内建”的否认句。
- 无孤立页：sitemap ⊆ 侧栏，生成页/废弃页例外需登记。

### 6.4 全站扩展

本文只定 docs 段。营销页、资源页的 `.md` twin、`/llms.txt` 分区、JSON-LD、逐页 OG 已由「技术栈与仓库形态」定（见 `docs/spec/stack.md` §7–§8）；验收归「规格装配与交接验收标准」。`/llms.txt` 的站根位置不变，内容可扩展。

---

## 7. 交接验收清单

- [ ] IA 树 == §3.1；24 手写 + 249 生成；无孤儿页。
- [ ] 268 条 `/docs/**` 全部 200；`/` 不再 301 到 `/docs/`。
- [ ] canonical 全部 `${SITE_ORIGIN}/...`（provisional `https://oribos.ai/...`）；`docs.<apex>` 301。
- [ ] 尾斜杠一致；`.md` twin 全部 200。
- [ ] `redirects.json` 删除 `/` → `/docs/`；被删/改 URL 全部登记；CI 绿。
- [ ] frontmatter：`title` / `description` / `packages` 必填；`packageValues` == 28；生成页 `generated: true`。
- [ ] API 树 == v0.9.0 重生成；10 组 / 249 页；diff 门绿。
- [ ] import-map == 28 个导出面。
- [ ] `/llms.txt` 与 `/llms-manifest.json` 重生成；`packages` == 28；pin == v0.9.0。
- [ ] 无 0.5.0 / 0.6.0 / `ultralight` / `lightweight` / `@balsats/*` / RAG-evals 否认句。
- [ ] 无 Platform / Studio / Agent Builder / MCP Registry / Models / Integrations / Learn / AI Gateway 首发页。
- [ ] 无空 stub；P1/P2 页面只在清单中标状态。
- [ ] Pagefind 覆盖 273 页；无第三方搜索/分析。
- [ ] docs shell 的 header/footer/sidebar 视觉按「设计系统与组件规格（B · 仪器）」。

---

## 8. 未决 / 后续票

| 项 | 归属 |
|---|---|
| 18 个能力包是否各建独立 overview / API 页 | 后续内容票；P1/P2 |
| Platform / Studio / Agent Builder 产品事实卡与 docs 页 | 产品裁决 + 后续票 |
| MCP Registry 公开内容（API、用法、截图） | 产品裁决 + 后续票 |
| releases / changelog 的页面形态 | 「规格装配与交接验收标准」/ 建站 |
| deployment / contributing / glossary 的内容源与首发取舍 | 「规格装配与交接验收标准」/ 建站 |
| docs shell 是否复用营销 header/footer、主题切换 | 「设计系统与组件规格（B · 仪器）」 |
| docs landing 的营销内容取舍 | 「首页叙事与页面结构」 |
| 营销站历史 URL 全集与逐条重定向 | 「关键词页与 SEO 落地页集」/「规格装配与交接验收标准」 |

---

## 9. 来源

- `docs/research/mastra-docs-audit.md`
- `docs/research/oribos-content-audit.md`
- `docs/research/seo-agent-surface-audit.md`
- `docs/research/stack-options.md`
- `docs/spec/fact-baseline.md`
- 现有 `oribos-docs` 内容树与 `docs/spec/ia.md` / `agent-surface.md`
- 地图 [Oribos 官网：Mastra 形态站点规格](https://github.com/0xnicholas/oribos-www/issues/1)

---

_本文只裁决 docs IA、迁移、URL、内容真相源与 docs agent surface；技术栈、托管、视觉与建站实施由各自票处理。_
