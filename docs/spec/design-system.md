# 设计系统与组件规格（B · 仪器）

> 票：[设计系统与组件规格（B · 仪器）](https://github.com/0xnicholas/oribos-www/issues/20)（wayfinder 地图 [Oribos 官网：Mastra 形态站点规格](https://github.com/0xnicholas/oribos-www/issues/1) 的子票）
> 日期：2026-10-21
> 状态：**decided**。视觉与组件规格的交接物；实现、组件代码、页面内容不在本票。
> 上游：[视觉方向与品牌定义原型](https://github.com/0xnicholas/oribos-www/issues/11)、`docs/research/mastra-visual-audit.md`、`prototype/visual-direction` @ `daf51c0`、`CONTEXT.md`、[关键词页与 SEO 落地页集](https://github.com/0xnicholas/oribos-www/issues/19)、[文档 IA 与内容迁移策略](https://github.com/0xnicholas/oribos-www/issues/12)。
> 边界：技术栈已由 [技术栈与仓库形态](https://github.com/0xnicholas/oribos-www/issues/13) 裁决（Astro 7 + Starlight；见 `docs/spec/stack.md`）；wordmark 资产归 [品牌资产与 wordmark 规格](https://github.com/0xnicholas/oribos-www/issues/21)；页面装配与验收归 [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16)。本文的 docs shell 是框架无关 anatomy，Starlight 映射已启用。

## 0. 决策摘要

| # | 决策 | 结果 |
|---|---|---|
| 1 | 视觉方向 | **B · 仪器**不变；表面改为**中性 graphite / paper**，不再保留原型的绿调 |
| 2 | 主题 | 全站双主题；首次访问跟随 OS（无偏好 → dark）；toggle 覆盖并持久化；marketing 与 docs 同一模型 |
| 3 | Token | primitive + semantic 两层；`tokens.css` 单一真相源；docs 的 `--sl-*` 只做别名，不复制色板 |
| 4 | 形状 | **1px hairline**；0 radius；无 shadow / gradient / blur；2px 只用于 focus ring |
| 5 | 主色 | signal orange 拆 `accent`（图形/大字）、`accent-text`（小字）、`accent-fill`（实心按钮）；亮色小字与按钮自动加深过 AA |
| 6 | 状态色 | success / warning / danger / info 四对，只用于 docs callout 与表单校验，不进 marketing |
| 7 | 字体 | 自托管 InterVar（OFL）+ 系统 mono；8 档字阶 13–89；仅 400/600；无 fluid clamp |
| 8 | 布局 | 1328 容器 / 4px 基数 / 12 栏 / 144 区距；断点 768 / 1024 / 1328；导航 1024 收起 |
| 9 | Header | 去掉 Pricing；`Framework ▾ / Platform (Planned) / FDE + Support ▾ / Solutions ▾ / Resources ▾ / Docs / GitHub`；CTA = Get started + Talk to us |
| 10 | 组件 | 9 个营销组件 + docs shell + 基础 primitives；docs shell 框架无关，附条件性 Starlight slot 表 |
| 11 | 验收 | 33 对文本 × 2 主题 + 非文本 3:1；focus / reduced motion / 无外域请求 / 无横向溢出 / CJK grep / 防 FOUC |
| 12 | Wordmark | 设计系统只定文字位、mark 槽、尺寸与 clear space；#21 定稿为文字位 wordmark（不产独立 SVG），favicon / OG 见 `brand-assets.md` |

### 0.1 与原型的关系

方向不变，**像素契约以本文为准**。原型 `prototype/visual-direction` 是 throwaway，截图是方向证据，不是实现基准。本文相对原型做了四处修正：

1. **表面中性化**：原型 B 的 `#0b0d0c` / `#121614` / `#24302a` / `#f2f5ef` 带绿调，是 B 最初绿色 accent 的残留；本文用中性 graphite / paper。
2. **边框回到 1px**：原型 B 在 window / card / section / docs shell 上多处用 2px；本文统一 1px hairline，2px 只留给 focus ring。
3. **accent 分层**：原型单一 `#d94f2b` 作小字在纸底只有 3.74:1，按钮文字压橙底只有 3.91:1；本文拆图形 / 文字 / 填充三档。
4. **三级文字与控件边框加深**：原型的 `--ink3` / `--line` 在亮色表面低于 4.5:1 / 3:1；本文的 `text-3` 与 `border-strong` 按最暗表面重新取值。

---

## 1. 设计原则

1. **仪器，不是软面板。** graphite 表面、mono 标注、rail 分区、1px 线、0 radius；不借 Mastra 的 30/40px 圆角、2px 厚边、阴影、渐变和 shader。
2. **一个信号色。** signal orange 只承担品牌强调与交互；状态色只在 docs / 表单出现，不能变成第二个品牌色。
3. **结构承担层级。** 用线、留白、字阶和 mono 标注分层；不用 elevation、glow、背景图或动效制造层级。
4. **dark-first，但 light 是完整 alt。** 暗色是作者默认；亮色不是 docs 专属皮肤，而是同一套仪器的 paper 形态。
5. **内容是证据。** 代码块、trace、截图只能来自可运行 example 或实测；不编造指标、客户 logo、证言或人物照片。
6. **可访问性是门，不是加分项。** 所有正文与控件状态过 AA；焦点、键盘、reduced motion、无外域请求都是验收项。

---

## 2. 主题模型

### 2.1 状态与默认

| 项 | 规则 |
|---|---|
| 主题数 | 2：`light` / `dark` |
| 首次访问 | `prefers-color-scheme: light` → light；否则 dark |
| 用户覆盖 | header / docs top bar 的 toggle 写入 `localStorage["oribos-theme"]` |
| 无 JS | 落到 dark（`:root` 的默认 token 是 dark） |
| 跨页 / 跨 tab | 同一 storage key；监听 `storage` 事件同步 |
| `color-scheme` | light 主题 `light`；dark 主题 `dark` |
| `theme-color` | dark `#0a0a0a`；light `#f7f5f1`；toggle 时更新 meta |
| 切换行为 | 即时 token 交换，不做整页 cross-fade；只有控件颜色可有 120ms 过渡 |

### 2.2 防 FOUC

在 `<head>` 中、样式表之前执行：

```html
<script>
  (() => {
    try {
      const stored = localStorage.getItem('oribos-theme');
      const theme = stored === 'light' || stored === 'dark'
        ? stored
        : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.style.colorScheme = 'dark';
    }
  })();
</script>
```

### 2.3 Toggle

- 32×32 icon button，inline SVG（sun / moon），`currentColor`，1.5px stroke。
- `role="switch"`；`aria-checked="true"` 表示当前为 dark，`false` 为 light；`aria-label="Dark theme"`；图标反映当前状态（light 显示 sun，dark 显示 moon）；`title` 与 `aria-label` 一致。
- 键盘可达；Space / Enter 切换。
- docs 使用同一个 toggle 和 storage key；不允许 marketing 与 docs 各自维护主题状态。
- 如果框架自带 theme switch（如 Starlight），保留其 UI 但把 storage key 与 `data-theme` 统一到 `oribos-theme`；做不到时必须在 spec 的装配阶段记录两套 key 的同步策略。

### 2.4 亮色不是纯白

- 亮色表面是 warm paper，不是 `#ffffff`；纯白只用于 `accent-inv` 和必要时的高对比文字。
- 暗色表面是中性 graphite，不是纯黑；`#0a0a0a` 是最深页面底。
- 两套主题的语义 token 名称完全一致，只有值不同。

---

## 3. Token 架构

### 3.1 两层

| 层 | 命名 | 谁用 | 规则 |
|---|---|---|---|
| primitive | `--graphite-*` / `--paper-*` / `--signal-*` / `--status-*` / `--syntax-*` | 只有 `tokens.css` | 可以编码色值家族与步进；组件不得直接引用 |
| semantic | `--surface-*` / `--text-*` / `--border-*` / `--accent-*` / `--focus-*` / `--status-*` / `--syntax-*` | 组件、页面、docs 别名 | 按角色命名，不按色值命名；两套主题同名 |

### 3.2 单一真相源

- 色值只出现在 `tokens.css`；组件 CSS 不写 hex、`rgb()`、`hsl()`。
- 主题只通过 `:root`（dark 默认）与 `[data-theme="light"]` 两块切换；语义 token 在两块中都完整声明，不允许“只覆盖差异”的残缺主题。
- docs 的 `--sl-*` 只做别名；不允许 docs 另建一份色板。
- 如果选 Tailwind，`@theme` 只把 semantic token 暴露成 utility；primitive 不暴露。
- 如果选 CSS Modules / scoped styles，组件只消费 semantic token；不跨组件引用 primitive。

### 3.3 命名

| 语义组 | Token | 用途 |
|---|---|---|
| 表面 | `--surface-0` / `-1` / `-2` / `-3` | 页面 / 抬升区 / 卡片与面板 / hover 与 active |
| 文字 | `--text-1` / `-2` / `-3` / `-inv` | 主文字 / 次级 / meta 与标注 / 反色 |
| 线条 | `--border-hairline` / `--border-strong` | 装饰分隔 / 表单与控件边界（3:1） |
| 强调 | `--accent` / `--accent-hover` / `--accent-text` / `--accent-fill` / `--accent-fill-hover` / `--accent-low` / `--accent-inv` | 图形 / 图形 hover / 小字 / 实心按钮 / 按钮 hover / 低饱和底 / 按钮文字 |
| 焦点 | `--focus-ring` | 2px focus outline |
| 选择 | `--selection-bg` / `--selection-text` | `::selection` |
| 代码 | `--code-bg` / `--syntax-keyword` / `--syntax-string` / `--syntax-function` / `--syntax-comment` | 代码块 |
| 状态 | `--status-success` / `-low`；warning / danger / info 同构 | docs callout、表单校验 |

### 3.4 CSS 契约

```css
:root {
  color-scheme: dark;

  --surface-0: #0a0a0a;
  --surface-1: #111111;
  --surface-2: #181818;
  --surface-3: #242424;
  --border-hairline: #2a2a2a;
  --border-strong: #75756c;

  --text-1: #f2f1ee;
  --text-2: #b3b1aa;
  --text-3: #8c8c85;
  --text-inv: #0a0a0a;

  --accent: #ff7a4d;
  --accent-hover: #ff9a73;
  --accent-text: #ff7a4d;
  --accent-fill: #ff7a4d;
  --accent-fill-hover: #ff9a73;
  --accent-low: #3a241c;
  --accent-inv: #121110;

  --focus-ring: #ff7a4d;
  --selection-bg: #3a241c;
  --selection-text: #f2f1ee;

  --code-bg: #151513;
  --syntax-keyword: #ff7a4d;
  --syntax-string: #5eba7d;
  --syntax-function: #8aabff;
  --syntax-comment: #8c8c85;

  --status-success: #5eba7d;
  --status-success-low: #12281a;
  --status-warning: #f5b456;
  --status-warning-low: #2a2112;
  --status-danger: #ff7a6e;
  --status-danger-low: #331512;
  --status-info: #8aabff;
  --status-info-low: #15213f;
}

[data-theme="light"] {
  color-scheme: light;

  --surface-0: #f7f5f1;
  --surface-1: #efede8;
  --surface-2: #e9e6df;
  --surface-3: #ddd9d0;
  --border-hairline: #e0dcd3;
  --border-strong: #77776e;

  --text-1: #161513;
  --text-2: #4d4b46;
  --text-3: #5f5f58;
  --text-inv: #f7f5f1;

  --accent: #d94f2b;
  --accent-hover: #b93f20;
  --accent-text: #a8371b;
  --accent-fill: #b93f20;
  --accent-fill-hover: #9e3419;
  --accent-low: #f1d9cf;
  --accent-inv: #ffffff;

  --focus-ring: #a8371b;
  --selection-bg: #f1d9cf;
  --selection-text: #161513;

  --code-bg: #fafaf8;
  --syntax-keyword: #a8371b;
  --syntax-string: #2d7645;
  --syntax-function: #2f5fd0;
  --syntax-comment: #5f5f58;

  --status-success: #2d7645;
  --status-success-low: #e8f5ec;
  --status-warning: #8a5a00;
  --status-warning-low: #fff4e0;
  --status-danger: #b42318;
  --status-danger-low: #fee4e2;
  --status-info: #2f5fd0;
  --status-info-low: #e6efff;
}
```

字体、字阶、间距与布局 token 与主题无关，同样在 `tokens.css` 的 `:root` 中声明一次；具体值见 §5.2 / §6.1。语义色 token 才需要两套主题各声明一份。

### 3.5 CI 门

| 检查 | 规则 |
|---|---|
| token 完整性 | 两套主题都声明全部 semantic token；缺一个即失败 |
| 无重复 | 同一主题块内 token 不得声明两次 |
| 无裸色值 | `tokens.css` 之外禁止 hex / `rgb()` / `hsl()`；`tokens.css` 内只允许在 `:root` / `[data-theme]` 块 |
| 无微圆角 | 禁止 `border-radius` > 0（本规格不设头像；一律 0） |
| 无阴影 | 禁止 `box-shadow`（`none` 除外）、`filter`、`backdrop-filter` |
| 无位移 | 禁止 `transform`（`none` 除外）、`translate`、`scale`、`rotate` 的过渡 |
| 无外域 | 禁止 `@font-face` / `url()` 指向非 same-origin |

---

## 4. 色彩

### 4.1 Graphite / paper 表面

| Semantic token | Dark | Light | 用途 |
|---|---|---:|---|
| `--surface-0` | `#0a0a0a` | `#f7f5f1` | 页面底 |
| `--surface-1` | `#111111` | `#efede8` | hero / 抬升区 / 面板 |
| `--surface-2` | `#181818` | `#e9e6df` | 卡片 / 代码头 / 表头 |
| `--surface-3` | `#242424` | `#ddd9d0` | hover / active / 选中 |
| `--border-hairline` | `#2a2a2a` | `#e0dcd3` | 装饰分隔线；不得作为唯一状态指示 |
| `--border-strong` | `#75756c` | `#77776e` | 输入框、按钮、控件的 3:1 边界 |
| `--text-1` | `#f2f1ee` | `#161513` | 标题 / 主文字 |
| `--text-2` | `#b3b1aa` | `#4d4b46` | 正文 / 次级 |
| `--text-3` | `#8c8c85` | `#5f5f58` | mono 标注 / meta / 时间与版本 |
| `--text-inv` | `#0a0a0a` | `#f7f5f1` | 反色文字 |

规则：

- hairline 是装饰线，不承担状态；hover / active / focus 必须另有颜色、线宽、下划线或文字变化。
- `border-strong` 只给需要 3:1 的控件边界；不要用它画普通分隔线。
- `text-3` 仍承载信息（版本、日期、kicker），所以按正文 AA 取值；它不是“可以低对比”的灰。
- 页面底与卡片底最多相差两级；不要用阴影或渐变制造层级。

### 4.2 Signal orange

| Token | Dark | Light | 用途 |
|---|---|---:|---|
| `--accent` | `#ff7a4d` | `#d94f2b` | 图形、大号 display、边框、active 线；不作亮色小字 |
| `--accent-hover` | `#ff9a73` | `#b93f20` | 图形 hover；文字链接不用它，改用 2px 下划线强调 |
| `--accent-text` | `#ff7a4d` | `#a8371b` | 小字、链接、eyebrow、mono 强调 |
| `--accent-fill` | `#ff7a4d` | `#b93f20` | 实心按钮底 |
| `--accent-fill-hover` | `#ff9a73` | `#9e3419` | 实心按钮 hover |
| `--accent-low` | `#3a241c` | `#f1d9cf` | callout / 低饱和强调底 |
| `--accent-inv` | `#121110` | `#ffffff` | 实心按钮上的文字 |
| `--focus-ring` | `#ff7a4d` | `#a8371b` | focus outline |
| `--selection-bg` | `#3a241c` | `#f1d9cf` | `::selection` |
| `--selection-text` | `#f2f1ee` | `#161513` | `::selection` |

规则：

- **亮色小字只用 `--accent-text`**。`#d94f2b` 在白底 4.11、纸底 3.78，不满足 4.5:1；它只用于 ≥24px 或 ≥18.66px bold 的大字、图形和 3:1 的 UI 边界。
- **实心按钮只用 `--accent-fill` + `--accent-inv`**。`#b93f20` 配白字 5.53；`#d94f2b` 配白字只有 4.11，不能用于 16px/600 按钮。
- `--accent-low` 上的正文用 `--text-1`；`--accent-text` 在 `accent-low` 上是 4.82（亮）/ 5.62（暗），只用于短标签或链接，不用于长正文。
- signal orange 不承担 success / warning / danger；状态一律用 `--status-*`。
- hover 只改颜色，不改尺寸、位置、阴影。

### 4.3 状态色

| Status | Dark text | Dark low | Light text | Light low | 用途 |
|---|---|---:|---:|---:|---|
| success | `#5eba7d` | `#12281a` | `#2d7645` | `#e8f5ec` | 完成、已通过、可用 |
| warning | `#f5b456` | `#2a2112` | `#8a5a00` | `#fff4e0` | 注意、计划中、弃用预警 |
| danger | `#ff7a6e` | `#331512` | `#b42318` | `#fee4e2` | 错误、失败、破坏性操作 |
| info | `#8aabff` | `#15213f` | `#2f5fd0` | `#e6efff` | 提示、补充说明 |

规则：

- 只用于 docs callout、表单校验、状态徽标；不进 marketing hero / 导航 / CTA。
- 必须同时有文字或图标，不能只靠颜色；错误输入同时给 `aria-invalid="true"` 与错误文本。
- 文字压 low 底最低 4.94:1（亮 success），全部过 4.5。
- 状态色的边框可以用同色 1px；不要给状态块加圆角、阴影或渐变。

### 4.4 语法色

| Token | Dark | Light | 角色 |
|---|---|---:|---|
| `--syntax-keyword` | `#ff7a4d` | `#a8371b` | keyword / tag / 强调 token |
| `--syntax-string` | `#5eba7d` | `#2d7645` | string / number / 成功值 |
| `--syntax-function` | `#8aabff` | `#2f5fd0` | function / type / 链接式 token |
| `--syntax-comment` | `#8c8c85` | `#5f5f58` | comment / 注释；可斜体 |
| `--code-bg` | `#151513` | `#fafaf8` | 代码块底 |

规则：

- 只有 4 个语法角色；不做彩虹、不做每行背景、不做 glow。
- 注释用 italic；其余不加粗、不加下划线。
- 代码块底与页面底至少差一级；1px border-hairline 包住。
- 复制必须逐字一致；高亮 span 不得改变可复制文本。
- 代码里的颜色对比已在 §9 验算；新增语法色必须先加到 AA 表。

---

## 5. 字体与字阶

### 5.1 家族

| 用途 | Token | 值 |
|---|---|---|
| Sans | `--font-sans` | `'InterVar', system-ui, -apple-system, 'Segoe UI', sans-serif` |
| Mono | `--font-mono` | `ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace` |

- **自托管 InterVar**：`/fonts/inter-latin-wght-normal.woff2`（OFL，约 48KB，原型已带）。`font-display: swap`；`font-weight: 100 900`；只使用 400 / 600；`font-synthesis: none`。
- 只预加载这一个字体文件；不引 Google Fonts、不引 Mastra 的 Greed / Commit Mono / Orbitron、不引外域 CDN。
- 系统 mono 是首发选择；如果 QA 发现 macOS / Windows 的代码换行差异影响可读性，另开 mono 票，不在本票临时换字体。
- docs 使用同一 `--font-sans` / `--font-mono`；通过 `--sl-font` / `--sl-font-mono` 映射，消除 marketing / docs 的字体接缝。

### 5.2 字阶

| Token | Size / line-height | Weight | 用途 |
|---|---|---:|---|
| `--text-xs` | 13 / 20 | 400 | meta、脚注、表格注释 |
| `--text-base` | 16 / 24 | 400 | 正文 |
| `--text-lg` | 21 / 28 | 400 | lead、hero 副文 |
| `--text-xl` | 28 / 36 | 600 | h3、卡片标题 |
| `--text-2xl` | 38 / 44 | 600 | h2（移动 / 平板）、section 标题 |
| `--text-3xl` | 50 / 56 | 600 | h2（桌面）、h1（移动） |
| `--text-4xl` | 67 / 72 | 600 | 产品页 / docs h1 |
| `--text-5xl` | 89 / 96 | 600 | 首页 hero h1（≥1024） |

Mono 微阶：

| Token | Size / line-height | 用法 |
|---|---|---|
| `--text-mono-xs` | 11 / 16 | 版本、状态、表头、kicker |
| `--text-mono-sm` | 12 / 20 | eyebrow、breadcrumb、文件名 |

规则：

- 仅 400 / 600；不使用 500 / 520 / 450；不使用 `font-stretch`。
- 标题 600，`letter-spacing: -0.025em`；正文 400，字距 0。
- 所有行高是 4px 的倍数；不使用 fluid `clamp()`。
- 首页 hero 才用 89；产品页 / docs h1 用 67；移动 h1 用 50；h2 桌面 50、移动 38。
- 正文最大 72ch；lead 最大 44ch；表格数字用 `font-variant-numeric: tabular-nums`。
- 英文 only；不引 CJK 字体栈；构建期对 `src/content` 与页面文案跑 CJK grep。

---

## 6. 布局、间距与断点

### 6.1 空间

4px 基数，只使用：`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 72 / 96 / 144`。

| Token | 值 | 用途 |
|---|---:|---|
| `--container` | 1328px | 最大内容宽 |
| `--gutter` | 32px / 24px / 16px | ≥1328 / 768–1327 / <768 |
| `--grid-gap` | 16px | 12 栏 |
| `--section-y` | 72px / 48px / 36px | 区上下各一份；相邻区合计 144 / 96 / 72 |
| `--hero-y` | 80px 0 72px | 桌面 hero |
| `--rail-w` | 180px | section rail 标签列 |
| `--rail-gap` | 48px | rail 与内容 |
| `--docs-sidebar` | 280px | docs 侧栏 |
| `--docs-article` | 768px | docs 正文 |
| `--docs-toc` | 220px | docs TOC |
| `--docs-gap` | 48px | docs 三栏间距 |
| `--header-h` | 64px / 56px | 桌面 / 移动 |

### 6.2 栅格

- 12 栏，gap 16；hero 7 / 5；3-up 每卡 span 4；2-up span 6；单列 span 12。
- rail section：180px 标签列 + 48px gap + 内容；1024 以下 120px + 24px；768 以下堆叠。
- 卡片高度由内容决定，不设 min-height；同一行卡片等高由 grid 拉伸。
- 使用 CSS 逻辑属性（`padding-inline` / `margin-inline`），为未来 i18n 留路径；首发 `dir="ltr"`。

### 6.3 区距

| 区间 | 桌面 ≥1024 | 平板 768–1023 | 移动 <768 |
|---|---:|---:|---:|
| 普通 section | 72 + 72 = 144 | 48 + 48 = 96 | 36 + 36 = 72 |
| hero | 80 / 72 | 64 / 56 | 56 / 48 |
| final CTA | 144 + 144 | 96 + 96 | 72 + 72 |
| docs shell | 40 / 32 / 96 | 32 / 24 / 72 | 24 / 16 / 64 |

### 6.4 断点

| 断点 | 用途 |
|---|---|
| `< 768` | 单列；docs 单列；卡片 1-up |
| `768–1023` | 平板；卡片 2-up；docs 两栏（侧栏 + 正文）；TOC 隐藏 |
| `1024–1327` | 桌面紧凑；导航展开；docs 两栏；hero 7/5 可保留 |
| `≥ 1328` | 完整桌面；docs 三栏 280 / 768 / 220 |

- 测试宽度：320 / 390 / 768 / 1024 / 1328 / 1440；任何宽度 `scrollWidth ≤ innerWidth`。
- header 导航在 **1024** 收起；原型 1100 是遗留值，不采用。
- docs 三栏只在 ≥1328 成立；768–1327 是两栏（侧栏 + 正文）且 TOC 隐藏；<768 侧栏变抽屉，TOC 变文章顶部的 `<details>`。

### 6.5 边框、圆角、阴影

- 所有面板、卡片、按钮、输入框、代码块：`border-radius: 0`。
- 默认 1px `--border-hairline`；控件边界 1px `--border-strong`。
- 2px 只用于 `:focus-visible` 的 outline；不作为常规边框。
- 无 `box-shadow`、无 `filter`、无 `backdrop-filter`、无渐变。
- 分隔线优先用 1px border；不要用 `<hr>` 的浏览器默认样式。

### 6.6 Z-index

| 层 | 值 |
|---|---:|
| 内容 | 0 |
| sticky rail / TOC | 10 |
| header | 100 |
| 遮罩 | 200 |
| 菜单 / 移动抽屉 | 300 |
| skip link | 500 |

---

## 7. 动效

### 7.1 允许

| 属性 | 时长 | 场景 |
|---|---|---|
| `color` / `background-color` / `border-color` / `outline-color` | 120ms | hover / focus |
| `opacity` | 120–160ms | 菜单出现 / 消失；不做整页主题过渡 |

Easing：`cubic-bezier(0.2, 0, 0, 1)`。

### 7.2 禁止

- `transform` / `translate` / `scale` / `rotate` 的过渡（图标静态旋转可以，但不能动画）。
- 宽高、margin、padding、font-size 的过渡。
- `box-shadow`、`filter`、`backdrop-filter` 的过渡。
- 渐变、glow、shader、marquee、parallax、auto-play video。
- 菜单从上方滑入、按钮缩放、卡片上浮、FAQ 高度展开。

### 7.3 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- 主题切换不依赖动画；reduced motion 下也必须是即时 token 交换。
- FAQ 用原生 `<details>`，不写高度动画；开合用浏览器默认即时行为。
- 菜单开合用 `hidden` / `display`；如需淡入，只动 opacity。

---

## 8. 组件规格

### 8.0 组件索引

| 组件 | 页面 | 优先级 |
|---|---|---|
| Header / mega menu | 全站 | P0 |
| Mobile nav | <1024 | P0 |
| Hero / window | 首页、产品页、Solutions | P0 |
| Tabs | 首页、产品页 | P0 |
| Card grid | 首页、Solutions、Templates | P0 |
| Code block | 首页、关键词页、docs | P0 |
| Trace | 首页、可观测性页 | P0 |
| FAQ | 首页、关键词页、Solutions | P0 |
| Footer | 全站 | P0 |
| Docs shell | docs | P0 |
| Primitives | 全站 | P0 |

### 8.1 Header / mega menu

**Anatomy**

- `<header>` sticky top 0；高 64px（<1024 为 56px）；`--surface-0`；底部 1px hairline；z 100。
- 内层 `--container`；padding-inline 32 / 24 / 16。
- 左：wordmark（23px / 600 / -0.03em）+ 可选 24×24 mark 槽，gap 8。
- 中：`Framework ▾` / `Platform (Planned)` / `FDE + Support ▾` / `Solutions ▾` / `Resources ▾` / `Docs` / `GitHub`。
- 右：theme toggle（32×32）+ `Get started`（primary，md）+ `Talk to us`（ghost，md）。
- 不放 Pricing；不放 Blog；不放 search；不放 social icon（GitHub 用文字链）。

**Mega menu**

- 面板贴 header 下沿，`--surface-1`，1px border-hairline，0 radius，无 shadow；最大宽 `--container`，padding 32。
- Framework / Solutions 用 3 列；Resources 用 2 列；每列有 mono 11 uppercase 的 group label（`--text-3`）。
- 条目：标题 16/600 `--text-1`；描述 13/20 `--text-3`；hover 标题 `--accent-text`，条目底 `--surface-2`，1px transparent → hairline；不做位移。
- 打开方式：click（不做 hover-only）；`aria-expanded` / `aria-controls`；Esc 关闭并把焦点还给 trigger；外点关闭。
- 键盘：Tab 进入面板；面板内按 DOM 顺序；不抢 roving tabindex；链接是真实 `<a>`。
- Platform 的 `Planned` 徽标：mono 11 uppercase，1px border-strong，`--accent-text`，padding 2 6；文案可见，不只靠颜色。

**States**

| 状态 | 规则 |
|---|---|
| default | 链接 `--text-2`；hover `--text-1` |
| current | `aria-current="page"`；`--text-1` + 1px `--accent` 下边线 |
| open | trigger `aria-expanded="true"`；`--text-1` |
| focus | 2px `--focus-ring` + 2px offset |

**Responsive**

- <1024：隐藏桌面 nav 与右侧 CTA；**保留 theme toggle（32×32）**；显示 44×44 menu button（inline SVG，三条线）。
- 移动抽屉见 §8.2；wordmark 降到 21px；CTA 移入抽屉。

**A11y**

- header 是 `<header>`，主导航是 `<nav aria-label="Primary">`。
- 所有 trigger 是 `<button>`；菜单项是 `<a>`。
- 不把菜单做成 `role="menu"`；这是 disclosure navigation，不是 application menu。
- skip link 在 header 之前。

### 8.2 Mobile nav

- 全宽抽屉，从 header 下方展开；`--surface-0`；上下 1px hairline；`max-height: calc(100dvh - 56px)`；overflow auto。
- 顺序：Framework / Platform / FDE + Support / Solutions / Resources / Docs / GitHub，然后 `Get started` + `Talk to us`。
- 分组用 `<details>` 或 button + `aria-expanded`；组标题 16/600；条目 16/24，最小高度 44px；mono group label 11 uppercase `--text-3`。
- 打开时 `role="dialog"` + `aria-modal="true"`；焦点移入；Tab 循环；Esc 关闭；关闭后焦点回 menu button；body 滚动锁。
- 动效只允许 opacity ≤160ms；不做滑入。
- 不放 Pricing、Blog、search。

### 8.3 Hero / window

**Anatomy**

- 外层 `--surface-1`；底部 1px hairline；padding 80 0 72（<1024：64 0 56；<768：56 0 48）。
- 内层 12 栏，7 / 5，gap 48；<1024 单列，gap 40。
- 左：eyebrow（mono 12 uppercase，`--accent-text`，tracking .12em）→ h1（89/96 首页 ≥1024；67/72 产品与 docs；50/56 <768）→ 副文（21/28，`--text-2`，max 44ch）→ actions（12 gap）→ meta（mono 12/20，`--text-3`）。
- 右：最多 2 个 window；第一个 1px hairline、`--surface-0`；第二个偏移 `margin: -1px 0 0 22px`；无 shadow、无 rotation。
- window title bar：高 40px；mono 11/16 `--text-3`；文件名 `--text-1`；右侧可选 mono meta。
- 代码：12/1.65；`--code-bg`；只读；`overflow-x: auto`。

**Rules**

- 首页 hero 只放 1 个 window；产品页可放 2 个堆叠；Solutions 可不用 window。
- 代码必须来自可运行 example；不放伪代码、假日志、假 trace。
- 不放客户 logo、人物照片、渐变背景、glow、浮动 badge。

**A11y**

- h1 是页面唯一 h1；eyebrow 不是 heading。
- window 是 `<figure>` + `<figcaption>`（文件名）；代码块 `tabindex="0"`。
- 如果 window 只是装饰，`aria-hidden="true"`；如果承载代码证据，必须可读。

### 8.4 Tabs

- `role="tablist"`；tab 高 40px；padding 0 16；16/600；1px border-hairline；0 radius。
- active：`--surface-1` 底；下边框与 panel 同色（`margin-bottom: -1px`）；文字 `--accent-text`。
- inactive：透明底；`--text-3`；hover `--text-1`。
- panel：`--surface-1`；1px border-hairline；padding 32；`role="tabpanel"`；`tabindex="0"`；`aria-labelledby`。
- 键盘：ArrowLeft / ArrowRight / Home / End；roving tabindex；panel 切换即时，无动画。
- <768：tab 行可横向滚动；不换行成两行；`overflow-x: auto`；不隐藏 tab。

### 8.5 Card grid

- 12 栏；3-up span 4；2-up span 6；1-up span 12；gap 16。
- 卡片：`--surface-0`；1px border-hairline；padding 24；0 radius；无 shadow。
- hover：border 变 `--accent`；标题变 `--accent-text`；背景不变、位置不变。
- focus-within：border `--accent-text`；链接自己的 focus ring 可见。
- anatomy：optional mono kicker 11 uppercase `--text-3` → h3 21/28 600 → body 16/24 `--text-2` → footer link 16/600 `--accent-text` + `→`（实施时 `→` 用 16px inline SVG，见 `brand-assets.md` §6.1）。
- 整个卡片可点：只在卡片内只有一个链接时用 `::after` 覆盖；有多个链接时不做整卡覆盖，避免嵌套交互。
- 高度由内容决定；同一行等高；不设 min-height。
- ≥1024 3-up；768–1023 2-up；<768 1-up。

### 8.6 Code block

**Anatomy**

- wrapper：1px border-hairline；`--code-bg`；0 radius；overflow hidden。
- header：高 40px；`--surface-2`；底部 1px hairline；文件名 mono 11/16 `--text-3`；可选多文件 tabs（高 32px，同一 tab 语法）。
- copy button：32×32；`--text-3`；hover `--text-1`；focus ring；`aria-label="Copy code"`；成功后文字变 `Copied` 1.2s，`aria-live="polite"`。
- `pre`：margin 0；padding 16 18；mono 12/1.65；`overflow-x: auto`；`tabindex="0"`；`white-space: pre`。
- line numbers 默认关闭；如开启，`aria-hidden="true"` 且不可选中，复制仍只复制代码。
- 语法只用 §4.4 的 4 个角色；注释 italic；不加粗、不加行背景、不加 glow。

**Rules**

- 复制必须逐字一致；复制按钮复制 `textContent`，不是截图或 HTML。
- 代码不得超过容器；横向滚动在代码块内，不允许页面横向溢出。
- 首屏代码块最多 18 行；更长放 `<details>` 或 docs。
- 不写 fake terminal 输出；terminal 用同样的 code block，标题写 `terminal`。

### 8.7 Trace

**Anatomy**

- `<figure>`；1px border-hairline；`--surface-0`；padding 12–16；0 radius。
- 行 grid：`120px minmax(0,1fr) 48px`；<480：`88px minmax(0,1fr) 40px`；gap 8。
- label：mono 10/14 `--text-3`；track：高 6px；`--surface-2`；1px border-hairline；bar：agent `--accent`，tool `--status-success`；duration：mono 10 `--text-3`。
- 最多 6 行；更多时显示 summary row（如 `+ 12 spans`），不做滚动区域。
- `<figcaption>` 必须是数据来源与日期；数据来自可运行 example 或实测。

**A11y**

- 旁边或内部提供 visually hidden `<table>`：Span / Type / Duration；屏幕阅读器读表格。
- 颜色不是唯一信号：每行有文字 label 与 type；bar 只是辅助。
- 不做 hover tooltip、不做缩放、不做点击钻取；这是静态证据组件，不是图表系统。

### 8.8 FAQ

- `<details>` 列表；每项 1px top border；最后一项 1px bottom border。
- `<summary>`：16/24 600；`--text-1`；padding 16 0；去除默认 marker；右侧 mono `+` / `−`（打开时切换）；`summary:focus-visible` 用 focus ring。
- 答案：16/24；`--text-2`；max 72ch；padding 0 0 16。
- 无 JS；无高度动画；打开/关闭即时。
- 多个 FAQ 可以同时打开；不做 accordion 互斥。
- 问题必须是用户会问的原话，不写营销反问。

### 8.9 Footer

- 顶部 1px hairline；padding 48 0 24；4 列（brand + 3 groups），gap 32；<768 2 列；<480 1 列。
- brand：wordmark 21/600；一行描述 13/20 `--text-3`；GitHub 文字链。
- group label：mono 11 uppercase `--text-3`；链接 14/20 `--text-2`；hover `--text-1`。
- legal row：1px top hairline；margin-top 32；padding-top 24；13/20 `--text-3`；`© 2026 Oribos` / `License` / `GitHub`。
- 不放 newsletter、social icon 墙、contact 页、Pricing、Blog。
- 每列是 `<nav aria-label="...">`；legal 是普通文本 + 链接。

### 8.10 Docs shell

**Top bar**

- 高 58px；`--surface-1`；底部 1px hairline。
- 左：breadcrumb（mono 12/20；分隔 `/`；当前 `--text-1`，其余 `--text-3`）。
- 右：theme toggle（32×32，与 marketing 同一个 storage key）→ search trigger（260×36；1px border-strong；`--surface-0`；13/20 `--text-3`；`aria-haspopup="dialog"`；是 `<button>`，不是 input）→ Copy page split button（36px；1px border-strong；`Copy page` 12/600；options 32×32；`▾`）。
- <768：search trigger 隐藏；Copy page 保留；加 `Docs menu` 按钮。768–1023 时 search trigger 仍显示，不加 Docs menu。

**Grid**

- `280px minmax(0, 768px) 220px`；gap 48；max 1328；padding 40 32 96；align start。
- 1024–1327：`240px minmax(0,1fr)`；TOC 隐藏。
- 768–1023：`240px minmax(0,1fr)`；TOC 隐藏；侧栏仍可见。
- <768：单列；侧栏变抽屉；TOC 变文章顶部 `<details>`。
- 侧栏：`position: sticky; top: calc(var(--header-h) + 68px)`（桌面 132px，移动 124px）；右侧 1px hairline；group label mono 11 uppercase `--text-3`；链接 14/20 `--text-2`；active `--accent-text` + 1px `--accent` 左边线；hover `--text-1`。
- 正文：max 768；h1 50/56；h2 28/36，margin-top 40；h3 21/28，margin-top 32；body 16/24 `--text-2`；strong `--text-1`；链接 `--accent-text` + underline 1px offset 2px，hover 下划线 2px。
- 行内 code：mono 13/20；`--surface-2`；padding 2 6；1px hairline；0 radius。
- 表格：14/20；外框 1px hairline；cell 1px hairline；表头 `--surface-2` 600；数字 tabular；外层 `overflow-x: auto`。
- callout：1px border `--status-*`；`--status-*-low` 底；padding 16；标题 14/600；正文 14/20 `--text-1`；0 radius。
- blockquote：左侧 1px `--accent`；padding-left 16；`--text-2`。
- pager：顶部 1px hairline；margin-top 48；padding-top 24；两个链接 14/20；next 右对齐。
- TOC：`position: sticky; top: calc(var(--header-h) + 68px)`；label mono 11 uppercase `--text-3`；链接 13/20 `--text-2`；active `--accent-text`；`aria-current="true"`。
- 锚点 `scroll-margin-top: 80px`；标题锚点链接在 hover/focus 时出现，键盘可达。

**Copy page**

- 复制当前页的 `.md` twin（同路径 + `.md`）；不是复制渲染后的 HTML。
- 成功文案 `Copied` 1.2s；`aria-live="polite"`。
- options 菜单：`Copy as Markdown` / `View Markdown`；不做外部 AI 链接。
- `.md` twin 不可用时按钮 disabled，`aria-disabled="true"`，并给可见说明；不得静默失败。

**Search**

- 只 spec trigger；dialog、结果、键盘、索引已由 #13 定（见 `docs/spec/stack.md` §5）。
- trigger 是 `<button>`，不是假 input；点击打开 dialog；可选 `Cmd/Ctrl+K`，如果实现，必须在 trigger 上显示快捷键提示。
- 不引第三方搜索 UI 库的默认样式；dialog 仍用本文的 token。

**A11y**

- 侧栏 `<nav aria-label="Docs">`；正文 `<main>`；TOC `<aside aria-label="On this page">`。
- 侧栏 active 用 `aria-current="page"`；TOC active 用 `aria-current="true"`。
- 移动抽屉是 modal dialog：焦点 trap、Esc、body 锁、关闭回 trigger。
- Copy page 的 options 是 disclosure，不是 `role="menu"`；Esc 关闭。
- 标题层级不跳级；每页唯一 h1；表格有 `<caption>` 或前置说明。

### 8.11 Primitives

**Button**

| Variant | 底 | 文字 | 边 | Hover |
|---|---|---|---|---|
| primary | `--accent-fill` | `--accent-inv` | 1px transparent | `--accent-fill-hover` |
| secondary / ghost | transparent | `--text-1` | 1px `--border-strong` | 文字 `--accent-text`；边 `--accent-text` |
| text link | transparent | `--accent-text` | 无 | 下划线 2px；文字颜色不变 |
| disabled | `--surface-1` | `--text-3` | 1px `--border-hairline` | 不变 |

- 尺寸：sm 32 / md 40 / lg 48；padding-inline 16 / 24；16/600。
- 0 radius；focus ring 2px + 2px offset；不使用 opacity 表示 disabled。
- 不使用按钮做链接；导航一律 `<a>`。

**Link**

- 正文链接：`--accent-text`；默认 underline 1px，offset 2px；hover 下划线 2px，文字颜色不变；focus ring。
- 导航链接：默认不 underline；hover `--text-1`；current `aria-current`。
- 外链：不强制新 tab；如新 tab，`rel="noreferrer"` 且 `aria-label` 说明。

**Input**

- 高 40；1px `--border-strong`；`--surface-0`；padding 0 12；16/24。
- placeholder `--text-3`（仍过 4.5）；focus border `--accent-text` + focus ring。
- error：border `--status-danger`；文本 13/20 `--status-danger`；`aria-invalid="true"` + `aria-describedby`。
- disabled：`--surface-1`；`--text-3`；border hairline。

**Callout**

- 1px border `--status-*`；`--status-*-low` 底；padding 16；0 radius。
- 标题 14/600 `--text-1`；正文 14/20 `--text-1`；可选 inline SVG 16px。
- info / success / warning / danger 四型；不新增颜色。

**Table**

- 外框 1px hairline；cell 1px hairline；表头 `--surface-2` 600；14/20；数字右对齐 + tabular。
- 外层 `overflow-x: auto`；移动不堆叠成卡片（docs 表格保真）；必要时用横向滚动。
- 表头 `<th scope="col">`；首列 `<th scope="row">`。

**Breadcrumb**

- mono 12/20；`--text-3`；分隔 `/`；当前 `--text-1`。
- `<nav aria-label="Breadcrumb"><ol>`；最后一项 `aria-current="page"`。

**Badge**

- mono 11/16 uppercase；tracking .08em；padding 2 6；1px border-hairline；`--text-3`；0 radius。
- accent 变体：`--accent-text` + 1px `--border-strong`；用于 `Planned`。
- 状态徽标用 `--status-*`；不只用颜色，要有文字。

**Icon**

- 只用 inline SVG；16 / 20 / 24；1.5px stroke；`currentColor`；不引 icon font / 外域 sprite。
- 装饰图标 `aria-hidden="true"`；有语义的图标带 `aria-label` 或可见文字。
- GitHub 以文字链为主；如用图标，必须带可见文字或 `aria-label`；不做 social icon 墙。

**Skip link**

- 视觉隐藏，focus 时显示；fixed top 8 left 8；`--surface-0`；1px border-strong；padding 8 12；14/20；z 500。
- 文案 `Skip to content`；跳到 `<main id="main">`。

**Divider**

- 1px `--border-hairline`；用 border 或 `<hr>` 重置；不设 margin，靠 spacing token。

---

## 9. 可访问性验收

### 9.1 文本 AA（4.5:1）

**文字 / 表面**

| Pair | Light | Dark |
|---|---:|---:|
| text-1 / surface-0 | 16.76 | 17.53 |
| text-1 / surface-1 | 15.60 | 16.72 |
| text-1 / surface-2 | 14.64 | 15.72 |
| text-1 / surface-3 | 12.96 | 13.74 |
| text-2 / surface-0 | 8.00 | 9.23 |
| text-2 / surface-1 | 7.45 | 8.80 |
| text-2 / surface-2 | 6.99 | 8.27 |
| text-2 / surface-3 | 6.19 | 7.23 |
| text-3 / surface-0 | 5.91 | 5.85 |
| text-3 / surface-1 | 5.50 | 5.58 |
| text-3 / surface-2 | 5.16 | 5.25 |
| text-3 / surface-3 | 4.57 | 4.59 |

**强调 / 按钮 / 选择**

| Pair | Light | Dark |
|---|---:|---:|
| accent-text / surface-0 | 5.98 | 7.68 |
| accent-text / surface-1 | 5.56 | 7.32 |
| accent-text / surface-2 | 5.22 | 6.89 |
| accent-text / surface-3 | 4.62 | 6.02 |
| accent-text / accent-low | 4.82 | 5.62 |
| text-1 / accent-low | 13.53 | 12.83 |
| accent-inv / accent-fill | 5.53 | 7.31 |
| accent-inv / accent-fill-hover | 7.10 | 9.09 |
| selection-text / selection-bg | 13.53 | 12.83 |

**语法**

| Pair | Light | Dark |
|---|---:|---:|
| syntax-keyword / code-bg | 6.23 | 7.09 |
| syntax-string / code-bg | 5.30 | 7.66 |
| syntax-function / code-bg | 5.48 | 8.14 |
| syntax-comment / code-bg | 6.16 | 5.40 |

**状态**

| Pair | Light | Dark |
|---|---:|---:|
| status-success / surface-0 | 5.09 | 8.29 |
| status-success / status-success-low | 4.94 | 6.54 |
| status-warning / surface-0 | 5.44 | 10.88 |
| status-warning / status-warning-low | 5.44 | 8.72 |
| status-danger / surface-0 | 6.04 | 7.79 |
| status-danger / status-danger-low | 5.45 | 6.57 |
| status-info / surface-0 | 5.26 | 8.81 |
| status-info / status-info-low | 4.95 | 7.08 |

### 9.2 非文本 3:1

| Pair | Light | Dark |
|---|---:|---:|
| focus-ring / surface-0 | 5.98 | 7.68 |
| border-strong / surface-0 | 4.15 | 4.26 |
| border-strong / surface-3 | 3.21 | 3.34 |
| accent / surface-0 | 3.78 | 7.68 |
| accent / surface-1 | 3.52 | 7.32 |

### 9.3 焦点

- `:focus-visible`；2px `--focus-ring` outline；`outline-offset: 2px`。
- 在 accent / 深色块上，加 1px 与父表面同色的内环（通常是 `--surface-0` 或所在的 `--surface-1/2`），保证轮廓不糊。
- 不用 `outline: none`；不用 `box-shadow` 代替 outline。
- 所有交互元素键盘可达；skip link 第一个可聚焦。
- forced-colors 模式下保留系统 `CanvasText` outline；不依赖背景色区分焦点。

### 9.4 键盘与语义

- 导航 disclosure：Enter / Space 打开；Esc 关闭；焦点返回 trigger。
- Tabs：ArrowLeft / ArrowRight / Home / End；roving tabindex。
- FAQ：原生 `<details>` / `<summary>`；不拦截键盘。
- 移动抽屉：焦点 trap；Esc；关闭回 trigger。
- Copy page：button + disclosure；状态 `aria-live="polite"`。
- 图标按钮必须有 `aria-label`；装饰图标 `aria-hidden`。
- 标题层级不跳级；landmark 不重复。

### 9.5 其他门

| 检查 | 规则 |
|---|---|
| reduced motion | 所有 transition ≤ 0.01ms；无 animation；无平滑滚动 |
| 无外域请求 | 字体、图标、脚本、样式全部 same-origin；无 Google Fonts / CDN / analytics |
| 无横向溢出 | 320 / 390 / 768 / 1024 / 1328 / 1440 下 `scrollWidth ≤ innerWidth` |
| CJK grep | `src/content` 与页面文案不得出现 CJK；`docs/spec` 除外 |
| 防 FOUC | 首屏无主题闪烁；`data-theme` 在样式表前设置 |
| 主题一致性 | marketing 与 docs 的 `data-theme` / storage key / `color-scheme` 一致 |
| 对比度脚本 | 解析 `tokens.css`，按 §9.1 / §9.2 逐对检查；低于阈值即失败 |
| token 脚本 | 两套主题完整、无重复、组件无裸色值、无 radius/shadow/transform |
| 复制保真 | 代码块 / Copy page 的复制内容与源文本逐字一致 |
| 证据真实 | 代码、trace、截图来自可运行 example 或实测；无编造指标 |

### 9.6 验收清单

- [ ] 两套主题的 token 表完整；无组件裸色值。
- [ ] §9.1 / §9.2 全部通过；脚本可复跑。
- [ ] header / mega menu / mobile nav 键盘与 Esc 行为正确。
- [ ] tabs / FAQ / docs 侧栏 / TOC / Copy page 键盘可达。
- [ ] 主题 toggle 持久化、跨页一致、无 FOUC。
- [ ] reduced motion 下无过渡 / 动画。
- [ ] 无外域请求；InterVar 自托管并 preload。
- [ ] 320–1440 无横向溢出；docs 三栏 / 两栏 / 单栏切换正确。
- [ ] CJK grep 通过；英文 only。
- [ ] 代码块 / Copy page 复制保真。
- [ ] trace 有表格 fallback；代码 / trace 数据有来源。
- [ ] wordmark 使用 #21 的文字位规格；首发不产独立 SVG；不改尺寸规则。

---

## 10. Docs shell 的 Starlight 映射（已启用）

> 已启用：#13 选 Astro 7 + Starlight（见 `docs/spec/stack.md` §6）。若未来换框架，保留 §8.10 的 anatomy 与 §3 的 token，按框架的等价 slot 映射；不得另建色板。

### 10.1 Slot 映射

| Starlight 变量 | 映射 |
|---|---|
| `--sl-color-bg` | `--surface-0` |
| `--sl-color-bg-nav` | `--surface-0` |
| `--sl-color-bg-sidebar` | `--surface-0` |
| `--sl-color-bg-inline-code` | `--surface-2` |
| `--sl-color-text` | `--text-1` |
| `--sl-color-text-accent` | `--accent-text` |
| `--sl-color-text-invert` | `--accent-inv` |
| `--sl-color-hairline` | `--border-hairline` |
| `--sl-color-hairline-light` | `--border-hairline` |
| `--sl-color-hairline-shade` | `--border-hairline` |
| `--sl-color-white` | `--text-1` |
| `--sl-color-black` | `--surface-0` |
| `--sl-font` | `--font-sans` |
| `--sl-font-mono` | `--font-mono` |
| `--sl-content-width` | `768px` |
| `--sl-sidebar-width` | `280px` |
| `--sl-content-pad-x` | `32px` |
| `--sl-line-height` | `1.5` |

### 10.2 覆盖预算

只允许以下结构覆盖；超出即视为 fork，必须在 #16 记录：

1. 0 radius：Starlight 的按钮、卡片、搜索框、callout 一律 `border-radius: 0`。
2. 1px 线：用 `--border-hairline` / `--border-strong` 替换 Starlight 的阴影和厚边。
3. mono 标注：侧栏 group label、TOC label、breadcrumb 用 `--text-mono-xs/sm` + uppercase。
4. 侧栏 active：1px `--accent` 左边线 + `--accent-text`，不加背景块。
5. Copy page：split button，36px，1px border-strong。
6. 搜索 trigger：260×36，1px border-strong，`--surface-0`；dialog 样式沿用 token。

- 不覆盖 Starlight 的 DOM 结构、路由、内容 collection、Pagefind 集成。
- 不复制 Starlight 的默认色板；所有 `--sl-color-*` 必须是语义 token 的别名。
- 主题：保留 Starlight 的 theme switch UI，但 storage key 与 `data-theme` 统一到 `oribos-theme`；做不到时记录同步策略。
- 如果框架把 `--sl-*` 直接写进组件 shadow DOM，优先用官方 CSS 变量；不要用 `!important` 穿透。

---

## 11. Wordmark 与品牌资产边界

设计系统只定位置与规则；最终 wordmark 用法、favicon 与 OG 模板由 [品牌资产与 wordmark 规格](https://github.com/0xnicholas/oribos-www/issues/21) 定稿：首发是文字位 wordmark，不产独立 SVG；favicon 是占位 O tile，不是品牌 mark。

| 项 | 规则 |
|---|---|
| 文字位 | `Oribos`；23px / 600 / `-0.03em`；header 左；移动 21px |
| Mark 槽 | 24×24；与文字 gap 8；首发留空；不产独立 mark，不放占位图 |
| Clear space | 四周 ≥ 12px；不小于字高的一半 |
| 最小宽 | 96px；适用于独立资产；header 文字位按 23 / 21px 字号，不放大到 96px（见 `brand-assets.md` §2.2）；不得压缩、拉伸、描边、加阴影 |
| 颜色 | `--text-1`；在 accent 底上用 `--accent-inv` |
| 禁止 | 不用旧站 wordmark / trace-ink 字形；不做渐变字、发光字、描边字 |
| 资产 | 首发文字位，不产 `wordmark.svg`；favicon / OG 见 `brand-assets.md` |

---

## 12. 图像与图表

- 不使用 stock photo、人物照片、客户 logo、证言墙、客户故事。
- 参考架构图用 inline SVG / HTML：1px stroke、token 颜色、0 radius、无渐变、无阴影。
- 截图只来自可运行 example 或实测；1px border-hairline；0 radius；不加阴影 / 倾斜 / 背景光。
- 图表只允许 trace 组件与文档表格；不引入通用 chart library。
- 任何图表的数字必须有来源与日期；没有来源就不放图。

---

## 13. 不在本票

- 组件代码、页面实现、CSS 文件落地。
- Wordmark / mark / favicon / OG 资产（#21）。
- 技术栈、仓库形态、搜索实现（#13）。
- 页面 IA、逐页大纲、内容写作（#16 与已关闭的 IA 票）。
- 分析、consent、CMS、i18n 运营（部署基线 / 语言票已定）。

## 14. 依赖与未决

| 依赖 | 状态 | 对本规格的影响 |
|---|---|---|
| [技术栈与仓库形态](https://github.com/0xnicholas/oribos-www/issues/13) | closed（Astro 7 + Starlight） | docs shell 的 Starlight 映射已启用；anatomy 与 token 不变 |
| [域名、托管与备案基线](https://github.com/0xnicholas/oribos-www/issues/18) | closed（deferred） | provisional；不影响视觉，影响部署与 `SITE_ORIGIN` |
| [品牌资产与 wordmark 规格](https://github.com/0xnicholas/oribos-www/issues/21) | closed | 文字位 wordmark 首发；favicon / OG 占位与模板已定；不改尺寸 / 位置规则 |
| [规格装配与交接验收标准](https://github.com/0xnicholas/oribos-www/issues/16) | open，unblocked | 本文作为视觉规范输入；装配时补页面矩阵与验收清单 |
| 搜索 dialog UX | 已定 | 见 `docs/spec/stack.md` §5（Pagefind 单索引、懒加载、结果分组） |

## 15. 来源

- [视觉方向与品牌定义原型](https://github.com/0xnicholas/oribos-www/issues/11) 及其 resolution；`prototype/visual-direction` @ `daf51c0`。
- `docs/research/mastra-visual-audit.md`：Mastra 的 token / 组件 / 动效 / 可访问性对照，以及“借结构语法、不借材质”的结论。
- `docs/research/stack-options.md`：Astro + Starlight 首选、系统 mono / 自托管字体的可行性。
- [产品家族与 Products 导航](https://github.com/0xnicholas/oribos-www/issues/8)、[资源/博客与不适用板块](https://github.com/0xnicholas/oribos-www/issues/14)：header 与 Resources 的页面边界。
- [关键词页与 SEO 落地页集](https://github.com/0xnicholas/oribos-www/issues/19)：`.md` twin、JSON-LD、OG 字段与页面类型。
- [文档 IA 与内容迁移策略](https://github.com/0xnicholas/oribos-www/issues/12)：docs shell 的导航、TOC、Copy page 与 268 页规模。
- [语言与国际化策略](https://github.com/0xnicholas/oribos-www/issues/15)：English-only、CJK 门禁、`/zh/` 预留。
- `CONTEXT.md`：solution page / scenario card / reference architecture / docs IA / agent surface 等术语。
