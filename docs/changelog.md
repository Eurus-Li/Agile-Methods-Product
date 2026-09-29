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
