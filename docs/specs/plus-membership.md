# Spec: Plus 会员（Paywall）

**状态:** 已在 web demo 验证（本地模拟，非真实支付）· **对应 iOS 模块:** `Features/Plus`

## 目标

展示会员权益、提供一个"激活/结束 demo 会员"的模拟流程，用于验证付费墙的信息架构和转化文案，**不接入真实支付**。

## 用户故事

作为用户，我想知道 Plus 能解锁什么、多少钱，并且能在不被真的扣费的情况下体验会员解锁后的样子。

## 核心交互流程

1. 入口：Home 的 Plus 按钮，或点击一件被锁定的服装。
2. 展示价格（$4.99 USD/月，仅展示用途，见下方"重要限制"）、权益列表、"demo preview" 标注。
3. 点击主按钮 → 弹窗二次确认 → 确认后翻转本地 `plus` 状态为 true，解锁全部服装。
4. 已是会员时，主按钮文案变为"管理会员"，可以结束 demo 会员（同样是本地状态翻转）。
5. Terms / Privacy / Restore 均为纯信息展示或读取本地状态，不发起任何网络请求。

## 数据字段

```
plus: boolean
```

## 重要限制（必须在 UI 文案里保留）

- 明确标注"demo / 无真实扣费"，不能让用户误以为发生了真实交易。
- **不能**把这里的 `plus` 布尔值当作生产环境的付费凭证——本地状态可被用户任意修改。真实上线前必须替换为服务端签发/校验的 entitlement，见 [decisions.md](../decisions.md) "后端 / 账号系统" 一条与 [technical-debt-review.md](../technical-debt-review.md) PBI-9。

## 验收标准

- [ ] 未订阅/已订阅两种状态下，锁定服装的视觉区分明确（不仅靠颜色）。
- [ ] 激活/取消都需要二次确认弹窗，不能一次点击直接生效。
- [ ] 所有价格/权益文案与 [architecture.md](../architecture.md) 设计 Token 一致，没有重复维护的价格字符串（对应 technical-debt-review.md TD-4）。
- [ ] 页面任何地方都不会声称"已扣费"或"已续订"。

## 关联

- 技术决策：[decisions.md](../decisions.md) "支付 / IAP 方案"（暂缓选型）、"后端 / 账号系统"
- 安全注意事项：[technical-debt-review.md](../technical-debt-review.md) PBI-9
