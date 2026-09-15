# Architecture

技术栈、模块划分、数据/接口约定、UI 设计 Token。这是 [AGENTS.md](../AGENTS.md) 的详细展开；规则本身以 AGENTS.md 为准，这里只负责把"怎么做"讲清楚。

---

## 1. 技术栈

### Web demo（现有，已验证）

- 原生 HTML / CSS / JS，零依赖、零构建。`npm run dev` 启动 [scripts/serve.js](../scripts/serve.js) 本地静态服务器。
- 代码：[src/js/app.js](../src/js/app.js)（路由 + 状态 + 交互）、[src/styles/app.css](../src/styles/app.css)。
- 设计稿来源：[design/exports/](../design/exports/)（Pencil/pen.dev 导出），[scripts/build_demo.py](../scripts/build_demo.py) 负责把导出稿重建成 `index.html` 模板。

### iOS App（规划中，代码尚未开始）

| 项目 | 选型 |
|---|---|
| 语言 | Swift（最新稳定版），全面用 Swift Concurrency（`async`/`await`、`actor`） |
| UI 框架 | SwiftUI only。用 UIKit 能力时包一层 `UIViewRepresentable` 并在 commit 里写明原因 |
| 最低系统版本 | iOS 17+（用最新 API 加快原型开发，上线前按用户设备分布重新评估，见 decisions.md #10） |
| 架构模式 | MVVM（见第 2 节） |
| 持久化 | SwiftData（无后端，见 decisions.md #2） |
| 依赖管理 | 只用 Swift Package Manager，不用 CocoaPods/Carthage |
| 测试框架 | Swift Testing（iOS 17+） |
| 静态检查 | SwiftLint + SwiftFormat，配置提交到仓库根目录 |

引入任何第三方包前先问：SwiftUI/Foundation 原生能不能做？能做就不加依赖。

## 2. 模块划分（MVVM）

- **View** — 纯 SwiftUI View，只做绑定和渲染，不写业务逻辑、不直接读写持久化。
- **ViewModel** — `@Observable` class（不用旧的 `ObservableObject`/`@Published`），持有页面状态和用户操作方法，依赖注入拿 Model/Service。
- **Model** — 值类型 `struct`，描述领域数据。

```
PipApp/
├── App/                   # App 入口、启动配置
├── Features/
│   ├── Home/{HomeView,HomeViewModel}.swift
│   ├── Reply/
│   ├── Journal/
│   ├── Me/
│   └── Plus/
├── Models/                # 领域模型 (struct)
├── Services/               # 持久化封装，未来的网络层入口
├── DesignSystem/           # 颜色/字体/间距/可复用组件，对应本文档第 4 节
└── Resources/
```

一个 Feature 一个文件夹，View/ViewModel 一一对应。**禁止**把多个页面逻辑塞进一个大文件——参考 [技术债审查](technical-debt-review.md) 里 TD-1 点名的教训（web demo 的 `app.js` 315 行单文件塞了全部页面逻辑），iOS 版本不要重蹈覆辙。

## 3. 数据模型 / 接口约定

- iOS Model 字段语义对应 web demo 已经跑通的状态结构（`pip-demo-v1` in `localStorage`）：`nickname`、`birthday`、`outfit`、`plus`、`entries`（按日期 keyed 的心情记录）、`bond`、`started`。复用已验证的产品逻辑，不用重新设计。
- 模型变更要写清 SwiftData migration 计划，不能假设用户会重装 App。
- 每个 Feature 的 ViewModel 对外只暴露只读状态 + 意图方法（如 `selectMood(_:)`），不直接暴露可写的 `@State`/Model 给 View 随意改。

## 4. 设计系统 / UI Token

来自 web demo [src/styles/app.css](../src/styles/app.css) 已验证的视觉语言。**任何人（含 AI）新增 UI 时数值必须从这里取，不允许现场发明。**

### 品牌调性

温暖、松弛、治愈系的"小伙伴"陪伴产品——奶油色基底 + 一个暖橘主色 + 五种柔和马卡龙心情色 + 一个薰衣草紫的"Plus"点缀色。圆润、低对比度、无锐角。

### 色彩

| Token | Hex | 用途 |
|---|---|---|
| `background.base` | `#EEE5DF` | App 整体背景 |
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

心情色是产品语义的一部分，不要因为视觉好看调整，改动需要过 `docs/decisions.md`。

### 字体与字号

- Phase 1 默认用系统 **SF Rounded**（性能好、自动支持 Dynamic Type），不内嵌自定义字体（见 decisions.md #5，可调整）。
- 弹窗标题 22pt Bold · 正文 14–15pt Regular · 说明小字 11–12pt · 数字强调（Lv./streak）15–17pt Bold。

### 间距与圆角

- 间距按 4pt 基准网格取值（4/8/12/16/24）。
- 主按钮圆角 24–28pt（pill），次按钮/卡片/Dialog 18–26pt，日历格/图标按钮圆形。

### 阴影

低不透明度、带主色调的彩色阴影（`text.primary` 加透明度），不用系统默认纯黑阴影。卡片量级 `0 24px 80px rgba(100,75,57,0.15)`，Dialog 更重一档。

### 动效

- 交互反馈"有弹性但不夸张"：抚摸动画 scale+rotate 轻微弹跳 0.5s；Bottom Sheet 从底部滑入+淡入 0.25s ease-out；常规状态切换 0.2s ease。
- 必须响应 `accessibilityReduceMotion`，为真时关闭非必要动画。

### 图标

- 服装/配饰用 emoji 直接表示，不做自定义插画资源。
- 需要线性图标（设置/关闭等）优先用 SF Symbols。

### 核心组件对照

| 组件 | Web 对应实现 | SwiftUI 落地要点 |
|---|---|---|
| `PrimaryButton` | `.primary` | 圆角 pill、`accent.primary` 底色、禁用态降透明度 |
| `SecondaryButton` | `.secondary` | `surface.secondaryButton` 底色 |
| `MoodTile` | Quick Moods | 选中态用对应 `mood.*` 底色+描边，`accessibilityAddTraits(.isSelected)` |
| `ReplySheet` | Reply Sheet | 原生 `.sheet`，焦点管理/Escape 对应 dismiss 手势 |
| `InfoDialog` | `<dialog>` | 视内容量用 `.alert` 或自定义 `.sheet` |
| `CalendarDayCell` | `.calendar-day` | 圆形，有记录点一个小圆点，今天描边高亮 |
| `ToastView` | `#toast` | 底部浮层，3 秒自动消失 |
| 底部 Tab | Tab Dock | 原生 `TabView`，当前项高亮用 `accent.primary` |

### 无障碍

所有可交互元素要有 `accessibilityLabel`；支持 Dynamic Type；遵循动效减弱设置；心情格颜色之外必须有文字/label 兜底（色盲友好）。

### Dark Mode

Phase 1 不做，跟随 web demo（`color-scheme: light`）。建 Color Set 时预留 dark 变体位置，内容可先留空，见 decisions.md #6。

## 5. CI / 质量门槛

- 每次 push 到 `main` 自动跑 build + lint + test（web demo 现在是 `npm run check`；iOS 工程建立后加 `swift build` + `swiftlint` + `swift test`）。
- 纯函数逻辑必须有单元测试（对应 [技术债审查](technical-debt-review.md) TD-2 的教训）；UI/snapshot 测试原型阶段不强制。
