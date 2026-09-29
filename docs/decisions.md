# Decisions

A log of important decisions, a few lines each. The goal is to keep every new vibe-coding session from reopening things that have already been settled. **Before changing any conclusion below, change it here first, then change the code.**

---

### 2026-09-15 · Platform strategy
Native iOS only (SwiftUI); no Android / cross-platform framework for now.
Rationale: the iOS experience comes first; during the prototype phase, polish one platform properly.
Revisit: when Android demand needs validating, or when the team grows to build both platforms for real.

### 2026-09-15 · Backend / account system
No backend for now; all data is persisted locally (SwiftData).
Rationale: avoid investing in infrastructure too early during the prototype phase.
Revisit: when multi-device sync or real accounts are needed, or **this must be resolved before introducing real payments** (otherwise we repeat the "client self-certifies payment" problem from PBI-9 in the [technical debt review](technical-debt-review.md)).

### 2026-09-15 · Payments / IAP
Not chosen yet (candidates: RevenueCat vs. in-house StoreKit); does not affect prototype development.
Revisit: when deciding to integrate real in-app purchases.

### 2026-09-15 · Design asset source
Keep using Pencil (pen.dev) for mockups/artboards, continuing with the existing [design/exports/](../web/design/exports/).
Revisit: Figma can be evaluated when collaboration grows enough to need a more mature multi-user design tool.

### 2026-09-15 · Fonts
Phase 1 uses the system SF Rounded; no embedded custom Nunito font.
Rationale: good native rendering performance, automatic Dynamic Type support, no font bundling needed.
Revisit: can be switched at any time if brand recognition needs grow; low risk.

### 2026-09-15 · Dark Mode
Phase 1 is light mode only, matching the web demo.
Revisit: add it once the product shape is stable and before the official App Store launch.

### 2026-09-15 · Testing strategy
Unit tests are mandatory for pure logic functions; UI/snapshot tests are not required during the prototype phase.
Rationale: learn from the web demo review, where core logic had zero coverage, but during frequent redesigns UI test maintenance costs outweigh the benefits.
Revisit: add UI tests once iteration slows and the product shape stabilizes.

### 2026-09-15 · Git collaboration model
Open a short-lived branch for each task and merge it back into `main` yourself when done; approval from others is not required, and small changes can be merged immediately. CI runs on branch push (without waiting for a merge into main) as the gate before merging.
Rationale: the team is small and uses AI vibe coding to change code in parallel; sharing `main` directly makes it easy for someone to pull half-finished work as the starting point for their next task. Short branches + self-merge keep the speed while keeping `main` always runnable. It is also closer to how the repo history already works (`codex/*`, `feature/*` branches + PR merges).
Revisit: when the team grows enough to need external review, or when branches stay unmerged long enough to rot.

### 2026-09-15 · Crash reporting / analytics
Not integrated for now (candidates: Sentry / Firebase Crashlytics / TelemetryDeck).
Revisit: when starting to invite external user testing or preparing for the App Store.

### 2026-09-15 · Minimum supported OS version
iOS 17+.
Rationale: use the latest SwiftUI APIs directly (`@Observable`, SwiftData, Swift Testing) to speed up prototyping.
Revisit: re-evaluate against target user device/OS distribution data before launch.

### 2026-09-15 · State field design
iOS Model field semantics mirror the web demo's `rongrong-demo-v1` (nickname/birthday/outfit/plus/entries/bond/started).
Rationale: reuse the validated product logic instead of redesigning the data structure.
Revisit: when product features change substantially (e.g. multiple users / multiple pets).

---

## How to add a decision

1. Confirm this is a question "many people will keep asking / AI will keep re-deciding", not a one-off implementation detail.
2. Add an entry in the format above: date · topic / decision / rationale / revisit conditions, in 2–4 lines.
3. If the decision affects something already fixed in [architecture.md](architecture.md), update it too so the two documents don't contradict each other.

### 2026-09-20 · Individual skin purchases
Keep a free default skin and add three tiered, individually purchased skins; prices are sample one-time USD prices. Purchases are still simulated locally and are separate from the Plus accessory membership.
Rationale: validate tiered pricing for cosmetic items while keeping the free companion features. Revisit: after real payments launch or pricing is validated.

### 2026-09-22 · Release 1.1 mood activities
Use a fixed local catalog, with three recommended activities for each of the five moods; no AI recommendations or backend. Each date stores only one activityId; changing the mood clears the selection, the same mood keeps it, selections give no Bond reward, and all activities are free.
Rationale: first validate the full web flow of recommend → details → select while keeping old data compatible. Revisit: when there is a need for personalized recommendations, timers or completion records; once the iOS project exists, implement it following the same spec.
