# AGENTS.md — Agile-Methods-Product 仓库规则

这个仓库是心理健康产品孵化仓库，包含多个**互相独立**的产品原型。**先进对应产品目录，读它自己的 AGENTS.md / README.md 再动手**——两个产品技术栈和约定不同，不要把一个项目的规则套到另一个上。

- [`Pip/`](Pip/AGENTS.md) — Pip 陪伴 App（mood check-in / journal / plus 会员），规划中做成 iOS 原生 App。规则见 [Pip/AGENTS.md](Pip/AGENTS.md)。
- [`RongrongPlus/`](RongrongPlus/README.md) — Rongrong Plus 商业化 demo，规则见其自己的 README。

## 仓库级共用部分

- **CI**：[.github/workflows/ci.yml](.github/workflows/ci.yml)，`Pip/` 和 `RongrongPlus/` 各自一个 job。
- **PR 模板**：[.github/pull_request_template.md](.github/pull_request_template.md)。
- **Git 协作**：每个任务开一个短生命周期分支，做完自己合并回 `main`，不用等他人审批；小改动可以立刻合。CI 在分支 push 时就跑，作为合并前的把关，不是合并后才补救。具体 Definition of Done 见各产品自己的 AGENTS.md/README。
