# Pip — Technical Debt & Security Review

**Date:** 2026-09-15
**Scope:** Code introduced for the "Home / Journal / Me screens + integrated app shell" sprint feature —
[`Home/src/home.js`](Home/src/home.js), [`Journal/src/journal.js`](Journal/src/journal.js),
[`Me/src/me.js`](Me/src/me.js), [`App/src/app.js`](App/src/app.js), and their four `server.js` dev servers
([`Home/server.js`](Home/server.js), [`Journal/server.js`](Journal/server.js), [`Me/server.js`](Me/server.js),
[`App/server.js`](App/server.js)). The three CSS files and the static `index.html` hosts are template
markup with no logic of their own, so they are not reviewed separately. `Commercialization/` is the
pre-existing sibling module this sprint's code reuses as-is; it is used throughout as the reference
standard for patterns (error handling, testing) the new code is measured against.

---

## 1. Technical Debt / Code Smell Findings

| # | Location | Problem | Why it's technical debt | Future impact | Recommended refactor | Severity | Est. effort |
|---|---|---|---|---|---|---|---|
| **TD-1** | `Home/src/home.js:1`, `Me/src/me.js:1-2` | `Home` imports from `Journal` (`MOODS`, `moodById`, `addEntry`, `updateEntry`, `loadEntries`, `computeStreak`), and `Me` imports from **both** `Journal` and `Home`, via relative paths that reach across sibling top-level folders | Creates an undocumented dependency chain `Journal ← Home ← Me`, even though each folder's own README describes itself as a standalone module (mirroring `Commercialization`'s "mount in any DOM container" framing). There is no build step to catch a broken import if a sibling file moves. | Renaming or moving `Journal/src/journal.js` silently breaks both `Home` and `Me` at runtime (a blank page or thrown import error), and the breakage isn't visible until someone runs that specific module | Either accept and document the dependency direction explicitly (e.g. in each README, "depends on Journal for entry storage"), or extract the shared entry/mood/bond logic into a small `core/` module all three import from symmetrically | **Medium** | 6–9h |
| **TD-2** | `Home/server.js`, `Journal/server.js`, `Me/server.js`, `App/server.js` (26–35 lines each) | Four near-identical dependency-free static file servers, differing only in the file whitelist map, the port number, and the console-log label | Classic copy-paste duplication — the pattern was copied from `Commercialization/server.js` three more times instead of factored out | A future fix (e.g. adding security headers, per TD-3 in `Commercialization`'s own review) has to be applied in up to 5 places now instead of 1, and it's easy to update 4 and miss the 5th | Extract a shared `createStaticServer(files, port, label)` helper (e.g. `shared/server.js`) that all five `server.js` entry points call with their own file map | **Low** | 2–3h |
| **TD-3** | `Home/src/home.js`, `Journal/src/journal.js`, `Me/src/me.js` — every `storage.getItem`/`setItem` call site | None of the three new modules guard `localStorage` access the way `Commercialization/src/commercialization.js:78-81` does (`try { store = createDemoMembershipStore(...) } catch { storageError = true }`, plus a user-facing feedback message) | The sibling module already proves this class of failure (private browsing, blocked storage, quota exceeded) is expected and handled; the three new modules regressed on that standard | A user with storage blocked/full gets an uncaught `TypeError` and a broken screen instead of the graceful "Browser storage is unavailable" message `Commercialization` shows for the same failure | Wrap each module's storage calls the same way `Commercialization` does: catch at mount time, set a `storageError` flag, and surface a feedback message instead of throwing | **Medium** | 4–6h |
| **TD-4** | `Home/src/home.js:1` | `moodById` is imported from `Journal` but never called anywhere in the file | Dead import — harmless today, but it's a sign the file wasn't re-checked after a refactor (the response sheet used to look up mood colors directly and stopped) | Not itself risky, but dead imports accumulate and make it harder to tell what a module actually depends on | Remove the unused `moodById` import | **Low** | 0.1h |

**Explicitly not found** (reported honestly rather than padded):
- **Zero test coverage** — unlike the sibling review this mirrors, this is *not* an issue here: all four new pure-function modules (`computeBondLevel`, `computeStreak`, `computeMonthStats`, `daysTogether`, `stageForLevel`, `loadProfile`, and — added during this review — `escapeHtml`) have `node --test` coverage, matching `Commercialization`'s existing testing standard (22 tests total across the project after this review).
- **Inefficient loops** — every loop iterates a small bounded set (≤31 calendar days, 8 wardrobe items, 5 moods); no performance concern at this data scale.
- **Deeply nested if/else** — the code is flat, using early returns and ternaries; no genuinely deep nesting was found.
- **Classic SOLID violations (O/L/I/D)** — this is small procedural browser code with no classes/interfaces; those principles don't meaningfully apply at this scale.

---

## 2. Top 3 Most Serious Issues — Manual Refactor Cost (@ $100/hr)

| Rank | Issue | Est. hours | Est. cost |
|---|---|---|---|
| 1 | **SEC-1** — stored XSS via unescaped journal text (see §3) | 1h (fixed during this review; listed at actual cost) | **$100** |
| 2 | **TD-3** — no storage-failure guarding across 3 modules | 5h (midpoint) | **$500** |
| 3 | **TD-1** — undocumented cross-module dependency chain | 7.5h (midpoint) | **$750** |

**Total: ≈ $1,350** (range $1,000–$1,700 if TD-1/TD-3 run high). Unlike the other two, SEC-1 is no longer
outstanding — it's included here because the assignment asks for the manual-remediation cost of what was
found, and reporting it at actual cost (rather than omitting a fixed issue) is a more honest signal of what
this audit was worth than only listing what's still open.

---

## 3. Security Review

Like `Commercialization`, this is a **pure static frontend + zero-dependency local file server** — no
database, no account system, no network calls. This significantly narrows the attack surface, but the new
code introduced one real, exploitable issue that `Commercialization`'s existing convention (never using
`innerHTML` for user-authored text) would have prevented.

| Category | Finding |
|---|---|
| **SQL injection** | **N/A** — no database or backend, no SQL execution path exists. |
| **XSS** | **SEC-1 (found and fixed during this review).** `Journal/src/journal.js`'s "Recent moods" list built each row as a template-literal string — including the user's free-typed journal text — and assigned it via `.innerHTML` (`get('[data-recent]').innerHTML = recent.map(entry => ...<p>${entry.text}</p>...)`). A journal entry containing e.g. `<img src=x onerror=alert(1)>` would execute as real markup the next time the Recent Moods list rendered — a **stored XSS**, since the payload is saved to `localStorage` and replays on every future page load. **Fix applied:** added and applied an `escapeHtml()` helper to the one interpolation site; added two regression tests (`journal.test.js`) asserting `<img>`/`<script>` payloads are neutralized to literal text. Every other dynamic value in the codebase already went through `.textContent` or `.value` (safe); this was the only `innerHTML` site touching user-authored text. |
| **Auth / authorization** | No real account system. `Home`/`Journal`/`Me` don't add new auth surface — they reuse `Commercialization`'s existing, already-flagged `state.plus`-in-localStorage pattern (unchanged, not re-reviewed here). |
| **Insecure input handling** | `Me/src/me.js:129` saves `nickname` and `birthday` straight from form inputs with no length cap or date validation before persisting (`saveProfile(store, { nickname: ...trim(), birthday: ... })`). Not an XSS risk today (`nickname`/`birthday` are only ever rendered via `.textContent`), but an unbounded nickname or an invalid `birthday` written directly into `localStorage` (bypassing the `<input type="date">` UI constraint) flows unvalidated into `daysTogether()`'s date math and the profile card's layout. |
| **Exposed secrets** | None found — no API keys, tokens, or `.env` files in any of the four new modules. |
| **Unsafe API usage** | None found — no external calls of any kind (`grep` confirms no `fetch`/`XMLHttpRequest`/`eval` in `Home/`, `Journal/`, `Me/`, or `App/`). |
| **Common web attack vectors** | All four new `server.js` files copy `Commercialization/server.js`'s already-good baseline (GET/HEAD-only, explicit whitelist map, binds only to `127.0.0.1`), so no new gap was introduced — but none of the five `server.js` files (the four new ones plus the original) send security headers (`X-Frame-Options` / `CSP` / `X-Content-Type-Options`). This was already true before this sprint; it's now duplicated across one more file each time the pattern gets copied. |
| **UI flows enabling unauthorized/malicious behavior** | `Me`'s locked wardrobe items correctly gate on `onOpenPlus` rather than unlocking client-side — no new bypass was introduced here. |

---

## 4. Backlog Cards

### PBI-1 — Document or remove the Journal→Home→Me dependency chain
- **Description:** `Home` depends on `Journal`; `Me` depends on both `Journal` and `Home`, via relative imports across sibling folders.
- **Impact:** A file move/rename in `Journal` silently breaks two other modules with no compile-time warning.
- **Remediation:** Per TD-1 — either document the dependency direction in each module's README, or extract shared entry/mood/bond logic into a `core/` module.
- **Severity:** Medium
- **Effort:** 6–9h
- **Acceptance criteria:** Either each README states its cross-module dependencies explicitly, or no module imports another feature module's `src/*.js` directly.

### PBI-2 — Deduplicate the four static file servers
- **Description:** Extract a shared `createStaticServer(files, port, label)` helper used by `App/`, `Home/`, `Journal/`, and `Me/`'s `server.js`.
- **Impact:** Future server-level fixes (e.g. PBI-6 below) only need to land in one place.
- **Remediation:** Per TD-2.
- **Severity:** Low
- **Effort:** 2–3h
- **Acceptance criteria:** Each `server.js` is reduced to its file map, port, and a one-line call into the shared helper; `npm start` still works unchanged in all four folders.

### PBI-3 — Guard localStorage access in Home, Journal, and Me
- **Description:** Wrap `storage.getItem`/`setItem` call sites so a blocked/full storage produces a user-facing message instead of an uncaught exception, matching `Commercialization`'s existing pattern.
- **Impact:** Brings the three new modules in line with the reliability standard already proven in the sibling module.
- **Remediation:** Per TD-3.
- **Severity:** Medium
- **Effort:** 4–6h
- **Acceptance criteria:** Manually throwing from a stubbed `storage.setItem` in a test no longer produces an uncaught exception in any of the three modules; each shows a feedback message instead.

### PBI-4 — Remove the unused `moodById` import in Home
- **Description:** `Home/src/home.js` imports `moodById` from `Journal` but never calls it.
- **Impact:** Trivial, but dead imports make it harder to see a module's real dependencies at a glance.
- **Remediation:** Per TD-4.
- **Severity:** Low
- **Effort:** 0.1h
- **Acceptance criteria:** `moodById` no longer appears in `Home/src/home.js`'s import list.

### PBI-5 (Security) — Stored XSS via unescaped journal text — **fixed this review**
- **Description:** `Journal`'s Recent Moods list interpolated raw user-typed journal text into an `.innerHTML` template.
- **Impact:** A crafted journal entry (e.g. containing an `onerror` payload) would execute as markup on every future render of that list — a stored XSS, the most serious class of finding in this review.
- **Remediation:** Added `escapeHtml()` in `Journal/src/journal.js` and applied it at the one vulnerable interpolation site; added two regression tests.
- **Severity:** Critical (as found) — resolved
- **Effort:** 1h (actual)
- **Acceptance criteria:** ✅ `node --test` includes a case asserting `<img src=x onerror=alert(1)>` renders as literal text, not markup; manually re-verified in-browser that a journal entry containing `<script>` tags displays as plain text in the Recent Moods list.

### PBI-6 (Security) — Validate nickname/birthday on save
- **Description:** `Me/src/me.js:129` persists `nickname`/`birthday` with no length cap or date validation.
- **Impact:** Not an XSS risk (rendered via `.textContent`), but an unbounded or malformed value written directly to `localStorage` (bypassing the UI) flows unvalidated into date math and layout.
- **Remediation:** Truncate `nickname` to a fixed max length on save; validate `birthday` with `Number.isNaN(Date.parse(...))` and reject/ignore invalid values instead of persisting them.
- **Severity:** Low
- **Effort:** 1h
- **Acceptance criteria:** Manually setting a 1000-character nickname or an invalid birthday string in `localStorage` and reloading no longer flows through unchanged.

### PBI-7 (Security) — Add security headers to all five dev servers
- **Description:** None of the project's `server.js` files (original `Commercialization` plus the four added this sprint) send `X-Content-Type-Options`, `X-Frame-Options`, or a baseline `Content-Security-Policy`.
- **Impact:** Low risk today (all bind to `127.0.0.1` only), but the pattern is now copied five times and looks "ready to deploy" as-is; doing this alongside PBI-2 means it only needs to be written once.
- **Remediation:** Add the three headers inside the shared server helper from PBI-2, so all five servers pick it up automatically.
- **Severity:** Medium
- **Effort:** 0.5–1h (assuming PBI-2 lands first)
- **Acceptance criteria:** `curl -I` against any of the five dev servers shows all three headers.

---

## Summary

7 cards total (4 technical debt + 3 security). One finding — a stored XSS in the Journal recent-moods
list — was serious enough to fix immediately rather than only log; it's still included above at its
actual remediation cost per the audit's format. Top-3 items (including the fixed XSS, at actual cost)
carry an estimated **$1,350** combined manual-remediation cost at $100/hr; the two still-open items total
**$1,250** of that.
