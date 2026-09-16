# Agile-Methods-Product
Product for mental health

协作规则（含 vibe coding / AI 助手约定）见 [AGENTS.md](AGENTS.md)。

## Demos

- [Pip browser demo](Pip/README.md): five connected screens for mood check-ins, replies, journaling, profile customization, and simulated Plus membership. Run `cd Pip/web && npm run dev`, then open http://127.0.0.1:8000.
- [Rongrong Plus](RongrongPlus/README.md): standalone Rongrong Plus commercialization demo.

## 怎么给 Coding Agent 下指令（vibe coding 使用者必读）

这个仓库的协作模式是人 + AI coding agent（Claude Code / Codex 等）直接写代码：每个任务开一个短分支，做完自己合并回 `main`，不用等审批。Prompt 写得好不好，直接决定 agent 是遵守这个仓库已经定好的架构和规则，还是自己发明一套——尤其因为每个新会话大概率是一个**没有记忆的新 agent 实例**，它唯一能依赖的持久上下文就是仓库里的文件。

### 黄金法则

**每次开新任务，先让 agent 读对应产品自己的 AGENTS.md**（比如 [Pip/AGENTS.md](Pip/AGENTS.md)、[RongrongPlus/README.md](RongrongPlus/README.md)），仓库根目录还有一份最简索引 [AGENTS.md](AGENTS.md)。大部分 agent 工具会自动读这些文件，但在 prompt 里明确点出来，能避免它中途"忘了"或者只读了一半就开始写代码。

### 一个好 Prompt 至少包含四块

1. **范围** — 在哪个产品、哪个实现里改（`Pip/web`、`Pip/ios`、`RongrongPlus`），不要让 agent 自己猜。
2. **依据** — 这个功能有没有对应 spec？没有就先让 agent 在 `docs/specs/` 写一份，你确认过再写代码。
3. **约束** — 提醒 agent 先查 `docs/decisions.md`，已经定过的技术选型不要重新发明。
4. **验收标准** — 怎么算做完，对应 [.github/pull_request_template.md](.github/pull_request_template.md) 里的 Definition of Done。

### 例子

❌ 模糊、容易让 agent 自由发挥：

> 帮我在 Pip 里加个提醒功能。

✅ 具体、有约束、agent 不容易跑偏：

> 在 `Pip/web` 里加一个每日提醒功能。先读 `Pip/AGENTS.md` 和 `Pip/docs/decisions.md`，确认这不违反"暂不接入后端"的决定（提醒应该是纯前端的本地通知/UI 提示，不要引入任何网络请求）。参考 `Pip/docs/specs/mood-checkin.md` 的格式，先写一份 `Pip/docs/specs/daily-reminder.md` 描述交互流程，我确认后再写代码。UI 数值从 `Pip/docs/architecture.md` 的设计 Token 取，不要发明新颜色。写完给纯逻辑部分补单元测试，跑一遍 `npm run check`。

### 常见坑

- **不要**假设 agent 记得上次对话的约定——约定必须写进 `AGENTS.md`/`docs/`，只停留在聊天记录里等于没有。
- **不要**用"顺手也把 XX 重构一下"这种模糊授权。大范围改动单独开一个分支说清楚，不要糊进无关任务的分支里一起合并。
- Agent 生成代码后，**你**要负责看一遍 diff 再合并，不是 agent 自己说"做完了"就代表能合并到 `main`。
- 如果 agent 的方案明显偏离 `docs/decisions.md`（比如突然引入了后端调用），先停下来问它"这是不是该先更新 decisions.md"，而不是直接接受。

### 推送前自查

不管有没有开 PR，都照着 [.github/pull_request_template.md](.github/pull_request_template.md) 里的 Definition of Done 清单过一遍——那份清单就是"怎么判断这次任务真的做完了"的标准答案。
