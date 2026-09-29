# Architecture

Tech stack, module breakdown, data/interface conventions, UI design tokens. This is the detailed expansion of [AGENTS.md](../AGENTS.md); AGENTS.md is authoritative for the rules themselves, and this document only explains "how".

---

## 1. Tech stack

### web/ (existing, verified)

- Vanilla HTML / CSS / JS, zero dependencies, zero build step. `npm run dev` starts the local static server [web/scripts/serve.js](../web/scripts/serve.js).
- Code: [web/src/js/app.js](../web/src/js/app.js) (routing + state + interaction), [web/src/styles/app.css](../web/src/styles/app.css).
- Design sources: [web/design/exports/](../web/design/exports/) (Pencil/pen.dev exports); [web/scripts/build_demo.py](../web/scripts/build_demo.py) rebuilds the exports into the `index.html` template.

### ios/ (planned, no code yet)

| Item | Choice |
|---|---|
| Language | Swift (latest stable), Swift Concurrency throughout (`async`/`await`, `actor`) |
| UI framework | SwiftUI only. When UIKit capabilities are needed, wrap them in `UIViewRepresentable` and state the reason in the commit |
| Minimum OS | iOS 17+ (latest APIs to speed up prototyping; re-evaluate against user device distribution before launch, see decisions.md #10) |
| Architecture | MVVM (see section 2) |
| Persistence | SwiftData (no backend, see decisions.md #2) |
| Dependency management | Swift Package Manager only; no CocoaPods/Carthage |
| Test framework | Swift Testing (iOS 17+) |
| Static analysis | SwiftLint + SwiftFormat, configs committed at the repo root |

Before adding any third-party package, ask: can native SwiftUI/Foundation do it? If so, don't add the dependency.

## 2. Module breakdown (MVVM)

- **View** — Pure SwiftUI views that only bind and render; no business logic, no direct persistence reads/writes.
- **ViewModel** — `@Observable` class (not the old `ObservableObject`/`@Published`) that holds screen state and user action methods, and gets Models/Services through dependency injection.
- **Model** — Value-type `struct`s describing domain data.

The project lives in `ios/`. Xcode convention is a source folder named after the app next to the `.xcodeproj`:

```
ios/
├── RongrongApp.xcodeproj
└── RongrongApp/
    ├── App/                   # App entry point, launch configuration
    ├── Features/
    │   ├── Home/{HomeView,HomeViewModel}.swift
    │   ├── Reply/
    │   ├── Journal/
    │   ├── Me/
    │   └── Plus/
    ├── Models/                # Domain models (struct)
    ├── Services/              # Persistence wrappers, future entry point for networking
    ├── DesignSystem/          # Colors / fonts / spacing / reusable components, see section 4
    └── Resources/
```

One folder per feature, with View/ViewModel in one-to-one correspondence. **Do not** cram multiple screens' logic into one large file — see the lesson called out as TD-1 in the [technical debt review](technical-debt-review.md) (the web demo's `app.js` packed all screen logic into a single 315-line file); the iOS version should not repeat it.

## 3. Data model / interface conventions

- iOS Model field semantics mirror the state structure the web demo already validated (`rongrong-demo-v1` in `localStorage`): `nickname`, `birthday`, `outfit`, `plus`, `entries` (mood records keyed by date), `bond`, `started`. Reuse the validated product logic instead of redesigning it.
- Model changes must spell out a SwiftData migration plan; don't assume users will reinstall the app.
- Each feature's ViewModel exposes only read-only state + intent methods (e.g. `selectMood(_:)`), not writable `@State`/Models for the View to modify freely.

## 4. Design system / UI tokens

The authoritative token tables for color / typography / spacing / radius / shadow / motion are in [design-system.md](design-system.md). That is the unified visual spec for the single Rongrong product; `web/` is just one of its implementations, so no potentially drifting copy is maintained here. **Anyone (including AI) adding UI takes values from that document; do not invent them on the spot.**

Below is only the component mapping the iOS implementation needs (web implementation → SwiftUI notes). It is an implementation detail rather than a brand-level token, so it stays here:

| Component | Web implementation | SwiftUI notes |
|---|---|---|
| `PrimaryButton` | `.primary` | Pill radius, `accent.primary` background, reduced opacity when disabled |
| `SecondaryButton` | `.secondary` | `surface.secondaryButton` background |
| `MoodTile` | Quick Moods | Selected state uses the matching `mood.*` background + outline, `accessibilityAddTraits(.isSelected)` |
| `ReplySheet` | Reply Sheet | Native `.sheet`; focus management / Escape map to the dismiss gesture |
| `InfoDialog` | `<dialog>` | `.alert` or a custom `.sheet` depending on content size |
| `CalendarDayCell` | `.calendar-day` | Circular, a small dot when there is an entry, today highlighted with an outline |
| `ToastView` | `#toast` | Bottom overlay, auto-dismisses after 3 seconds |
| Bottom tab bar | Tab Dock | Native `TabView`, current item highlighted with `accent.primary` |

## 5. CI / quality gates

- CI runs automatically on every branch push and on PRs targeting main. Web currently runs `npm run check` (JavaScript syntax check, not yet full lint/typecheck) and `npm test`; the standalone Plus prototype runs its own tests. Web currently has no build step; the iOS project and its checks have not been set up yet.
- Pure function logic must have unit tests (the lesson from TD-2 in the [technical debt review](technical-debt-review.md)); UI/snapshot tests are not required during the prototype phase.

## 6. Skin data extension
The web skin catalog and pure logic live in `web/src/js/skins.js`, loaded as a classic script so that opening the HTML directly still works. `skin` / `ownedSkins` are added to the existing state; on read, defaults are filled in, duplicates removed and unknown IDs cleaned up.
There is no iOS project yet; the future Model / SwiftData will add fields with the same semantics, migrating old records to cream / [cream]. Ending Plus does not clear skin purchase records. See the [spec](specs/pet-skins.md).

## 7. Mood activities (Release 1.1)

`web/src/js/activities.js` provides a fixed catalog, a mapping from each of the five moods to three activities, and the pure functions recommend / normalizeEntry / select / changeMood. It is a classic script loaded before app.js, so opening the HTML directly works. app.js handles the cards, the native details dialog and saving. The template generation script loads this module as well.

`entries[dateKey].activityId` is a nullable catalog ID. Old records and invalid IDs, or IDs not in the current recommendations, are normalized to null; re-checking in with the same mood keeps it, changing the mood clears it. Isolated per date, and it does not add Bond. The iOS project has not been created yet; when the SwiftData model is built, migrate with a nullable field and a nil default for old records, reusing the catalog IDs and mapping. See the [spec](specs/mood-activities.md).

## 8. Character layering and hand-painted portraits

`setupCutoutPet` in `app.js` is shared by Home and the activity celebration: a transparent PNG, a skin-tint mask with the same outline, theme decorations and accessories form an animatable character layer. Home's `home-pet-scene` uses a separate background image; the ground shadow is not part of the character transform. `showActivityCelebration` handles the confirmation feedback and restoring focus after closing, without adding persisted fields.

`setupHome` loads the five `mood-*-painted.png` into Quick Moods on Home / Reply, keeping the mood labels and aria-pressed. These are runtime enhancements that don't modify the original Pencil exports; template rebuilds still load app.js and app.css. Asset sources: [character/scene](pet-animation-asset.md), [mood portraits](mood-portrait-assets.md). Visual parameters are in the design system; acceptance steps are in [verification.md](verification.md).

## 9. Wishing Wheel
`wheel.html` loads shared `skins.js`, pure transaction logic in `wheel-model.js`, and page interactions in `wheel.js`. The existing storage key holds `wheel` with integer coin balance, acquired draw count, total simulated top-ups and up to seven history records. `ownedSkins` and `skin` are shared with Home. `drawOnly` prevents direct purchases of exclusive rewards; the original shop displays them only when owned. Hash routes provide Wheel, Wallet, Wardrobe and Odds pages.
