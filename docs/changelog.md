# Development Log

## 2026-09-22 · Collaboration docs sync

- README summarizes activity selection, layered character animation, hand-painted mood portraits, asset entry points and local data scope.
- Architecture doc adds runtime asset replacement and the shared character layer, and corrects the actual scope of CI checks.
- Activity spec unified to: celebrate first after selecting, return to the cards after closing; adds visual alignment conventions for the not-yet-implemented iOS side.
- New browser acceptance checklist plus verified / not-yet-covered scope, to make later re-verification easier for collaborators.

## 2026-09-22 · Hand-painted portraits for five moods

- Calm / Happy / Tired / Sad / Tense replaced with cream hand-painted dog expressions consistent with Rongrong on the home screen.
- Keeps the original circular size, labels, keyboard operation and check-in / activity recommendation behavior; Home and Reply use the same set of portraits.
- Asset paths and built-in image_gen prompts are in [mood-portrait-assets.md](mood-portrait-assets.md).

## 2026-09-22 · Home cutout dog and separate illustrated scene

- Tapping the dog on Home now uses a transparent character layer; accessories hop with the character while the background and ground shadow stay fixed.
- Adds a cream hand-painted window-light and corner-plant background that keeps the paper/brush texture instead of a solid-color stage.
- Shares the cutout character construction and skin outline tinting with the activity celebration; keeps keyboard operation and reduce-motion support.

## 2026-09-22 · Fix character layering in the celebration animation

- Uses an alpha-preserving cutout PNG of the dog instead of transforming the whole photo in the celebration dialog. The background and ground shadow are fixed; only the character and accessories move.
- Skin color uses the dog's outline mask to avoid rectangular color blocks; the original JPG and other page assets are unchanged.
- Asset source, generation method and prompts are recorded in [pet-animation-asset.md](pet-animation-asset.md).

## 2026-09-22 · Activity selection: happy Rongrong animation

- After confirming Select activity, the current dialog shows the dog hopping, swaying, squashing/stretching, and hearts floating up; the current skin and accessories stay consistent.
- Uses the original image with CSS transform animation, returning to rest after three plays; no photo swap, no added dependencies or persisted state, no added Bond.
- Can be closed at any time, with focus returning to the original activity card; under reduce motion a static confirmation is shown. Activity spec and design motion parameters updated; the later iOS implementation follows the same feedback semantics.

## 2026-09-22 · Release 1.1: mood activity recommendations

- Each of the five moods shows three free activities; cards include name, summary and estimated time; details show actionable steps, and one can be selected after confirming.
- Home can reopen today's recommendations and Journal can open recommendations for past dates; selections are saved locally per date, can be replaced, and are cleared automatically when the mood changes.
- Recommendation and selection pure logic is independent of the DOM; compatible with old data and invalid IDs; membership and Bond rewards unchanged.
- Synced the activity spec, mood spec, architecture, decisions, README, iOS migration conventions and the template generation entry point.
- Added 6 activity unit tests, included in branch CI alongside the existing 6 skin tests; all 12 tests and the JS syntax check pass.
- Tested in Chromium: all five moods, cancel / focus return, select / replace, refresh, per-date isolation for past dates, and 320/390/768px layouts; fixed top reachability of long Reply sheets.
- This release implements the web demo; the iOS project has not been created yet, and no timer or activity completion reward was added.

## 2026-09-20 · Commercialization: pet skins and tiered pricing

### New features
- Skin shop entry points on Home, the Me wardrobe and the Plus page of the main app.
- Classic Cream is free by default; Mint Cloud US$0.99, Cherry Blossom US$1.99, Starlight US$2.99, all sample one-time prices.
- Supports appearance preview, simulated purchase with a second confirmation, switching the worn skin, and Equipped / Owned / Locked status labels.
- Skins use the existing pet asset, theme background colors and decorations, and can be combined with existing accessories.
- Purchase and worn state are saved locally and persist across refreshes; old data is automatically backfilled with the default skin and invalid skin IDs are cleaned up.
- Individual skin purchases are separate from Plus membership; ending the membership does not affect purchased skins, and resetting demo data clears purchase records.

### Docs and verification
- Synced README, skin spec, Plus entitlement boundaries, data model, visual spec and product decisions.
- Added 6 skin logic tests wired into CI, covering migration, invalid data, pricing, permissions, repeat purchases and persistence.
- Local skin tests pass; browser-verified cancelling a purchase, confirming a purchase, persistence across refresh, worn state after ending membership, and phone-size display.

### Demo scope
- No real payments, charges or auto-renewal; purchase state is saved only in the current browser.
- This change modified the main implementation `web/`, not the old standalone paywall prototype; the iOS project has not started yet.

## 2026-09-29 · Mobile Wishing Wheel
- Added seven exclusive skins, a weighted wheel without replacement, prize results and equipping on Home. Collected rewards leave the pool; probabilities update and drawing/top-ups stop after all seven rewards.
- Added English Wheel, Wallet, Wardrobe and Odds & Rules pages with a mobile shell and bottom navigation. Insufficient funds lead to Wallet; confirmed top-ups return to Wheel.
- Added simulated coin top-ups of $1 / $5 / $10 or custom amounts from $1 to $100, at most two decimals. The single-transaction limit is checked in both input and transaction logic. No real payments or backend.
- Set seven draw prices to $1 / $2 / $3 / $4 / $6 / $8 / $10, totaling $34.
- Lightened Peach Picnic to #FFD9BD. Replaced colors duplicated from direct purchases with Pistachio Picnic (pale yellow-green), Cocoa Cloud (cocoa brown) and Silver Mist (silver gray). Existing reward IDs, ownership and history remain compatible.
- Kept original direct-purchase prices and permanent ownership, separate from Plus. Shop copy now states “Buy once, keep forever”; demo records remain local to the browser.
- Updated README, specifications, architecture, design tokens and decisions. All 24 web logic tests pass, including permanent purchase ownership after wheel completion, reload and membership cancellation, plus compatibility of recolored rewards.

## 2026-09-29 · User profile personalization
- Pet Naming: name your companion (max 20 characters, empty restores Rongrong); shown on Home, the pet hint and the Me card.
- Call-Me Preference: nickname / dear / friend / sunshine, used in the pet tap line and birthday greeting.
- Birthday Surprise: on the birthday (Feb 29 → Feb 28 in non-leap years) Home shows a greeting, a one-time toast and a 🎂 accessory next to the worn one; Me shows "Today!". Nothing extra is saved.
- Personal Goals: pick up to three from a fixed list of six; display-only on Me.
- Data Backup (Export): Settings → Back up my data downloads `rongrong-backup-{date}.json` locally; nothing is uploaded. Restore is not included yet.
- Old data migrates with defaults; 6 new profile logic tests, 30 web tests pass. Browser-checked at 390px and 320px, including persistence across reload and the wheel page keeping profile fields.

## 2026-10-03 · Avatar Growth
- Four growth stages derived from bond: Fluff (0) → Sprout (200) → Bloom (500) → Glow (1000); no new stored field.
- Home shows the current stage next to the days together; Me shows it next to the level, and tapping the level opens a growth dialog with progress, bond to the next stage and all stages.
- Check-ins and hugs that cross a threshold show a "grew into" toast. 3 new growth tests; 38 web tests pass.

## 2026-10-03 · Companion Chat (Groq gpt-oss)
- Home "💬 Talk to {petName}" opens a chat; replies come from `openai/gpt-oss-20b` on Groq in the pet's voice, using the call-me preference, today's mood and goals.
- Key stays on the local dev server (`/api/chat` in `serve.js`, `web/.env.local`); same-origin JSON only; history is memory-only.
- Crisis messages get a fixed help reply (Taiwan 1925, US 988) and are never sent to the model. Without a key the pet gives a gentle fallback.
- 9 new tests (6 logic, 3 server against a fake Groq); 47 web tests pass. Browser-checked reply, crisis, missing key and 320px layout with a fake Groq; not yet run against the real Groq API.
