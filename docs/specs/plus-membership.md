# Spec: Plus Membership (Paywall)

**Status:** Verified in the web demo (simulated locally, no real payment) · **iOS module:** `Features/Plus`

## Goal

Show the membership benefits and provide a simulated "activate / end demo membership" flow, to validate the paywall's information architecture and conversion copy. **No real payment is integrated.**

## User story

As a user, I want to know what Plus unlocks and how much it costs, and to experience what membership unlocks without actually being charged.

## Core interaction flow

1. Entry points: the Plus button on Home, or tapping a locked outfit.
2. Show the price ($4.99 USD/month, for display only; see "Important limitations" below), the benefits list and a "demo preview" label.
3. Tap the primary button → confirmation dialog → after confirming, flip the local `plus` state to true and unlock all outfits.
4. For existing members, the primary button copy changes to "Manage membership", and the demo membership can be ended (also a local state flip).
5. Terms / Privacy / Restore are purely informational or read local state; they make no network requests.

## Data fields

```
plus: boolean
```

## Important limitations (must be kept in UI copy)

- Clearly label it "demo / no real charge", so users never think a real transaction happened.
- The `plus` boolean here must **not** be treated as proof of payment in production — local state can be modified freely by the user. Before real launch it must be replaced with a server-issued/verified entitlement; see the "Backend / account system" entry in [decisions.md](../decisions.md) and PBI-9 in [technical-debt-review.md](../technical-debt-review.md).

## Acceptance criteria

- [ ] In both unsubscribed and subscribed states, locked outfits are clearly distinguished visually (not by color alone).
- [ ] Both activating and cancelling require a confirmation dialog; a single tap must not take effect directly.
- [ ] All price/benefit copy is consistent with the design tokens in [architecture.md](../architecture.md), with no duplicated price strings (see technical-debt-review.md TD-4).
- [ ] Nowhere on the page claims "charged" or "renewed".

## Related

- Technical decisions: [decisions.md](../decisions.md) "Payments / IAP" (choice deferred), "Backend / account system"
- Security notes: [technical-debt-review.md](../technical-debt-review.md) PBI-9

## Boundary with individual skin purchases
Plus unlocks the 12 accessories and does not include the separately priced pet skins. The Plus page provides an entry to the skin shop; individually purchased skins are kept after the membership ends. See [pet-skins.md](pet-skins.md).
