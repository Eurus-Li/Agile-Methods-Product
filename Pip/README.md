# Pip

一款心理健康陪伴产品：养一只虚拟小伙伴，记录每日心情、写 Journal、给 Pip 换装，并有一个模拟的 Plus 会员方案。当前有一个交互逻辑已经跑通的 **web demo**（[web/](web/)），下一步目标是做成 **iOS 原生 App**（[ios/](ios/)，尚未开始）。

## 给协作者（vibe coding 团队）

这个仓库同时被人和 AI 编码助手（Claude Code / Codex 等）使用。**任何任务开始前先读 [AGENTS.md](AGENTS.md)**——那是本项目唯一的规则源，Claude Code 会通过 [CLAUDE.md](CLAUDE.md) 自动读到同一份内容。仓库根目录还有一份最简版 [../AGENTS.md](../AGENTS.md)，指路到 `Pip/` 和 `RongrongPlus/` 各自的规则。

日常开发只需要记住三件事：

1. **做之前先看 [docs/specs/](docs/specs/)**，没有对应 spec 就先写一份简短的再动代码（参考 [mood-checkin.md](docs/specs/mood-checkin.md)）。
2. **技术/设计选型先查 [docs/decisions.md](docs/decisions.md)**，已经定过的不要重新讨论；新的、会被反复问的问题，做完记得补一条。
3. **每个任务开一个短分支，做完自己合并**：不用等审批，小改动确认 [CI](../.github/workflows/ci.yml) 绿了就能立刻合到 `main`——但这意味着合并前自己要走一遍 [../.github/pull_request_template.md](../.github/pull_request_template.md) 里的 checklist，不管有没有开 PR。

技术栈、模块划分、UI 设计 Token 的完整说明在 [docs/architecture.md](docs/architecture.md)。

## 项目结构

```text
Pip/
├── AGENTS.md                  # 唯一的项目规则（AI 助手 / 人都先读这个）
├── CLAUDE.md                  # 一行：指向 AGENTS.md，供 Claude Code 读取
├── README.md                  # 项目说明（本文件）
├── docs/
│   ├── architecture.md        # 技术栈 + 模块划分 + 设计 Token（web 现状 + iOS 目标）
│   ├── decisions.md           # 技术/产品决策记录
│   ├── specs/                 # 每个功能一份简短 spec，与实现平台无关
│   └── technical-debt-review.md  # 技术债/安全审查报告（历史记录）
├── web/                       # 现有实现：原生 HTML/CSS/JS demo，零依赖零构建
│   ├── index.html
│   ├── package.json
│   ├── requirements-dev.txt
│   ├── src/
│   │   ├── js/app.js          # 页面路由、交互逻辑、状态与本地保存
│   │   └── styles/app.css     # 响应式布局、交互状态和弹层样式
│   ├── assets/                # 应用实际使用的图片
│   ├── design/                # Pencil/pen.dev 设计画板导出
│   └── scripts/                # 本地静态服务器 + 模板生成脚本
└── ios/                       # 未来实现：SwiftUI 原生 App（尚未开始，见 ios/README.md）
```

`web/` 和 `ios/` 是同一套产品逻辑的两种实现，不是两个不同产品——`docs/` 下的 spec/decisions/architecture 对两者都适用。仓库共用的 CI（`../.github/workflows/ci.yml`）和 PR 模板放在仓库根目录，同时覆盖 Pip 和 `RongrongPlus/`。

## 快速启动（web demo）

在 `Pip/web/` 目录打开终端，使用 **Node.js 20 或更新版本**运行：

```sh
cd Pip/web
npm run dev
```

打开 **http://127.0.0.1:8000**。项目没有 npm 依赖，无需先执行 `npm install`。`npm start` 与 `npm run dev` 相同，按 `Ctrl+C` 停止服务。

端口被占用时，可以先关闭旧服务，或在 macOS / Linux 上指定其他端口：

```sh
PORT=8001 npm run dev
```

也支持以下运行方式：

- **直接打开**：双击 `web/index.html`，无需 Node.js、Python 或构建。
- **VS Code**：使用 Live Server 打开 `web/index.html`。
- **Python**：在 `web/` 目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`。

日常演示建议使用 `npm run dev`，该服务仅提供 `index.html`、`src/` 和 `assets/` 中的应用文件。Python 和 Live Server 会同时提供目录中的其他文件。

### 常用命令（在 `Pip/web/` 下执行）

| 命令 | 用途 | 环境 |
| --- | --- | --- |
| `npm run dev` / `npm start` | 启动本地演示服务 | Node.js 20+ |
| `npm run check` | 检查应用和服务器 JavaScript 语法 | Node.js 20+ |
| `npm run build:templates` | 根据设计源文件重新生成 `index.html` 和图片 | Node.js、Python 3、Python 开发依赖 |

`check` 是语法检查，不替代浏览器交互验证。项目无需打包即可运行，普通代码修改也不需要重新生成模板。

## 功能与演示流程

1. **Home**：点击 Pip 与它互动，选择 Calm、Happy、Tired、Sad 或 Tense 记录当天心情。
2. **Pip Reply**：查看对应回复、拥抱 Pip、收藏回复，再关闭弹层。选择心情时已自动记录，收藏按钮用于标记回复。
3. **Journal**：切换月份或年份，点击有记录的日期查看回复、保存文字备注，查看月度汇总。
4. **Me**：修改昵称和生日，选择配饰或打开衣橱；配饰会显示在 Home 的 Pip 上。
5. **Plus**：通过 Home 的 Plus 按钮或锁定配饰进入，模拟开通会员、检查恢复状态或结束会员。

页面通过 URL hash 导航，支持浏览器前进与后退：`#home`、`#reply`、`#journal`、`#me`、`#plus`。

首次使用的日历为空，统计由实际演示记录生成。同一天再次选择心情会更新当天记录，不会重复增加当天签到奖励。通过 **Me → Settings → Reset demo data** 可以清空演示数据。

## 开发与更新设计（web demo）

- 修改行为、文案逻辑或本地状态：编辑 `web/src/js/app.js`。
- 修改响应式布局或交互样式：编辑 `web/src/styles/app.css`。
- Pip 高清图片：`web/assets/images/pip.jpg`（1536 × 1024），用于首页、回复、个人页和 Plus 页；模板生成脚本会自动用它替代原始画板中的低分辨率缩略图。
- 更新原始页面设计：替换 `web/design/exports/` 中相应的 HTML，然后重新生成模板。

重新生成模板前，在 `web/` 目录安装 Python 开发依赖（macOS / Linux）：

```sh
cd Pip/web
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements-dev.txt
python3 scripts/build_demo.py
```

在已激活的虚拟环境中，最后一条也可使用 `npm run build:templates`。

生成脚本按 `01` 至 `05` 的文件名前缀读取画板，将内嵌图片提取到 `assets/images/`，并重写 `web/index.html`。手工修改 `index.html` 会在下次生成时被覆盖。交互依赖画板中的 `data-pencil-name` 名称；重命名设计节点时，需要同步调整 `src/js/app.js` 和相关 CSS 选择器。

## 数据与演示范围（web demo）

- 昵称、生日、心情、备注、配饰和模拟会员状态保存在当前浏览器的 `localStorage`，键名为 `pip-demo-v1`。
- 不同浏览器、端口、`localhost` / `127.0.0.1` 和直接打开文件的存储环境相互独立。建议固定使用同一地址；浏览器禁止存储时，修改仅在本次页面会话内有效。
- Pip 回复为预设文本；没有接入 AI、账号系统、云端同步或真实支付。
- Plus 仅模拟会员状态和配饰解锁，页面中的价格不会产生扣款或自动续费。
- 运行所需图片均在本地，正常演示不依赖外部网络资源。
