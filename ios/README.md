# Rongrong iOS App — 尚未开始

这个目录是未来 SwiftUI 原生 App 的占位。技术栈、架构、模块划分、UI 设计 Token 已经在 [../docs/architecture.md](../docs/architecture.md) 定好，开始写代码时直接照着建工程，不用重新决定。

产品逻辑（心情打卡、Journal、Me、Plus）已经在 [../web/](../web/) 跑通并验证过，见 [../docs/specs/](../docs/specs/)。iOS 版本是把同样的产品逻辑用原生实现，不是从零设计。

开始这个目录下的工作前，先看 [../AGENTS.md](../AGENTS.md)。

Release 1.1 的活动推荐已定义于 [活动规格](../docs/specs/mood-activities.md)，Web 先实现。未来 Reply 模块复用固定目录 ID、心情映射和选择规则；SwiftData 增加可空 activityId，旧记录默认 nil。

活动确认反馈：按活动规格显示短暂的小狗开心动画与选择文字，使用系统 accessibilityReduceMotion 决定是否关闭位移/缩放；不新增持久化字段或 Bond 奖励。

视觉对齐：Home 使用透明角色、独立插画背景和固定阴影；配饰随角色运动，五个心情选项使用对应手绘表情。素材路径与提示词见 [角色/背景](../docs/pet-animation-asset.md) 和 [心情头像](../docs/mood-portrait-assets.md)。这些目前仅在 Web 实现，iOS 仍待建立工程与原生适配。
