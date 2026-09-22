# Rongrong

一款心理健康陪伴产品：养一只虚拟小伙伴，记录每日心情、写 Journal、给 Rongrong 换装，并有一个模拟的 Plus 会员方案。当前有一个交互逻辑已经跑通的 **web demo**（[web/](web/)），下一步目标是做成 **iOS 原生 App**（[ios/](ios/)，尚未开始）。

## 快速启动（web demo）

```sh
cd web
npm run dev
```

打开 **http://127.0.0.1:8000**。项目没有 npm 依赖，无需先执行 `npm install`。`npm start` 与 `npm run dev` 相同，按 `Ctrl+C` 停止服务。

端口被占用时可以指定其他端口：

```sh
PORT=8001 npm run dev
```

也支持：直接双击 `web/index.html`；VS Code Live Server 打开 `web/index.html`；或 `cd web && python3 -m http.server 8000 --bind 127.0.0.1`。

### 常用命令（在 `web/` 下执行）

| 命令 | 用途 |
| --- | --- |
| `npm run dev` / `npm start` | 启动本地演示服务 |
| `npm test` | 验证活动推荐、选择与皮肤纯逻辑 |
| `npm run check` | 检查应用和服务器 JavaScript 语法 |
| `npm run build:templates` | 根据设计源文件重新生成 `index.html` 和图片 |

## 功能与演示流程

1. **Home**：点击去背的 Rongrong 与它互动，小狗和配饰会轻跳，后方奶油色窗光/植物插画保持固定；选择 Calm、Happy、Tired、Sad 或 Tense 记录当天心情。
2. **Reply**：查看对应回复、拥抱 Rongrong、收藏回复；浏览三个心情推荐活动，查看时间与步骤，再选择一项。Home 可再次打开当天活动，Journal 可查看历史日期的活动。
3. **Journal**：切换月份或年份，点击有记录的日期查看回复、保存文字备注，查看月度汇总。
4. **Me**：修改昵称和生日，选择配饰或打开衣橱；配饰会显示在 Home 的 Rongrong 上。
5. **Plus**：通过 Home 的 Plus 按钮或锁定配饰进入，模拟开通会员、检查恢复状态或结束会员。

页面通过 URL hash 导航：`#home`、`#reply`、`#journal`、`#me`、`#plus`。通过 **Me → Settings → Reset demo data** 可以清空演示数据。

## 开发与更新设计

- 修改行为、文案逻辑或本地状态：编辑 `web/src/js/app.js`。
- 修改响应式布局或交互样式：编辑 `web/src/styles/app.css`。
- 更新原始页面设计：替换 `web/design/exports/` 中相应的 HTML，然后在 `web/` 目录跑 `npm run build:templates`（首次需要 `python3 -m pip install -r requirements-dev.txt`）重新生成 `index.html`。手工改 `index.html` 会在下次生成时被覆盖。

## 数据与演示范围

- 昵称、生日、心情、备注、配饰和模拟会员状态保存在浏览器 `localStorage`，键名 `rongrong-demo-v1`。
- Rongrong 回复为预设文本；没有接入 AI、账号系统、云端同步或真实支付。

## 协作文件一览

| 文件 | 干什么用 |
|---|---|
| [AGENTS.md](AGENTS.md) | 项目规则，AI 编码助手开工前先读 |
| [docs/design-system.md](docs/design-system.md) | 颜色/字体/间距/组件 Token |
| [docs/architecture.md](docs/architecture.md) | 技术栈、模块划分、iOS 组件映射 |
| [docs/changelog.md](docs/changelog.md) | 开发日志与功能更新记录 |
| [docs/decisions.md](docs/decisions.md) | 已经定过的技术/产品选型 |
| [docs/specs/](docs/specs/) | 每个功能的交互流程 |
| [docs/technical-debt-review.md](docs/technical-debt-review.md) | 技术债/安全审查记录 |
| [prototypes/plus-standalone/](prototypes/plus-standalone/README.md) | 早期付费墙原型，已被 web/ 取代，仅供参考 |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | 每次 push 自动跑的检查 |
| [.github/pull_request_template.md](.github/pull_request_template.md) | 合并前的 Definition of Done 清单 |

## Commercialization：宠物皮肤

Home 的 **Skins** 按钮、Me 衣橱或 Plus 页的 **Explore pet skins** 可打开商店。预览后确认模拟购买，皮肤立即应用到 Home，可与配饰叠加使用。

| 皮肤 | 一次性示例价格 | 外观 |
| --- | --- | --- |
| Classic Cream | 免费 | 原始奶油色 |
| Mint Cloud | US$0.99 | 薄荷色与叶子 |
| Cherry Blossom | US$1.99 | 樱花粉与花朵 |
| Starlight | US$2.99 | 薰衣草色与月亮星星 |

皮肤独立于 US$4.99/月的 Plus 配饰会员；结束会员不影响已购皮肤。**所有交易均为本地模拟，不会真实扣款。** `skin` 和 `ownedSkins` 存入现有 localStorage，刷新后保留，重置演示数据会清除。旧数据自动补充免费默认皮肤。

运行 `npm test` 验证皮肤定价、购买和穿戴逻辑。产品规格见 [pet-skins.md](docs/specs/pet-skins.md)。

## Release 1.1：心情活动

五种心情各推荐三个免费活动。卡片 → **View details** → **Select activity**；关闭详情不会选择活动。确认选择后，去背后的 Rongrong 会独立轻跳、摇摆并飘出爱心，背景保持固定，短暂庆祝后停下；支持系统减弱动态效果。每个日期保留一项选择，同心情重新打卡保留，改心情清空。选择只保存于本机，不提供计时或完成奖励。规格见 [mood-activities.md](docs/specs/mood-activities.md)。
