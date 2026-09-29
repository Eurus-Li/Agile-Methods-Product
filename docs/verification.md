# Web Verification and Demo Checklist

## Automated checks

Run from the repo root:

```sh
npm --prefix web run check
npm --prefix web test
```

There are currently 12 unit tests: 6 for activity logic and 6 for skin logic. check is a JavaScript syntax check; there is no full ESLint, TypeScript check or iOS test. CI runs on branch push; confirm it passes before merging.

## Running locally

```sh
cd web
npm run dev
```

Visit http://127.0.0.1:8000; if the port is in use, run `PORT=8011 npm run dev` and visit that port. Force-refresh after assets are updated. Persisted data belongs only to the current browser and origin, so different ports don't share records.

## Browser acceptance

| Action | Expected result |
| --- | --- |
| Open Home | Cream window-light/plant background, transparent dog, five hand-painted expression portraits |
| Tap the dog, or focus it and press Enter / Space | The dog and accessories hop lightly, the scene and shadow stay fixed, and there is petting text feedback |
| Switch between the four skins | Character color/theme matches, and no rectangular background color appears in the cutout area |
| Select each of the five moods | Today's mood is saved; Reply shows the matching response and exactly three recommended activities |
| Close View details or press Escape | Time and steps are visible; the selected activity doesn't change and no celebration plays |
| Select activity | Selection is saved; the dialog shows the dog hopping three times plus the selection text, with no extra Bond |
| Back to activities or Escape | Returns to the activity cards showing Selected, with focus back on the original card button |
| Switch to another activity, then refresh | The new selection is kept and the celebration does not replay on refresh |
| Re-check in with the same mood / change to another mood | The former keeps the activity, the latter clears it; the daily check-in reward is not added again |
| Open a past date's activities from Journal | Acts on that date's activity without overwriting today's record |
| System reduce motion on | No dog translation/rotation/scaling; the static character and confirmation text remain |
| 320 / 390 / 768px viewports | No horizontal overflow; long Reply and details scroll; the close button is reachable |

## Verified scope and limitations

On 2026-09-22 the features above were verified in local Chromium, and the pure logic tests and the corresponding feature-branch CI passed. The browser checks used a temporary Playwright script that is not part of the repo's CI; the table is for later manual re-verification. Safari, real iPhone, or native iOS verification is not claimed.

The animation is currently a CSS transform of the whole cutout character, not skeletal animation; selecting an activity doesn't mean completing it, and there is no timer, completion reward or real payment. Visual assets were generated only during development; the demo uses local files at runtime.
