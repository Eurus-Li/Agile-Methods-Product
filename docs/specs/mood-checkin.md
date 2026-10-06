# Spec: Mood Check-in

**Status:** Verified in the web demo · **iOS modules:** `Features/Home`, `Features/Reply`

## Goal

Each day the user picks a mood on the Home page and Rongrong responds with matching comforting copy, forming the core "come see Rongrong every day" loop.

## User story

As a user, I want to quickly log today's mood and get a caring response, so that I feel seen without having to write a long journal entry.

## Core interaction flow

1. The Home page shows 5 hand-painted expression portraits of the same Rongrong with matching text options: Calm / Happy / Tired / Sad / Tense (color values in [design-system.md](../design-system.md)).
2. The user taps one → today's record is written (if today already has a record, overwrite mood and keep the existing note/saved/hugged state) → navigate to the Reply page.
3. The Reply page shows the matching copy (one of five fixed messages), the current Bond level bar, a Hug button and a Save (bookmark) button.
4. The first check-in of the day gives bond +15; the first tap of Hug gives +5, and repeated taps add nothing. Once hugged, the button shows "Hug received ♡" whenever that day's Reply is reopened.
5. Reply shows three activity cards for the mood; details, selection and migration rules are in the [activity spec](mood-activities.md). Re-checking in with the same mood keeps activityId; changing the mood clears it.
6. Closing Reply or tapping the backdrop → back to Home.
7. The Home dog is a transparent character layer in front of a fixed cream hand-painted window-light and plant scene. Petting it by tap or keyboard Enter/Space makes only the character and accessories hop; the background and ground shadow stay still. The current skin is kept, the reduce-motion setting is respected, and no data or rewards are added.

## Data fields

```
entries[dateKey]: { mood, note, saved, hugged, created, activityId }
bond: number (used to compute Lv. = 7 + floor(bond / 100))
```

## Edge cases

- Checking in again on the same day: update mood, don't add bond again.
- Mood record keys must be in `yyyy-MM-dd` format; invalid/corrupted data must be rejected on read rather than crash.
- When opening a day from Journal into Reply, use that day's record, not "today's".

## Acceptance criteria

- [ ] All 5 moods can be selected and are highlighted correctly (expressed both by color and by `aria`/`accessibility` state, not color alone).
- [ ] Reply copy maps one-to-one to mood, and the Bond level/progress bar updates live with the bond value.
- [ ] Repeated check-ins don't count the daily bond reward again.
- [ ] The Hug button is idempotent (multiple taps add points only once).

## Related

- Design tokens: [architecture.md section 4](../architecture.md#4-design-system--ui-tokens)
- Known technical debt to reference (to avoid repeating it in the iOS version): [technical-debt-review.md](../technical-debt-review.md) TD-3 (unguarded state lookup), TD-4 (duplicated bond progress formula)
