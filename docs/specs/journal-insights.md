# Spec: Journal records and insights

**状态:** 已在 Web demo 实现 · **对应 iOS 模块:** `Features/Journal`（工程尚未建立）

## 目标

Journal 将每日心情、文字记录和已选活动整理成可回看的时间线，并提供容易理解的月度与长期概览。分析仅描述用户自己记录的数据，不提供诊断或治疗判断。

## 核心交互

1. Month 日历按心情语义色标记有记录的日期；可切换月份并打开单日详情。Year 显示各月记录天数并可进入对应月份。
2. 用户生日对应的月日显示蛋糕图标；修改生日后重新进入 Journal 即同步更新。
3. 单日详情显示心情头像、emoji、标签、Rongrong 固定回复、已选活动和可编辑 note。
4. Recent moods 默认显示最近三条记录；See all 展开全部，See less 恢复折叠。每条显示心情头像、标签、note（无 note 时显示回复）和日期，点击可打开详情。
5. 月度分析按五种心情显示数量和比例，并按日历周展示每周记录天数及最常见心情。
6. Preferred activity 统计全部历史记录中选择次数最多的活动；Total logged days 统计全部有记录的唯一日期。
7. 无记录、无活动选择和旧数据均显示空状态，不报错；数据只从现有本地状态读取，不新增网络请求。

## 数据与计算边界

- 继续使用 `rongrong-demo-v1.entries[dateKey]`，不增加持久化字段。
- 月度分布和周模式只计算当前查看月份；Total logged days 和 Preferred activity 使用全部历史记录。
- 每个日期最多一条记录，因此 logged days 等于合法 entry key 数量。
- 次数相同的心情或活动按既有目录顺序稳定选择，避免界面随机变化。

## 验收标准

- [x] 月历、年历、日期详情和生日图标随本地状态更新。
- [x] Recent moods 正确排序，并可展开/折叠。
- [x] 月度心情数量、每周主导心情、总记录天数和偏好活动由纯逻辑计算。
- [x] 单日详情同时呈现心情视觉、标签、回复、活动和 note。
- [x] 纯逻辑有单元测试，JavaScript 语法检查和完整 Web 测试通过。

## 关联

[心情打卡](mood-checkin.md) · [心情活动](mood-activities.md) · [设计规范](../design-system.md) · [架构](../architecture.md)
