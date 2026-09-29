# Spec: Wishing Wheel

Status: interactive web demo approved for repository publication; all payments are simulated.

## Flow and pricing
`web/wheel.html` is accessible from the skin shop. Preset top-ups are $1/$5/$10; custom amounts allow $1–$100 with at most two decimal places. $1 equals 100 coins. Both UI and pure transaction logic enforce the per-transaction maximum; cumulative balance is not capped at $100. There is no backend; real payments must repeat validation server-side.
The seven draw prices are $1/$2/$3/$4/$6/$8/$10 ($34 total). Prices remain subject to product validation. A collected reward leaves the pool. After seven rewards, drawing and top-ups stop. Confirm current and next prices before drawing. Insufficient funds and cancellation never deduct coins or advance progress. Progress persists across reloads.

## Seven prizes
| Skin | Rarity | Initial probability |
| --- | --- | --- |
| Pistachio Picnic | Common | 32% |
| Cocoa Cloud | Common | 25% |
| Silver Mist | Rare | 18% |
| Honey Dream | Rare | 12% |
| Aurora Waltz | Epic | 7% |
| Peach Picnic | Epic | 4% |
| Celestial Crown | Legendary | 2% |

Exclusive reward IDs are separate from direct purchases. Current probability is the remaining item's weight divided by the total remaining weight; the last item has 100% probability. Display both initial and current odds. Equal visual wheel sectors do not represent probabilities. The final pointer matches the result. No duplicates or duplicate refunds.
Awards join `ownedSkins` and may be equipped here or on Home. Original direct purchases remain permanently owned, independent of Plus, at their original prices. The shop shows exclusive skins only when owned. Recolored Pistachio/Cocoa/Silver rewards retain the legacy wish-mint/wish-cherry/wish-starlight IDs, keeping previous ownership, history and draw progress. Direct purchases do not count toward wheel progress.

## Persistence and reliability
Extend `rongrong-demo-v1` with `wheel { balance, draws, toppedUp, history }`. Coins are integers, default balance is zero, history holds up to seven records, and draw count derives from owned pool items. Save deduction and award together before animation. Read fresh state before transactions and serialize same-origin wheel writes with Web Locks when supported; otherwise use synchronous local operations. This is not a production payment ledger.
If storage fails, block transactions without reporting success. Preserve existing mood and journal fields. Resetting app data clears wallet and ownership. Reduced motion skips spinning. iOS has no implementation yet and should follow the same spec later.

## Mobile pages and navigation
All interface copy is English. Match the main app's 390px phone shell, up to 844px height; mobile uses 100dvh and up to 430px width. `#wheel`, `#wallet`, `#wardrobe`, `#odds` are separate views. Fixed Wheel/Wardrobe/Wallet tabs, header balance entry, odds/back links and browser history support navigation.
Insufficient funds lead to Wallet; confirmed top-ups return to Wheel; result actions equip or open Wardrobe. See on Home returns to the original app. Contents scroll independently; dialogs are limited to 85dvh. Peach Picnic uses pale orange #FFD9BD throughout.

## Acceptance
Verify unique rewards, weighted boundaries and updated odds, price progression, insufficient funds, completion, top-up limits, save/reload, ownership and equipping, cancellation and mobile navigation. Direct purchases must stay wearable after drawing, reload and membership cancellation. Demo ownership is local to the current browser and lasts until its saved data is reset.
