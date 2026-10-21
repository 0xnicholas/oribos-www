# 品牌资产与 wordmark 规格

> 票：[品牌资产与 wordmark 规格](https://github.com/0xnicholas/oribos-www/issues/21)
> 上游：[设计系统与组件规格（B · 仪器）](https://github.com/0xnicholas/oribos-www/issues/20)
> 边界：本文只定义品牌资产、占位形态与验收点；站点实现已由 [技术栈与仓库形态](https://github.com/0xnicholas/oribos-www/issues/13) 裁决（Astro 7 + Starlight；OG 构建期生成见 `docs/spec/stack.md` §8），装配验收归 [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16)，域名/主机已由 [域名、托管与备案基线](https://github.com/0xnicholas/oribos-www/issues/18) provisional 搁置。

---

## 0. 决策摘要

| # | 决策 |
|---|---|
| 1 | 首发 wordmark 是**文字位** `Oribos`：不造独立 mark、不做锁定图形、首发不产 `wordmark.svg`。 |
| 2 | Header 23px / 600 / `-0.03em`，移动 21px；footer 21px / 600；24×24 mark 槽留空。 |
| 3 | Favicon 用 graphite/orange 的 **O tile 占位**，不是品牌 mark；SVG 亮暗双态 + PNG 回退 + 180 apple-touch。 |
| 4 | OG/social 只有 **1200×630 暗色模板**；默认卡 + 逐页生成；不做方形或亮色变体。 |
| 5 | 字体只自托管 **InterVar Latin 48,256 B**（OFL 1.1）+ 系统 mono；只用 400 / 600；`font-display: swap`；单文件 preload。 |
| 6 | 图标只用 **inline SVG**：16 / 20 / 24，1.5px stroke，`currentColor`；无 icon font、sprite、社交图标墙。 |
| 7 | 资产单一真相源：token 从 `tokens.css`、品牌文案从 `BRAND`；favicon 是唯一硬编码 hex 的资产，构建期校验。 |
| 8 | 不复用旧站 favicon / `og.png` / amber 品牌资产；旧站只作迁移来源。 |

---

## 1. 范围与上游约束

- **目标**：给实施者一套可直接产出资产的规格，不产出站点代码。
- **上游已定**：主题、token、字阶、布局、图标基本规则、wordmark 尺寸与 clear space（#20）；首页 H1 / meta / eyebrow（#10）；OG 字段契约（#19）；English-only（#15）；`SITE_ORIGIN` 占位（#18）。
- **本文新增**：wordmark 用法边界、favicon 占位形态、OG 模板与产出方式、字体核验、占位资产清单、验收点。
- **不做**：自绘 logo、品牌手册、营销物料、PWA 图标、社交平台专属图、站点实现。

---

## 2. Wordmark

### 2.1 形态

- 文字 `Oribos`：`O` 大写，其余小写。不写 `ORIBOS`、`oribos`、`Oribos™`。
- 不造独立 mark / 缩写 / 图形 lockup；不复用旧站 wordmark、trace-ink 字形或 amber 品牌皮肤。
- 通过 live text（InterVar）渲染，不产 `wordmark.svg`。需要导出独立资产时，从同一字体轮廓生成，不手绘、不改字形。
- 可选 24×24 mark 槽首发**留空**：不放 favicon、占位圆点或任何图形。favicon 的 O tile 不是 mark，不得回填到 header。

### 2.2 尺寸、位置与间距

| 位置 | 字号 / 行高 | 字重 | 字距 | 颜色 |
|---|---|---:|---:|---|
| Header ≥1024 | 23 / 28 | 600 | `-0.03em` | `--text-1` |
| Header <1024 | 21 / 28 | 600 | `-0.03em` | `--text-1` |
| Footer | 21 / 28 | 600 | `-0.03em` | `--text-1` |
| OG card | 23 / 28 | 600 | `-0.03em` | `--text-1`（暗色卡） |

- Header：左侧；wordmark 链到 `/`；可选的 24×24 mark 槽与文字 gap 8；clear space 四周 ≥12px。
- Footer：wordmark 21/600；与一行描述 13/20 `--text-3` 间距 8；不做 wordmark + tagline 锁定组合。
- OG：只放小号 wordmark；大字号留给 title，不复用旧站 OG 的 89px wordmark。
- **最小宽 96px 的适用范围**：这是**独立资产**的最小渲染宽度，不是 header 文字位的宽度。header 文字位按 23 / 21px 字号，字面宽度约 72 / 66px；加四周 12px clear space 后约 96 / 90px 占位。不要为了凑 96px 把 header 文字放大。
- 禁止压缩、拉伸、描边、加阴影、渐变字、发光字；header 文字不转曲；独立资产导出时可用同一字体轮廓转曲，但不改字形、不手动调整字距。
- Wordmark 字距固定 `-0.03em`；不要套用标题的 `-0.025em`。

### 2.3 与 mono 标签的关系

- Wordmark 是 header 里唯一用 Inter 600 的品牌元素；mono 标签是元数据，始终大写，11/16 或 12/20，tracking `.08em`，`--text-3`。
- 不把 wordmark 排成 mono；也不把 mono 标签排成 Inter 600 来替代 wordmark。
- Header 不在 wordmark 旁放版本 pill。版本只出现在 hero eyebrow（`OPEN SOURCE · v0.9.0`）与 OG 卡右上角。
- Wordmark 与相邻 mono 标签之间至少 24px，或用 1px hairline 分隔；不做 `Oribos / DOCS` 这类斜杠锁定。
- 正文里 `Oribos` 是专有名词；包名、URL、scope 用小写 `oribos`（如 `@oribos/core`）。

### 2.4 颜色与对比

- 在普通表面：`--text-1`。
- 在 accent 实心底上：`--accent-inv`。
- 不用 accent 色 wordmark 压普通表面；不用白字压 paper。
- Wordmark 是文字，按 4.5:1 验收。`--text-1` / `--surface-0` 亮 16.76、暗 17.53（#20 §9.1）。

---

## 3. Favicon

### 3.1 形态与几何

- 32×32 正方 tile，0 radius；graphite / paper 底 + 几何 O 环。
- **这是占位浏览器图标，不是品牌 mark**：不得放进 header、OG、营销图或作为装饰符号复用。
- 几何：`viewBox="0 0 32 32"`；满幅 `rect`；`circle cx=16 cy=16 r=8`；`stroke-width=5`；`fill=none`。
- 缩放后的实际尺寸：

| 渲染尺寸 | Tile | O 外径 | O 内孔 | Stroke | 四周留白 |
|---:|---:|---:|---:|---:|---:|
| 16×16 | 16 | 10.5 | 5.5 | 2.5 | 2.75 |
| 32×32 | 32 | 21 | 11 | 5 | 5.5 |
| 180×180 | 180 | 118.1 | 61.9 | 28.1 | 30.9 |

- 不加内阴影、渐变、描边、圆角。iOS 对 apple-touch-icon 自己加圆角遮罩，源文件保持直角，不预圆。
- 16px 下 O 的 stroke 为 2.5px，内孔 5.5px，足够辨认；不得把 16px 版本再缩小或加细线。

### 3.2 亮暗值

| 主题 | Tile | O | 对比度 | 说明 |
|---|---|---|---:|---|
| 暗色 / 默认 | `#111111`（`--surface-1`） | `#ff7a4d`（`--accent`） | 7.32 | SVG 基态；也是 PNG 回退色 |
| 亮色 | `#f7f5f1`（`--surface-0`） | `#d94f2b`（`--accent`） | 3.78 | SVG 媒体查询切换；图形 ≥3:1 |

- SVG 基态是暗色；`@media (prefers-color-scheme: light)` 切到亮色。不支持媒体查询的浏览器落暗色，可接受。
- Favicon 跟随 OS / 浏览器 chrome，不跟站内 `oribos-theme` 手动 toggle；不要用 JS 同步。
- 亮色 O 用 `--accent`，不用 `--accent-text` `#a8371b`；后者是亮色小字，不是图形色。
- 暗色 tile 用 `--surface-1` 而不是 `--surface-0`，避免在深色浏览器 chrome 上完全消失；亮色 tile 用 `--surface-0` 已足够与浅色 chrome 区分。

### 3.3 文件与 `<link>`

| 文件 | 规格 | 主题 |
|---|---|---|
| `public/favicon.svg` | 32×32 viewBox，SVG | 亮暗媒体查询 |
| `public/favicon-32.png` | 32×32，PNG，RGB，无 alpha | 暗色 |
| `public/favicon-16.png` | 16×16，PNG，RGB，无 alpha | 暗色 |
| `public/apple-touch-icon.png` | 180×180，PNG，RGB，无 alpha | 暗色 |

- 不产 `favicon.ico`；不产 `manifest.webmanifest`、192/512 PWA 图标、`mask-icon`。目标浏览器用 SVG + PNG 回退足够。
- 不放 `shortcut icon` 重复项；不动 favicon URL 的 query string。

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
```

### 3.4 参考源（placeholder，不是最终 logo）

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <title>Oribos</title>
  <style>
    .tile { fill: #111111; }
    .o { fill: none; stroke: #ff7a4d; stroke-width: 5; }
    @media (prefers-color-scheme: light) {
      .tile { fill: #f7f5f1; }
      .o { stroke: #d94f2b; }
    }
  </style>
  <rect class="tile" fill="#111111" width="32" height="32"/>
  <circle class="o" fill="none" stroke="#ff7a4d" stroke-width="5" cx="16" cy="16" r="8"/>
</svg>
```

- 这是占位资产的精确源；替换时保持 32×32、0 radius、同一组文件路径。
- favicon 是唯一硬编码 hex 的资产（外链 SVG 不能可靠读取页面 CSS 变量）；构建期用 token 值校验这四个 hex（暗 `--surface-1`、暗 `--accent`、亮 `--surface-0`、亮 `--accent`）。
- 不得与旧站 favicon 字节相同（旧站 marketing 865 B、docs 849 B）；禁用旧 amber `#9e630a` / `#ea9f2e`。

---

## 4. OG / social card

### 4.1 契约

- 一张模板：**1200×630 PNG，RGB，无 alpha，sRGB，≤200 KB**。
- 只做暗色卡；不做亮色、方形、竖版或平台专属变体。
- 默认卡 `/og.png`；逐页卡 `/og/<slug>.png`；缺失时回退默认卡。
- `og:image` 用 `SITE_ORIGIN` 拼绝对 URL；同时输出 `og:image:width=1200`、`og:image:height=630`、`og:image:type=image/png`、`og:image:alt`。
- `og:image:alt`：默认 `Oribos — Compose AI agents`；逐页 `Oribos — <ogTitle>`。
- `og:title`、`og:description`、`og:url`、`og:site_name` 按 #19；`og:site_name=Oribos`；`og:locale=en_US`（#15）。
- `og:type`：营销页 `website`；docs 的 `article` 由 #12 / #16 决定，本模板不区分。
- 本票不裁决 `twitter:*`。OG 卡按 `summary_large_image` 的 1.91:1 比例设计；若 #16 允许，可直接复用；若全站禁，则不输出任何 `twitter:*`。

### 4.2 版式

固定画布 1200×630，四周 36px 1px 发丝框；内容相对画布左右 96px、上 72px、下 64px。中间块在 top bar 与 footer 之间垂直居中，上下各留 48px 弹性空间。

| 元素 | 规格 |
|---|---|
| 画布 | 1200×630；`--surface-0` 暗 `#0a0a0a` |
| 外框 | inset 36px；1px `--border-hairline` `#2a2a2a`；0 radius |
| 左上 wordmark | `Oribos`；23/28、600、`-0.03em`；`--text-1` `#f2f1ee` |
| 右上 mono meta | mono 12/20；`--text-3` `#8c8c85`；默认 `OPEN SOURCE · v0.9.0`，逐页用 section label |
| Accent bar | 48×4；`--accent` `#ff7a4d`；与 title 间距 24 |
| Title | 67/72、600、`-0.025em`；`--text-1`；最大宽 1008；最多 2 行 |
| Description | 28/36、400；`--text-2` `#b3b1aa`；最大宽 880；最多 3 行；与 title 间距 24 |
| Footer rule | 1px `--border-hairline`；内容宽 1008 |
| Footer 左 | mono 12/20；`--text-3`；`new URL(SITE_ORIGIN).host` |
| Footer 右 | mono 12/20；`--text-3`；`DOCS · TEMPLATES · GITHUB` |
| 安全区 | 所有文字距边 ≥64px；实际左右 96 / 上下 72 / 64 |

- 不放截图、客户 logo、人物照片、图标 mark、渐变、阴影、圆角、背景图或装饰纹样。
- Title 超过 2 行时降到 50/56；仍超过 2 行则用 frontmatter `ogTitle`，不得裁字或压字距。Description 超过 3 行时优先用 `ogDescription`；没有则在词边界截断并加省略号。
- 默认卡文案：
  - Title：`Compose AI agents.`
  - Description：`An open-source agent framework of composable pieces — agents, workflows, memory, and a harness, with zero runtime dependencies in the core.`
  - 右上是 `OPEN SOURCE · v0.9.0`；版本从构建期常量读取，不手写。
- 逐页：
  - `ogTitle = frontmatter.ogTitle ?? page.title`；不含 `— Oribos` 站点后缀。
  - `ogDescription = frontmatter.ogDescription ?? metaDescription`。
  - 右上 section label 用受控词表：`OPEN SOURCE`、`FRAMEWORK`、`PLATFORM`、`SOLUTIONS`、`DOCS`、`TEMPLATES`、`CHANGELOG`、`FDE + SUPPORT`。
  - Slug：路由去掉首尾斜杠、`/` 换 `-`、小写。`/` 用 `/og.png`；`/ai-agent-framework/` 用 `/og/ai-agent-framework.png`；`/docs/get-started/quickstart/` 用 `/og/docs-get-started-quickstart.png`。
- 不可索引 / planned 页面不生成逐页 OG；被分享时回退默认卡。

### 4.3 产出方式

- **参考实现**：HTML/CSS + headless Chromium，`window-size=1200,630`、`device-scale-factor=1`，等 `document.fonts.ready` 后截图。旧站 `scripts/make-og.mjs` 只作为流程参考，不复用它的 amber 配色、89px wordmark 或文案。
- **备选**：SVG 模板 + `sharp` / `resvg` 栅格化；同一字体文件与同一 token。
- 模板必须从 `tokens.css` 读颜色、从 `BRAND` 读文案，不硬编码 hex / 文案 / 版本 / 域名。
- 只读暗色 token；OG 卡不跟 `oribos-theme` / `prefers-color-scheme` 切换。
- 确定性：同一输入生成同一 PNG；不加日期戳、随机数、构建时间水印。
- 输出后断言 PNG 尺寸 1200×630、颜色类型 RGB、体积 ≤200 KB；参考渲染约 50 KB。
- 逐页生成已由 #13 定为构建期生成（见 `docs/spec/stack.md` §8）；默认卡是静态资产。逐页未就绪时，所有页面先用 `/og.png`。

---

## 5. 字体

### 5.1 文件与授权

| 项 | 值 |
|---|---|
| 文件 | `/fonts/inter-latin-wght-normal.woff2` |
| 大小 | 48,256 B |
| SHA-256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |
| 字体 | Inter 4.001；`wght` 100–900；Latin subset；230 glyphs |
| 授权 | SIL Open Font License 1.1 |
| 授权文件 | `/fonts/inter-OFL.txt`；4,380 B；SHA-256 `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a` |
| 来源 | Fontsource variable Inter；原型分支 `prototype/visual-direction` 的 `fonts/` |

- 保留 OFL 版权声明；不改名、不修改字形。若 #13 重新 subset，衍生字体仍须 OFL，更新文件 hash 与授权说明，不能使用保留名称。
- 不引 Google Fonts、不引外域 CDN、不 `@import`、不装第二套 sans。
- 系统 mono 是首发选择：`ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace`。不为 mono 下载字体。
- 若 QA 发现 macOS / Windows 的代码换行差异影响可读性，另开 mono 票；不在首发临时换字体。

### 5.2 `@font-face` 与 preload

```css
@font-face {
  font-family: "InterVar";
  src: url("/fonts/inter-latin-wght-normal.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

```html
<link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
```

- 只 preload 这一个字体文件；`crossorigin` 即使同源也要写。
- 只使用 400 / 600；`font-synthesis: none`；不用 500 / 450 / 520；不用 `font-stretch`；不用 fluid `clamp()`。
- `--font-sans: "InterVar", system-ui, -apple-system, "Segoe UI", sans-serif`；`--font-mono` 用系统栈。
- docs 通过 `--sl-font` / `--sl-font-mono` 映射同一组 token，不产生 marketing / docs 字体接缝。
- 不写 `unicode-range`；这个文件本身就是 Latin subset，缺字自动落系统栈。若未来换多子集，再按子集拆 `unicode-range`。
- **缺字说明**：Inter 4.001 Latin subset 不含箭头（`→ ← ↑ ↓`）、`≤`、`≥`。这些字符落 `system-ui`，不额外引字体。UI 链接尾箭头统一用 16px inline SVG（见 §6.1）；正文里的数学符号若必须精确，也用 SVG 或改写文案。
- Latin subset 覆盖 `— – · × “ ” ‘ ’ … ° © ® ™ € £ ¥`；站点英文文案不得依赖未覆盖字符。
- English-only：不引 CJK 字体栈；构建期对 `src/content` 与页面文案跑 CJK grep。

### 5.3 加载与性能

- 48 KB 单文件 preload；`font-display: swap`；不用 `optional`。
- 不引第二套字体；不为 favicon / OG 额外加载字体（OG 渲染器内嵌同一文件）。
- CLS 与 LCP 预算由 #16 验收；本票不新增 metric override。若实测 CLS 超预算，再评估 fallback metrics，不临时换字体。
- 所有字体请求 same-origin；无外域请求。

---

## 6. 图标与图形语言

### 6.1 图标

- 只用 inline SVG；不引 icon font、外域 sprite、SVG `<use>` 跨文件雪碧图。
- 母版 24×24；渲染尺寸 16 / 20 / 24；stroke 1.5px；`currentColor`；默认 `fill="none"`。
- 16 / 20 尺寸要么单独绘制，要么用 `vector-effect="non-scaling-stroke"` 保持 1.5px；不得把 16px 图标直接放大到 24px。
- 水平/垂直线落在整数坐标；不用 2px+ stroke；不用圆角矩形底、渐变、阴影、双色、发光。
- `stroke-linecap="round"`、`stroke-linejoin="round"`；同一组图标保持一致。
- 装饰图标 `aria-hidden="true"`；有语义的图标带 `aria-label` 或可见文字。
- GitHub 以文字链为主；不用社交图标墙。若用图标，必须带可见文字或 `aria-label`。
- 图标只用于识别与操作（theme toggle、menu、copy、external link 等），不做装饰纹样、不做功能图标墙。
- UI 链接尾箭头用 16px inline SVG（1.5px stroke、`currentColor`、`aria-hidden`），不用 `→` 字符：Inter Latin subset 不含箭头，字符会落系统栈。设计系统 §8.5 的 `→` 视为占位写法，位置与语义不变。
- Favicon 的 O tile 不是图标系统的一部分；不得复用到按钮、列表或空状态。

### 6.2 图形语言

- 参考架构图用 inline SVG / HTML：1px stroke、token 颜色、0 radius、无渐变、无阴影。
- 截图只来自可运行 example 或实测；1px `--border-hairline` 包边；0 radius；不加阴影、倾斜、背景光。
- 不用 stock photo、人物照片、客户 logo、证言墙、客户故事。
- 图表只允许 trace 组件与文档表格；不引通用 chart library。
- 任何图表的数字必须有来源与日期；没有来源就不放图。

---

## 7. 占位资产清单

### 7.1 必须存在的静态文件

| 路径 | 规格 | 主题 | 产出 |
|---|---|---|---|
| `public/favicon.svg` | 32×32 viewBox，SVG，≤2 KB | 亮暗媒体查询 | §3.4 源 |
| `public/favicon-32.png` | 32×32，PNG RGB，无 alpha | 暗色 | 由 SVG 栅格化 |
| `public/favicon-16.png` | 16×16，PNG RGB，无 alpha | 暗色 | 由 SVG 栅格化 |
| `public/apple-touch-icon.png` | 180×180，PNG RGB，无 alpha | 暗色 | 由 SVG 栅格化 |
| `public/og.png` | 1200×630，PNG RGB，≤200 KB | 暗色 | §4 模板 |
| `public/fonts/inter-latin-wght-normal.woff2` | 48,256 B，WOFF2 | — | 原型分支复制 |
| `public/fonts/inter-OFL.txt` | 4,380 B，OFL 1.1 | — | 原型分支复制 |

### 7.2 构建期生成

| 路径 | 规格 | 说明 |
|---|---|---|
| `public/og/<slug>.png` | 1200×630，PNG RGB，≤200 KB | 逐页；缺失回退 `/og.png` |

### 7.3 品牌文案单一真相源

实现时放在一个 `BRAND` 模块（路径由 #13 定）；header、footer、`<title>`、OG、JSON-LD 共用：

| 键 | 值 |
|---|---|
| `wordmark` | `Oribos` |
| `defaultTitle` | `Oribos — Compose AI agents` |
| `defaultDescription` | `An open-source agent framework of composable pieces — agents, workflows, memory, and a harness, with zero runtime dependencies in the core.` |
| `ogAlt` | `Oribos — Compose AI agents` |
| `ogFooter` | `DOCS · TEMPLATES · GITHUB` |

- 版本不写进 `BRAND` 的静态字符串；从构建期版本常量读取。
- 域名不写进 `BRAND`；从 `SITE_ORIGIN` 读取。

### 7.4 明确不产

- 首发不产 `wordmark.svg`，也不做独立 logo / mark / 品牌图形；后续若需要独立资产，从同一字体轮廓生成，不手绘。
- icon font、图标 sprite、社交图标包。
- `favicon.ico`、PWA manifest、192/512 图标、`mask-icon`。
- 方形 / 竖版 / 亮色 OG、平台专属 OG、逐页 OG 的手工副本。
- Twitter/X 专属卡；是否输出 `twitter:*` 由 #16 定。
- 品牌手册、字体二次设计、营销物料。

---

## 8. 产出方式与单一真相源

- **Favicon**：手写 SVG；PNG 用确定性 SVG→PNG 渲染器（`sharp` / `resvg` / `rsvg-convert` 任一）按 16 / 32 / 180 精确输出；断言尺寸与 RGB。不要用带浏览器边距的截图。
- **OG**：HTML/CSS + headless Chromium 参考实现，或 SVG + `sharp` / `resvg`；等字体 ready；断言 1200×630、RGB、≤200 KB。
- **字体**：从 `prototype/visual-direction` 的 `fonts/` 复制；校验 SHA-256；保留 OFL。
- **Token**：颜色从 `tokens.css` 读；不在资产里重复 token。favicon 是唯一例外，构建期比对四个 hex。
- **文案**：从 `BRAND` 读；OG 模板不硬编码标题、描述、版本、域名。
- **替换安全**：占位资产替换为最终资产时，文件路径、尺寸、布局、token 不变；不得改 header 尺寸或 OG 版式。

---

## 9. 验收点

### A. Wordmark

- [ ] Header 文字精确为 `Oribos`；桌面 23/28/600/`-0.03em`，移动 21/28/600/`-0.03em`。
- [ ] Footer 21/28/600/`-0.03em`；与描述间距 8。
- [ ] 24×24 mark 槽为空；没有把 favicon 或任何图形放进 header。
- [ ] 没有 `ORIBOS`、`oribos`、`Oribos™`、旧站 wordmark、trace-ink 字形。
- [ ] 没有渐变、描边、阴影、拉伸、压缩；没有 `-0.025em` 误用到 wordmark。
- [ ] Clear space ≥12px；独立资产导出时最小宽 96px；header 文字不被放大到 96px。
- [ ] 普通表面用 `--text-1`；accent 实心底用 `--accent-inv`；对比 ≥4.5:1。
- [ ] Wordmark 未排成 mono；mono 标签未排成 Inter 600；wordmark 与 mono 标签间距 ≥24px 或有 1px 分隔线。

### B. 字体

- [ ] 只请求 `/fonts/inter-latin-wght-normal.woff2` 一个字体文件；无 Google Fonts / 外域 CDN / `@import`。
- [ ] 只 preload 这一个文件，`as="font"`、`type="font/woff2"`、`crossorigin`。
- [ ] `@font-face` 的 `font-weight: 100 900`、`font-style: normal`、`font-display: swap`；`font-synthesis: none`。
- [ ] 实际只使用 400 / 600；无 500 / 450 / 520；无 `font-stretch`；无 `clamp()`。
- [ ] 字体文件 48,256 B、SHA-256 匹配；OFL 文件 4,380 B、SHA-256 匹配，`/fonts/inter-OFL.txt` 返回 200。
- [ ] 英文文案不依赖箭头 / `≤` / `≥`；这些字符落 `system-ui`，UI 链接尾箭头改用 inline SVG，不额外引字体。
- [ ] docs 与 marketing 使用同一 `--font-sans` / `--font-mono`；无字体接缝。
- [ ] 构建期 CJK grep 通过；无 CJK 字体栈。

### C. 图标

- [ ] 所有图标是 inline SVG；无 icon font、外域 sprite、跨文件 `<use>`。
- [ ] 尺寸只用 16 / 20 / 24；stroke 1.5px；`currentColor`；默认无 fill。
- [ ] 16 / 20 版本没有把 24px 母版直接缩放导致 stroke 变细；或使用 `non-scaling-stroke`。
- [ ] 无 2px+ stroke、圆角矩形底、渐变、阴影、双色、发光。
- [ ] 装饰图标 `aria-hidden="true"`；语义图标有 `aria-label` 或可见文字。
- [ ] UI 链接尾箭头是 16px inline SVG，不是 `→` 字符。
- [ ] 无社交图标墙；GitHub 是文字链或带可见文字的图标。
- [ ] Favicon 的 O tile 未复用到任何 UI 位置。

### D. Favicon

- [ ] `/favicon.svg` 200，`Content-Type: image/svg+xml`；SVG 可解析，`<title>Oribos</title>`。
- [ ] `/favicon-32.png`、`/favicon-16.png`、`/apple-touch-icon.png` 均 200；尺寸分别为 32 / 16 / 180；PNG RGB、无 alpha。
- [ ] 16px 下 O 的 stroke ≥2px，内孔可见；32px 下比例一致；无模糊、无锯齿边。
- [ ] 暗色 tile `#111111` + O `#ff7a4d`；亮色 tile `#f7f5f1` + O `#d94f2b`；对比度 ≥3:1。
- [ ] SVG 亮暗媒体查询在 Chrome / Firefox 生效；Safari 落暗色可接受。
- [ ] 不与旧站 favicon 字节相同；不含旧 amber `#9e630a` / `#ea9f2e`。
- [ ] `<link>` 顺序与 §3.3 一致；无 `shortcut icon` 重复项；无 query string。
- [ ] Favicon 不跟站内主题 toggle 同步。

### E. OG / social

- [ ] `/og.png` 200，`Content-Type: image/png`；1200×630；RGB；≤200 KB。
- [ ] 外框 36px、1px `#2a2a2a`；内容左右 96 / 上 72 / 下 64；所有文字在 64px 安全区内。
- [ ] Wordmark 23/28/600；title 67/72/600（超长降 50/56）；description 28/36/400；右上与 footer mono 12/20。
- [ ] Accent bar 48×4 `#ff7a4d`；footer rule 1px `#2a2a2a`；无渐变、阴影、圆角、截图、客户 logo、图标 mark。
- [ ] 默认卡文案与 §4.2 一致；版本来自构建常量；footer 主机来自 `SITE_ORIGIN`，不是硬编码。
- [ ] 逐页卡使用 `ogTitle` / `ogDescription`；超长不裁字、不压字距；缺失回退默认卡。
- [ ] 每页 `og:image` 是绝对 URL、200、有 width/height/type/alt；`og:image:alt` 为 `Oribos — <ogTitle>`。
- [ ] `og:title` / `og:description` / `og:url` / `og:site_name=Oribos` / `og:locale=en_US` 齐全。
- [ ] 未擅自输出 `twitter:*`；若 #16 允许，同一张卡可作 `summary_large_image`。
- [ ] 逐页 OG 的 slug 规则与 §4.2 一致；不生成 planned / noindex 页的逐页卡。

### F. 跨项

- [ ] 字体、图标、图片、favicon、OG 全部 same-origin；无外域请求。
- [ ] `theme-color` 暗 `#0a0a0a`、亮 `#f7f5f1`，与 #20 一致；toggle 时更新为当前表面色。
- [ ] `BRAND` 是 wordmark / 默认标题 / 默认描述 / OG alt 的唯一来源；页面与 OG 无重复字符串。
- [ ] Token 从 `tokens.css` 读；favicon 四个 hex 在构建期与 token 比对。
- [ ] 新资产与旧站 `favicon.svg`（865 / 849 B）、`og.png`（45,479 / 27,061 B）字节不同。
- [ ] 旧站 URL 不再返回旧 amber favicon / OG；切流后 `/favicon.svg`、`/og.png` 已是新资产或明确 404/301。
- [ ] 替换占位资产后，header 尺寸、OG 版式、文件路径、token 均不变。

---

## 10. 依赖与未决

| 项 | 归属 | 对本规格的影响 |
|---|---|---|
| 仓库目录、渲染器、逐页 OG 生成、搜索 | #13（已关闭） | 已定：Astro 7 + Starlight 单包单应用；`public/` 路径、构建期 OG、Pagefind 单索引见 `docs/spec/stack.md` §5 / §8；资产契约不变 |
| 交接验收、CLS / LCP、`twitter:*` 策略 | #16 | 把本文验收点并入总清单；Twitter 策略单独裁决 |
| `SITE_ORIGIN`、主机、缓存、headers | #18 | OG 绝对 URL 与 footer 主机；当前用 `SITE_ORIGIN` 占位；切流时确认旧站 favicon / OG 不再被服务 |
| 逐页 OG 的 frontmatter `ogTitle` / `ogDescription` | #13（已关闭）/ #16 | 字段进 marketing block 模型；本模板已定义回退规则；验收归 #16 |
| 系统 mono 换字体 | 另开票 | 首发不换；QA 发现换行问题再立 |
| 自绘 logo / 品牌 mark | 不在本 effort | 首发文字 wordmark + 占位 O tile；自定义锁定图形另立 effort |
| PWA / 方形 OG / 亮色 OG | 不在本 effort | 首发不需要；不预留文件 |

---

## 11. 来源

- [设计系统与组件规格（B · 仪器）](https://github.com/0xnicholas/oribos-www/issues/20)：token、字阶、布局、图标、wordmark 尺寸与 clear space、AA 表。
- [首页叙事与页面结构](https://github.com/0xnicholas/oribos-www/issues/10)：`Compose AI agents.`、`OPEN SOURCE · v0.9.0`、默认 meta description。
- [关键词页与 SEO 落地页集](https://github.com/0xnicholas/oribos-www/issues/19)：OG 字段、`.md` twin、canonical 契约。
- [语言与国际化策略](https://github.com/0xnicholas/oribos-www/issues/15)：English-only、`og:locale=en_US`、CJK 门禁。
- [域名、托管与备案基线](https://github.com/0xnicholas/oribos-www/issues/18)：`SITE_ORIGIN` 占位、`oribos.ai` provisional。
- [SEO、agent surface 与部署基线审计](https://github.com/0xnicholas/oribos-www/issues/7)：favicon 三件套、apple-touch、OG 1200×630、旧站品牌资产不一致。
- [站点事实基线](https://github.com/0xnicholas/oribos-www/issues/17)：0.9.0、19 包、23 examples、zero runtime deps 仅 core。
- 原型分支 `prototype/visual-direction`：InterVar 文件、OFL、B · 仪器 token 与字阶。
- 旧站 `scripts/make-og.mjs`：仅作 HTML/CSS + headless Chromium 的流程参考；旧站 amber 配色、89px wordmark 与 `og.png` 不复用。
