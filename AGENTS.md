# AGENTS.md — Agile-Methods-Product 仓库规则

这个仓库是心理健康产品孵化仓库，包含多个**互相独立**的产品原型。**先进对应产品目录，读它自己的 AGENTS.md / README.md 再动手**——两个产品技术栈和约定不同，不要把一个项目的规则套到另一个上。

- [`Pip/`](Pip/AGENTS.md) — Pip 陪伴 App（mood check-in / journal / plus 会员），规划中做成 iOS 原生 App。规则见 [Pip/AGENTS.md](Pip/AGENTS.md)。
- [`Commercialization/`](Commercialization/README.md) — Rongrong Plus 商业化 demo，规则见其自己的 README。

## 仓库级共用部分

- **CI**：[.github/workflows/ci.yml](.github/workflows/ci.yml)，`Pip/` 和 `Commercialization/` 各自一个 job。
- **PR 模板**：[.github/pull_request_template.md](.github/pull_request_template.md)。
- **Git 协作**：轻量模式，允许直接推 `main`，不强制 PR review，靠 CI 兜底。改动大或涉及某个产品的共用文件时，开分支自己合并、或在团队渠道说一声。具体 Definition of Done 见各产品自己的 AGENTS.md/README。
