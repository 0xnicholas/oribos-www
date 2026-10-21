# 域名、托管与备案基线

> 票：[域名、托管与备案基线](https://github.com/0xnicholas/oribos-www/issues/18)（wayfinder 地图 [Oribos 官网：Mastra 形态站点规格](https://github.com/0xnicholas/oribos-www/issues/1) 的子票）
> 日期：2026-10-21
> 状态：**provisional，未验收；owner 2026-10-21 搁置外部开通**。域名未注册、托管账号未开通、真实主机验证未跑；开通与实测移交建站/上线 effort，不再作为地图的阻塞门。本文不是交接基线，完成 §8 的开通与 §7 的实测前，不得据此开工建站。
> 上游：`docs/research/stack-options.md`、`docs/research/seo-agent-surface-audit.md`、`docs/spec/docs-ia.md`。
> 边界：本文只裁决域名、托管、DNS/TLS、重定向/headers 能力、预览与观测。技术栈见 `docs/spec/stack.md`，视觉归「设计系统与组件规格（B · 仪器）」，页面 IA 归已关闭的 docs/营销票。

## 0. 决策摘要

| # | 项 | 裁决 | 状态 |
|---|---|---|---|
| 1 | 上线形态 | **全球优先，不做 ICP 备案**；大陆节点不纳入首发 | 已定 |
| 2 | 域名 | **provisional `oribos.ai`**；未注册；规格用 `SITE_ORIGIN` 占位 | 暂定，注册为门 |
| 3 | canonical | `${SITE_ORIGIN}` 单一来源；provisional `https://oribos.ai`；`www` / `docs` / `http` 全部 301 到 apex | 已定 |
| 4 | 托管 | **暂定腾讯云 EdgeOne Pages（EdgeOne Makers）**，Global AZ excluding Chinese mainland，免费版 | 暂定，待实测 |
| 5 | 预览 | 公开 URL + `X-Robots-Tag: noindex`；生产项目只跟 `main`，预览落独立 staging 项目 | 已定 |
| 6 | 分析 / 日志 | 首发**不做分析**，不弹 consent；不要求原始 access log | 已定 |
| 7 | 域名注册 | owner 执行；Porkbun 等支持 `.ai` 的注册商；最少 2 年，约 $82.70/年 | 搁置，移交上线 effort |
| 8 | 真实主机验证 | 待账号与默认域名可用后执行 §7；结果另落 `docs/spec/deploy-verification.md` | 搁置，移交上线 effort |

**一句话**：用 `oribos.ai` 作为 provisional canonical，先在全球区 EdgeOne Pages 上跑通静态站、301、headers、404 与预览 noindex；域名注册和实测通过之前，本基线保持 provisional，该工作已移交建站/上线 effort。

> 2026-10-21 owner 决议：本票按 deferred 关闭；provisional 基线保留为规格约束，域名注册、云账号开通、DNS/TLS 与真实主机实测由建站/上线 effort 承接。

---

## 1. 为什么是全球优先

### 1.1 备案资格结论

`.ai` 与 `.dev` **都不在工信部批复的顶级域名单里**（2026-10-21 核对 MIIT 列表，精确匹配均不存在）。这意味着：

- `oribos.ai` 与 `oribos.dev` **都无法完成 ICP 备案**，不是等待周期问题，是资格问题。
- 腾讯云大陆节点、大陆加速区、以及任何要求备案的大陆托管形态，对这两个域名都不可用。
- 「先用境外域名上线，以后再备案」不成立；换域名是唯一的大陆路径。

### 1.2 为什么接受全球优先

- 语言策略已定 **English-only**（「语言与国际化策略」），首发没有中文内容与大陆运营目标。
- 旧站从未真正上线（`oribos.dev` / `docs.oribos.dev` / `www.oribos.dev` 均 NXDOMAIN），没有线上流量、排名或外链可丢。
- 所有已关闭的 IA / SEO / docs 决策都以单站、单 canonical 为前提；为了大陆访问换域名会推翻这些规格，收益与成本不匹配。
- 大陆访问留作上线后的独立 effort；若出现持续需求，再评估 ICP 可备案域名与双域策略。

**明确不做**：不为大陆访问做腾讯云大陆节点、不做 CDN 大陆加速、不申请 ICP、不建 `oribos.cn` 镜像。

---

## 2. 域名

### 2.1 当前状态

| 域名 | 状态（2026-10-21） | 结论 |
|---|---|---|
| `oribos.ai` | `whois.nic.ai` 返回 `Domain not found`；未注册 | **provisional canonical** |
| `oribos.dev` | RDAP 无记录；三个主机 NXDOMAIN | 历史候选，不作为 canonical |
| `oribos.com` | 已注册（2016-01-13，NameBright 停放） | 不采用；如需收购另议 |
| `oribos.cn` | `whois` 无匹配记录，可注册 | 仅在大陆优先路线下考虑；与 English-only 冲突 |

### 2.2 注册约束

- `.ai` 最少 **2 年**起注与续费；Porkbun 当前标价约 **$82.70/年**，首次约 **$165**，续费同价（价格会变，注册时以注册商页面为准）。
- `.ai` 不在 HSTS preload 名单；HTTPS 由站点自己强制，不能依赖 TLD。
- 注册商建议：Porkbun / Namecheap 等明确支持 `.ai` 的注册商。Cloudflare Registrar 对 `.ai` 的支持未确认，不作为默认选项。
- 开启自动续费与 WHOIS 隐私（若注册商提供）；域名所有权与 DNS 管理权归 owner。

### 2.3 `SITE_ORIGIN` 占位

在域名锁定前，所有规格与配置使用 **`SITE_ORIGIN`** 表示站点源，provisional 值为 `https://oribos.ai`：

- 构建期单一配置项已由「技术栈与仓库形态」定为 `src/lib/site.ts`（读 `astro.config.mjs` 的 `site`，允许 `SITE_ORIGIN` 环境变量覆盖）；内容、组件、sitemap、`llms.txt`、manifest、canonical、OG、JSON-LD 全部从它派生。
- 正文与 frontmatter **不得硬编码域名**；`docs/spec/docs-ia.md`、`docs/spec/fact-baseline.md` 已按此约定改写。
- `<apex>` 指 `SITE_ORIGIN` 的 host；provisional 即 `oribos.ai`。
- 域名最终变更时，只改 `SITE_ORIGIN` 与 DNS，不逐页改文案；research 文档中的 `oribos.dev` 是历史快照，不回写。

### 2.4 注册前的验证域名

域名未注册不阻塞托管能力验证：

- EdgeOne Pages 项目创建后会得到平台分配的默认部署域名（deployment domain，具体后缀以控制台为准），可在它上面先跑 §7 的重定向 / headers / 404 / MIME 矩阵。
- 默认域名只用于验证，**不写 canonical、不进 sitemap、不对外发布**；staging 必须带 noindex。
- 自定义域绑定与 TLS 在域名注册、DNS 可用后再做。

---

## 3. 托管形态

### 3.1 选型

**暂定：腾讯云 EdgeOne Pages（EdgeOne Makers），Global AZ excluding Chinese mainland，免费版。**

选择理由：

- 静态站 + Git 构建 + 自定义域 + 301/headers/404 的能力齐备，免费版对本站规模足够。
- 全球区（排除大陆）不要求 ICP，符合 §1 的上线形态。
- 与 owner 的腾讯云目标一致；不引入新的云厂商。

**明确不选**：

| 选项 | 不选理由 |
|---|---|
| EdgeOne CDN + COS 静态网站 | 两个产品拼装；重定向/日志能力更强但本票不需要；配置面与运维成本更高 |
| Cloudflare Pages | 技术上更适合预览 noindex，但 owner 2026-10-02 已裁决本期不用 Cloudflare；本票不推翻 |
| Vercel | Hobby 禁商用，Pro $20/月；无大陆故事；对本静态站不划算 |

### 3.2 能力基线（EdgeOne Pages）

以下为 2026-10-21 官方文档口径，**开通后必须按 §7 在真实主机复验**：

| 能力 | 口径 | 对本站的影响 |
|---|---|---|
| 自定义域 / TLS | 支持 apex 与子域；免费证书一键签发、自动续期；可强制 HTTPS + HSTS | 满足；apex 需 DNS 商支持 CNAME flattening |
| 重定向 | `edgeone.json` 最多 **100 条**；301/302；exact / `:param` / `*`；**不支持 regex**；`middleware.js` 可绕开条数上限 | 本票规则数 < 20，够用；未来 SEO 页扩张需监控 |
| 自定义 headers | 最多 **30 条**，可设任意响应头（含 `X-Robots-Tag`） | 满足 noindex、缓存、安全头 |
| 404 | `404.html` 返回真实 404 | 满足 |
| URL 形态 | 文件式托管；Astro `build.format: 'directory'` 输出 `/path/`；无文档化的尾斜杠/`.html` 归一 | 用 Astro `trailingSlash: 'always'` 固化，实测 `/docs` → `/docs/` |
| 预览 | Production + Preview 环境；PR 预览；**无内置 noindex / 访问控制** | 用独立 staging 项目 + header 解决 |
| 构建 | 支持 Astro；Node 22.21 / 24.18；`.nvmrc`；monorepo 可设根目录 | 满足；Node 版本在项目里钉死 |
| 产物 | 不可变部署；生产指向最新；**只保留 3 个产物**，更早的返回 401；回滚 = 重部署旧构建 | 可接受；发布节奏别太密 |
| 缓存 | 每次部署自动失效；**无文档化的手动 purge** | 可接受；需要即时清缓存时用重新部署 |
| 日志 / 分析 | 流量与请求指标；函数日志 24h；**不导出 access log** | 3.D 首发不做分析，不构成阻塞 |
| 价格 | 免费版：流量/请求不限、500 builds/月、20k 文件、5GB、40 项目、200 域；官方标注为**限时免费阶段**，配额高于计划商业价值；商业版价格 TBD | 首发免费；限时免费与商业计价都是风险 |

### 3.3 已知限制与触发条件

- **100 条重定向**：当前规则数远低于上限；若「关键词页与 SEO 落地页集」带来大批旧 URL，超过 100 时改用 `middleware.js` 返回 301，或提前评估 Cloudflare。
- **无内置预览 noindex**：必须用独立 staging 项目；生产项目不得直接暴露预览分支。
- **无原始日志**：若未来需要安全审计/排障日志，升级到 EdgeOne CDN 或换托管，不在首发范围。
- **3 个产物保留**：回滚窗口有限；发布流程要保留可重建的 commit。
- **无手动 purge**：依赖部署失效；静态资源用内容哈希，HTML 短缓存。
- **商业计价 TBD**：免费版条款可能调整；上线前复核。

---

## 4. URL 与重定向契约

### 4.1 主机级

| 规则 | 动作 | 位置 |
|---|---|---|
| `https://www.<apex>/**` → `https://<apex>/**` | 301 | 托管配置 |
| `https://docs.<apex>/**` → `https://<apex>/**` | 301（路径原样保留） | 托管配置 |
| `http://<apex>/**` → `https://<apex>/**` | 301 | 托管配置 |
| `http://www.<apex>/**` / `http://docs.<apex>/**` | 301 到对应 HTTPS，再按上两行归一 | 托管配置 |

- 主机级规则不进 `redirects.json`；台账只记人改的路径。
- `docs.<apex>` 是旧 docs 主机的别名，不是 canonical；`/docs/**` 的 canonical 始终在 apex。
- 单跳：不允许 `http → https → www → apex` 的多跳链；每条请求最多一次 301。

### 4.2 路径级

- `/` 是营销首页，**不再** 301 到 `/docs/`。
- 保留全部 268 条 `/docs/**` 路径（19 手写 + 249 生成）；docs 迁移不产生重定向。
- 尾斜杠 canonical：`/docs/concepts/agents/`；`/docs` 也保留尾斜杠。
- `.md` twin：`<route>.md`，无尾斜杠；`Content-Type: text/markdown; charset=utf-8`。
- 站根：`/llms.txt`、`/llms-manifest.json`、`/robots.txt`、`/sitemap-index.xml`。
- 现有营销 11 页路径保留；Solutions 的 `/in-product-agents/` → `/customer-facing-agents/` 等改名按「关键词页与 SEO 落地页集」的台账执行。

### 4.3 重定向预算

| 类别 | 预计条数 | 说明 |
|---|---:|---|
| 主机级（www / docs / http） | 3–5 | 不含路径级 |
| 营销页改名 / 退役 | < 15 | 11 页 + Solutions 改名 + 少量别名 |
| docs | 0 | 268 条路径全部保留 |
| **合计** | **< 20** | 远低于 EdgeOne Pages 的 100 条上限 |

若后续关键词页或历史 URL 台账使总数接近 100，先把规则分级（host-level 优先、path-level 合并），再评估 `middleware.js`。

### 4.4 404 与尾斜杠

- `404.html` 必须是真实 404 状态，不是 200 软 404，也不是 302 到首页。
- Astro 侧固定 `trailingSlash: 'always'`、`build.format: 'directory'`；EdgeOne 侧实测：
  - `/docs` → `/docs/` 是 301/308 还是 200；
  - `/docs/` 是否稳定 200；
  - `.html` 结尾是否被剥离；
  - 大小写是否敏感。
- 若 EdgeOne 不做尾斜杠归一，在 `edgeone.json` 加规则或接受 Astro 生成的双路径；验收以 canonical 唯一为准。

---

## 5. Headers 与预览 noindex

### 5.1 生产 headers（最小集）

| Header | 值 | 范围 |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | apex + www + docs；**先不加 `preload`** |
| `X-Content-Type-Options` | `nosniff` | 全站 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 全站 |
| `Content-Type` | `text/markdown; charset=utf-8` | `/*.md` |
| `Cache-Control` | `public, max-age=31536000, immutable` | 带哈希的静态资源 |
| `Cache-Control` | `public, max-age=0, must-revalidate` | HTML |

CSP 归「设计系统与组件规格（B · 仪器）」与建站实施，不在本票展开；header 条数上限 30，当前预算充足。

### 5.2 预览策略

- **生产项目**：只跟 `main`；绑定 `oribos.ai` / `www` / `docs`；不直接暴露 PR 分支。
- **staging 项目**：独立 EdgeOne Pages 项目，跟 PR / 预览分支；只使用平台分配的默认部署域名；`edgeone.json` 对 `/*` 加 `X-Robots-Tag: noindex, nofollow`。
- staging 同时放 `robots.txt` 的 `Disallow: /`，作为 header 之外的第二道保险。
- staging 不写 canonical 到 apex，不提交 sitemap；页面 canonical 指向自身或省略。
- 预览 URL 不进入生产导航、sitemap、`llms.txt`、README 的公开链接。
- 验收：`curl -sSI <staging-url>` 必须看到 `X-Robots-Tag`；生产 URL 必须看不到。

---

## 6. 分析、日志与 consent

- **首发不做分析**（3.D）：不装 GA / Plausible / Umami / 腾讯云分析，不设 cookie，不弹 consent。
- 不要求原始 access log；EdgeOne Pages 不导出日志，正好匹配。
- 运行指标只看 EdgeOne 控制台的流量/请求/构建状态，用于运维，不作为产品分析。
- 上线后若要加分析：优先 cookieless（Plausible / Umami），先评估 consent 与隐私政策，再改本基线。
- 错误监控不在首发范围；构建失败由 CI / EdgeOne 控制台暴露。

---

## 7. 真实主机验证矩阵

**前提**：EdgeOne Pages 项目已创建，平台分配的默认部署域名可用；自定义域在 DNS 就绪后追加。所有检查必须在真实主机跑，不能只看 `dist/`。

| # | 检查 | 期望 | 记录 |
|---:|---|---|---|
| 1 | 默认域名 `/` | 200；HTML | `curl -sSI` |
| 2 | 自定义 apex `/` | 200；证书有效 | `curl -sSI` + `openssl` |
| 3 | `www` → apex | 单跳 301；路径保留 | `curl -sSI` |
| 4 | `docs` → apex | 单跳 301；`/docs/**` 路径保留 | `curl -sSI` |
| 5 | `http://` → `https://` | 单跳 301 | `curl -sSI` |
| 6 | `/` 不跳 `/docs/` | 200；无 Location | `curl -sSI` |
| 7 | 抽样 docs URL | 200；canonical 指向 apex | `curl -sS` + grep |
| 8 | `/docs` vs `/docs/` | 归一行为明确；canonical 唯一 | `curl -sSI` |
| 9 | `.md` twin | 200；`text/markdown; charset=utf-8` | `curl -sSI` |
| 10 | 不存在路径 | 404；自定义 404 页；非 200/302 | `curl -sSI` |
| 11 | 生产 headers | HSTS + nosniff + referrer；无 `X-Robots-Tag: noindex` | `curl -sSI` |
| 12 | staging headers | `X-Robots-Tag: noindex, nofollow`；`robots.txt` Disallow | `curl -sSI` |
| 13 | 缓存 | 哈希资源 immutable；HTML 可重验证 | `curl -sSI` |
| 14 | 重定向条数 | < 100；无 regex 需求 | 配置导出 |
| 15 | 构建 | Node 版本符合；Astro 构建成功；产物 < 20k 文件 | 构建日志 |
| 16 | 回滚 | 上一构建可重新部署 | 控制台 |
| 17 | 预览 | 预览 URL 可访问且 noindex；生产不含预览链接 | `curl` + grep |

**产出**：`docs/spec/deploy-verification.md`，逐项记录命令、实际状态码、header、时间与结论。未跑完之前，本基线保持 provisional。

---

## 8. 只有 owner 能执行的开通清单

按顺序执行；每步完成后把结果回填到建站/上线 effort 的 tracker。

1. **注册 `oribos.ai`**
   - 注册商：Porkbun / Namecheap 等支持 `.ai` 的注册商。
   - 2 年起注；预算约 $165；开启自动续费；开启 WHOIS 隐私（若可用）。
   - 拿到 DNS 管理权；不要在这一步配置任何 A/CNAME。
2. **开通腾讯云账号 / EdgeOne Pages**
   - 创建或确认腾讯云账号；完成实名认证；确认 EdgeOne Pages 的入口与计费归属。
   - 确认所选区域为 **Global（excluding Chinese mainland）**。
3. **建生产项目**
   - 连接 `0xnicholas/oribos-www`；构建命令与输出目录已由「技术栈与仓库形态」定：`pnpm build` / `dist`（Node 22.21、pnpm 10.33）。
   - 钉死 Node 版本；生产分支只设 `main`。
   - 先不绑自定义域。
4. **建 staging 项目**
   - 独立项目；跟预览分支；只使用平台分配的默认部署域名。
   - 加 `X-Robots-Tag: noindex, nofollow` 与 `robots.txt` Disallow。
5. **DNS**
   - 选支持 **apex CNAME flattening** 的 DNS 商（Cloudflare DNS 可用；DNSPod 需实测）。
   - `@` → Pages 目标（flatten）；`www`、`docs` → Pages 目标 CNAME。
   - 等 TLS 证书签发；强制 HTTPS + HSTS（先不加 preload）。
6. **跑验证**
   - 把默认域名、staging 域名、DNS 记录发给 agent；按 §7 跑矩阵，落 `deploy-verification.md`。
7. **锁定域名**
   - 注册与实测通过后，把 `SITE_ORIGIN` 从 provisional 改为正式值；更新 `docs/spec/docs-ia.md` 与 `docs/spec/fact-baseline.md` 的占位说明；提交 sitemap。
8. **可选**
   - 防御性注册 `oribos.dev`（非必需；旧站从未上线，无 301 债）。若注册，只做 301 到 apex，不建内容。

---

## 9. 未决项

| 项 | 影响 | 归属 |
|---|---|---|
| `oribos.ai` 未注册，域名仍是 provisional | canonical 不能最终锁定；不能提交 sitemap | owner；建站/上线 effort |
| 腾讯云账号 / 实名状态未知 | 项目无法创建；默认域名与实测无法开始 | owner；建站/上线 effort |
| EdgeOne Pages 商业计价与免费版条款可能变化 | 成本与配额风险 | 上线前复核 |
| 100 条重定向上限 | 未来 SEO 页扩张可能触顶 | 「关键词页与 SEO 落地页集」/ 建站 |
| 预览 noindex 依赖独立 staging 项目 | 配置遗漏会把预览暴露给搜索 | 建站实施；上线 effort 验收 |
| 无原始 access log | 安全审计/排障能力弱 | 若成为硬需求，另立 effort |
| 3 个产物保留 / 无手动 purge | 回滚窗口与缓存控制有限 | 建站实施 |
| 分析延后 | 首发无 PV/来源数据 | 上线后另议 |
| 大陆访问不优化 | 大陆用户体验无保证 | 上线后独立 effort |
| `docs.<apex>` 与 apex 的 TLS 证书覆盖 | 证书按 host 签发；需逐个子域验证 | 本文 §7 |
| FDE/Support 邮箱与团队署名 | 与域名邮箱相关，但不在本文 | 地图 fog |

---

## 10. 来源

- EdgeOne Pages 文档：<https://pages.edgeone.ai/document/faqs>、<https://pages.edgeone.ai/document/edgeone-json>、<https://pages.edgeone.ai/document/custom-domain>、<https://pages.edgeone.ai/document/configuring-an-https-certificate>、<https://pages.edgeone.ai/document/limits-and-quotas>、<https://pages.edgeone.ai/document/deployment-overview>、<https://pages.edgeone.ai/document/middleware>、<https://pages.edgeone.ai/document/domain-overview>、<https://pages.edgeone.ai/document/custom-404-page>、<https://pages.edgeone.ai/document/build-guide>、<https://pages.edgeone.ai/document/log-analysis>、<https://pages.edgeone.ai/document/configuring-cache>、<https://pages.edgeone.ai/document/how-to-configure-a-dns-cname-record>
- EdgeOne CDN（备选）：<https://edgeone.ai/document/46166>、<https://edgeone.ai/document/46185>、<https://edgeone.ai/document/54201>、<https://edgeone.ai/document/55650>
- ICP / 域名资格：<https://cloud.tencent.com/document/product/243/18905>、<https://domain.miit.gov.cn/>、<https://cloud.tencent.com/document/product/243/18909>
- `.ai` 注册：<https://porkbun.com/tld/ai>、`whois.nic.ai`（2026-10-21 查询）
- 本仓研究：`docs/research/stack-options.md`、`docs/research/seo-agent-surface-audit.md`、`docs/spec/docs-ia.md`

---

_本文只裁决域名、托管、备案、DNS/TLS、重定向/headers 能力、预览与观测；建站实施、内容写作与上线切流不在本文。_
