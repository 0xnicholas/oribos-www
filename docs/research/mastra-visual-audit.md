# Mastra 视觉与交互审计（票 #6 · `mastra-visual-audit`）

> 研究日期：2026-10-20
> 范围：`mastra.ai` 的营销面（首页、Framework 产品页、Solutions 页、Pricing、Blog 索引/文章、Docs）+ Oribos 本地三仓库（`oribos-website`、`oribos-docs`、`oribos-framework`）。
> 方法：抓取页面 HTML 与其引用的 CSS chunk，按选择器读取真实 token/规则；用 1440×900 桌面与 393×852 移动视口截图互证；本地只读源文件与规范。所有对比度按 WCAG 2.1 相对亮度公式从 CSS 声明值计算。
> 口径：Mastra 是持续改版的站点，本报告是 **2026-10-20 的快照**；页面类名与 CSS chunk 哈希会随构建变化，结论以选择器和 token 名为锚，不以文件哈希为长期契约。

---

## TL;DR

1. **Mastra 的营销面是“强制暗色 + 软机器”系统，不是瑞士盒式**：`#080808` 页面底、`#0f0f0f` 面板、2px 边框、30/40px 圆角、180px 区距、Greed 可变字体 + Commit Mono。它用“大圆角厚边框 + 低对比灰 + 橙色公告 + 绿色交互 + 噪点/渐变”建立识别度。
2. **Token 不能直接移植**：Mastra 有 20+ 颜色槽、fluid `clamp()` 标题、423/450/470/520 等可变字重、`font-stretch:108%`、20–40px 圆角、多层阴影和 0.7s 入场动画；Oribos 是 13 个颜色槽、8 档固定字阶、仅 400/600、零圆角、1px hairline、零阴影。两套 token 的语义和约束不同，照抄任一项都会破坏 Oribos 的 CI 门。
3. **真正值得借的是“结构语法”**：section label tab（标签嵌在面板上沿）、active tab 与面板合并、卡片跨列网格、三栏 docs、博客正文 + 右侧 TOC、比较矩阵、原生 `<details>` FAQ、代码文件名 + copy。
4. **最值得警惕的是“证明方式”**：Mastra 用 12 个客户 logo、灰度人物故事卡、客户案例页撑可信度；Oribos 没有客户案例，必须用架构事实带、场景卡、host-interface mock 替代。照搬 logo 墙/人物卡会直接制造虚假 social proof。
5. **动效纪律正面冲突**：Mastra 用 0.7s 入场、0.48s mega menu 高度动画、24px 位移、`scale(.98)` 按压、60s logo 跑马灯、canvas 着色层；Oribos SPEC 只允许颜色/透明度过渡（无位移、无缩放）。借结构，不借运动。
6. **可访问性有强项也有硬伤**：Mastra 的语义结构、roving tabindex、箭头/Home/End、焦点环、逐组件 reduced-motion 做得扎实；但营销页没有 skip link，logo 墙 “Read →” 文字用 `#424242` 对 `#080808` 仅 **1.99:1**，且营销站强制暗色、不给用户主题选择。Oribos 不应复制这三项。
7. **Docs 是另一套系统**：Mastra docs 是 Docusaurus，280px 侧栏 + 48rem 正文 + 右侧 TOC、亮暗可切换、绿色主交互；Oribos docs 是 Starlight + 琥珀 + 覆盖数 0。借三栏比例与内容块，不借 DOM/CSS/组件。
8. **落地结论**：**10 项可直接借（结构/行为）**、**9 项需品牌化改写**、**13 项不建议借**。下游应按 Oribos token 重画，不接受任何 Mastra 色值、字号、圆角、阴影、动画曲线作为“默认值”。

---

## 详细发现

### 0. 证据表与阅读约定

正文用 `[M#]` 指 Mastra 页面、`[C#]` 指 CSS chunk、`[L#]` 指本地文件；完整 URL/路径见文末「来源清单」。每个关键结论至少挂一个证据 ID。

| ID | 证据 | 本报告用它证明 |
| --- | --- | --- |
| M1 | `https://mastra.ai/` | 首页 9 区、hero、feature/observability tabs、logo 墙、case cards、resources、FAQ、final CTA、footer、移动菜单 |
| M2 | `https://mastra.ai/ai-agent-framework` | Framework 产品页骨架、68px 产品 H1、card-grid 布局 1/2/3、product hero |
| M3 | `https://mastra.ai/developer-infrastructure` | Solutions 页骨架：浮动标签图 + 54px H1 + 3 张客户故事卡 + FAQ + CTA |
| M4 | `https://mastra.ai/pricing` | 三档定价、分段切换、200px 标签列 + 3 列比较矩阵 |
| M5 | `https://mastra.ai/blog` | 博客索引：54px H1、筛选 pill、2 列大圆角卡片、作者/日期/分类 |
| M6 | `https://mastra.ai/blog/agent-memory-guide` | 博客文章：676px 正文 + 右侧 TOC、代码块 copy、绿色链接、作者行 |
| M7 | `https://mastra.ai/docs/agents/overview` | Docs 三栏 shell、Copy page、右侧 TOC、表格、callout、主题切换 |
| M8 | `https://mastra.ai/customers` | 客户故事是筛选列表，不是 testimonial 引用卡 |
| C1 | `https://mastra.ai/_next/static/immutable/chunks/1as2jdn401-n2.css` | `:root` 颜色/字体/字号/布局变量、`@theme`、prose/table、docs 之外的全局 token |
| C2 | `https://mastra.ai/_next/static/immutable/chunks/2a1kg4-oqt4cr.css` | `.ds-section`、`.ds-section--header`、`.ds-product-hero` |
| C3 | `https://mastra.ai/_next/static/immutable/chunks/1_--kn-lmf7z7.css` | `.header`、`.announcement-lip`、`.nav-dropdown-*`、`.nav-list-link` |
| C4 | `https://mastra.ai/_next/static/immutable/chunks/164goi-shwi7k.css` | `.ds-faq*` 的 details/height 动画 |
| C5 | `https://mastra.ai/_next/static/immutable/chunks/20jnp59j0wiah.css` | `.ds-card-grid*` 布局与卡片 |
| C6 | `https://mastra.ai/_next/static/immutable/chunks/0nb2aci6nyrsy.css` | `.shiki-figure`、`.shiki-copy`、`.blog-pre`、`.prose` |
| C7 | `https://mastra.ai/_next/static/immutable/chunks/30agtboqrg1qd.css` | 定价卡片（pricing card）相关规则 |
| C8 | `https://mastra.ai/_next/static/immutable/chunks/3gb0tb3v514tx.css` | `@font-face`：Greed / Commit Mono / Orbitron |
| C9 | `https://mastra.ai/assets/css/styles.d5e328f2.css` | Docs 的 `--mastra-*`、`--ifm-*`、280px sidebar、48rem content、表格/主题 |
| L1 | `../oribos-website/src/styles/global.css` | Oribos 营销站 13 色槽、8 档字阶、1200 容器、12 栏、0 圆角、1px 盒、按钮、代码块 |
| L2 | `../oribos-website/docs/SPEC-revamp.md` | 视觉/交互纪律：§2.1–§2.10、§3.1–§3.8、§4.3 |
| L3 | `../oribos-website/src/components/Header.astro` | 现有 header：Use cases 下拉、Docs/GitHub/version pill、移动菜单、焦点管理 |
| L4 | `../oribos-website/src/components/FeatureTabs.astro` | 现有 feature tabs：方形 tab、5 panel、键盘方向键 |
| L5 | `../oribos-website/src/components/CodeTabs.astro` | 现有代码卡：文件名 tab、copy、行高亮 |
| L6 | `../oribos-website/src/components/FaqList.astro` | 现有 FAQ：`<details>`、无 JS |
| L7 | `../oribos-website/src/components/UseCaseCards.astro` | 现有 use-case 卡：mock + 文案 |
| L8 | `../oribos-website/src/components/Footer.astro` | 现有 footer：4 栏 + 法务行 |
| L9 | `../oribos-website/src/components/Hero.astro` | 现有 hero：6/6 两栏 + 代码/trace 窗 |
| L10 | `../oribos-website/src/lib/brand-tokens.ts` | 13 色槽/8 档字阶/26 项 AA/主题切换的代码级契约 |
| L11 | `../oribos-docs/src/styles/global.css` | Docs 的 Starlight token（暗/亮 HSL） |
| L12 | `../oribos-docs/docs/spec/brand-visual.md` | Docs 品牌口径：琥珀、系统字体、覆盖数 0、ThemeSelect auto |
| L13 | `../oribos-docs/docs/spec/ia.md` | Docs 单车道、五族侧栏、URL 形态与 Reference 升格判据 |
| L14 | `../oribos-website/CONTEXT.md` | 用例页/场景卡/事实带/agent prompt CTA 的术语与职责 |
| L15 | `../oribos-website/src/components/AgentPromptCta.astro` | 现有 chip CTA：可见四面 + 隐藏 payload |

---

### 1. 设计 token

#### 1.1 颜色：近黑单色 + 橙色品牌 + 绿色交互 + 五色数据

**营销站**（`[C1]` 的 `:root`/`@theme`）：

| 角色 | Token | 值 | 主要用途 | 对 `#080808` 的对比度 |
| --- | --- | --- | --- | ---: |
| 页面底 | `--color-ds-surface-bg` | `#080808` | body / section 底 | — |
| 面板底 | `--color-ds-surface-antigrid` | `#0f0f0f` | section 内衬、卡片、nav hover | — |
| 抬升面 | `--color-ds-surface-elevation-sm` | `#171717` | 卡片 hover、FAQ hover、代码窗 | — |
| 最深面 | `--color-ds-surface-elevation-lg` | `#020202` | stage / footer 外层 | — |
| hover 面 | `--color-ds-surface-hover` | `#262626` | 按钮/行 hover | — |
| 边框/唇线 | `--color-ds-surface-hover-lip` | `#2b2b2b` | 代码块边框、hover 边 | — |
| 卡边框 | `--color-ds-border-antigrid` | `#1c1c1c` | 2px 卡片/面板边 | — |
| 表格表头 | `--color-ds-border-elevation` | `#1a1a1a` | docs/prose 表头 | — |
| overlay 边 | `--color-ds-border-overlay` | `#242424` | 弹层边 | — |
| focus 边 | `--color-ds-border-focus` | `#333` | 少数 focus 边框 | — |
| 主文字 | `--color-ds-main-white` | `#f0f0f0` | 标题/正文 | **17.57:1** |
| 次文字 | `--color-ds-special-gray` | `#ccc` | 次级/说明 | **12.47:1** |
| 三级文字 | `--color-ds-main-gray` | `#939393` | 正文辅助、nav 默认 | **6.52:1** |
| 弱化文字 | `--color-ds-dark-gray` | `#424242` | logo 下 “Read →”、装饰标签 | **1.99:1** |
| 橙色 | `--color-ds-orange` | `#fdac53` | 公告 lip、newsletter 标签、强调 | 10.23:1（对 `#0f0f0f`） |
| 橙色 hover | `--color-ds-orange-hover` | `#e0993f` | 橙色 hover | — |
| 绿色 | `--color-ds-green` | `#7aff78` | 焦点环、链接、成功、active 边 | **15.64:1** |
| 数据粉 | `--color-ds-pink` | `#ff69cc` | trace bar / 图表 | — |
| 数据紫 | `--color-ds-purple` | `#b588fe` | trace bar / 图表 | — |
| 数据蓝 | `--color-ds-blue` | `#6ccdfb` | trace bar / 图表 | — |
| 数据黄 | `--color-ds-yellow` | `#e7e67b` | 图表 | — |
| 数据红 | `--color-ds-red` | `#ff4758` | 失败行、错误 | — |

关键事实：

- **橙色不是主 CTA**。首页主 CTA “Get a demo” 是深色渐变描边 pill（`#1c1c1c` 填充、`#383838→transparent` 边、`#ccc` 字），橙色只用于顶部公告、newsletter 标签和少量强调（`[M1]` 的 `Get a demo` class、`[C3]` 的 `.announcement-lip--fill`）。这与 Oribos “主按钮 = 琥珀实底”相反（`[L1]` `.btn-primary`）。
- **绿色承担交互/焦点/成功**：导航 active 边、focus ring、active 按压边、blog 链接、成功状态都用 `#7aff78`（`[M1]`/`[M6]`）。橙色负责“品牌/公告”，绿色负责“可操作/通过”。这是一套**双强调色分工**。
- **五色数据只出现在产品 mock/图表**：粉、紫、蓝、黄、红用于 trace bar、eval 表格、token 柱状图；不是品牌色。`[M1]` 的 trace 面板与 `[M2]` 的卡片图都可见。
- **弱化文字越过 AA 线**：`#424242` 对 `#080808` 只有 1.99:1，却被用在 logo 墙每张卡下方的 “Read →” 文字（`[M1]` 截图与 class `text-ds-dark-gray`）。链接本身有 `aria-label`，但低视力用户看见的是低对比文字。这是**不应借用的具体项**。
- **`theme-color` 与页面底不一致**：首页 `<meta name="theme-color" content="#020202">`，而页面底是 `#080808`（`[M1]`/`[C1]`）。Oribos 的规则是 `theme-color = --bg`（`[L2]` §2.8），不能照抄这个不一致。

**Docs**（`[C9]`）是另一套：暗色 `surface-bg:#020202`、`antigrid:#0d0d0d`、`elevation-sm:#171717`、`elevation-lg:#141414`、`border-antigrid:#191919`；亮色 `surface-bg:#f8f8f8`、`antigrid:#f4f4f4`、`elevation-sm:#ebebeb`、`main-white:#0f0f0f`、`main-gray:#4b4b4b`、`orange:#9d5200`、`green:#028300`。Docs 还用 Docusaurus 的 `--ifm-color-primary`（暗 `#18fb6f`、亮 `#0d8020`）作为交互色，和 `--mastra-color-green`（暗 `#72ff70`、亮 `#028300`）并不完全同值——**Mastra 自己的营销/docs 也没有单一 token 真相源**。

#### 1.2 字体与字阶：Greed 可变字体 + fluid clamp

字体（`[C8]`、`[C1]`）：

| 角色 | 字体 | 文件/轴 | 用法 |
| --- | --- | --- | --- |
| 主 sans / display | **Greed** | `GreedVF.woff2`，`font-weight:100 900`；`--greed` | 全站标题、正文、导航、按钮；`ss01/ss02/ss06` 特性 |
| Mono | **Commit Mono** | 4 个静态文件：500/550 × regular/italic；`--commit-mono` | 代码、文件名、日期、meta、终端感标签 |
| 404 专用 | **Orbitron** | `Orbitron.woff2`，400–900 | 仅 404 模板；`[C8]` + `[M1]` 的 404 RSC |

字号/字重（`[C1]`）：

| 角色 | 值 | 备注 |
| --- | --- | --- |
| 基础正文 | `17px / 1.5` | `--text-base:17px`；不是 16px |
| 小正文 | `14.5px / 1.36` | `--text-body-sm`，nav 描述、卡片 meta |
| 大正文 | `22px / 1.36` | `--text-body-lg`，hero 副文、section 副文 |
| H1 首页 | `clamp(30px, 30px + 24*(100vw-390px)/890, 54px) / 110%` | `text-headline-2xl` |
| H1 产品页 | `clamp(36px, 36px + 32*(100vw-390px)/890, 68px) / 110%` | `.ds-product-hero--title` |
| 博客 H1 | `32px → 48px`，`1.1`，`-0.022em` | 桌面 `md:text-5xl`，600 |
| Docs H1 | `40px / 110%`，`0.015em`，520 | `--mastra-text-h1` |
| 标题字重 | **520** | 标题统一 520，`font-stretch:108%` |
| 正文/标签字重 | 400 / 423 / 450 / 470 | 大量中间字重，依赖 Greed 可变轴 |
| 导航 | 15px / 500 | `text-[15px] font-medium` |
| 页脚链接 | 17px / 450 / 1.4 | footer 行 |
| 代码（hero） | 15.2px / 24.6px / 0.05px | 代码窗；blog 代码更小 |
| FAQ 问题 | 22px / 1.36 / 0.33px | 400 |
| FAQ 答案 | 17px / 1.36 / 0.255px | 400 |

关键事实：

- **字宽是品牌的一部分**：标题 `font-stretch:108%`，正文 `100%`；Greed 的宽度轴让标题更“宽、稳、像机械面板”。Oribos 的 Inter 没有宽度轴，使用 `font-stretch` 只会得到合成/无效效果，**不能假装复刻**。
- **字重不是 400/600 两档**：Mastra 大量使用 423、450、470、520；Oribos 的 §2.3 锁定 400/600（`[L2]`）。把 520 标题搬进 Oribos 会破坏字重纪律，而不是“更精致”。
- **fluid clamp 是响应式策略**：从 390px 到 1280px 线性插值；Oribos 是固定八档 + 断点，不允许任意字号（`[L10]` 的 type scale 门）。两种策略不能混用。
- **Blog 与产品页的 H1 不同档**：首页 54、产品 68、博客 48、docs 40；Oribos 首页/关键词页 H1 67、产品页也可 67、博客可用 50/38；应回到 Oribos 八档，而不是复制 Mastra 的 54/68/48。

#### 1.3 间距、栅格、容器

| 维度 | Mastra | 证据 | Oribos | 证据 |
| --- | --- | --- | --- | --- |
| 基础单位 | 4px | `--spacing:.25rem` | 4px | `--spacing:0.25rem`；行高 4px 倍数 |
| 容器 | `--ds-layout-content-v1:1120px`；`--ds-layout-content-v2:1328px` | `[C1]` | **1200px** | `[L1]` `.wrap` |
| 组件内边距（header/card） | 28px（<640）/ 38px（≥640） | `--ds-antigrid-padding` | 16px（<768）/ 32px（≥768） | `[L1]` `.wrap` |
| 栅格间距 | 18px（<640）/ 24px（≥640） | `--ds-antigrid-gap` | 16px（<768）/ 32px（≥768） | `[L1]` `.cols` |
| 栅格 | 卡片用 2/3 列 + 跨列；不是 12 栏 | `[C5]` | 4 栏（移动）/ 12 栏（≥768） | `[L1]` `.cols` |
| 区头上下留白 | **180px**（`padding-block:45*4px`） | `[C2]` `.ds-section--header` | 96px（`py-24`）或 144px 组合 | `[L2]` §2.2；`[L1]` |
| 区尾留白 | **180px**（除非 inverse） | `[C2]` `.ds-section` | 96px 为主 | `[L1]` 各 section |
| 卡片最小高 | 576px（hero card）/ 540px（pricing card） | `[C5]`/`[C7]` | 内容决定，无固定最小高 | `[L7]` |
| Header 高度 | 60px | `--ds-nav-height` | 60px（`py-4` + `text-lg` 的 28px 行高） | `[L3]` |
| Docs 侧栏 | 280px | `[C9]` `--doc-sidebar-width` | Starlight 默认（约 300px） | `[L11]` |
| Docs 正文 | 48rem（768px） | `[C9]` `[class*=docItemContainer]` | Starlight 默认正文列 | `[L11]` |
| Docs TOC | 约 220px（1440 实测） | `[M7]` 截图 | Starlight 默认右栏 | `[L11]` |

关键事实：

- **Mastra 的“宽”来自 1328 容器 + 24px stage padding**：桌面 stage shell 约 1376px，1440 视口左右各约 32px；Oribos 1200 容器在 1440 下左右各 120px。Mastra 更像“贴在屏幕上的面板”，Oribos 更像“纸面上的盒子”。
- **180px 区头是 Mastra 的核心节奏**：每个 H2 区先来 180px 空，再放 54px 标题，再 180px 到卡片；首页因此很长、很“画廊”。Oribos 的 96/144 区距信息密度高得多，不能直接套。
- **Mastra 的栅格不是 12 栏**：卡片用 `grid-template-columns: repeat(3,1fr)` / `repeat(2,1fr)` 加跨列（`[C5]`）。Oribos 已有 12 栏，应该用 4/6/12 的 span 表达同样的节奏，而不是引入第二套栅格。

#### 1.4 圆角、边框、阴影

| 元素 | Mastra | 证据 | Oribos |
| --- | --- | --- | --- |
| 卡片 | 30px（<640）/ 40px（≥640） | `--ds-corner-grid:30/40`；`.ds-card-grid-card` | **0** |
| Section stage shell | 30px / 38px | `--ds-section-stage-shell-radius` | 0 |
| 抬升面 | 16px / 20px | `--ds-radius-elevation` | 0 |
| Mega menu 行 | 20px | `.nav-list-link` | 0 |
| 图标 tile | 10px | `.nav-list-link--tile` | 无（无图标） |
| 代码块 | 8px | `.shiki-figure` / `.blog-pre` | 0 |
| 按钮 | 9999px（full pill） | `[M1]` `rounded-full` | 0 |
| FAQ 行 | 20px | `.ds-faq--homepage .ds-faq__summary` | 0 |
| 边框 | 卡片/面板 2px；按钮/窗 1.5px；代码 1px | `[C3]`/`[C5]`/`[C6]` | **统一 1px** |
| 阴影 | header `0 4px 60px #000000bf`；mega menu `drop-shadow(0 4px 54px #000c)`；hero 窗 `10px 14px 40px rgba(8,8,8,.6)` | `[C3]`/`[M1]` | **无** |
| 渐变/噪点 | hero 窗 radial-gradient；卡片 shader；footer shader；FAQ 半透明 + backdrop blur | `[M1]`/`[C5]` | 无 |

关键事实：

- **2px 边框 + 30/40px 圆角 + 阴影**是 Mastra 的“软面板”语言；Oribos 的“盒式模块”是 1px + 0 圆角 + 0 阴影（`[L1]` `.box`、`[L2]` §2.2）。这不是“风格差异”，是**结构语言冲突**：把 Mastra 的卡片圆角改小仍会留下厚边框和阴影，必须整体重画。
- **Mastra 的圆角在 640px 处跳变**（30→40），不是 768；Oribos 的断点是 768（`[L1]`），不能照搬这个跳变点。

#### 1.5 暗色模式策略

| 面 | 策略 | 证据 |
| --- | --- | --- |
| Mastra 营销 | **强制暗色**：`<meta name="color-scheme" content="dark">`、`body class="dark"`、CSS `color-scheme:dark`；无切换按钮 | `[M1]` head/body；`[C1]` |
| Mastra Docs | **跟随系统 + 用户切换**：内联脚本读 `localStorage`，否则 `matchMedia('(prefers-color-scheme: dark)')`；`data-theme` 亮/暗 | `[M7]` 内联脚本；`[C9]` |
| Oribos 营销 | **只随 OS**：`:root` 亮色默认，`@media (prefers-color-scheme: dark)` 换值；无 `.dark` class、无切换、无持久化 | `[L1]`/`[L2]` §2.7 |
| Oribos Docs | **auto + 切换按钮**：Starlight `ThemeSelect` 默认 `auto`，亮暗均为验收面 | `[L12]` §3.3 |

关键事实：

- Mastra 营销的暗色不是“主题”，是**唯一形态**；Docs 则允许用户选亮色。两站并置时，同一个用户在 marketing 永远暗、进 docs 可能亮，这是**品牌体验断裂**。Oribos 单站化时应明确：营销 OS-only、docs auto+toggle 是否可接受；若不可接受，需要统一策略（见「对 Oribos 的启示」§7 未决项）。
- Oribos 的 26 项 AA 审计是**双主题**硬门（`[L10]`）；Mastra 营销的强制暗色让亮色对比度不可测，也没有亮色验收面。不要把“只做暗色”当成省事。

#### 1.6 Token 架构

- Mastra 营销：Tailwind v4 `@theme` 把 `--color-ds-*`、`--text-headline-*`、`--font-*`、`--radius-*` 暴露成 utility；布局常量放在 `:root` 的 `--ds-*`（`[C1]`）。颜色有语义别名 `--color-surface1..6`、`--color-border1/2`、`--color-card` 等，但底层仍是 `--color-ds-*`。
- Mastra Docs：Docusaurus 的 `--ifm-*` + 自有 `--mastra-*`，亮暗两套；与营销的 `--color-ds-*` 不是同一命名空间（`[C9]`）。
- Oribos 营销：`src/styles/global.css` 单一真相源，13 色槽 + 8 档字阶 + `@theme inline` 别名；`scripts/check-tokens.mjs` 逐项比对 SPEC（`[L1]`/`[L10]`）。
- Oribos Docs：`--sl-color-*` 暗 11 / 亮 12 槽，亮暗 HSL；`scripts/check-contrast.mjs` 16 对；覆盖数 0（`[L11]`/`[L12]`）。

**含义**：Mastra 的 token 是“多命名空间 + 多主题 + 多产品面”的堆叠，Oribos 是“单文件 + 单主题策略 + CI 锁定”的窄接口。新站若要单站承载 marketing/docs/blog，**不能把 Mastra 的 token 架构当模板**；应保留 Oribos 的单一真相源，再为 docs 定义显式的继承/别名关系。

---

### 2. 布局模式

#### 2.1 首页 9 区（`[M1]`）

| # | 区块 | 布局配方 | 关键视觉 | 对 Oribos 的判断 |
| --- | --- | --- | --- | --- |
| 1 | Hero | 左文右图，约 50/50；文本 H1 54、副文 22、CTA 50；右栏 3 个叠放产品窗 | 黑色底、白 54px H1、绿色词 “Build”、橙色公告、26px 圆角窗 + 阴影 | 结构已与 Oribos 6/6 hero 接近；只借比例，不借视觉 |
| 2 | Logo 墙 | 桌面 6 列 × 2 行；移动跑马灯；每卡 logo + “Read →” | 灰度客户 logo、`#424242` 低对比标签、60s marquee | **不借**：Oribos 无客户，用事实带替代 |
| 3 | Feature tabs ×6 | 80px 高 pill tab 行；active tab 与 panel 同底合并；panel 内左代码右产品窗 | 大圆角、2px 边、图标 + 大写标签、代码/聊天双窗 | 借“active tab 合并 panel”，改成方形 tab |
| 4 | Observability tabs ×5 | 同上，5 个 tab；panel 是产品表格截图 | 红/绿状态行、紫/绿 trace bar | 借“tabs + 产品窗”结构；颜色改 Oribos |
| 5 | Case studies | 3 张卡（单卡上限 426px）；灰度人物照 + logo + 标题 + Read story | 照片去饱和、hover 恢复彩色 500ms | **不借**：Oribos 无客户故事 |
| 6 | Solutions cards | 3 张等宽卡；每卡一个 mini mock | 工具列表/记忆表/审批对话 | 借“3 卡 + mini mock”，Oribos 已有 UseCaseCards |
| 7 | Resources | 2 个 tab（Agent Books / Latest Releases）；左大书卡 + 右 release 列表 | 228px 区头、tab 嵌在面板上沿、行 hover 箭头位移 | 借“featured + list”结构；改成方形盒 |
| 8 | FAQ ×11 | 30/40px 圆角大面板；11 行 `<details>`；首行 open | 22px 问题、20px 行内边距、chevron 旋转 90° | 借“盒装 FAQ + details”；不借高度动画/大圆角 |
| 9 | Final CTA | 640px 高全宽区；H2 54；agent prompt chip + Quickstart | footer shader 灰雾、chip hover 展开 payload | 借“大区 + chip”结构；Oribos 已有更克制的版本 |

**首页的节奏**：每个 H2 区先 180px 空白，再 54px 标题 + 22px 副文，再 180px 到内容；这就是“画廊式”长页。Oribos 首页已有 9 区但每区 96px，信息密度更高；不要为了“像 Mastra”把 `py-24` 改成 180px。

#### 2.2 Framework 产品页（`[M2]`）

骨架：

1. **Product hero**：装饰性网状图（770×300 移动 / 1540×600 桌面）→ 产品 glyph（100/200px）→ eyebrow “Mastra Framework” → H1 68 → 副文 22（max 760）→ CTA（Copy agent prompt + Quickstart）。`[C2]` `.ds-product-hero--title`。
2. **Feature sections**：H2（54）+ 副文（22）+ card grid；每个产品能力一个 section，card grid 有三种布局：
   - `layout-1`：3 列，第一张跨 3 列、最小 576px；其余 3 张各 1 列。
   - `layout-2`：2 列，第一张跨 2 列、最小 576px；其余 2 张各 1 列。
   - `layout-3`：3 列，第一张跨 3 列；第 5 张跨 2 列 × 3 行。`[C5]`。
3. **Case studies**：客户故事带（与首页同款）。
4. **FAQ**：5–9 题。
5. **Final CTA**：同首页。

**对 Oribos 的判断**：结构可借（eyebrow → H1 → 副文 → CTA → 能力分区 → FAQ → CTA），但 Oribos 只有 Framework 是真实产品；Platform / Studio / Agent Builder 是计划中，**不能为它们做同规格的 hero + 产品截图 + 能力卡**。一个“Framework 产品页”是合理的；计划中产品只应有状态卡/说明段，或等产品落地再建页。

#### 2.3 Solutions 页（`[M3]`）

- Hero：装饰图 + 浮动绿色标签（如 “Incident response”）→ H1 54 → 副文 22（max 448）→ 3 张客户故事卡（单卡上限 426px，30/40px 圆角，2px 边，灰度图 + logo + 标题 + Read story）。
- 下方：FAQ + Final CTA。**没有独立的“解决方案论证”正文**；可信度全靠客户故事。
- 对 Oribos：Solutions 沿用 Mastra 的角色/行业分类，但必须用 **场景卡**（场景名 + 2–3 句怎么搭 + 用到的子系统/包名）替代客户故事；页头 mock 用 host-interface mock，不用人物照片。`[L14]` 已定义“场景卡”和“用例页”。

#### 2.4 博客索引与文章（`[M5]`/`[M6]`）

**索引**：

- H1 54（`text-headline-2xl`），副文 17（max 560）。
- 筛选 pill：`All Posts / Announcements / Features / Examples / Foundations`；约 36–38px 高、full radius、1px `#1c1c1c` 边；active 填 `#171717`、字白；hover 边/底变亮。`[M5]`。
- 卡片：2 列（桌面），大圆角（约 40px）、2px 边、约 28px 内边距；标题 22、描述 17 灰；底部作者头像 28px + 日期 14.5 + 分类 badge `# announcements`（小圆角 pill）。`[M5]` 截图。
- 搜索 icon 在筛选行右端。

**文章**：

- 面包屑 → 居中 H1（32→48，600，-0.022em，max 900）→ 描述（18，max 700）→ 作者/日期/阅读时长 → 正文 676px + 右侧 TOC 约 220px；移动端 TOC 变 accordion。`[M6]` 截图/HTML。
- 正文链接绿色 + 下划线；行内 code 深底 + 1px 边；代码块 8px 圆角、1px `#2b2b2b` 边、`#1e1e1e` pre 底、copy 按钮 hover/focus 才出现。`[C6]`。
- 代码块 `pre` 带 `tabindex="0"`，可键盘横向滚动（`[M6]`）。

#### 2.5 Docs shell（`[M7]`/`[C9]`）

- 顶栏：Docs / Models / Integrations / Reference / Learn / Platform；搜索；Ask AI；GitHub；主题切换；Deploy agents。**六条产品/内容车道**。
- 三栏：280px 侧栏（可折叠、组内 active pill）→ 48rem 正文（面包屑、Copy page 分体按钮、H1 40、正文 16/1.6、callout、代码、表格）→ 右侧 TOC（约 220px）+ Mastra Platform 卡 + newsletter。
- 表格：语义 `<table>`；表头 `#1a1a1a` 底、1px 右分隔、0.5px 行分隔、单元格 24/16 padding、14px 字、首列绿色（`[C9]` `.prose th/td/tr`）。
- Callout：紫色边框/底（Watch 提示），绿色链接；代码块带文件名 `src/mastra/agents/test-agent.ts`。
- 移动：侧栏/TOC 折叠为抽屉/accordion；正文单列。

**对 Oribos 的判断**：三栏比例（280 / 768 / 220）可借；但 Oribos docs 是 **单车道**（只有 Documentation 入口，五族降为侧栏分组，`[L13]` §1），不能复制 Mastra 的 6 Tab 顶栏。Starlight 默认已经有侧栏/TOC/搜索/主题切换，**不要为了像 Mastra 而引入 Docusaurus 组件或覆盖 Starlight 结构**（`[L12]` ADR-0003 覆盖数 0）。

#### 2.6 Pricing / 比较矩阵（`[M4]`）

- H1 “Pricing that scales with your agents” 左置；右侧说明 + 分段切换（Mastra Platform / Self-Hosted）。
- 比较矩阵：左列 200px 行标签；右列 3 张 plan 卡；行高 42px、价格头 63px、plan 头 90px；卡片 30/40px 圆角、2px 边、每档轻微色 tint（Teams 绿、Enterprise 蓝）；行标签 17/450 灰，值 17/450；check/价格混排。`[M4]`；`[C7]`。
- 这不是 `<table>`，是 CSS grid 的“定价板”；移动端折叠为 stacked plan cards（外层 `xl:grid`）。
- Oribos 当前没有定价页，且 Framework 是开源；**不要为了视觉完整造三档价格**。如果未来要做“产品状态矩阵”，可借这个“左标签 + 多列卡”的结构，把价格换成 `Available / Planned / Registry / Not planned` 状态。

#### 2.7 FAQ、Final CTA、Footer

**FAQ**：

- 大面板：30/40px 圆角、2px 边、`rgba(15,15,15,.78)` 半透明底、`backdrop-blur(2px)`、`p-7`、内阴影高光；11 行 `<details>`；问题 22/400、答案 17/400；summary `py-5` + 20px 横向 padding，hover `#171717`，chevron 18px `rotate-90` 300ms；第一行默认 open；无 `name` 互斥。`[M1]`/`[C4]`。
- 动画：`::details-content` 高度 0→auto 420ms + opacity 220ms；JS fallback 用 `.ds-faq__slide` 高度过渡；reduced motion 下关闭。`[C4]`。

**Final CTA**：

- 全宽 640px 高，H2 54，副文/CTA；背景是 1040/1360px 高的 footer shader（灰色雾），H2 之上有大量空；agent prompt chip 50px 高，hover/focus 展开隐藏 payload（mask 渐隐），图标 Claude/Codex/Cursor。`[M1]`。

**Footer**：

- 外层 32/40px 圆角、2px 边、`#0f0f0f`；5 列网格（品牌 1.6fr + 4 个 1fr），7 个 nav 组排两行：Product / Framework / Developers / Solutions / Resources / Company / Connect；品牌列下方 newsletter（橙色 gooey tab + 50px pill 输入）；右下角 `Privacy / Terms / DPA / llms.txt`；左下有 `SECURITY` / `FULLY OPERATIONAL` 状态点。`[M1]` 截图。
- 对 Oribos：footer 只需 4 栏 + 法务行（`[L8]`）；借“分组 + 两行”的信息组织，不借 7 栏、newsletter、status 点。

---

### 3. 组件形态清单

| # | 组件 | Mastra 形态 | 状态/行为 | Oribos 对应 | 判断 |
| --- | --- | --- | --- | --- | --- |
| 1 | Header | 60px sticky；logo + 3 下拉 + 3 直达 + GitHub + Login/Sign Up | 滚动后实底 + 2px 底边 + 大阴影；无 skip link | `Header.astro`：60px、Use cases 下拉、Docs/GitHub/version pill | 借结构，改视觉；补 skip link |
| 2 | Mega menu | 343px 宽；内容 303px；20px 内边距；2px 边 + 30px 壳；行 60px/20px 圆角；图标 44px/10px 圆角；行 hover `#1c1c1c` | hover/click 打开；shell 高度 480ms；panel 交叉淡入 + 24px 位移；Esc/外点关闭 | 288px 文本下拉，无图标；原生 disclosure | 借“图标 + 标题 + 描述”的信息层级；改方形/无图标 |
| 3 | 按钮 | 50px 高、22px 横 padding、17/500、full pill；深色渐变描边；hover 填充变亮；active `scale(.98)` + 绿边；focus 绿 2px | 主 CTA 不是橙色；绿色 active 边 | 48px、16/600、方形；实底琥珀 / ghost | 保留 Oribos 按钮；不借 pill/渐变/scale |
| 4 | Badge / 标签 | 公告 lip（51px 圆角、橙底黑字、日期 + 标题 + 箭头）；section label tab（38px 高、51px 圆角、12/17px、470）；blog 分类 `# announcements` | 公告不可关闭；label tab 不可点击；分类是静态 pill | version pill（mono hairline）；无公告/分类 | 借“mono 标签”层级；不借橙底/圆角 |
| 5 | Tabs | Feature 6 个 80px pill；Observability 5 个；Resources 2 个；active 与 panel 合并 | roving tabindex、箭头/Home/End、aria-selected/controls；切换有交叉淡入 | `FeatureTabs.astro` 方形 tab；`CodeTabs` 文件 tab | 借“active 合并 panel”结构；改方形 |
| 6 | 代码块 | 文件名 chip（大写 mono、10px 圆角、`#171717`）；15.2/24.6 mono；行高亮；copy 按钮 hover/focus 出现；blog 代码 8px 圆角、1px 边、`tabindex=0` | copy 成功变绿；无行号；横向滚动 | `CodeTabs`：文件名 tab、copy、2px 左高亮条、`pre tabindex=0` | 已基本具备；补 copy 反馈/文件名 chip 即可 |
| 7 | 产品窗 / mock | 3 个叠放窗；26px 圆角、1.5px 边、radial-gradient、阴影；内部行 40px；mono/Greed 13–17px | 入场 stagger；自动轮播（project tree → traces → evals）；hover shader | `MockWindow`/`MockChat`/`MockThread`/`MockTraceConsole`，hairline 盒 | 借“多窗叠放 + 状态切换”构图；改盒式/静态 |
| 8 | 聊天气泡 | Studio 面板：工具栏 Chat/Editor/Evaluate/Review；左会话列表；右消息流 + composer；底部建议 prompt | 选中会话、发送按钮、附件/语音图标 | `MockChat` | 结构已对齐；保留 Oribos mock |
| 9 | Logo 墙 | 12 个客户 logo；桌面 6×2、移动 60s marquee；每卡 “Read →” | hover 暂停/标签变亮；`aria-label` 完整 | `FactsBand` 四格事实带 | **替换**：事实带，不做 logo 墙 |
| 10 | Testimonial / case card | 灰度人物照 + logo + 标题 + Read story；hover 照片恢复彩色 500ms | 整卡链接；无引用文本 | `UseCaseCards` 场景卡 + mock | **替换**：场景卡，无人物/logo |
| 11 | 对比表 | Pricing CSS grid：200px 标签列 + 3 plan 卡；行 42px；每档 tint | 分段切换 Platform/Self-hosted；移动 stacked | 无 | 只在“产品状态矩阵”场景改写使用 |
| 12 | FAQ | 大圆角半透明面板；11 行 `<details>`；问题 22、答案 17；行 hover `#171717`；chevron 旋转 | 首行 open；高度动画 420ms；无互斥 | `FaqList`：`max-w-3xl`、`divide-y`、`details` | 借盒装 + details；不借圆角/动画 |
| 13 | Final CTA | 640px 高；H2 54；agent prompt chip 50px；hover 展开 payload；shader 背景 | chip 复制状态；Quickstart 文本链 | `FinalCta` + `AgentPromptCta` 四面 chip | 保留 Oribos chip；不借展开/shader |
| 14 | Footer | 32/40px 圆角面板；7 组两行；newsletter gooey tab；状态点；法务在右列 | newsletter 提交；back-to-top logo | 4 栏 + 法务行 | 借分组；不借 7 栏/newsletter/status |
| 15 | 筛选 pill | Blog 分类、Customers 下拉/搜索；36–38px、full radius、1px 边、active `#171717` | active 状态；搜索 | 无（blog 未建） | 借“筛选行”结构；改方形 mono chip |
| 16 | Segmented control | Pricing 的 Platform/Self-Hosted；白底 active pill；Chat/Editor/Evaluate/Review 工具条 | 切换视图 | 无 | 仅产品状态切换可用；改方形 |
| 17 | Docs 表格 | 语义 `<table>`；表头 `#1a1a1a`；1px 竖线/0.5px 横线；首列绿色；14px | 移动 `display:block; overflow:auto` | Starlight 默认表格 | 借结构；改 Oribos 色/加 `scope` |
| 18 | Docs callout | 紫色 1px 边/淡底；标题 + 链接；代码块带文件名 | 静态 | Starlight aside | 借“带标题的提示块”；改琥珀/绿语义 |
| 19 | Copy page | Docs 面包屑右侧 “Copy page” 分体按钮 + 下拉 | 复制 Markdown twin；下拉 | Oribos 有 `.md` twin，无 UI | 可选借；需产品/内容决策 |
| 20 | 公告 lip | 橙底黑字、51px 圆角、日期 + 标题 + 箭头；移动跑马灯 | 无关闭；链接新窗 | 无 | 可选改写为方形 mono 公告；默认不做 |

#### 3.1 导航与 mega menu 的关键尺寸（`[C3]`/`[M1]`）

- Header：`position:sticky; top:0; z-index:500; background:#0f0f0f; border-bottom:2px solid #1c1c1c; box-shadow:0 4px 60px #000000bf`；`--ds-nav-height:60px`。
- 顶部条：`max-width:1328px`、`padding-inline:28px（<640）/38px（≥640）`、`padding-block:12px`、`min-height:60px`。
- 桌面导航：`font-size:15px; font-weight:500`；菜单项 `height:38px; padding-inline:17px; border-radius:full`；默认 `#939393`；hover/expanded `#fff` + `#1c1c1c` 底；transition 300ms。
- 下拉壳：panel 宽 343px；内容 303px；shell 内容 padding 20px；2px stroke `#1c1c1c`；`drop-shadow(0 4px 54px #000c)`；左边缘 clamp 到触发词附近。
- 行：`min-height:60px; padding:8px; gap:14px; border-radius:20px`；hover `#1c1c1c`；图标 tile `44×44; border-radius:10px; background:#000`；图标图片 132×132 PNG 渲染 44px；标题 `14.5px/450` 白；描述 `14.5px/400` `#939393`。
- 分组：Product 4 项（Framework/Deployment/Observability/FDE Support），Solutions 7 项（Sales/Marketing/Company Brain/Financial Services/Healthcare/Customer-facing/Developer Infra），Resources 5 项（Blog/Templates/Principles book/Workshops/Research）。`[M1]`。
- 移动：<1024 用全屏菜单；组标签 18px 灰；链接 24px/2xl；底部 GitHub + 全宽 Login/Sign Up。`[M1]` 393×852 截图。

#### 3.2 按钮的具体状态

- 主 CTA “Get a demo”：`h-50px; px-22; text-17/500; rounded-full`；背景双层：内层 `#1c1c1c`、外层渐变边框 `#383838→#2b2b2b00`；hover 内层 `#242424`、边框 `#464646`；active `scale(.98)` + 绿色边框；focus `outline-2 outline-offset-2` 绿色。`[M1]`。
- 次 CTA “Quickstart”：纯文本 17px、灰、右侧箭头；hover 变白/箭头位移。`[M1]`。
- 橙色只出现在公告/ newsletter；如果 Oribos 把主按钮改成 Mastra 的深色 pill，会丢掉 Oribos 最强的琥珀识别点。

#### 3.3 Tabs 的三种形态

1. **Feature tabs**：6 个 80px 高 pill，带图标 + 大写标签；active 填 `#0f0f0f`，与下方 panel 同底；panel 是“代码窗 + 产品窗 + 底部说明”的三层舞台。`[M1]` 截图。
2. **Observability tabs**：同样 pill，5 个；panel 是产品表格截图。
3. **Resources tabs**：2 个标签嵌在 228px 区头的凹槽里；panel 内左书卡右 release 列表。`[M1]`。

Oribos 的 `FeatureTabs` 是方形 tab + `box bg-bg2` panel，active 用 `border-acc bg-acc-lo text-acc-h`（`[L4]`）。**结构目标一致**：让 active tab 与 panel 连成一体；实现方式应改为方形 border 合并，而不是 pill。

#### 3.4 代码块与 copy

- 文件名 chip：`font-mono; text-[14px]; uppercase; #939393; background:#171717; border-radius:10px; padding:6px 17px`；位于代码窗左上（`[M1]` hero 代码窗）。
- 代码：`font-mono; 15.2px/24.6px; tracking:.05px`；关键字 salmon `#FA7B6A`、字符串 green `#46F488`、类/函数 purple `#D06BEE`、其余白（`[M1]` 内联样式）。
- Blog 代码：`figure.shiki-figure` 1px `#2b2b2b`、8px 圆角、`#0f0f0f` 框 + `#1e1e1e` pre；copy 按钮绝对定位右上，默认 opacity 0，hover/focus-within 显示；copy 成功 `.shiki-copy--copied` 绿色；`pre tabindex=0`。`[C6]`/`[M6]`。
- Oribos `CodeTabs` 已有文件名 tab、copy、`pre tabindex=0`、2px 左高亮条（`[L5]`/`[L1]` §2.6）。**不需要重做**；只需决定是否把文件名做成 chip、copy 图标是否 hover 才出现。

#### 3.5 卡片

- 基础卡：`border-radius:30/40px; border:2px solid #1c1c1c; background:#0f0f0f; padding:28/38px`；hover `#171717`；箭头 16px；背景图/生成图绝对定位；可选 shader。`[C5]`。
- 卡片网格：layout-1/2/3 的跨列规则见 §2.2；hero card 最小 576px，其余自适应。
- 博客卡：2 列、大圆角、2px 边、28px padding、标题 22、描述 17、作者 28px 头像、日期 14.5、分类 pill。`[M5]`。
- Oribos 卡：`box`（1px）、`p-5/6`、无图、mock 置顶（`[L7]`）。借“卡片网格的跨列节奏”，不借圆角/厚度/照片。

#### 3.6 FAQ

- 结构：`section > h2(sr-only) + 装饰 label + stage shell > panel > details×11`；问题用 `<h3>` 包在 `<summary>` 内；答案 `max-w-[760px]`。`[M1]`。
- 视觉：22px 问题、17px 答案、20px 行内边距、`#171717` hover、18px chevron 旋转；面板 30/40px 圆角 + 2px 边 + 半透明 + blur。
- Oribos：`section > h2 + div.divide-y > details > summary`，16px semibold 问题、16px 答案、无 JS（`[L6]`）。**借盒装与 details；不借 22px/圆角/高度动画**（Oribos 只允许颜色/透明度）。

#### 3.7 Footer

- 结构：`footer > stage shell > 32/40px 圆角面板 > 5 列 grid`；品牌列 1.6fr + 4 个 1fr；7 个 nav 组两行；newsletter 在品牌列下方；法务在右下；状态点在左下。`[M1]`。
- Oribos：`footer.mt-24.border-t` + `wrap.grid` 4 栏 + 法务行（`[L8]`）。**借分组与两行布局，不借面板/圆角/newsletter/status**。

#### 3.8 Logo 墙、testimonial、对比表

- Logo 墙：12 个客户 logo；桌面 6×2、移动 marquee；每个 logo 有 `aria-label` + “Read →” 链接；文字 `#424242`，hover `#939393`。`[M1]`。
- Testimonial：Mastra **没有** blockquote 引用卡；`/customers` 是筛选列表（10/34 stories），首页用 case-study 照片卡。`[M8]`。因此不要设计“引用卡”组件，除非 Oribos 未来真有客户引语。
- 对比表：Pricing 的 CSS grid 版本；Docs 的语义 table 版本。两者视觉不同，不要混成一个组件。

---

### 4. 动效与交互

| 效果 | 触发 | 值与曲线 | 实现 | 证据 |
| --- | --- | --- | --- | --- |
| Hero 入场 | 页面加载 | 0.7s / 0.8s，`cubic-bezier(.16,1,.3,1)`；延迟 80/220/360/510/560/690/780/870ms | CSS keyframes + React 状态 | `[C1]` `--animate-hero-*`；`[M1]` |
| Hero 窗序列 | 自动 | frame in 0.8s，out 0.25s；90ms/45ms stagger | JS 切 `data-state` + CSS | `[M1]` `.hero-illustration-panel` |
| Mega menu | hover/click | shell 高度 0.48s；panel 透明度 0.32/0.48s、位移 24px；`cubic-bezier(.32,.72,0,1)` | CSS transition + Base UI state | `[C3]` |
| Feature tab 切换 | 点击 | 代码/媒体交叉淡入 + 位移；短过渡（CSS transition，具体时长未逐项锁定） | CSS transition | `[M1]` 截图/类名 |
| FAQ 开合 | 点击 | 高度 0.42s `cubic-bezier(.33,1,.68,1)`；opacity 0.22s | 原生 details + CSS `::details-content` + JS fallback | `[C4]` |
| 按钮 hover | hover | 150ms 颜色/边框 | CSS | `[M1]` |
| 按钮按压 | active | `scale(.98)` + 绿色边，150ms | CSS | `[M1]` |
| 卡片 hover | hover/focus | 背景 150ms；shader 200ms；照片去饱和→彩色 500ms | CSS + canvas/JS | `[C5]`/`[M1]` |
| Logo marquee | 自动 | 60s linear infinite；hover/focus-within 暂停 | CSS keyframes | `[C1]`/`[M1]` |
| Announcement ticker | 自动（移动） | 15s linear infinite；reduced motion 停 | CSS keyframes | `[C3]` |
| 404 | 页面 | Orbitron 字体 + 黑底 | 独立模板 | `[C8]`/`[M1]` 404 RSC |
| 页面过渡 | 路由 | **未发现** `view-transition` / 页面转场 | — | CSS 搜索 |

**CSS vs JS**：

- CSS 负责所有颜色/透明度/高度/位移/跑马灯；JS 负责状态（tabs、菜单、FAQ fallback、copy、shader 激活、hash）。
- 在本次下载的 20 个 JS chunk 中未发现 `framer-motion`/`motion` 库；交互状态由 React 19 + Base UI（`base-ui` chunk 可见）驱动；shader 用 canvas 着色层 + fallback 图（`data-optimized-shader`，`[M1]`）。
- 没有 CSS `scroll-timeline` / `animation-timeline`；滚动触发主要不是“逐段 reveal”，而是 shader 进入视口激活与 hero 自动轮播。`[M1]` 搜索 `data-optimized-shader-activation="viewport"`。
- 没有页面过渡；Next.js 路由切换是瞬时。

**Reduced motion**：

- 组件级 `motion-reduce:animate-none` / `motion-reduce:transition-none` 大量存在（首页 100+ 处）；logo marquee 在 reduced motion 下停止；announcement ticker 停止；FAQ details 过渡关闭。`[M1]`/`[C4]`。
- 没有全局 `*` 动画清零，依赖每个组件自觉。Oribos 的全局 `@media (prefers-reduced-motion: reduce)` 把 animation/transition 压到 0.01ms（`[L1]`），更稳；应保留 Oribos 的全局兜底，不要退回 Mastra 的逐组件模式。

---

### 5. 响应式行为与可访问性

#### 5.1 断点与折叠

| 断点 | Mastra 行为 | 证据 |
| --- | --- | --- |
| <640px | antigrid gap 18、padding 28、卡片圆角 30；移动导航全屏；hero 单列；logo 墙 marquee；footer 2 列 | `[C1]` `@media(min-width:40rem)` 之前；`[M1]` 393×852 |
| 640–1023px | gap 24、padding 38、卡片圆角 40；导航仍是移动菜单（<1024） | `[C1]`；`[M1]` `lg:` 前缀 |
| ≥1024px | 桌面导航、mega menu、hero 约 50/50 两栏、feature tabs 全行 | `[M1]` |
| ≥1280px | 容器达到 1328；pricing 进入 `xl:grid` 200px+3 列 | `[C1]`/`[M4]` |
| Docs | 桌面三栏；窄屏侧栏/TOC 折叠；正文 48rem | `[C9]`/`[M7]` |

Mastra 的 nav 切换点是 **1024px**，不是 Oribos 的 768px。Oribos 如果保持 4 个导航项，768 足够；如果新增 Product/Solutions/Resources 三组，768 会拥挤，建议把断点提到 1024，或减少一级项。

#### 5.2 移动端的具体变化

- Header：logo 缩小（约 21.5px 高 → 29.3px 桌面）、汉堡、公告变成横向裁切/跑马灯；全屏菜单分组 + 24px 链接 + 底部全宽登录按钮。`[M1]` 393×852。
- Hero：单列；H1 约 30（clamp 下限，393 视口实测）、副文 22、按钮全宽；右侧产品窗缩成一张简化卡（项目树），其余窗隐藏；logo 墙变 marquee。
- Feature tabs：桌面 6 个 pill 一行；移动变成横向滚动 tab + 单独移动 panel（30px 圆角）。`[M1]` RSC 中 `data-feature-tab-trigger-surface="mobile"`。
- Pricing：`xl:grid` 以下 stack 成 plan 卡；标签列变成每卡内的行标签。
- Docs：侧栏抽屉、TOC accordion；表格 `display:block; overflow:auto`。

#### 5.3 可访问性审计

**强项**：

- 语义：`header/nav/main/section/footer`、`details/summary`、真实 `button`/`a`；图标按钮有 `aria-label`；装饰图 `alt=""`；重复的 marquee 行 `aria-hidden`。`[M1]`。
- Tabs：`role="tablist"`、`role="tab"`、`aria-selected`、`aria-controls`、roving `tabindex`；方向键/Home/End；`aria-label="… tabs"`。`[M1]` RSC/JS。
- 菜单：trigger `aria-expanded`/`aria-haspopup`；Base UI 的 focus guard/inert；Esc 关闭。`[M1]` JS。
- 焦点：营销 `focus-visible:outline-2 outline-offset-2 outline-(--color-ds-green)`；Docs `ring-2 ring-(--mastra-green-accent)`；焦点环对比度高（绿 `#7aff78` 对 `#080808` 15.64:1）。`[M1]`/`[C9]`。
- Reduced motion：逐组件处理；marquee 在 hover/focus 暂停；FAQ 过渡关闭。`[M1]`/`[C4]`。
- 代码块：`pre tabindex="0"`，键盘可横向滚动；copy 按钮有 `aria-label` + copied 状态。`[M6]`/`[C6]`。
- Docs：有 "Skip to main content"；营销页没有。`[M7]` vs `[M1]`。

**硬伤/风险**：

1. **营销页没有 skip link**：在 2026-10-20 抓取的首页 HTML 中未发现 skip link；docs 有。键盘用户要穿过整套 header/nav 才能到 main。`[M1]`/`[M7]`。
2. **`#424242` 对 `#080808` = 1.99:1**：用于 logo 墙每卡的 “Read →” 可见文字；虽然链接有 `aria-label`，但低视力用户看见的文字不达 AA。`[M1]`/`[C1]`。
3. **强制暗色**：营销站忽略 `prefers-color-scheme: light`；对光敏感用户没有选择。`[M1]`。
4. **文本压在灰度照片上**：case-study 卡的标题/描述叠在人物照上；照片上的实际对比度无法从静态 CSS 证明，必须按真实裁切逐张实测（不能假定有 scrim 就达标）。`[M1]`/`[M3]`。
5. **表格缺少 `scope`/caption**：Docs 表头是 `<th>` 但没有 `scope="col"`/`<caption>`；屏幕阅读器关联弱。`[M7]`。
6. **滚动的表格区域不可聚焦**：Docs 表格移动端 `overflow:auto`，但没有 `tabindex=0`；键盘用户可能无法横向滚动。`[C9]`。
7. **FAQ 装饰标签不是 heading**：可见的 “Frequently asked questions” 是 `div`，真实 `h2` 是 `sr-only`；视觉层级与语义层级分离。`[M1]`。Oribos 应让可见标题就是 `h2`。
8. **公告不可关闭**：顶部橙色 lip 没有 close 控件；长期占位会挤压内容。`[M1]`。
9. **部分 auth CTA 客户端渲染**：服务端 HTML 只直出 GitHub 链接，Login/Sign Up 由客户端出现；可能造成 header 布局跳动/首屏 CTA 缺失。`[M1]`（截图 vs HTML）。

**对比度汇总**（按 CSS 值计算）：

| 前景/背景 | 比值 | 结论 |
| --- | ---: | --- |
| `#f0f0f0` / `#080808` | 17.57:1 | 主文字通过 |
| `#939393` / `#080808` | 6.52:1 | 次级文字通过 |
| `#424242` / `#080808` | **1.99:1** | “Read →” 不达 AA |
| `#fdac53` / `#0f0f0f` | 10.23:1 | 橙色通过 |
| `#000000` / `#fdac53` | 11.20:1 | 公告黑字通过 |
| `#ffffff` / `#fdac53` | 1.87:1 | 白字不可用在橙底 |
| `#7aff78` / `#080808` | 15.64:1 | 绿色/焦点通过 |
| `#939393` / `#171717` | 5.84:1 | 抬升面次级文字通过 |
| Oribos `#9e630a` / `#ffffff` | 4.95:1 | 亮色琥珀通过（`[L10]`） |
| Oribos `#ea9f2e` / `#101010` | 8.61:1 | 暗色琥珀通过（`[L10]`） |

---

### 6. 与 Oribos 现有视觉资产的兼容点与冲突点

#### 6.1 逐维对照

| 维度 | Mastra | Oribos | 兼容性 |
| --- | --- | --- | --- |
| 主题 | 营销强制暗色；docs auto+toggle | 营销 OS-only；docs auto+toggle | **冲突**（营销） |
| 主色 | 橙 `#fdac53` + 绿 `#7aff78` 双强调 | 单一琥珀 `#9e630a` / `#ea9f2e` | **部分兼容**：橙色与琥珀同色相，但双强调冲突 |
| 数据色 | 粉/紫/蓝/黄/红/绿 | 琥珀 + 语法绿/蓝 + trace 绿 | **冲突**：Oribos 不允许彩虹数据色 |
| 字体 | Greed VF + Commit Mono + Orbitron | InterVar + 系统 mono | **冲突**：授权 + 字重/字宽/字阶 |
| 字阶 | 17 base、fluid clamp、520/108% | 16 base、8 档固定、400/600 | **冲突** |
| 形状 | 30/40 圆角、2px 边、阴影、渐变 | 0 圆角、1px 边、无阴影 | **硬冲突** |
| 密度 | 180px 区头 + 180px 区尾 | 96/144 区距、24px 节奏 | **冲突** |
| 栅格 | 1328 容器、18/24 gap、非 12 栏 | 1200、12 栏、16/32 gutter | **可调和**：借跨列节奏，不借宽度 |
| 动效 | 位移/缩放/高度/跑马灯/shader | 只颜色/透明度 | **冲突** |
| 证明方式 | 客户 logo/人物故事 | 事实带/场景卡/mock | **不兼容**：必须替换 |
| Docs shell | Docusaurus 三栏 + 6 Tab | Starlight 三栏 + 单车道 | **部分兼容**：借比例，不借 DOM/导航 |
| 组件实现 | React 19 + Base UI + canvas | Astro + 原生 JS | **不兼容**：不能直接移植组件代码 |

#### 6.2 可直接利用的兼容点

1. **4px 基础单位 + 8 档字阶的“离散节奏”**：Mastra 的 4px spacing 与 Oribos 的 4px 行高纪律同源；把 Mastra 的 18/24/38/180 换算成 Oribos 的 16/24/32/96/144 是自然的，不需要重做布局系统。
2. **暖色强调**：Mastra 橙 `#fdac53` 与 Oribos 暗色琥珀 `#ea9f2e` 都在 hue 33–36°，视觉温度一致；Oribos 不需要引入第二种品牌色就能承接 Mastra 的“暖强调”感觉。
3. **盒装模块 vs 卡片网格**：两者都把内容装进可辨识的矩形单元；Oribos 的 `.box` 只是把 Mastra 的“厚软卡”换成“细线盒”，结构可以一一对应。
4. **语义化组件**：两边都使用真实 `button`/`details`/`table`/`nav`；Oribos 的 tabs/FAQ/代码卡已经有正确的 ARIA 基础，不需要重写行为。
5. **单色底 + 一个暖强调**：Mastra 的营销虽然花，但骨架仍是近黑单色；Oribos 的暖纸/碳黑也是单色骨架。把 Mastra 的“橙色块”换成“琥珀块”，整体不会失稳。
6. **Docs 三栏比例**：280 / 768 / 220 与 Oribos Starlight 的默认结构接近；只改 token 和排版密度即可，不需要覆盖组件（符合 ADR-0003 覆盖数 0）。
7. **trace-ink 是别名，不是第二真相源**：`../oribos-website/src/styles/trace-ink.css` 把 `--trace-green` 指向 `--syn-green`，没有独立色值；Mastra 的绿色 trace 只需映射到这个别名，不新增品牌色。

#### 6.3 硬冲突（不能“调一调就用”）

1. **暗色唯一形态**：Oribos 的 26 项 AA 是双主题门；强制暗色会让亮色面失去验收对象。
2. **Greed 的 108% 字宽 + 520 字重**：Inter 没有宽度轴，Oribos 只有 400/600；仿制会得到“假的 Greed”，同时违反字阶/字重门。
3. **30/40px 圆角 + 2px 边 + 阴影**：这不是单个 token，而是“软面板”结构；改成 0 圆角/1px 后，卡片内部的 28/38 padding、背景图、hover 阴影都要重算。
4. **180px 区头**：Oribos 的页面长度、锚点、FAQ 密度都按 96px 设计；直接拉长会让首页变成另一条叙事。
5. **位移/缩放/高度动画**：Oribos SPEC §2.5 明确“无位移、无缩放”；Mastra 的 hero stagger、mega menu 24px 位移、button scale 都越线。
6. **客户证明**：Oribos 没有客户案例；logo 墙/人物卡不是“视觉选择”，是“内容造假”。
7. **多产品导航/定价**：Oribos 的 Platform/Studio/Agent Builder 是计划中，MCP Registry 无独立产品页，AI Gateway 不做；Mastra 的 Product 4 项 + Pricing 3 档 + Docs 6 Tab 都没有对应内容。
8. **字体授权**：Greed/Commit Mono/Orbitron 是 Mastra 自托管字体文件；Oribos 没有授权，不能复制文件，也不能用 `@font-face` 指向 Mastra 的 URL（外域请求红线）。

---

## 对 Oribos 的启示

### 1. 先定“借什么层”，再谈像不像

把 Mastra 拆成三层：

| 层 | 是否可借 | 说明 |
| --- | --- | --- |
| **信息结构/组件解剖** | 可借 | section 顺序、tab→panel 关系、卡片跨列、FAQ 行、代码卡文件名、docs 三栏、博客正文+TOC |
| **交互行为/可访问性** | 可借（去掉运动） | roving tabindex、Esc/外点关闭、`details`、copy 状态、skip link、焦点环、reduced motion |
| **视觉 token/皮肤** | 不可借 | 色值、字体、字号、圆角、边框、阴影、渐变、shader、跑马灯、动画曲线 |

一句话：**借 Mastra 的“排版语法”，不借它的“材质”**。

### 2. 可直接借用（10 项）

| # | 借用项 | Mastra 证据 | Oribos 落地方式 | 验收 |
| --- | --- | --- | --- | --- |
| 1 | **Section label tab**：标签嵌在面板上沿 | FAQ “Frequently asked questions”、Resources “Agent Books/Latest Releases”、Case Studies `[M1]` | 方形 label：mono `--t-xs`、`--bg` 底、1px `--line` 边、`padding:4px 8px`、绝对定位 `translateY(-50%)` 压在面板上边；标签不可点击时不做 hover | 标签不遮挡标题；键盘顺序不插入装饰元素；面板边线连续 |
| 2 | **Active tab 与 panel 合并** | Feature/Observability tabs `[M1]` | `FeatureTabs` 方形 tab：active `background:var(--bg2); border:1px solid var(--line); border-bottom-color:var(--bg2); margin-bottom:-1px`；panel 1px 边；无圆角 | active tab 与 panel 无缝；非 active tab 仍有下边线；键盘切换不跳布局 |
| 3 | **卡片跨列网格** | `layout-1/2/3` `[C5]` | 12 栏：hero 卡 `span 12`；3 up `span 4`；2 up `span 6`；不设 576px 最小高 | 1440/1024/768/390 无水平溢出；卡片高度由内容决定 |
| 4 | **盒装 FAQ + 原生 details** | 大面板 + 11 行 `[M1]`；`details` `[C4]` | `FaqList` 外包 `.box`；`summary` grid `1fr auto`；问题 `--t-base` 600；答案 `--t-base --ink2`；chevron 旋转用颜色/透明度，不做高度动画 | 无 JS 可开合；Esc 不需要；屏幕阅读器读得出 question/answer；不因动画产生 CLS |
| 5 | **代码文件名 + copy 状态** | 文件名 chip、copy `[M1]`/`[C6]` | 保留 `CodeTabs` 文件名 tab；copy 按钮加 `aria-label`；成功换 Check 图标 + `--acc` 色；`pre tabindex=0` | 复制可见文件逐字一致；键盘可达；复制后 1.2s 复位 |
| 6 | **Docs 三栏壳** | 280 / 768 / 220 `[M7]`/`[C9]` | Starlight 默认壳；正文最大 48rem；TOC sticky；移动折叠 | 1440 下三栏不挤；1024 下正文可读；窄屏无水平滚动 |
| 7 | **博客正文 + 右侧 TOC** | 676px + 220px；移动 accordion `[M6]` | 新博客模板：`max-w-3xl`（768）或新增 `--w-prose:676px` token 作为正文宽 + `sticky` TOC；移动 TOC 用 `<details>`；标题锚点 `scroll-margin-top` | TOC 链接命中标题；键盘可达；移动不遮挡正文 |
| 8 | **博客索引 2 列 + 筛选行** | 2 列卡、pill 筛选 `[M5]` | 2 列卡（≥1024），1px 边、0 圆角、`p-6`；筛选用方形 mono chip，active `--acc-lo` + `--acc` 字 | 筛选状态 `aria-current`/`aria-pressed`；卡片标题/日期/分类可读 |
| 9 | **比较矩阵的 grid 结构** | 200px 标签列 + N 列卡 `[M4]` | 只在“Framework / Platform / Studio 状态矩阵”使用：左列能力名，右列 `Available/Planned` 状态 pill；语义用 `<table>` 或 `role=table` | 行标签与值对齐；移动 stacked；状态不只靠颜色 |
| 10 | **Tabs 键盘行为** | 箭头/Home/End、roving tabindex `[M1]` | `FeatureTabs`/`CodeTabs`/Hero tabs 已有；统一抽成 `tabs.ts` 行为 | ArrowLeft/Right 循环；Home/End 到首尾；焦点跟随；`aria-selected` 同步 |

> 注：第 1、2 项是“结构借用”，实现必须用 Oribos 的 0 圆角/1px 线；第 4 项只借 `details` 语义，**不借 420ms 高度动画**（Oribos 只允许颜色/透明度）。

### 3. 需品牌化改写（9 项）

| # | Mastra 形态 | Oribos 改写 | 不能照搬的部分 |
| --- | --- | --- | --- |
| 1 | 343px mega menu：图标 tile + 标题 + 描述 + 20px 圆角行 | 2–3 组、方形面板、1px 边、无图标；组内用 mono 序号 `01/02/03` 或纯文本；行高 48–56px、`hover:bg-bg2`；Solutions 7 项可两列 | 44px 图标 tile、20px 圆角、2px 壳、drop shadow、480ms 高度动画 |
| 2 | 约 50/50 hero + 54px H1 + 22px 副文 + 50px pill CTA + 3 个叠放产品窗 | 保留 Oribos 的 6/6；H1 67（`--t-4xl`）、副文 21（`--t-lg`）、CTA 用 `AgentPromptCta` chip；右栏 `MockWindow` 单窗或双 tab（code/trace） | Greed/108%、绿色词、橙色公告、26px 窗、阴影、自动轮播 |
| 3 | 180px 区头 + 54px 标题 + 22px 副文 | `py-24`（96px）或 `py-36`（144px）；H2 38/50；副文 21；左对齐或居中按页面 | 180px 空、54px 固定、`font-stretch` |
| 4 | Feature tabs：80px pill、图标 + 大写、active 合并 | 方形 tab 行：`--t-base` 600、`px-4 py-2`、1px 边；active `--acc-lo` + 2px 底边；无图标/大写 | 80px 高、pill、图标 tile、交叉淡入/位移 |
| 5 | Section stage shell：1328 容器 + 30/38px 圆角 + 2px 边 + 180px 区尾 | 全宽 band + `wrap` 1200；需要“面板”时用 `.box` 1px、0 圆角、`p-6/8`；不套第二层圆角壳 | 30/38px 圆角、2px 边、stage shell 双层结构 |
| 6 | Resources：2 tab + 左书卡 + 右 release 列表 + 228px 区头 | “Featured + latest” 两栏：左 featured 卡（1px、p-6）、右 3–5 条 release 行（mono 日期 + 标题 + 1px 分隔）；无 tab 时直接并列 | 228px 区头、大圆角书卡、图片、hover 24px 位移 |
| 7 | Case-study 卡：灰度人物照 + logo + Read story | 场景卡：场景名 + 2–3 句怎么搭 + 包名 chip + host-interface mock；整卡 stretched link；hover 只改边框色 | 人物照、客户 logo、灰度→彩色、426px 固定宽 |
| 8 | Footer：7 组两行 + newsletter + 状态点 + 大圆角面板 | 4 栏（Framework / Use cases / Developers / Project）+ 品牌块 + 法务行；需要时加 “Back to top” | 7 组、newsletter gooey tab、SECURITY/FULLY OPERATIONAL、32/40 圆角 |
| 9 | Pricing：3 plan + 价格 + 渐变 tint + 分段切换 | 不做定价；如做“产品状态”页：左列能力/产品，右列 `Available / Planned / Registry / Not planned` 状态 pill + 一句说明；方形、1px、无 tint | 价格、三档、Custom pricing、渐变、白底 active pill |

### 4. 不建议借用（13 项）

| # | 不建议项 | 原因 | Oribos 替代 |
| --- | --- | --- | --- |
| 1 | **强制暗色营销** | 与 Oribos 亮色默认 + 26 项双主题 AA 冲突；剥夺用户选择 | 保持 `prefers-color-scheme` 双主题；docs 继续 auto+toggle |
| 2 | **Greed / Commit Mono / Orbitron 字体文件** | 授权不可假定；三家族 + 可变字宽/中间字重与 Oribos 字体/字阶门冲突；外域字体违反零外域请求 | InterVar + 系统 mono；docs 若统一，走 `--sl-font` 槽自托管 |
| 3 | **30/40px 圆角 + 2px 边 + 阴影 + 渐变/噪点** | 与瑞士盒式“1px/0 圆角/0 阴影”硬冲突；会改变整个站点的材质 | `.box` 1px + 0 圆角；需要层次用 `--bg2`/`--acc-lo`，不用阴影 |
| 4 | **180px 区头 + 180px 区尾** | 页面长度/密度/锚点全部要重算；Oribos 是信息密度优先 | 96/144 px；用 24px 节奏 |
| 5 | **shader/canvas 着色层 / 卡片噪点 / 大图背景** | 运行时重、与“零运行时负担/无外域”取向冲突；视觉上也不是 Oribos | 纯 CSS 盒 + mock；需要纹理时用 1px 网格线，不用噪点 |
| 6 | **Logo 跑马灯 / 公告跑马灯 / 自动轮播 hero** | 运动不受控、分散注意力；Oribos 只允许颜色/透明度 | 静态事实带；公告如必须，静态一行 |
| 7 | **五色数据 palette（粉/紫/蓝/黄/红）** | Oribos 单一琥珀品牌色 + 语法绿/蓝例外；彩虹色会稀释识别 | trace/图表只用 `--acc` + `--syn-green` + `--ink` 三阶；错误态如需要，新增功能性 `--trace-red` 并单独审计，不做品牌色 |
| 8 | **客户 logo 墙 / 人物故事卡 / testimonial** | Oribos 无客户案例；会制造虚假 social proof | 架构事实带 + 场景卡 + host-interface mock |
| 9 | **7 栏 footer + newsletter + 状态点** | Oribos footer 是 4 栏 + 法务行；newsletter/status 没有内容/运维支撑 | 4 栏 + 法务；如要 newsletter，先有内容计划 |
| 10 | **Docs 6 Tab 顶栏（Docs/Models/Integrations/Reference/Learn/Platform）** | Oribos docs 单车道、五族侧栏；多产品 Tab 是 ~900 页规模的功能 | 只保留 Documentation 入口；侧栏分组 |
| 11 | **Pricing 三档 / Custom pricing** | Oribos Framework 开源、Platform 计划中；没有定价事实 | 不做定价页；如需要，做产品状态矩阵 |
| 12 | **Agent prompt chip 的 hover 展开面板** | Oribos 的设计是“可见四面 + 隐藏 payload”，展开面板会把隐藏内容变成第二层 UI，且引入位移/遮罩动画 | 保留 `AgentPromptCta` 现有 chip；只在 copy 成功时换图标/文案 |
| 13 | **`theme-color:#020202` 与页面底不一致** | 浏览器 chrome 与页面脱节；Oribos 要求 `theme-color = --bg` | 用 `--bg` 解析值（亮 `#ffffff` / 暗 `#101010`） |

### 5. Token 映射表（Mastra → Oribos）

| 角色 | Mastra 营销 | Oribos 亮 | Oribos 暗 | 备注 |
| --- | --- | --- | --- | --- |
| 页面底 | `#080808` | `#ffffff` | `#101010` | 不要把 `#080808` 当 Oribos 暗底；Oribos 是 `#101010` |
| 次级面/卡底 | `#0f0f0f` | `#fafaf8` | `#171716` | Oribos 的 `--bg2` 更暖 |
| 抬升面 | `#171717` | `#fafaf8` | `#171716` | Oribos 没有第三层抬升；用 `--bg2` 即可 |
| 边线 | `#1c1c1c` / `#2b2b2b` | `#e6e6e0` | `#2a2925` | Oribos 统一 `--line` 1px |
| 主文字 | `#f0f0f0` | `#161513` | `#f2f1ee` | 近黑/近白，暖灰 |
| 次文字 | `#939393` | `#5f5f5c` | `#b3b1aa` | Oribos `--ink2` |
| 弱化 meta | `#424242`（1.99:1） | `#98988f` | `#74726b` | Oribos `--ink3` 也只用于装饰；**不要把 `#424242` 用于可读链接** |
| 品牌强调 | `#fdac53` | `#9e630a` | `#ea9f2e` | 同色相；Oribos 亮色更深以满足 AA |
| 强调 hover | `#e0993f` | `#7a4c07` | `#f5b456` | 只动明度 |
| 强调底 | `#fdac531a`（10%） | `#f4e8d3` | `#3a2c14` | Oribos `--acc-lo` |
| 反字 | `#000000` | `#ffffff` | `#101010` | 橙底用黑字（11.2:1）；琥珀底用 `--acc-inv` |
| 代码底 | `#1e1e1e` / 框 `#0f0f0f` | `#fafaf8` | `#151513` | Oribos `--code-bg`；框仍是 1px `--line` |
| 成功/trace | `#7aff78` | `#2d7645` | `#5eba7d` | Oribos `--syn-green`/`--trace-green` 更克制 |
| 错误 | `#ff4758` | 无 | 无 | 如 mock 需要，新增功能性 token，单独审计 |

### 6. 模板、字段与验收（可直接喂给后续票）

#### 6.1 模板清单（视觉模板，不是 IA 裁决）

| 模板 | 区块顺序 | 必填字段 | 复用组件 |
| --- | --- | --- | --- |
| `home` | Hero → Facts band → Feature tabs → Observability → Use-case cards → Resources → Global FAQ → Final CTA | `hero{h1,sub,file,code,trace}`, `facts[4]`, `features[5]`, `observability`, `useCases[3]`, `resources[3]`, `faq[9]`, `finalCta` | `Hero`, `FactsBand`, `FeatureTabs`, `Observability`, `UseCaseCards`, `ResourcesStrip`, `FaqList`, `FinalCta` |
| `framework` | Product hero → 2–3 feature sections → Facts band → Use-case links → Page FAQ → Final CTA | `productHero{eyebrow,h1,sub,cta,diagram}`, `sections[{title,description,cards[]}]`, `facts`, `faq[4–6]` | 新 `ProductHero` + `CardGrid` + `FaqList` |
| `solution` | Hero（mock + 标签）→ 3 场景卡 → 论证卡区（3–4）→ Page FAQ（4–6）→ Final CTA | `hero{label,h1,sub,mock}`, `scenarios[3]{title,body,packages[]}`, `arguments[3–4]`, `faq[]` | `UseCaseCards` 变体 + `ArgumentBand` + `FaqList` |
| `use-case` | 页头 mock → intro → 3 场景卡 → related features → Global FAQ → Final CTA | `headerMock`, `intro`, `scenarios[3]`, `related[]`, `faq[9]` | `Mock*`, `UseCaseCards`, `FaqList` |
| `keyword` | H1 → Argument cards（3–4）→ Feature tabs / capability band → Page FAQ（6）→ Final CTA | `h1`, `arguments[3–4]`, `features?`, `faq[6]` | `ArgumentBand`, `FeatureTabs`, `FaqList` |
| `resources` | H1 → filter row → featured card + latest list → CTA | `h1`, `filters[]`, `featured{...}`, `latest[3–5]` | 新 `FilterChips` + `ResourceCard`/`ResourceRow` |
| `blog-index` | H1 → description → filter row → 2-col cards → pagination/load more | `h1`, `description`, `categories[]`, `posts[]` | `FilterChips`, `PostCard` |
| `blog-post` | breadcrumb → H1 → description → author/date/read time → prose + TOC → related | `title`, `description`, `category`, `author{name,handle?,avatar?}`, `date`, `readingTime`, `toc[]`, `body` | `Prose`, `Toc`, `CodeBlock`, `Callout` |
| `docs-landing` | Starlight splash：hero + cards + code | `title`, `description`, `actions[]`, `cards[]` | Starlight 内建 + token |
| `docs-page` | 侧栏 → 面包屑 + Copy page → H1 → prose → TOC | `title`, `description`, `group`, `order`, `toc`, `prev/next` | Starlight 内建 + token |
| `text` | 标题 + 正文 + `Last updated` | `title`, `body`, `updated` | `LegalLayout`/`BaseLayout` |

#### 6.2 数据契约（建议）

```ts
type NavItem = {
  label: string;
  href: string;
  description?: string;   // Product 组用；Solutions/Resources 可省略
  badge?: 'available' | 'planned' | 'registry' | 'not-planned';
};

type NavGroup = {
  label: string;           // Product / Solutions / Resources
  items: NavItem[];
  columns?: 1 | 2;         // Solutions 7 项建议 2 列
};

type SectionHeader = {
  kicker?: string;         // 可选 mono kicker；不要每区都有
  title: string;           // h2，可见
  description?: string;    // 21px / --ink2
  align?: 'left' | 'center';
  labelTab?: string;       // 面板上沿的装饰标签；不可点击
};

type FeaturePanel = {
  id: string;
  tab: string;
  claim: string;           // h3
  bullets: { lead: string; text: string }[];
  files: { file: string; code: string; highlight?: number[] }[];
  mock?: 'chat' | 'thread' | 'console';
};

type FaqItem = { question: string; answer: string; defaultOpen?: boolean };

type ResourceCard = {
  type: 'blog' | 'doc' | 'template' | 'research';
  title: string;
  description: string;
  date?: string;           // mono / ISO
  href: string;
  external?: boolean;
};

type PostCard = {
  title: string;
  description: string;
  category: string;
  author: { name: string; avatar?: string };
  date: string;
  readingTime: string;
  href: string;
};

type ComparisonRow = {
  label: string;
  values: Array<
    | { kind: 'text'; value: string }
    | { kind: 'status'; value: 'available' | 'planned' | 'registry' | 'not-planned' }
  >;
};
```

#### 6.3 验收清单（可执行）

**Token / 材质**

- [ ] 全站颜色只来自 Oribos 13 色槽；无 Mastra 色值、无第二套灰阶。
- [ ] 字号只来自 8 档 `--t-*`；新增 54/68/22/17/14.5 等 Mastra 字号即失败。
- [ ] 字重只用 400/600；不出现 423/450/470/520/550。
- [ ] 圆角为 0；边框 1px `--line`；无 `box-shadow`、无渐变、无 backdrop-filter（header 的 `prefers-reduced-transparency` 例外按现有实现）。
- [ ] 容器 1200、4/12 栏、16/32 gutter；24px 纵向节奏；区距 96/144。

**主题 / 对比度**

- [ ] 营销站随 `prefers-color-scheme`，无 `.dark` class、无 localStorage；文档站保留 ThemeSelect auto。
- [ ] 26 项营销 AA + 16 项 docs AA 全绿；`--ink3` 只出现在装饰 mono meta，不用于链接/正文。
- [ ] 任何图片/ mock 上的文字有实底或足够 scrim；不靠灰度照片保证对比。
- [ ] `theme-color` = 当前主题 `--bg` 解析值。

**交互 / 可访问性**

- [ ] 每页有 skip link，跳至 `#main`，键盘可见。
- [ ] 所有交互元素有 `:focus-visible` 2px `--acc`、offset 2px；不出现 `outline:none` 无替代。
- [ ] Tabs：`role=tablist/tab/tabpanel`、`aria-selected`、`aria-controls`、roving tabindex、Arrow/Home/End。
- [ ] Mega menu：`aria-expanded`/`aria-controls`；Esc 关闭并回焦 trigger；外点关闭；打开一个关闭同级。
- [ ] FAQ：`<details>/<summary>`，无 JS 可开合；问题为 heading；答案可读。
- [ ] 代码块：文件名可见；copy 有 `aria-label`；复制内容 = 可见文件；`pre tabindex=0`；横向滚动不撑破布局。
- [ ] 表格：`<table>` + `<caption>`（可 sr-only）+ `scope="col"`；移动端滚动容器可聚焦。
- [ ] 无 hover-only 信息；所有 hover 效果有 focus 对应。
- [ ] `prefers-reduced-motion` 全局兜底；无跑马灯、无自动轮播、无位移/缩放。

**响应式**

- [ ] 320/390/768/1024/1440 无水平滚动；长代码/长 URL 可换行或滚动。
- [ ] 导航在选定断点不拥挤；移动菜单可滚动、可关闭、焦点不逃逸。
- [ ] 卡片网格在 768 从 3 列变 1 列（或 2 列，按内容）；不出现 576px 固定最小高造成的空白。
- [ ] Docs 三栏在 1024 不挤；窄屏侧栏/TOC 折叠。

**内容 / 产品口径**

- [ ] 无客户 logo、无人物故事、无 testimonial；事实带只写已批准架构事实。
- [ ] Platform / Studio / Agent Builder 只用 `Planned` 状态卡，不建完整产品页/假截图。
- [ ] MCP Registry 只出现在资源/文档，不作为独立产品导航项。
- [ ] 无 AI Gateway 页面/导航。
- [ ] 无定价页；如做状态矩阵，不出现价格。
- [ ] Final CTA 复用 `AgentPromptCta`；不新造第二种 agent prompt 形态。

### 7. 下游未决项（需要别的票拍板）

1. **单站 token 真相源**：marketing 的 `--*` 与 docs 的 `--sl-*` 如何合并/继承？是保留两套语义层，还是 docs 直接消费 marketing token？Mastra 自己也没统一（`#080808` vs `#020202`），不能作为答案。
2. **Docs 字体**：是否把 `--sl-font` 从系统栈换成自托管 InterVar，以消除 marketing/docs 的字体接缝？这会动 docs 的 brand-visual §3.2 与覆盖数 0 的边界。
3. **Docs 主题切换**：营销 OS-only、docs auto+toggle 是否保留？如果保留，跨面主题跳变是否可接受？
4. **导航规模与断点**：新站 header 是 2 组（Product/Solutions）+ Resources + Docs，还是 3 组？如果 3 组，断点应从 768 提到 1024，并决定是否全屏移动菜单。
5. **博客作者/头像**：Oribos 只有 GitHub handle（`CONTEXT.md` 的维护者署名），没有作者头像；博客卡是否保留头像位？建议用 mono handle/日期，不做头像。
6. **功能性红色**：如果 observability/trace mock 需要错误态，是否新增 `--trace-red`？它不能成为品牌色，必须限定在 mock/图表并单独审计。
7. **Section label tab 的使用范围**：只在 FAQ/Resources 使用，还是每个 H2 区都用？用多了会变成 Mastra 的“标签噪音”；建议只在“面板型”区块用。
8. **公告条**：首发是否需要公告？如果没有真实公告，不做；不要用占位公告。

---

## 来源清单

### Mastra 页面（2026-10-20 抓取）

- 首页：https://mastra.ai/
- Framework 产品页：https://mastra.ai/ai-agent-framework
- Solutions 示例：https://mastra.ai/developer-infrastructure
- Pricing：https://mastra.ai/pricing
- Blog 索引：https://mastra.ai/blog
- Blog 文章：https://mastra.ai/blog/agent-memory-guide
- Docs：https://mastra.ai/docs/agents/overview
- Customers：https://mastra.ai/customers
- Sitemap 索引：https://mastra.ai/sitemap.xml
- Sitemap（pages）：https://mastra.ai/sitemaps/pages.xml

### Mastra CSS

- 全局 token / `@theme` / prose / table：https://mastra.ai/_next/static/immutable/chunks/1as2jdn401-n2.css
- Section / product hero：https://mastra.ai/_next/static/immutable/chunks/2a1kg4-oqt4cr.css
- Header / announcement / mega menu：https://mastra.ai/_next/static/immutable/chunks/1_--kn-lmf7z7.css
- FAQ：https://mastra.ai/_next/static/immutable/chunks/164goi-shwi7k.css
- Card grid：https://mastra.ai/_next/static/immutable/chunks/20jnp59j0wiah.css
- Blog code / prose：https://mastra.ai/_next/static/immutable/chunks/0nb2aci6nyrsy.css
- Pricing card：https://mastra.ai/_next/static/immutable/chunks/30agtboqrg1qd.css
- Fonts（Greed / Commit Mono / Orbitron）：https://mastra.ai/_next/static/immutable/chunks/3gb0tb3v514tx.css
- Docs theme：https://mastra.ai/assets/css/styles.d5e328f2.css

### Oribos 本地仓库

- 营销站 token / 布局 / 按钮 / 代码块：`../oribos-website/src/styles/global.css`（颜色 `:36`，暗色 `:72`，`.wrap` `:165`，`.cols` `:178`，`.box` `:193`，`.btn-primary` `:214`，`.astro-code` `:237`）
- 营销站视觉/交互规范：`../oribos-website/docs/SPEC-revamp.md`（§2.1 `:33`、§2.2 `:77`、§2.3 `:84`、§2.4 `:100`、§2.5 `:107`、§2.6 `:113`、§2.7 `:121`、§2.9 `:133`、§2.10 `:139`、§3.1 `:163`、§3.2 `:171`、§3.3 `:185`、§3.5 `:195`、§3.6 `:200`、§3.7 `:213`、§3.8 `:217`、§4.3 `:244`）
- 营销站 token 契约与 AA：`../oribos-website/src/lib/brand-tokens.ts`
- trace 绿别名：`../oribos-website/src/styles/trace-ink.css`（`--trace-green: var(--syn-green)`）
- Header：`../oribos-website/src/components/Header.astro`
- Feature tabs：`../oribos-website/src/components/FeatureTabs.astro`
- Code tabs：`../oribos-website/src/components/CodeTabs.astro`
- FAQ：`../oribos-website/src/components/FaqList.astro`
- Use-case cards：`../oribos-website/src/components/UseCaseCards.astro`
- Footer：`../oribos-website/src/components/Footer.astro`
- Hero：`../oribos-website/src/components/Hero.astro`
- Agent prompt chip：`../oribos-website/src/components/AgentPromptCta.astro`
- 术语（用例页/场景卡/事实带/agent prompt CTA）：`../oribos-website/CONTEXT.md`
- 框架仓（仅产品口径/术语参照，无站点视觉层）：`../oribos-framework/CONTEXT.md`、`../oribos-framework/README.md`
- Docs token（暗/亮 HSL）：`../oribos-docs/src/styles/global.css`（暗 `:19`，亮 `:32`）
- Docs 品牌规范：`../oribos-docs/docs/spec/brand-visual.md`（§2.1 `:19`、§2.2 `:28`、§3.2 `:87`、§3.3 `:93`、§4 `:105`、§5 `:117`）
- Docs IA / 单车道：`../oribos-docs/docs/spec/ia.md`（§1 `:10`、§4 `:51`）
- Docs Starlight 配置：`../oribos-docs/astro.config.mjs`
- Docs 主题定制边界：`../oribos-docs/docs/adr/0003-theme-customization-boundary.md`

### 方法与限制

- 截图条件：桌面 1440×900、移动 393×852（iPhone 14 Pro 档）；截图仅用于核对布局/状态，不随报告入库。
- Mastra 的 CSS chunk 哈希、类名、页面内容会随构建变化；本报告以选择器、token 名和页面 URL 为长期引用，哈希只用于本次复核。
- Mastra 的 Login/Sign Up 等 header CTA 由客户端渲染，服务端 HTML 与截图不完全一致；涉及它们的结论均以截图为准并标注。
- 对比度数值由 CSS 十六进制值按 WCAG 2.1 公式计算；未对图片/半透明叠层做像素级采样，相关项按“风险”而非“确定失败”记录。
- Oribos 的 26 项/16 项 AA 数值来自 `brand-tokens.ts` 与其测试（`[L10]`、`[L11]`），不是本次重算；本次只重算了 Mastra 的对照值。
