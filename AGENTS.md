# AGENTS.md — Rongrong Project Rules

The single source of project rules. **Every AI coding assistant (Claude Code / Codex / others) and every human contributor should read this file before starting a task.** For deeper technical details see [docs/architecture.md](docs/architecture.md); for visual specs see [docs/design-system.md](docs/design-system.md); for past decisions see [docs/decisions.md](docs/decisions.md); for a specific feature see [docs/specs/](docs/specs/).

## What the project is

Rongrong is a mental-wellness companion product: raise a virtual companion, log your daily mood, write a Journal, dress Rongrong up, and try a simulated Plus membership. Current state: a web demo whose interaction logic already works end to end ([web/](web/)). Next step: build it as a native iOS app in [ios/](ios/). **The iOS experience comes first; no Android / cross-platform for now.**

`web/` and `ios/` are two implementations of the same product logic, not two products. To change product logic or copy, update the spec first, then update both implementations to match. If you are only changing an implementation detail on one side, leave the spec alone.

[`prototypes/plus-standalone/`](prototypes/plus-standalone/README.md) is an earlier standalone paywall prototype. It has been superseded by the Plus flow built into `web/` and is kept only as a reference for its test cases. **Do not build new features on it.**

There is also a completely separate implementation on the `feature/pip-frontend` branch (not merged into `main`, developed independently by another author). **Do not touch that branch for now.** How the architectures will be integrated is still undecided; wait until it is confirmed. Do not merge it on your own initiative or use it as a reference to change code here.

## Tech stack at a glance

- **`web/` (existing):** Vanilla HTML/CSS/JS, zero dependencies, zero build step. Run it directly with `cd web && npm run dev`.
- **`ios/` (planned, no code yet):** Swift + SwiftUI + MVVM + SwiftData for local persistence; no backend; no dependencies unless necessary.
- Full tech stack, module breakdown and data-model conventions → [docs/architecture.md](docs/architecture.md).
- Color / typography / spacing / component tokens → [docs/design-system.md](docs/design-system.md). Do not invent new values on the spot.
- Choices that have been settled or explicitly deferred (backend, payments, dark mode, etc.) → [docs/decisions.md](docs/decisions.md). Do not reopen settled decisions.

## Repository layout

```
AGENTS.md / CLAUDE.md       # This file (single source of rules)
README.md                   # Human-friendly project intro + how to run
docs/
  design-system.md            # Color / typography / spacing / component tokens
  architecture.md              # Tech stack + module breakdown + interface conventions
  decisions.md                 # Decision log, a few lines per entry
  specs/                       # One short, platform-agnostic spec per feature
  technical-debt-review.md     # Technical debt / security review report (historical)
web/                         # Current implementation: src/, index.html, design/, assets/, scripts/
ios/                         # Future implementation: SwiftUI project, placeholder README only for now
prototypes/
  plus-standalone/             # Early paywall prototype, superseded by web/, reference only
.github/                     # CI + PR template
```

## Read before you start

1. **Is there a spec for it?** Check `docs/specs/` first. If there isn't one, write a short spec following the format of the existing ones before touching code.
2. **Has this technical choice already been made?** Check `docs/decisions.md` first. If it has, follow it; don't reinvent it. If it hasn't, and it's a question that will keep coming up, add an entry once you're done.
3. **UI changes:** Take colors / corner radii / font sizes from the token tables in `docs/design-system.md`. Do not invent new values on the spot.

## Collaboration rules (Git / vibe coding)

- **Open a short-lived branch for each task** (e.g. `feat/daily-reminder`, `fix/streak-boundary`) and merge it back into `main` yourself when done. No need to wait for approval from others; for small changes, merge and delete the branch as soon as CI is green.
- **CI runs on branch push** (not only after merging into main). Treat it as a gate before merging, not a fix-up after. If CI goes red, fix it first; don't keep stacking code on a red branch.
- For large changes, or changes to files shared by many people (data model, design tokens, routing/navigation layer), besides opening a branch, give the team channel a heads-up to reduce the chance of parallel AI-generated code conflicting in the same files.
- Commit messages follow Conventional Commits: `feat:` / `fix:` / `refactor:` / `docs:` / `chore:`.
- Definition of Done before merging: it runs, lint passes, pure logic functions touched have unit tests, UI values come from design tokens, and any implicit technical decision has been added to `docs/decisions.md`.

## Specific conventions for AI assistants

- Do not introduce new architectural patterns, new third-party dependencies, or new color/font-size values without checking `docs/decisions.md`. Most of these have been discussed already; follow them. If you really need to deviate, say explicitly "this conflicts with decisions.md #N and needs a human decision" instead of silently going with your own approach.
- Keep changes small and focused: do only what the task/spec says; don't refactor code you weren't asked to change.
- Review generated code yourself: is business logic leaking into the View layer, is there copy-pasted duplicate logic, are values that may be null guarded?
- When a task description is too vague to know what to do (no design provided, not covered by decisions.md), ask first. Don't guess a solution and start writing code.

## Don'ts

- Don't introduce a backend or remote storage of user data (data stays local; see `docs/decisions.md` #2). Network requests are allowed only for external AI services such as companion chat, with API keys kept server-side and the app still working offline without them.
- Don't introduce CocoaPods, TypeScript, or any tool that conflicts with the settled tech stack unless you update `docs/decisions.md` first.
- Don't add abstractions, configuration or dependencies nobody asked for just to "look more professional".
- Don't add new features to `prototypes/plus-standalone/`; don't touch the `feature/pip-frontend` branch.

## CI / PR

- **CI**: [.github/workflows/ci.yml](.github/workflows/ci.yml).
- **PR template**: [.github/pull_request_template.md](.github/pull_request_template.md).
