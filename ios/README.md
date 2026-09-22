# Pip iOS App — 尚未开始

这个目录是未来 SwiftUI 原生 App 的占位。技术栈、架构、模块划分、UI 设计 Token 已经在 [../docs/architecture.md](../docs/architecture.md) 定好，开始写代码时直接照着建工程，不用重新决定。

产品逻辑（心情打卡、Journal、Me、Plus）已经在 [../web/](../web/) 跑通并验证过，见 [../docs/specs/](../docs/specs/)。iOS 版本是把同样的产品逻辑用原生实现，不是从零设计。

开始这个目录下的工作前，先看 [../AGENTS.md](../AGENTS.md)。

Release 1.1 的活动推荐已定义于 [活动规格](../docs/specs/mood-activities.md)，Web 先实现。未来 Reply 模块复用固定目录 ID、心情映射和选择规则；SwiftData 增加可空 activityId，旧记录默认 nil。
