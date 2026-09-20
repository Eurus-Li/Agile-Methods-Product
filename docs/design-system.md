# Rongrong Design System

只有一个产品：**Rongrong**。这份文档是它的视觉规范唯一来源，覆盖现在所有实现（`web/`、`prototypes/plus-standalone/`、以后的 `ios/`），不管代码架构最后怎么整合。**颜色/字体/间距/圆角/阴影/动效数值都从这里取，不允许现场发明。**

## 0. 现状：还有一处没对齐的漂移

`web/`（主实现）和 `prototypes/plus-standalone/`（早期付费墙原型，已被 `web/` 内置的 Plus 流程取代）曾经是独立开发的两份代码，吉祥物名字已经统一成 "Rongrong"（`web/` 之前叫 "Pip"，现已改名），但配色和字体还没对齐，如实记录，不隐藏：

| 项 | web/（权威值） | prototypes/plus-standalone/ |
|---|---|---|
| 主背景色 | `#EEE5DF` | `#EEE8E2` |
| 主字体栈 | `Nunito, ui-rounded, 'Arial Rounded MT Bold', system-ui` | `ui-rounded, 'Segoe UI', system-ui` |
| 主橘色 | `#FF8A5B` | `#FF8757` |

`web/` 的 Token 提取更完整（含心情色、组件映射、无障碍说明），本文档以它为权威值。`prototypes/plus-standalone/` 已经是不再新增功能的参考原型，不用专门排期去改，如果哪天顺手碰到那份样式代码再对齐到本文档的值即可。

## 1. 品牌调性

温暖、松弛、治愈系的陪伴产品——奶油色基底 + 一个暖橘主色 + 五种柔和马卡龙心情色 + 一个薰衣草紫的 "Plus" 点缀色。圆润、低对比度、无锐角。

## 2. 色彩 Token

| Token | Hex | 用途 |
|---|---|---|
| `background.base` | `#EEE5DF` | 整体背景 |
| `background.screen` | `#FBF3EC` | 单屏背景（手机） |
| `text.primary` | `#3A302B` | 主文字 |
| `text.muted` | `#897567` | 次要说明文字 |
| `accent.primary` | `#FF8A5B` | 主按钮、选中态、强调元素 |
| `accent.primaryFocus` | `#B56B42` | 焦点/可访问性描边 |
| `accent.plus` | 文字 `#775797` / 底色 `#EDE0FA` | "Plus" 会员相关标签、按钮 |
| `surface.card` | `#FBF3EC` | 卡片/瓦片背景 |
| `surface.secondaryButton` | `#F2E5DB` | 次级按钮背景 |
| `mood.calm` | `#DDEBDC` | 心情——平静 |
| `mood.happy` | `#FFE3B5` | 心情——开心 |
| `mood.tired` | `#E6DFF4` | 心情——疲惫 |
| `mood.sad` | `#DCE6F2` | 心情——难过 |
| `mood.tense` | `#F4D8D8` | 心情——紧张 |
| `toast.background` | `#3A302B` | Toast 提示背景 |

心情色是产品语义的一部分，不要因为视觉好看调整，改动需要过对应产品的 `decisions.md`。

## 3. 字体与字号

- 字体栈：`Nunito, ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif`。
- iOS Phase 1 默认用系统 **SF Rounded**（性能好、自动支持 Dynamic Type），不内嵌自定义字体。
- 弹窗标题 22pt Bold · 正文 14–15pt Regular · 说明小字 11–12pt · 数字强调（Lv./streak）15–17pt Bold。

## 4. 间距与圆角

- 间距按 4pt 基准网格取值（4/8/12/16/24）。
- 主按钮圆角 24–28pt（pill），次按钮/卡片/Dialog 18–26pt，日历格/图标按钮圆形。

## 5. 阴影

低不透明度、带主色调的彩色阴影（`text.primary` 加透明度），不用系统默认纯黑阴影。卡片量级 `0 24px 80px rgba(100,75,57,0.15)`，Dialog 更重一档。

## 6. 动效

- 交互反馈"有弹性但不夸张"：轻微弹跳类动画 0.5s；Bottom Sheet 从底部滑入+淡入 0.25s ease-out；常规状态切换 0.2s ease。
- 必须响应系统"减弱动态效果"设置（web: `prefers-reduced-motion`；iOS: `accessibilityReduceMotion`），为真时关闭非必要动画。

## 7. 图标

- 服装/配饰用 emoji 直接表示，不做自定义插画资源。
- 需要线性图标（设置/关闭等）：web 用简单 stroke SVG（1.5px 描边、圆头），iOS 优先用 SF Symbols。

## 8. 核心组件

| 组件 | 要点 |
|---|---|
| 主按钮 | 圆角 pill、`accent.primary` 底色、禁用态降透明度 |
| 次按钮 | `surface.secondaryButton` 底色 |
| 心情/选项格 | 选中态用对应语义色底色+描边，同时要有文字/label 兜底（不能只靠颜色） |
| 底部弹层（Sheet） | 从底部滑入，焦点管理，Escape/滑动可关闭 |
| 信息弹窗（Dialog） | 视内容量选原生 dialog/alert/sheet |
| Toast | 底部浮层，3 秒自动消失 |
| 底部 Tab | 当前项高亮用 `accent.primary` |

## 9. 无障碍

所有可交互元素要有文字化的可访问名称（`aria-label` / `accessibilityLabel`）；支持系统字号缩放（Dynamic Type）；遵循动效减弱设置；语义信息（心情、状态）不能只靠颜色传达。

## 10. Dark Mode

Phase 1 不做，两套实现目前都只有浅色模式。以后要做的话先在这里定 dark 变体的值，再回头改代码。

## 11. 平台映射

- **Web（CSS）**：用 CSS 自定义属性命名，前缀跟 token 名一致，例如 `--color-accent-primary`、`--radius-pill`。
- **iOS（SwiftUI）**：Asset Catalog 里的 Color Set 用同样的语义名（`background.base` → `Color("BackgroundBase")`），不要另起一套命名。
- 不管哪个平台，新增 UI 前先看这份文档有没有现成 token；没有的话先在这里加一行，再写代码，不要反过来先写死在代码里。

## 12. 皮肤展示
复用原宠物图片，以 CSS 混合底色与 emoji 主题装饰呈现皮肤。Cream 无混合；Mint 使用 `mood.calm`；Cherry 使用 `mood.tense`；Starlight 使用 `mood.tired`。使用 multiply 混合，主题装饰仅为外观，不改变心情语义。
皮肤卡预览高度 128px、详情预览 192px；装饰字号 22px、内边距 12px；卡片网格最小列宽 128px。沿用现有卡片圆角 18px、间距 12px、正文 14px。
