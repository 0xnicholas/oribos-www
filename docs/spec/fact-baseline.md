# 站点事实基线

> 票：[站点事实基线](https://github.com/0xnicholas/oribos-www/issues/17)（wayfinder 地图 [#1](https://github.com/0xnicholas/oribos-www/issues/1) 的子票）
> 日期：2026-10-20
> 状态：交接事实源。页面大纲、文案、导航、SEO / agent surface 的版本与能力断言以此为准。
> 范围：只定义“什么可以公开说”；不决定 IA、页面清单、视觉、技术栈。那些归后续票。

## 0. 先读这三条

1. **公开站描述的是已发布的 `0.9.0`，不是框架仓当前 `main`。**
   `main` 上已经有不在 0.9.0 发布面的 `agent-run` / `output-object` 两个 core 入口，以及同样不在 0.9.0 发布面的 `@oribos/lease` 叶子包。它们可以出现在内部规格里，不能出现在站面“已发布 / 可用”口径里。
2. **“零运行时依赖”只属于 `@oribos/core`。**
   能力包按需携带外部依赖（MCP SDK、OTel、croner、Inngest）；把它们笼统写成“整个框架零依赖”是事实错误。站面应把零依赖作为 core 的证据，而不是整站身份词。
3. **`@balsats/*` 是已下架的历史 scope，不是安装路径。**
   0.5.0 曾以 `@balsats/*` 发布，现已 unpublished；第一个 `@oribos/*` 版本是 0.6.0，当前是 0.9.0。任何安装命令、import、文档示例都只能写 `@oribos/*`。

---

## 1. 版本与发布事实

### 1.1 当前发布线

| 事实 | 值 | 来源 |
| --- | --- | --- |
| 当前发布版本 | **0.9.0** | GitHub Release `v0.9.0`（2026-10-15）；`packages/core/package.json` |
| 发布 tag | `v0.9.0` | 框架仓 tag；tag commit `77e582419c425f7d4d7cee2cd189b9f46f69ef84` |
| 已发布包数 | **19**（core + 18 能力包） | Release notes v0.9.0；`git ls-tree v0.9.0 packages/`（排除 private `testing`） |
| npm scope | `@oribos/*` | 全部 19 包 |
| 模块格式 | ESM only | `packages/core/package.json`、Release notes |
| Node 下限 | **>=22.13.0** | `packages/core/package.json` `engines`；Release notes |
| 许可 | Apache-2.0（代码与 examples；不覆盖名称） | `LICENSE` |
| 发布状态 | pre-1.0；1.0 无排期 | README Status；Release notes |

### 1.2 版本序列

| 版本 | 包数 | 公开口径 | 备注 |
| --- | --- | --- | --- |
| 0.5.0 | 7 | 上一代 scope `@balsats/*` 的最后版本，**已 unpublished** | 不可作为安装路径；旧站 docs 仍指向它是事实债 |
| 0.6.0 | 7 | 第一个 `@oribos/*` 版本；M1–M5 主线 + 首批能力包 | Release notes v0.6.0 列出 core + 6 包 |
| 0.7.0 | 9 | 追赶面第一批：`@oribos/supervisor`、`@oribos/evals` | Release notes v0.7.0 |
| 0.8.0 | 15 | 追赶面中段：`@oribos/rag`、`@oribos/resumable-stream`、`@oribos/model-router`、`@oribos/checkpoints`、`@oribos/otel-bridge` + `@oribos/semconv` 叶子包 | Release notes v0.8.0：“9 → 15 packages” |
| 0.9.0 | 19 | 追赶面收尾：`@oribos/distributed-signals`、`@oribos/inngest`、`@oribos/observational-memory`、`@oribos/background-tasks` | Release notes v0.9.0：“15 → 19 packages” |

> **不要把目录当发布证据。** v0.8.0 的 tag tree 里已经有 `packages/distributed-signals`，但版本是 `0.0.0`，不在 v0.8.0 的发布清单里；它首次发布是 0.9.0。同理，当前 main 的 `packages/lease` 写 0.9.0，但不在 v0.9.0 tag 里。判断“已发布”只认 **tag tree + Release notes**，不认目录或 manifest 的版本字面。
>
> **v0.9.0 tag 的 README Status 段是滞后的。** Tag commit `77e5824` 的 README 仍写 “0.8.0 is published / all fifteen packages”，因为 0.9.0 的文档收口 commit `f879a4a` 在 tag 之后。0.9.0 的发布事实以 Release notes + tag 内各包 manifest（0.9.0）为准；不要引用 tag README 的 Status 段。README 里的 “All six” 指 M5 首批六包，不是全部 18 能力包。

### 1.3 发布面 vs 当前 main（关键边界）

| 维度 | v0.9.0（公开站口径） | 当前 main（未发布） |
| --- | --- | --- |
| core 入口数 | **10** | **12**（新增 `agent-run`、`output-object`） |
| 已发布包 | **19** | 19 + `@oribos/lease`（不在 v0.9.0 发布面）；`@oribos/testing` 仍为 private |
| `background-tasks` / `distributed-signals` 依赖 | 0 外部依赖 | 依赖 `@oribos/lease`（叶子包，不在 v0.9.0 发布面） |
| 版本字面 | 0.9.0 | 各包 manifest 仍写 0.9.0，但代码已领先 tag |

**写法规则**：站面版本事实一律以 tag `v0.9.0` 为准；不要因为 `main` 的 `package.json` 也写 0.9.0，就把未发布 seam 当成已发布能力。若未来发布 0.10.0，再整体升版并重跑本基线。

### 1.4 已发布包清单（19）

| # | 包 | 类别 |
| --- | --- | --- |
| 1 | `@oribos/core` | 核心 |
| 2 | `@oribos/ai-sdk` | 能力包 |
| 3 | `@oribos/background-tasks` | 能力包 |
| 4 | `@oribos/checkpoints` | 能力包 |
| 5 | `@oribos/croner` | 能力包 |
| 6 | `@oribos/distributed-signals` | 能力包 |
| 7 | `@oribos/evals` | 能力包 |
| 8 | `@oribos/inngest` | 能力包 |
| 9 | `@oribos/mcp-client` | 能力包 |
| 10 | `@oribos/mcp-server` | 能力包 |
| 11 | `@oribos/model-router` | 能力包 |
| 12 | `@oribos/observational-memory` | 能力包 |
| 13 | `@oribos/otel-bridge` | 能力包 |
| 14 | `@oribos/otlp` | 能力包 |
| 15 | `@oribos/rag` | 能力包 |
| 16 | `@oribos/resumable-stream` | 能力包 |
| 17 | `@oribos/semconv` | 叶子包（被 otlp / otel-bridge 复用；用户不直接安装） |
| 18 | `@oribos/sqlite` | 能力包 |
| 19 | `@oribos/supervisor` | 能力包 |

不在 0.9.0 发布面 / 非公开：`@oribos/lease`（main 上新增的叶子包，不在 v0.9.0 tag；站面不要写成已发布）、`@oribos/testing`（private，never published）。

---

## 2. 包与导出面

### 2.1 core 的 10 个入口（0.9.0）

| 入口 | 给什么 | 不是什么 |
| --- | --- | --- |
| `@oribos/core` | `createApp`，可选组合根 | 不是平台控制面；不挂任何子系统也能用 |
| `@oribos/core/agent` | `Agent`、动态参数、结构化输出、processors、内建 tool loop | 没有 supervisor 协议 / sub-agent 字段 |
| `@oribos/core/model` | 模型契约与 chunk 协议类型 | 不是 provider registry；模型实例来自 AI SDK provider 包 |
| `@oribos/core/tools` | `createTool` 与工具类型；Standard Schema | 工具不是 class；不在工具上挂 agent / memory |
| `@oribos/core/memory` | `Memory`、内存 store、消息历史与 working memory | 不是托管记忆服务；默认内存，持久化走 port |
| `@oribos/core/workflows` | `createWorkflow` / `createStep`、快照 store、suspend/resume、time-travel restart | 不是 DAG 执行器 |
| `@oribos/core/observability` | `createTracer`、console / memory exporter、span 类型 | 不是 OTel SDK；OTLP / OTel 走能力包 |
| `@oribos/core/signals` | `createSignals`：inject / wake / queue，单进程语义 | 不是跨实例 PubSub；跨实例走 `@oribos/distributed-signals` |
| `@oribos/core/durable-agent` | `createDurableAgent`、审批闸、`AgentRunSnapshotStore` | 不是常驻 worker；快照默认内存 |
| `@oribos/core/schedules` | `createSchedules`、`tick`、`ScheduleStore`；cron 解析注入 | 不是内置 cron 守护进程；平台 cron 打 endpoint 是一等形态 |

> 当前 main 另有 `@oribos/core/agent-run` 与 `@oribos/core/output-object`，**未在 0.9.0 发布**；站面不要写。

### 2.2 能力包矩阵（18）

| 包 | 是什么 | 不是什么 / 边界 |
| --- | --- | --- |
| `@oribos/ai-sdk` | Oribos chunk 协议 ↔ AI SDK UI message stream；`useChat` 兼容路由 | 不是模型 provider；不引入 provider registry |
| `@oribos/background-tasks` | 应用自有后台任务：task row → lease → 进程内执行 → heartbeat → settle；`adopt()` 收养孤儿，`untilIdle()` 等待 | 不是队列服务；at-least-once，幂等由应用负责；默认内存 store / lease |
| `@oribos/checkpoints` | 每步 checkpoint 落到自有 store；`recover(runId)` / `recoverAll()` 从最后完成步重放 | 不是 exactly-once；不新增存储服务 |
| `@oribos/croner` | cron 表达式 → `schedules.save()` 的 `next` 片段 | 不是调度守护进程；tick 仍由宿主 / 平台触发 |
| `@oribos/distributed-signals` | 包装 core `Signals`，三个 send 原语跨实例路由；租约仲裁 idle wake；流仍本地 | 不做跨实例 chunk 实时跟随；at-most-once |
| `@oribos/evals` | scorer：`scoreRun` 事后整跑评分；`createScorerProcessor` per-step 接入 Processor | 不是 eval 数据集 / 托管评估平台 |
| `@oribos/inngest` | workflow `start` / `resume` 作为 Inngest trigger；walker 与 snapshot store 留在进程内 | 不是 Inngest 托管执行；不暴露 durable sleep / workflow cron / 实时流跟随 |
| `@oribos/mcp-client` | 远端 MCP server 的工具变成普通 Oribos 工具（HTTP / stdio） | 不是工具 registry |
| `@oribos/mcp-server` | 把工具容器以 MCP 暴露（HTTP fetch handler / stdio） | 不是 MCP Registry；没有独立产品页 |
| `@oribos/model-router` | `'provider/model'` 字符串 → 模型实例；catalog 自带；只做 parse / resolve | 不是模型网关；core 无 registry / magic string |
| `@oribos/observational-memory` | 包装 `MemoryStore`：recall 窗口之外的积压在请求内压缩成 observation / reflection | 不是后台常驻管线；请求内完成，零 timer；记录走自有 port |
| `@oribos/otel-bridge` | 通过宿主 `TracerProvider` 开真实 OTel span；无 provider 时 no-op | 不是 exporter / collector |
| `@oribos/otlp` | OTLP/HTTP exporter；Oribos span → GenAI semconv | 不是 dashboard / 托管观测服务 |
| `@oribos/rag` | 包装 `MemoryStore`：保存消息时用你的 embedding 模型建索引，recall 时拉回更早的相关消息 | 不是向量数据库；向量 store 客户端由用户提供 |
| `@oribos/resumable-stream` | 记录 run 的 chunk 流，`observe(runId)` 重放并跟随 | 默认内存 cache；跨实例实时跟随不是承诺 |
| `@oribos/semconv` | GenAI semconv 映射纯件（span 名 / 属性、消息转换、值域） | 叶子包，用户不直接安装 |
| `@oribos/sqlite` | 四个 storage port 的 SQLite adapter，基于 `node:sqlite` | 不是通用 ORM；Node only |
| `@oribos/supervisor` | `createSupervisor`：把 sub-agent 组合成父 agent 上的委派工具 | 不是 supervisor 协议 / 新 core seam |

### 2.3 能力矩阵（core 子系统）

| 子系统 | 是什么 | 不是什么 |
| --- | --- | --- |
| Agents | `Agent` = name / instructions / model / tools（+ 可选 memory / processors）；`generate()` / `stream()` 同一输出对象；内建 tool loop | 没有 God class、没有权限模型、没有 sub-agent 字段 |
| Tools | `createTool` 四字段普通对象；名字 = 容器 Record key；Standard Schema 校验；错误回喂模型 | 不是工具注册表；工具不携带框架引用 |
| Memory | 消息历史（默认开，`lastMessages=10`）+ working memory（opt-in，resource-scoped）；storage port 默认内存 | 不是会话状态自动机；thread / resource 每次调用显式指定 |
| Workflows | builder：`then` / `parallel` / `branch` / `foreach` / `dowhile` / `dountil` / `sleep`；扁平条目列表 + for 循环 walker；suspend/resume + restart | 不是 DAG；不是状态机 DSL |
| Observability | 自有最小 span 模型；agent run、model step、tool call、workflow run/step、memory recall/save 自动埋点；console / memory exporter 内置 | 不是 OTel SDK；无 tracer 时零 span 开销 |
| Harness 三件套 | durable agents（审批闸挂起 / resume）、signals（单进程 inject / wake / queue）、schedules（记录 CRUD + tick） | 不是常驻队列 / worker；跨实例与持久执行走能力包 |
| 模型契约 | 直接传 AI SDK provider 模型实例；核心零依赖；字符串路由走 `@oribos/model-router` | 不是自有 provider SPI / 注册表 |
| 存储 port | 四个 port：memory、workflow snapshot、agent-run snapshot、schedule；默认内存；`@oribos/sqlite` 全实现 | 不是数据库内置；不强制任何外部存储 |

---

## 3. 已批准 claims 清单

每条给出来源。页面只能在这个清单内做已实现 / 已发布断言；清单外的能力写成“planned”或直接不写。

| # | 可公开断言 | 精确口径 | 来源 |
| --- | --- | --- | --- |
| C1 | 当前版本 0.9.0 | “0.9.0 is the current release.” | Release v0.9.0；tag |
| C2 | 19 个包已发布 | “19 packages: core + 18 capability packages.” | Release v0.9.0 |
| C3 | core 零运行时依赖 | “The **core** has zero runtime dependencies.” 不可省略 core | `packages/core/package.json`（dependencies 空）；ADR-0015；README |
| C4 | 子路径导出 | 0.9.0 core 有 10 个入口；每个能力包单一入口。共 28 个导出面 | `git show v0.9.0:packages/core/package.json`；各能力包 manifest |
| C5 | 无 DB / 队列 / 长驻进程 | “Nothing in the core requires a database, a queue, or a long-running process.” 能力包可 opt-in 外部基础设施 | README Why；ADR-0001 / 0011 |
| C6 | Node >=22.13，ESM only | 公开 Requirements | `packages/core/package.json` engines；Release notes |
| C7 | Apache-2.0 | 代码与 examples；名称不在许可内 | `LICENSE`；README |
| C8 | 23 个 examples | “23 runnable, self-asserting examples.” | `examples/`；README |
| C9 | 16 个 example / 17 个离线 case 进 CI | 16 个 example 产生 17 个 case（`mcp-tools` HTTP + stdio 两条） | Release notes v0.9.0；`scripts/check-examples.mjs` |
| C10 | 7 个 example 需要真实模型 key | `minimal-agent` / `memory-chat` / `workflow-approval` / `durable-approval` / `signals-desk` / `ai-chat-route` / `sqlite-resume` | 各 example README 的 `OPENAI_API_KEY` 要求 |
| C11 | RAG 是可选能力包 | 0.8.0 起 `@oribos/rag`；语义 recall，非 core 内建 | README；Release notes |
| C12 | evals 是可选能力包 | 0.7.0 起 `@oribos/evals`；scorer / Processor 接入 | README |
| C13 | supervisor 是可选能力包 | 0.7.0 起 `@oribos/supervisor`；as-tool 组合 | README |
| C14 | MCP 支持是两个包 | `@oribos/mcp-server` / `@oribos/mcp-client`；0.6.0 起可用 | README；Release notes |
| C15 | 观测是 core 内建 + 可选导出 | core 自有 span 模型；`@oribos/otlp` / `@oribos/otel-bridge` 可选 | README；Release notes |
| C16 | 持久化是可选的 | 四个 storage port 默认内存；`@oribos/sqlite` 可选 | README；`@oribos/sqlite` |
| C17 | CI 有零依赖硬闸门、字节预算、导出面、example 冒烟 | 机制可公开；具体字节数 / 测试数不公开 | ADR-0015；`.github/workflows/ci.yml` |
| C18 | pre-1.0，1.0 无排期 | “Pre-1.0; 0.x may make breaking changes; 1.0 is not scheduled.” | README Status；Release notes |

### 3.1 需要加限定词的 claim

| 说法 | 问题 | 改成 |
| --- | --- | --- |
| “Oribos has zero runtime dependencies.” | 能力包有外部依赖，整句会被理解成全部包 | “The core has zero runtime dependencies; capability packages carry only their own.” |
| “Every package is zero-dependency.” | 只有 core 与部分能力包成立 | “Core and most capability packages are dependency-free; OTLP / OTel / MCP / croner / Inngest packages carry their own.” |
| “19 capability packages.” | 19 是包总数，不是能力包数 | “19 packages: core + 18 capability packages.” |
| “10 entry points.” | 0.9.0 的 core 是 10；main 是 12 | 公开站写 10，并注明“0.9.0”；不要用 main 的 12 |
| “RAG / evals are not built in.” | 已是可选能力包 | “RAG and evals ship as optional capability packages.” |
| “Studio / Platform is available.” | 无代码、无发布日期 | 只写 “planned”，不给能力与日期 |

### 3.2 不应公开的数字

- 测试数（1216 例 / 97 文件）——内部回归参考，不是公开承诺（ADR-0001 / 0015）。
- 字节预算（byte budget）与 dependency closure 的具体数字——机制可讲，数字不对外。
- 下载量、星数、用户数、客户数——无可靠来源，且旧站红线禁止。
- 任何排期 / 日期承诺——1.0、Platform、Studio、Agent Builder 都没有日期。

---

## 4. 出域项（不要写成已实现 / 不建独立页）

以下不是“还没写”，而是**这张地图的边界**；页面大纲不应把它们当首发内容，除非 owner 另开 effort。

| 项 | 口径 | 依据 |
| --- | --- | --- |
| Studio / editor / stored agents | 框架出域；不建独立产品页；不写已实现 | 框架 ROADMAP 出域档；`docs/architecture/agent.md` CUT-AG3 |
| 托管平台（Platform） | 计划中伞形产品；首发只做 `/platform` 方向页；无代码、无日期、无能力承诺 | 地图 Notes；框架 ROADMAP 把“托管平台”列为出域 / 商业决策 |
| Agent Builder | Platform 的面；不单独进 header；不建独立页 | 地图 Notes |
| channels / voice / workspaces & sandboxes / browser | 框架出域；不写能力 | 框架 ROADMAP 出域档；CUT-AG2 |
| AgentController / session | 框架出域；不写成品运行时 | 框架 ROADMAP；CUT-H7 |
| notification inbox | 框架出域；即时 `sendSignal` 已覆盖主路径 | 框架 ROADMAP；CUT-H3 |
| AI Gateway | 不做；不建页 | 地图 Out of scope |
| MCP Registry 独立产品页 | 做，但只在文档中讲；不建独立页 | 地图 Notes / Out of scope |
| 客户案例、logo 墙、客户证言 | 无客户证据；不伪造 | 地图 Out of scope；旧站红线 |
| Mastra 的视觉 token / 品牌皮肤 | 只借结构语法，不借视觉 | 地图 Out of scope；视觉票 |
| 继承旧站视觉 | 旧站只作迁移来源 | 地图 Out of scope；owner 裁决 |
| 建站实施、批量写作、迁移排期、上线切流 | 本地图只到规格交接 | 地图 Out of scope |
| 首发中文内容 / 中文站运营 | English-only 已定；`/zh/` 只预留 | 地图 Decisions；语言票 #15 |

### 4.1 Platform / Studio 的表述边界

地图的产品口径是：**Framework 真实；Platform 是计划中的伞形产品，Studio / Agent Builder 是其两个面；header 只露 `Platform (Planned)` 一个入口，Studio / Agent Builder 不单独进 header；不承诺日期。**

框架仓的事实是：**没有 Platform / Studio / Agent Builder 代码；ROADMAP 仍把 Studio 与托管平台列为出域 / 商业决策。**

两者不矛盾，但站面必须同时满足：

- 可以写 “Platform (Planned)” 或 “in development”，不能写 “available / shipping”。
- 不能给 Platform / Studio / Agent Builder 编造能力清单；没有产品事实卡就不写细节。
- 不能给日期。
- Studio / Agent Builder 不单独建页、不进 header。

---

## 5. 旧站改写清单

> 这一节是给迁移 / 建站用的“逐句处方”。行号以 2026-10-20 工作树为准；`oribos-website` HEAD `5ab2f62`，`oribos-docs` HEAD `b03e3ce`。

### 5.1 营销站（`oribos-website`）

| 文件:行 | 现文（摘录） | 改成 | 理由 |
| --- | --- | --- | --- |
| `src/lib/version.ts:14` | `export const VERSION = '0.6.0';` | `'0.9.0'` | 0.9.0 是当前发布；该常量同时供 header pill 与 MCP 代码段 `{version}` 使用 |
| `src/content/faq/rag-or-evals.json:3-4` | Q: “Does Oribos support RAG or evals?” / A: “No — neither is built in. Both sit on the framework's deferred list…” | Q 保留；A 改为：“Yes — both ship as optional capability packages: `@oribos/evals` (0.7.0) for scorers and `@oribos/rag` (0.8.0) for semantic recall. They are not part of the core; install only what you use.” | 0.7 / 0.8 已发布；旧答案直接否认事实 |
| `src/content/faq/on-npm.json:4` | “Yes — Oribos is on npm. npm i @oribos/core installs the zero-dependency core, and every capability package ships alongside it…” | “Yes — Oribos 0.9.0 is on npm. `npm install @oribos/core` installs the zero-dependency core; 18 capability packages publish under `@oribos/*`, and you add them one at a time.” | 补当前版本与“core 零依赖”的范围；19 包 = core + 18 |
| `src/content/faq/mcp.json:4` | “Both ship with the first release.” | “Both are available now — `@oribos/mcp-server` and `@oribos/mcp-client` are two of the 18 capability packages.” | “first release”口径过时；MCP 只是能力包中的两个 |
| `src/content/hero/home.json:3` | “Oribos, the TypeScript agent framework with zero runtime dependencies.” | “Oribos, the TypeScript agent framework — with a zero-runtime-dependency core.” | 零依赖只属于 core |
| `src/content/facts/zero-runtime-dependencies.json:3` | “0 runtime dependencies” | “0 runtime dependencies in core” | 同上；事实带不能暗示全部包 |
| `src/content/keyword-pages/ai-agent-framework.json:3` | “…a library, not infrastructure you operate — zero runtime dependencies, nothing new to run.” | “…a library, not infrastructure you operate — a zero-runtime-dependency core, nothing new to run.” | 同上；正文与 FAQ 已正确写 core，保持全页一致 |
| `src/content/about/default.json:8` | “The framework came first, the documentation site is next, and future subprojects live alongside them…” | “The framework came first, the documentation is built, and future product work — Platform, with Studio and Agent Builder as its faces — is planned. No dates are promised.” | 文档站已存在；Platform 只能写 planned，不能写未来子项目已可用 |
| `src/lib/copy-rules.ts:86-88` | `id: 'rag-evals'` / “keyword pages do not carry RAG or evals at all” / `pattern: /\bRAG\b|\bevals?\b/i` | 删除该规则；换成“禁止否认 RAG / evals 已实现”的规则（如匹配 `neither is built in` / `not built in` / `deferred list`），并允许在关键词页写能力包名 | 旧规则会把真话判红 |
| `docs/SPEC-revamp.md:27` | “无 RAG/evals 宣称” | 改为“RAG / evals 作为可选能力包可写；不得写进 core” | 旧红线过期 |
| `docs/SPEC-revamp.md:431` | “RAG / evals 不作已实现宣称…” | 同上；该条整体退役 | 旧红线过期 |
| `docs/SPEC-revamp.md:242,302` | 版本示例 `v0.6.0` / `VERSION = '0.6.0'` | 若保留该 spec，改为 0.9.0；更建议把 SPEC-revamp 标为历史，不作出厂依据 | 版本常量已升 |
| `src/lib/links.ts:13` | `docs: 'https://github.com/0xnicholas/oribos-framework'` | 文档站上线后指 `https://oribos.dev/docs`（或子域裁决结果）；在此之前保留 GitHub 回退 | 链接债，不是事实错误 |
| `public/llms.txt` | 11 条营销页扁平清单 | 合并站改用构建期生成的 `/llms.txt`（营销 + docs + blog/resources） | 单站 agent surface 需要全站索引 |

### 5.2 文档站（`oribos-docs`）

| 文件:行 | 现文（摘录） | 改成 | 理由 |
| --- | --- | --- | --- |
| `src/content/docs/docs/index.mdx:3,43,49` | “Oribos is an **ultralight** TypeScript agent framework…” / “Two properties carry the ‘ultralight’ claim” | “Oribos is a TypeScript agent framework.”；标题与正文去掉 `ultralight` / `lightweight`；保留“compose only what you use / no runtime burden”两条事实 | 公开叙事已退役该身份词（ADR-0016/0017） |
| `src/content/docs/docs/index.mdx:65-66` | “**0.5.0** shipped as the previous scope's `@balsats/core`, while `@oribos/*` is the scope from the next release on.” | “**0.9.0** is the current release. `@oribos/*` has been the scope since 0.6.0; 0.5.0 was the preceding `@balsats/*` line and is no longer installable.” | 0.5.0 已下架；0.9.0 已发布 |
| `src/content/docs/docs/get-started/installation.md:29-38` | 只列 6 个能力包 + “Until `@oribos/core` ships, the install line is `npm install @balsats/core`; the published 0.5.0 packages are what that installs.” | 重写为：`npm install @oribos/core`；Node >=22.13；18 个能力包逐个列出或链接；删除 scope window 与 `@balsats`；说明能力包按需安装、可带自己的依赖 | **会引导读者安装不存在的包**，最高优先级 |
| `src/content/docs/docs/guides/examples.md:3,12` | “The **five** runnable examples…” | “The repository ships 23 examples; 16 run offline in the CI smoke gate (17 cases), and 7 require a real model key.” 或至少改成 23 个的索引表 | examples 已是 23 个 |
| `src/content/docs/docs/reference/import-map.md:13,18,61` | “ten entry points” / “The ten entry points” / “the table above stays the core's ten entry points” | **0.9.0 保留 10**（不要改成 12）；在“Beyond the core”补 18 个能力包表，每包一行；说明 core 10 + 能力包 18 = 28 个导出面 | 10 对 0.9.0 是正确的；缺的是能力包面 |
| `src/content/docs/docs/project/docs-for-agents.md:53,65-66` | manifest 示例 `"version": "0.5.0"`；正文 “0.5.0 as of this writing — the previous scope's `@balsats/*`…” | `"version": "0.9.0"`；pin 改 v0.9.0 tag commit；删除 previous scope 说明 | 机器契约示例过期 |
| `src/lib/agent-surface.ts:183,188` | 注释说 0.5.0 是 single first release；`frameworkVersion = '0.5.0'` | 注释改为 0.9.0；`frameworkVersion = '0.9.0'` | manifest / llms 的版本源 |
| `src/lib/site.ts:28` | `siteDescription = 'Documentation for Oribos, a lightweight TypeScript agent framework.'` | 改为品类语言：`Documentation for Oribos, a TypeScript agent framework.` | 退役身份词 |
| `pinned-ref.json:3` | `"commit": "81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6"` | `"commit": "77e582419c425f7d4d7cee2cd189b9f46f69ef84"`（tag `v0.9.0`） | API 树 / 内容 pin 仍在 0.5 时代 |
| `src/lib/frontmatter.ts:21-32` | `packageValues` 只有 core 的 10 个值 | 扩到 28：core 10 + 18 能力包；若首发只做 core API 树，至少把能力包名加进合法值域，别让页面无法标注 | manifest 的包→页映射需要 |
| `src/content/docs/docs/reference/api/**` | 249 页、10 个模块组、pinned 0.5.0 | 升 pin 后重生成；0.9.0 core 仍是 10 组，但符号会变；能力包 API 树是否首发由 docs IA 票 #12 裁决 | 生成树过期 |
| `api-sidebar.json` / `api-entry/` | 只有 core 的 10 个 shim / 10 组侧栏 | 若 docs IA 决定覆盖能力包：加 18 个 shim、侧栏扩到 28 组；否则明确“首发只覆盖 core” | 与上一条同源 |
| `dist/llms-manifest.json` | 生成物 `version: "0.5.0"`、10 个 package 键 | 源文件改完后重建；不要手改 dist | 生成物，不是真相源 |

### 5.3 规范 / 门禁 / 资产

| 资产 | 现状态 | 处置 |
| --- | --- | --- |
| `oribos-website/docs/SPEC.md` | v1，2026-10-02，已被 revamp 取代 | 历史；不作出厂依据 |
| `oribos-website/docs/SPEC-revamp.md` | v2，0.6.0 时代，含 RAG/evals 红线 | 历史；视觉部分可作参考，事实与红线按本基线改写 |
| `oribos-website/src/lib/copy-rules.ts` 的 `rag-evals` | 禁止关键词页出现 RAG / evals | 删除，换成“禁止否认已实现” |
| `oribos-website` 的 `counting-figure` 规则 | 禁止计数式表述 | 保留“禁止体积 / 测试 / 用户数”的内核；允许版本、包数、能力枚举等事实计数（由新站 claims 政策重写） |
| `oribos-website` 的 `retired-positioning` 规则 | 禁止 `ultralight` / `lightweight` | 保留；docs 侧也要清掉 `lightweight` |
| `oribos-docs/docs/spec/content-inventory.md:38,49,136,187` | 仍写 10 子路径 / version 0.0.0 / npm 未发布 / 0.5.0 | 标历史或按 0.9.0 更新；不能作为内容真相源 |
| `oribos-docs/docs/spec/api-reference.md:13,44,75,149` | 10 组 / 249 页 / pin 0.5.0 | 标历史；新站 API 树另立规格 |
| `oribos-docs/docs/spec/agent-surface.md:45,130,171` | 10 个模块组 / manifest version 0.5.0 | 标历史；新站 manifest 另立规格 |
| `oribos-docs/redirects.json` | `/` → `/docs/` 301 | 合并站 `/` 是营销首页；该条必须退役（归 docs IA / 迁移票 #12） |
| `oribos-docs/wrangler.jsonc` / `public/_headers` | Cloudflare 专用 | 腾讯云迁移时重写（归部署票 #18） |

---

## 6. 资产状态（供后续票估算，不替它们做决定）

### 6.1 营销站

- 11 页 + 404；`src/pages/*.astro`。
- 16 个 content collections / 38 个 JSON。
- 22 个组件（含 4 个 mock、4 个图标）+ 5 个布局。
- 22 道 `check-*` gate / 23 个测试文件。
- 版本单点 `src/lib/version.ts`；origin 单点 `src/lib/site.ts`。
- 关键可复用资产：v2 token 层、Inter 自托管字体、Hero / FeatureTabs / CodeTabs / TraceWaterfall / mock 四件、FactsBand、FaqList、FinalCta、AgentPromptCta、UseCaseCards。

### 6.2 文档站

- 19 个手写页 + 249 个 TypeDoc 生成页 = 268 条路由（另 404）。
- 每页 `.md` twin；`/llms.txt`；`/llms-manifest.json`；重定向台账。
- 15 道 gate；Pagefind 搜索；Starlight 0.42.4 / Astro 7.3.5。
- API 树：10 个 core 模块组，pin `81483bd`（0.5.0 时代）。
- 当前 `llms-manifest.json`：10 个 package 键、`version: 0.5.0`、`pin: 81483bd…`。

### 6.3 框架仓

- 23 个 examples；16 个 / 17 case 离线冒烟；7 个需要真实模型 key。
- 21 篇 ADR、8 篇 architecture（另 1 篇 README；中文内部文档，不直接上站）。
- `skills/oribos/SKILL.md` 已随仓发布，可作为 agent skill 资产。
- 测试规模 1216 例 / 97 文件（0.9.0 release note）——仅内部，不公开。

---

## 7. 复核命令

以下命令可在 2026-10-20 的快照上复现本基线。路径以 `/Users/nicholasl/Documents/build-whatever/` 为父目录。

```bash
# 1) 发布 tag 与包数（应为 19，排除 private testing）
git -C oribos-framework show v0.9.0:packages/core/package.json | jq -r '.version, (.exports|keys|length)'
# 期望：0.9.0 / 10
git -C oribos-framework ls-tree --name-only v0.9.0 packages/ | grep -v '^packages/testing$' | wc -l
# 期望：19

# 2) 当前 main 的 core 入口（应为 12，含未发布 seam）
jq -r '.exports|keys|length' oribos-framework/packages/core/package.json
# 期望：12

# 3) examples 与离线闸门
find oribos-framework/examples -mindepth 1 -maxdepth 1 -type d | wc -l
# 期望：23
gh release view v0.9.0 -R 0xnicholas/oribos-framework --json body --jq .body | grep -E '17 offline|1216'
# 期望：17 offline example runs (16 examples) / 1216 tests

# 4) 旧站事实债
rg -n '0\.6\.0|neither is built in|ultralight|0\.5\.0|five runnable|ten entry' \
  oribos-website/src oribos-docs/src oribos-docs/pinned-ref.json
# 期望命中本文第 5 节列出的位置

# 5) 文档站页面规模
find oribos-docs/src/content/docs/docs -type f -not -path '*/reference/api/*' | wc -l
# 期望：19
find oribos-docs/src/content/docs/docs/reference/api -type f | wc -l
# 期望：249
```

---

## 8. 本基线不决定的事

- IA / 导航树、页面清单、每页大纲（归 #9 / #10 / #12 / #14 / #16）。
- 视觉 token / 组件规格 / 品牌资产（归 #20 / #21）。
- 技术栈与仓库形态（归 #13；已有候选评估 `docs/research/stack-options.md`）。
- 域名、托管、备案（归 #18）。
- 关键词页与 SEO 落地页集（归 #19）。
- 定价、Platform 功能边界、FDE/Support 联系方式、博客/资源首发内容——仍是地图的 **Not yet specified**，需要 owner 或后续票输入。

---

## 附：快照

| 仓库 | HEAD | 日期 | 状态 |
| --- | --- | --- | --- |
| `oribos-framework` | `637a68e` | 2026-10-20 | `M CONTEXT.md`；tag v0.5.0–v0.9.0 |
| `oribos-website` | `5ab2f62` | 2026-10-11 | clean，`main` |
| `oribos-docs` | `b03e3ce` | 2026-10-04 | clean，`main` |
| `oribos-www` | `spec/fact-baseline` | 2026-10-20 | 本文所在分支；基于 `research/mastra-site-audit` |
| npm | 0.9.0 | 2026-10-20 | `@oribos/core` / `@oribos/supervisor` 实测 0.9.0（见 #4 审计）；本 session registry 查询较慢，发布集合以 tag + Release notes 为准 |

_本文只做事实基线；页面能否上线，仍取决于 #16 的交接验收与 #18 的部署基线。_
