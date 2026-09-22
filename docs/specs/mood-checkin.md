# Spec: 心情打卡（Mood Check-in）

**状态:** 已在 web demo 验证 · **对应 iOS 模块:** `Features/Home`, `Features/Reply`

## 目标

用户每天在 Home 页选一个心情，Rongrong 给出对应的安慰/回应文案，形成"每天来看看 Rongrong"的核心循环。

## 用户故事

作为用户，我想快速记录今天的心情并得到一句贴心的回应，这样我能感觉到被看见，而不用写很长的日记。

## 核心交互流程

1. Home 页展示 5 个心情选项：Calm / Happy / Tired / Sad / Tense（对应色值见 [architecture.md](../architecture.md#色彩)）。
2. 用户点选一个 → 写入当天记录（若当天已有记录，覆盖 mood，保留已有的 note/saved/hugged 状态）→ 跳转到 Reply 页。
3. Reply 页展示对应文案（五条固定文案之一）、当前 Bond 等级条、Hug 按钮、Save（收藏）按钮。
4. 首次打卡当天 bond +15；Hug 按钮首次点击 +5，重复点击不再加分。
5. Reply 展示三个对应心情的活动卡；详情、选择及迁移规则见 [活动规格](mood-activities.md)。同心情重打卡保留 activityId，改心情时清空。
6. 关闭 Reply 或点击遮罩 → 回到 Home。
7. Home 小狗为透明角色层，置于固定的奶油色手绘窗光与植物场景前。点击或键盘 Enter/Space 抚摸时只让角色及配饰轻跳，背景与地面阴影不动；保留当前皮肤，遵循减弱动态效果设置，不新增数据或奖励。

## 数据字段

```
entries[dateKey]: { mood, note, saved, hugged, created, activityId }
bond: number（用于计算 Lv. = 7 + floor(bond / 100)）
```

## 边界情况

- 同一天重复打卡：更新 mood，不重复加 bond。
- 心情记录的 key 必须是 `yyyy-MM-dd` 格式，非法/损坏数据要在读取时被拒绝而不是崩溃。
- 从 Journal 点开某天进 Reply 时，用该天的记录而非"今天"的记录。

## 验收标准

- [ ] 5 种心情都能选中并正确高亮（颜色 + `aria`/`accessibility` 状态双重表达，不只靠颜色）。
- [ ] Reply 文案与 mood 一一对应，且 Bond 等级/进度条随 bond 值实时更新。
- [ ] 重复打卡不重复计入当日 bond 奖励。
- [ ] Hug 按钮幂等（多次点击只加一次分）。

## 关联

- 设计 Token：[architecture.md 第 4 节](../architecture.md#4-设计系统--ui-token)
- 已知技术债参考（避免在 iOS 版本重犯）：[technical-debt-review.md](../technical-debt-review.md) TD-3（无保护的状态查找）、TD-4（重复的 bond 进度公式）
