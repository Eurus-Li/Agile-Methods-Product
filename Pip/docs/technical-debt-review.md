# Pip Demo — Technical Debt & Security Review

**Date:** 2026-09-15
**Scope:** Code introduced for the "5 export pages → runnable browser demo" sprint feature —
[`src/js/app.js`](../web/src/js/app.js), [`src/styles/app.css`](../web/src/styles/app.css),
[`scripts/serve.js`](../web/scripts/serve.js), [`scripts/build_demo.py`](../web/scripts/build_demo.py).
The generated `index.html` is template markup produced by `build_demo.py` and contains no
logic of its own, so it is not reviewed separately.

> **Note:** this report is a historical snapshot from before the `web/`/`ios/` split (see
> [decisions.md](decisions.md)). File paths quoted throughout the tables below (e.g. `app.js:1-315`)
> are relative to what is now `web/`.

---

## 1. Technical Debt / Code Smell Findings

| # | Location | Problem | Why it's technical debt | Future impact | Recommended refactor | Severity | Est. effort |
|---|---|---|---|---|---|---|---|
| **TD-1** | `app.js:1-315` (whole file) | Single IIFE holds state management, routing, rendering, DOM helpers, and every page's business logic (~40 functions), with no module boundaries | Violates separation of concerns; nobody can understand a slice without loading the whole file | Every new page/feature inserts more branches into the same file — merge conflicts and regression risk grow linearly | Split into `state.js` (state + persistence), `router.js`, `dom.js` (`named`/`actionable`/`button` helpers), `pages/*.js` (one setup function per page) | **High** | 10–14h |
| **TD-2** | Whole `src/`, contrast with [`RongrongPlus/tests/`](../../RongrongPlus/tests/commercialization.test.js) | `streak()`, `level()`, `mostFrequent()`, `dateKey()`, and the load-time state merge/validation logic (`app.js:21-29`) are pure functions with **zero unit tests** | The sibling RongrongPlus project already proves this class of logic deserves tests (7 cases covering date boundaries/corrupt data) — this one has none | Month/year-boundary bugs, DST edge cases, or the "streak counts from yesterday if today has no entry" logic can silently break with no regression signal | Extract these pure functions (exportable once modularized) and cover them with `node --test`, mirroring the existing RongrongPlus test pattern | **High** | 5–7h |
| **TD-3** | `app.js:144, 151, 247` | `named('Fill', named('Bond', sheet)).style.width = ...` — a **two-level string DOM lookup with no null guard**, unlike the `text()` helper which does guard (`if (element) ...`) | A design-tool layer rename/removal throws an uncaught `TypeError` at runtime instead of degrading gracefully | One rename in the Pencil export breaks a UI flow at runtime with an error message that gives no clue which element is missing | Wrap `named()` in a guarded accessor that warns (rather than throws) on a miss, and audit all call sites | **Medium** | 3–5h |
| **TD-4** | `app.js:144/151/247`, `app.js:302/310` | The bond-fill-width formula `30 + state.bond % 100 * .7` is duplicated verbatim 3×; the `$4.99` price string is hardcoded in two separate dialog strings; the dialog-construction boilerplate (`openDialog` + `paragraph` + `button` + `dialog.append`) repeats ~8× | Classic copy-paste duplication — fixing one copy and missing another is easy | Next price change or formula tweak will likely miss one of the duplicates, producing a user-visible inconsistency | Extract `bondFillWidth()`, hoist the price into a constant, wrap the repeated pattern in a `confirmDialog(title, body[], actionLabel, onConfirm)` helper | **Medium** | 2–3h |
| **TD-5** | `app.js:93-109` (`render()`) | One function does: route parsing + fallback, template cloning, `document.title` mapping, clock text refresh, tab binding, streak calculation, and a 4-way dispatch to page setup functions | Classic "does everything" function — violates single responsibility | Testing "title mapping" or "route fallback" in isolation requires running the entire render pipeline | Split into `resolveRoute()`, `renderTemplate()`, `bindTabs()`, `dispatchPageSetup()`; `render()` only orchestrates | **Medium** | 3–4h |
| **TD-6** | `app.js:30-36` | `route`, `selectedDate`, `calendarDate`, `calendarMode`, `toastTimer`, `lastFocus` are mutable free variables in the closure top level, read/written by nearly every function | No single funnel for state changes; hard to trace what mutates what | As features are added, implicit cross-function coupling on shared mutable state compounds debugging cost | At minimum group into a single `uiState` object; ideally fold into the TD-1 module split as a small store | **Medium** | folded into TD-1 |
| **TD-7** | `scripts/build_demo.py:21-23` | `if name == '119bbe39cb82fe1d.png': return 'assets/images/pip.jpg'` — special-cases the curated high-res photo via a **hardcoded SHA-256 hash prefix** of the exported thumbnail's bytes | Hardcoded magic value + silent failure mode: a mismatch doesn't error, it just quietly writes out a low-res thumbnail instead | Next time the design board is re-exported, the hash changes, the special case silently stops firing, and the demo regresses to a 74×92 blurry image with nothing in the build log to flag it | Match by filename/layer name instead of content hash, or print an explicit warning on a miss | **Medium** | 1–2h |
| **TD-8** | `scripts/build_demo.py:29` | `next(EXPORTS.glob(f'{number:02} *-export.html'))` has no try/except — a missing file raises a bare `StopIteration` | Weak error handling: the resulting error gives no indication of which of the 5 pages is missing | Anyone who renames/forgets to copy an export file gets an opaque crash and has to guess which page broke the build | Use a guarded lookup and raise `FileNotFoundError(f'Missing export for page {number:02}')` | **Low** | 0.5–1h |

**Explicitly not found** (reported honestly rather than padded):
- **Inefficient loops** — every loop iterates over a small bounded set (12 outfits / 31 calendar days / 5 moods); no performance concern at this data scale.
- **Deeply nested if/else** — the code is largely flat with ternaries; no genuinely deep nesting was found.
- **Classic SOLID violations (O/L/I/D)** — this is a small procedural script with no classes/interfaces; those principles don't meaningfully apply at this scale, and forcing findings here would be padding.

---

## 2. Top 3 Most Serious Issues — Manual Refactor Cost (@ $100/hr)

| Rank | Issue | Est. hours | Est. cost |
|---|---|---|---|
| 1 | **TD-1** — monolithic single-file architecture | 12h (midpoint) | **$1,200** |
| 2 | **TD-2** — zero test coverage on core business logic | 6h (midpoint) | **$600** |
| 3 | **TD-3** — unguarded string-based DOM lookups | 4h (midpoint) | **$400** |

**Total: ≈ $2,200** (range $1,800–$2,600). These three are related — doing the TD-1 module split first lowers the actual cost of TD-2 (easier to import/test pure functions) and TD-3 (one place to add the guarded accessor), so tackling them together will likely land below the sum of the individual estimates.

---

## 3. Security Review

The codebase is a **pure static frontend + zero-dependency local file server** — no database, no account system, no network calls (`grep` confirms no `fetch`/`XMLHttpRequest`/`eval`/`document.write`/`innerHTML` in `app.js`). This significantly narrows the attack surface.

| Category | Finding |
|---|---|
| **SQL injection** | **N/A** — no database or backend, no SQL execution path exists. |
| **XSS** | No exploitable vector found. All dynamic text goes through `textContent` (`text()` / `paragraph()` helpers); zero uses of `innerHTML`. This is a **coding convention, not a language-enforced guarantee** — see SEC-1. |
| **Auth / authorization** | No real account system, but `state.plus` membership status lives entirely in editable `localStorage` — trivially self-granted via DevTools. See SEC-2. |
| **Insecure input handling** | `nickname` / `birthday` are loaded from `localStorage` (`app.js:24`) without the same validation applied to `outfit` / `bond` / `entries`. See SEC-3. Not currently an XSS risk (still rendered via `textContent`), but a robustness/consistency gap. |
| **Exposed secrets** | None found — no API keys, tokens, or `.env` files present. |
| **Unsafe API usage** | None found — no external calls of any kind. |
| **Common web attack vectors** | `scripts/serve.js` already does a lot right: GET/HEAD-only, extension allowlist, path-prefix traversal guard, binds only to `127.0.0.1`. It sends **no security headers** (`X-Frame-Options` / `CSP` / `X-Content-Type-Options`). See SEC-4. |
| **UI flows enabling unauthorized/malicious behavior** | "Activate demo membership" / "Restore demo" flip a boolean with zero verification — same root cause as SEC-2, not double-counted. |

---

## 4. Backlog Cards

### PBI-1 — Split the app.js monolith
- **Description:** Break `app.js` state, routing, DOM helpers, and per-page logic into separate modules.
- **Impact:** Lowers cognitive load and regression risk for every future feature/bugfix; foundational for the other cards below.
- **Remediation:** Per TD-1 — extract `state.js` / `router.js` / `dom.js` / `pages/*.js`; `app.js` becomes an entry-point wiring file only.
- **Severity:** High
- **Effort:** 10–14h
- **Acceptance criteria:** `npm run check` passes post-split; manual walkthrough of all 5 pages behaves identically to pre-split; no single file exceeds ~150 lines.

### PBI-2 — Add unit tests for core business logic
- **Description:** Cover `streak()`, `level()`, `mostFrequent()`, `dateKey()`, and the load/merge/validation logic with unit tests.
- **Impact:** Prevents silent regressions in date-boundary logic (month/year rollover, DST); brings this project in line with the testing standard already set by the RongrongPlus project.
- **Remediation:** Mirror [`RongrongPlus/tests/commercialization.test.js`](../../RongrongPlus/tests/commercialization.test.js) using `node --test`; export the pure functions if needed.
- **Severity:** High
- **Effort:** 5–7h
- **Acceptance criteria:** New `tests/app.test.js` covers at minimum: consecutive/broken streaks, cross-month level calculation, `mostFrequent` ties, rejection of corrupt localStorage data; `npm test` wired into `package.json`.

### PBI-3 — Guard the `named()` DOM accessor
- **Description:** Eliminate unguarded two-level `named(...).style.xxx` calls; add null checks and a locatable warning.
- **Impact:** A renamed/removed design layer no longer white-screens the app with an uncaught exception.
- **Remediation:** Wrap in `safeNamed()` — `console.warn` and return a no-op proxy on a miss, instead of throwing.
- **Severity:** Medium
- **Effort:** 3–5h
- **Acceptance criteria:** Manually deleting a `data-pencil-name` attribute no longer throws an uncaught exception; console shows an explicit warning instead.

### PBI-4 — Remove duplicated formulas/copy/dialog boilerplate
- **Description:** Extract `bondFillWidth()`, a price constant, and a generic `confirmDialog()` builder.
- **Impact:** Price/formula changes only need to happen in one place, removing a class of inconsistency bugs.
- **Remediation:** Per TD-4.
- **Severity:** Medium
- **Effort:** 2–3h
- **Acceptance criteria:** No repeated `30 + state.bond % 100 * .7` literal or repeated `$4.99` literal remains in the codebase.

### PBI-5 — Split `render()`'s responsibilities
- **Description:** Break route resolution, template cloning, title setting, tab binding, and page dispatch into separate functions.
- **Impact:** Each step becomes independently testable/reusable.
- **Remediation:** Per TD-5.
- **Severity:** Medium
- **Effort:** 3–4h
- **Acceptance criteria:** `render()` body is ≤10 lines and only orchestrates calls to the extracted functions.

### PBI-6 — Fix the hardcoded image-hash special case in `build_demo.py`
- **Description:** Match the curated high-res photo swap by filename/layer name instead of content hash; warn explicitly on a mismatch.
- **Impact:** Prevents the high-res Pip photo from silently reverting to a low-res thumbnail after a design re-export, with no build-log signal.
- **Remediation:** Per TD-7.
- **Severity:** Medium
- **Effort:** 1–2h
- **Acceptance criteria:** Deliberately altering the source thumbnail's bytes and re-running the build produces a visible warning/failure instead of silently emitting a low-res image.

### PBI-7 — Explicit error when a design export file is missing
- **Description:** Replace the bare `StopIteration` with a `FileNotFoundError` naming the missing page number.
- **Impact:** Cuts down debugging time when one of the 5 export files is missing or renamed.
- **Remediation:** Per TD-8.
- **Severity:** Low
- **Effort:** 0.5–1h
- **Acceptance criteria:** Temporarily removing one export file and re-running the build script produces an error message that names the missing page number.

### PBI-8 (Security) — Add a regression guard against `innerHTML`
- **Description:** No XSS vulnerability exists today, but nothing enforces that it stays that way.
- **Impact:** A future contributor concatenating user data (nickname/notes) into `innerHTML` would silently reopen an XSS surface.
- **Remediation:** Add a simple CI/pre-commit grep rule banning `innerHTML` in `src/js/`, or add it to the PR checklist.
- **Severity:** Low (preventive hardening, no current vulnerability)
- **Effort:** 0.5–1h
- **Acceptance criteria:** CI fails if `innerHTML` appears anywhere under `src/js/`.

### PBI-9 (Security) — Client-side-spoofable Plus membership state
- **Description:** `state.plus` lives entirely in editable `localStorage`; anyone can grant themselves "membership" via DevTools.
- **Impact:** README already labels this a demo/no real billing, **but this is exactly the kind of code that gets carried straight into production under deadline pressure** — if it were, it becomes a real entitlement-bypass vulnerability.
- **Remediation:** Before any production use, replace with server-issued/verified entitlement (signed token or server session); never trust client storage as proof of payment.
- **Severity:** High (from a production standpoint) / acceptable at demo stage, but must be flagged
- **Effort:** Not estimable here — depends on the eventual billing architecture; track as a separate epic if productionization is planned
- **Acceptance criteria:** Project README/architecture doc explicitly states this pattern must never ship to production as-is; a separate epic exists if/when real billing is scoped.

### PBI-10 (Security) — Validate nickname/birthday on load
- **Description:** `outfit`, `bond`, and `entries` are validated on load; `nickname` and `birthday` are not.
- **Impact:** Extreme/oversized/invalid values flow unvalidated into runtime state (safe from XSS today since rendering uses `textContent`, but a data-integrity and potential layout-breakage risk).
- **Remediation:** Truncate `nickname` on load to match the 30-char UI limit; validate `birthday` with `Number.isNaN(Date.parse(...))` and fall back to the default on failure.
- **Severity:** Low
- **Effort:** 1h
- **Acceptance criteria:** Manually setting a 1000-character nickname in localStorage and reloading results in a truncated value, not a raw pass-through.

### PBI-11 (Security) — Add security headers to the dev server
- **Description:** `scripts/serve.js` sets no `X-Frame-Options`, `Content-Security-Policy`, or `X-Content-Type-Options` headers.
- **Impact:** Low risk today (localhost-only binding), but this zero-dependency server looks "ready to deploy" and is likely to get reused as-is for a public-facing host, at which point clickjacking and related risks become real.
- **Remediation:** Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and a baseline `Content-Security-Policy` to every response.
- **Severity:** Medium
- **Effort:** 0.5–1h
- **Acceptance criteria:** `curl -I` shows all three headers; the page fails to load inside a cross-origin iframe.

---

## Summary

11 cards total (7 technical debt + 4 security). Top-3 technical debt items carry an estimated **$2,200** manual remediation cost at $100/hr.
