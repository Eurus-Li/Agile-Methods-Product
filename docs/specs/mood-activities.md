# Spec: Mood Activity Recommendations (Release 1.1)

**Status:** Verified in the web demo · **iOS module:** `Features/Reply` (project not created yet)

## Goal and user story

After logging a mood, the user can pick one of three lightweight activities, view its estimated time and concrete steps, and decide what they want to do right now.

## Core interaction flow

1. After the mood response, Reply shows exactly 3 activity cards, using a fixed local recommendation order for Calm / Happy / Tired / Sad / Tense.
2. Each card shows the name, estimated time, summary and a "View details" button; opening details does not mean the activity is selected.
3. Details show the name, time, description, steps and "Select activity". After confirming, happy feedback is shown first; after closing or tapping Back to activities, the user returns to the card list, where Selected is shown in text and in the accessible name.
4. Each date stores only one selection; selecting another recommended activity replaces it. Re-checking in with the same mood keeps the selection; changing the mood clears it and updates the recommendations.
5. The activity entry on Home can reopen today's recommendations; if the user hasn't checked in, it prompts them to pick a mood first. Past dates in Journal show that day's recommendations and selection.
6. Closing details or pressing Escape doesn't change the selection; the selection is restored after refresh. All activities are free and don't depend on Plus.
7. After confirming a selection, the current dialog shows Rongrong's happy feedback: keeping the current skin and accessories, the dog hops, sways left and right, and hearts float up. The animation plays briefly and stops; the user can close at any time or tap "Back to activities" to return to the cards; there is no automatic navigation. The text confirmation appears together with the animation; when the system reduce-motion setting is on, only the static dog and the confirmation text are shown. Browsing details, cancelling or refreshing does not trigger the celebration or change the mood or Bond.
   The dog moves independently using a transparent cutout asset while the background and ground shadow stay fixed; skin tinting is confined to the dog's outline, and no photo rectangle may rotate along with it.

## Data and edge cases

`entries[dateKey].activityId: string | null`, defaulting to null for old data. Unknown IDs, or IDs not in the current mood's recommendations, are cleared on read. An invalid mood generates no recommendations and allows no selection. Recommendation logic is separate from the DOM and sends no network requests.

When the iOS SwiftData model is built, add a nullable activityId, migrate old records to nil, and reuse the same catalog IDs and mapping rules; a full iOS project is not being created at this point.

Activities involve no timer, completion check-in, extra Bond reward or therapeutic promise; these are outside the scope of these four stories.

## Acceptance criteria

- [x] Each of the five moods returns three distinct activities with complete details.
- [x] Viewing/cancelling details doesn't change state; selecting/replacing gives text feedback and persists across refresh.
- [x] Re-checking in with the same mood keeps the selection, changing the mood clears it, without affecting note/saved/hugged or adding Bond again.
- [x] Old data, invalid IDs and missing moods are handled safely; past dates and today don't overwrite each other.
- [x] The phone layout scrolls, everything is keyboard operable, and focus is restored after dialogs close.

## Related

[Mood check-in](mood-checkin.md) · [Design system](../design-system.md) · [Architecture](../architecture.md)

## Verification record

2026-09-22: 12 unit tests and the JS syntax check pass. Verified in Chromium: all five moods, cancelling details and focus return, select/replace, refresh, same mood keeps / changed mood clears, no duplicate rewards, per-date isolation for past dates, and 320/390/768px operable with no horizontal overflow.

Animation and visual acceptance: the transparent dog and accessories move, the background/shadow stay still, and it stops after three hops; cancelling details doesn't trigger it, and under reduce motion there is no translation/scaling. Re-verification steps are in [verification.md](../verification.md).
