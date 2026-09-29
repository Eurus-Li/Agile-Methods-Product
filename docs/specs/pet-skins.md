# Spec: Pet skins / Commercialization

**Status:** Simulated locally on web; the iOS project has not started, and the future implementation follows this spec.

## Goal and pricing
The free companion features are unchanged. Skins only change appearance and can be combined with the existing accessories.
Classic Cream is free; Mint Cloud US$0.99; Cherry Blossom US$1.99; Starlight US$2.99.
All paid skins are simulated one-time purchases, separate from the US$4.99/month Plus accessory membership.

## Interaction
Home, the Me wardrobe and the Plus page all have a skin shop entry point. Each card shows a pet preview, name, description, price and Equipped / Owned / Locked status.
Locked skins can be previewed first; the user must tap a confirm button showing the price to simulate unlocking and wearing it. Cancelling changes no data, and no real charge happens.
Owned skins can be worn directly. Going back to Home or closing the shop shows the effect, and it persists across refresh. Ending Plus does not remove individually purchased skins.

## Data and acceptance
`skin: string` defaults to `cream`; `ownedSkins: string[]` defaults to `['cream']`; both are saved in the existing local state.
When old data lacks the new fields, defaults are filled in; unknown and duplicate IDs are filtered out; a selected skin that isn't owned falls back to the default.
Resetting data deletes all simulated purchases. When storage is unavailable, changes only last for the current session. Skins don't affect mood, bond or accessory entitlements.
Tests cover old-data migration, fallback for bad data, purchase idempotency, unowned skins not being wearable, and independence from membership status.
