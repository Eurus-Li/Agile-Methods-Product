# Architecture

技术栈、模块划分、数据/接口约定、UI 设计 Token。这是 [AGENTS.md](../AGENTS.md) 的详细展开；规则本身以 AGENTS.md 为准，这里只负责把"怎么做"讲清楚。

---

## 1. 技术栈

### web/（现有，已验证）

- 原生 HTML / CSS / JS，零依赖、零构建。`npm run dev` 启动 [web/scripts/serve.js](../web/scripts/serve.js) 本地静态服务器。
- 代码：[web/src/js/app.js](../web/src/js/app.js)（路由 + 状态 + 交互）、[web/src/styles/app.css](../web/src/styles/app.css)。
- 设计稿来源：[web/design/exports/](../web/design/exports/)（Pencil/pen.dev 导出），[web/scripts/build_demo.py](../web/scripts/build_demo.py) 负责把导出稿重建成 `index.html` 模板。

### ios/（规划中，代码尚未开始）

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

工程建在 `ios/`，Xcode 惯例是 `.xcodeproj` 旁边放一个和 App 同名的源码文件夹：

```
ios/
├── RongrongApp.xcodeproj
└── RongrongApp/
    ├── App/                   # App 入口、启动配置
    ├── Features/
    │   ├── Home/{HomeView,HomeViewModel}.swift
    │   ├── Reply/
    │   ├── Journal/
    │   ├── Me/
    │   └── Plus/
    ├── Models/                # 领域模型 (struct)
    ├── Services/              # 持久化封装，未来的网络层入口
    ├── DesignSystem/          # 颜色/字体/间距/可复用组件，对应本文档第 4 节
    └── Resources/
```

一个 Feature 一个文件夹，View/ViewModel 一一对应。**禁止**把多个页面逻辑塞进一个大文件——参考 [技术债审查](technical-debt-review.md) 里 TD-1 点名的教训（web demo 的 `app.js` 315 行单文件塞了全部页面逻辑），iOS 版本不要重蹈覆辙。

## 3. 数据模型 / 接口约定

- iOS Model 字段语义对应 web demo 已经跑通的状态结构（`rongrong-demo-v1` in `localStorage`）：`nickname`、`birthday`、`outfit`、`plus`、`entries`（按日期 keyed 的心情记录）、`bond`、`started`。复用已验证的产品逻辑，不用重新设计。
- 模型变更要写清 SwiftData migration 计划，不能假设用户会重装 App。
- 每个 Feature 的 ViewModel 对外只暴露只读状态 + 意图方法（如 `selectMood(_:)`），不直接暴露可写的 `@State`/Model 给 View 随意改。

## 4. 设计系统 / UI Token

颜色/字体/间距/圆角/阴影/动效的权威 Token 表在 [design-system.md](design-system.md)——这是 Rongrong 这一个产品的统一视觉规范，`web/` 只是它众多实现之一，不在这里重复维护一份可能漂移的副本。**任何人（含 AI）新增 UI 时数值从那份文档取，不允许现场发明。**

以下只列 iOS 实现要用到的组件映射（web 实现 → SwiftUI 落地要点），这是实现细节，不属于品牌级 Token，留在这里：

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

## 5. CI / 质量门槛

- 每次 push 到 `main` 自动跑 build + lint + test（web demo 现在是 `npm run check`；iOS 工程建立后加 `swift build` + `swiftlint` + `swift test`）。
- 纯函数逻辑必须有单元测试（对应 [技术债审查](technical-debt-review.md) TD-2 的教训）；UI/snapshot 测试原型阶段不强制。

## 6. 皮肤数据扩展
Web 皮肤目录和纯逻辑位于 `web/src/js/skins.js`；通过经典脚本加载以兼容直接打开 HTML。`skin` / `ownedSkins` 加入现有状态，读取时补默认、去重并清理未知 ID。
iOS 尚无工程；未来 Model / SwiftData 增加同名语义字段，旧记录迁移至 cream / [cream]。Plus 结束不清理皮肤购买记录。见 [规格](specs/pet-skins.md)。

## 7. 心情活动（Release 1.1）

`web/src/js/activities.js` 提供固定目录、五种心情到三个活动的映射，以及纯函数 recommend / normalizeEntry / select / changeMood；经典脚本先于 app.js 加载，支持直接打开 HTML。app.js 负责卡片、原生详情 dialog 与保存。模板生成脚本同步加载此模块。

`entries[dateKey].activityId` 为可空目录 ID。旧记录及无效/不属于当前推荐的 ID 归一化为 null；同心情重打卡保留、改心情清空。按日期隔离，不增加 Bond。iOS 工程尚未创建；建立 SwiftData 模型时以可空字段和旧记录 nil 默认值迁移，复用目录 ID 与映射，详见 [规格](specs/mood-activities.md)。
