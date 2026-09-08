# Pip 浏览器 Demo

基于五个设计画板实现的原生 HTML、CSS、JavaScript 交互原型，包含 Home、Pip Reply、Journal、Me 和 Plus。支持手机尺寸、键盘操作和浏览器本地保存，无需后端或外部 API。

## 快速启动

在仓库根目录打开终端，使用 **Node.js 20 或更新版本**运行：

```sh
cd Pip
npm run dev
```

打开 **http://127.0.0.1:8000**。项目没有 npm 依赖，无需先执行 `npm install`。`npm start` 与 `npm run dev` 相同，按 `Ctrl+C` 停止服务。

端口被占用时，可以先关闭旧服务，或在 macOS / Linux 上指定其他端口：

```sh
PORT=8001 npm run dev
```

也支持以下运行方式：

- **直接打开**：双击根目录的 `index.html`，无需 Node.js、Python 或构建。
- **VS Code**：使用 Live Server 打开根目录的 `index.html`。
- **Python**：在本目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`。

日常演示建议使用 `npm run dev`，该服务仅提供 `index.html`、`src/` 和 `assets/` 中的应用文件。Python 和 Live Server 会同时提供项目目录中的其他文件。

## 项目结构

```text
.
├── index.html                 # 浏览器入口，包含五个页面模板（由脚本生成）
├── package.json               # 项目信息和 npm 命令
├── README.md                  # 项目说明
├── .gitignore                 # 忽略本地环境、日志和验证截图
├── requirements-dev.txt       # 仅重新生成模板时需要的 Python 依赖
├── src/
│   ├── js/
│   │   └── app.js             # 页面路由、交互逻辑、状态与本地保存
│   └── styles/
│       └── app.css            # 响应式布局、交互状态和弹层样式
├── assets/
│   ├── favicon.svg            # 网站图标
│   └── images/                # 应用实际使用的图片，从设计导出中提取
├── design/
│   ├── exports/               # 五个原始 *-export.html 设计画板
│   └── images/                # 原始设计图片素材
└── scripts/
    ├── serve.js               # 无依赖的本地静态服务器
    └── build_demo.py          # 从设计导出重新生成页面模板和图片
```

本目录是 `Agile-Methods-Product` 仓库中的独立 Pip demo，与 `Commercialization/` 并列。后续命令均在 `Pip/` 目录执行；本 demo 不依赖 `Commercialization/`。

## 常用命令

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

## 开发与更新设计

- 修改行为、文案逻辑或本地状态：编辑 `src/js/app.js`。
- 修改响应式布局或交互样式：编辑 `src/styles/app.css`。
- Pip 高清图片：`assets/images/pip.jpg`（1536 × 1024），用于首页、回复、个人页和 Plus 页；模板生成脚本会自动用它替代原始画板中的低分辨率缩略图。
- 更新原始页面设计：替换 `design/exports/` 中相应的 HTML，然后重新生成模板。

重新生成模板前，在项目根目录安装 Python 开发依赖（macOS / Linux）：

```sh
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements-dev.txt
python3 scripts/build_demo.py
```

在已激活的虚拟环境中，最后一条也可使用 `npm run build:templates`。

生成脚本按 `01` 至 `05` 的文件名前缀读取画板，将内嵌图片提取到 `assets/images/`，并重写根目录的 `index.html`。手工修改 `index.html` 会在下次生成时被覆盖。交互依赖画板中的 `data-pencil-name` 名称；重命名设计节点时，需要同步调整 `src/js/app.js` 和相关 CSS 选择器。

提交或共享项目时应包含 `index.html`、`src/`、`assets/`，这样接收方可以直接运行。如果需要继续更新设计，也应包含 `design/`、`scripts/` 和配置文件。

## 数据与演示范围

- 昵称、生日、心情、备注、配饰和模拟会员状态保存在当前浏览器的 `localStorage`，键名为 `pip-demo-v1`。
- 不同浏览器、端口、`localhost` / `127.0.0.1` 和直接打开文件的存储环境相互独立。建议固定使用同一地址；浏览器禁止存储时，修改仅在本次页面会话内有效。
- Pip 回复为预设文本；没有接入 AI、账号系统、云端同步或真实支付。
- Plus 仅模拟会员状态和配饰解锁，页面中的价格不会产生扣款或自动续费。
- 运行所需图片均在本地，正常演示不依赖外部网络资源。
