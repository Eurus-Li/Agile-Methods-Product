# AGENTS.md — Pip 项目规则

唯一的项目规则文件。**任何 AI 编码助手（Claude Code / Codex / 其他）和人类贡献者，开始任务前先读这份文件。** 更深的技术细节看 [docs/architecture.md](docs/architecture.md)，历史决策看 [docs/decisions.md](docs/decisions.md)，具体某个功能看 [docs/specs/](docs/specs/)。

## 项目是什么

Pip 是一款心理健康陪伴类产品：养一只虚拟小伙伴，记录每日心情、写 Journal、给 Pip 换装、有一个模拟的 Plus 会员方案。现状：一个交互逻辑已经跑通的 web demo（[web/](web/)）。下一步：在 [ios/](ios/) 做成 iOS 原生 App。**iOS 体验优先，暂不做 Android / 跨平台。**

`web/` 和 `ios/` 是同一套产品逻辑的两种实现，不是两个产品——改产品逻辑/文案先改 spec，两边实现都要跟着更新；只改某一端的实现细节，不动 spec。

## 技术栈速览

- **`web/`（现有）：** 原生 HTML/CSS/JS，零依赖、零构建，`cd web && npm run dev` 直接跑。
- **`ios/`（规划中，代码尚未开始）：** Swift + SwiftUI + MVVM + SwiftData 本地持久化；无后端；不引入依赖除非必要。
- 完整技术栈、模块划分、数据模型约定、UI 设计 Token → [docs/architecture.md](docs/architecture.md)。
- 已经拍板 / 明确延后的选型（后端、支付、暗色模式等）→ [docs/decisions.md](docs/decisions.md)，不要重新讨论已经定过的事。

## 仓库结构

```
Pip/                     # 本项目根目录（这份 AGENTS.md 所在位置）
├── AGENTS.md / CLAUDE.md   # 本文件（唯一规则源），CLAUDE.md 只是指向它的一行
├── README.md               # 人类友好的项目介绍 + 怎么跑
├── docs/
│   ├── architecture.md       # 技术栈 + 模块划分 + 接口约定（web 现状 + iOS 目标）
│   ├── decisions.md          # 决策记录，一条几行
│   ├── specs/                # 每个功能一份简短 spec，与实现平台无关
│   └── technical-debt-review.md  # 上一轮技术债/安全审查报告（历史记录，非实时规则）
├── web/                     # 现有实现：src/, index.html, design/, assets/, scripts/
└── ios/                     # 未来实现：SwiftUI 工程，目前只有占位 README

../RongrongPlus/         # 仓库里另一个独立产品（Rongrong Plus 商业化 demo），与 Pip 无关，不要在这里改它
../README.md             # 仓库根 README，列出所有产品目录
../AGENTS.md             # 仓库级最简索引，指向各产品自己的 AGENTS.md
../.github/              # 仓库共用的 CI + PR 模板，同时覆盖 Pip 和 RongrongPlus
```

## 开工前必读

1. **有没有对应的 spec？** 先看 `docs/specs/`；没有就照着已有 spec 的格式先写一份简短 spec 再动代码。
2. **这个技术选型是不是已经定过？** 先查 `docs/decisions.md`。定过就照做，别重新发明；没定过、且是个会被反复问的问题，做完之后补一条记录进去。
3. **UI 相关改动**：颜色 / 圆角 / 字号从 `docs/architecture.md` 的设计 Token 表取值，不要现场发明新数值。

## 协作规则（Git / vibe coding）

- **每个任务开一个短生命周期分支**（如 `feat/daily-reminder`、`fix/streak-boundary`），做完自己合并回 `main`。不用等其他人审批；小改动做完确认 CI 绿了就可以立刻合并、删分支。
- **CI 在分支 push 时就跑**（不是等合并到 main 才跑），把它当合并前的把关，不是合并后的补救。CI 变红先修红，不在红的分支上继续叠代码。
- 改动大、或会碰到多人共用的文件（数据模型、DesignSystem、路由/导航层）时，除了开分支，最好再在团队渠道说一声，降低并行 AI 生成代码在同一批文件上互相冲突的概率。
- Commit message 用 Conventional Commits：`feat:` / `fix:` / `refactor:` / `docs:` / `chore:`。
- 合并前的 Definition of Done：能跑、lint 过、涉及的纯逻辑函数有单元测试、UI 数值来自设计 Token、隐含的技术决定已经补进 `docs/decisions.md`。

## 给 AI 助手的具体约定

- 不要在没查 `docs/decisions.md` 的情况下擅自引入新架构模式、新的第三方依赖、新的颜色/字号数值——这些大多已经讨论过，照着做。真的需要偏离，先明确说"这和 decisions.md #N 冲突，需要人决定"，不要静默按自己的方案改。
- 保持改动小而聚焦：只做任务/spec 里写的事，不顺手重构没被要求改的代码。
- 生成代码后自查一遍：业务逻辑有没有混进 View 层、有没有复制粘贴出重复逻辑、有没有对可能为 null 的东西做保护。
- 任务描述模糊到无法确定怎么做时（设计稿没给、decisions.md 没覆盖），先提问，不要自己猜一个方案就开始写代码。

## 不要做的事

- 不引入后端 / 网络请求（现阶段决定纯本地，见 `docs/decisions.md` #2）。
- 不引入 CocoaPods、TypeScript，或任何和已定技术栈冲突的工具，除非先更新 `docs/decisions.md`。
- 不为了"看起来更专业"引入没被要求的抽象、配置或依赖。
