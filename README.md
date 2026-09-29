# Rongrong

A mental-wellness companion product: raise a virtual companion, log your daily mood, write a Journal, dress Rongrong up, and try a simulated Plus membership. There is currently a **web demo** whose interaction logic works end to end ([web/](web/)); the next goal is a **native iOS app** ([ios/](ios/), not started yet).

## Quick start (web demo)

```sh
cd web
npm run dev
```

Open **http://127.0.0.1:8000**. The project has no npm dependencies, so there is no need to run `npm install` first. `npm start` is the same as `npm run dev`; press `Ctrl+C` to stop the server.

If the port is in use, pick another one:

```sh
PORT=8001 npm run dev
```

Also supported: double-clicking `web/index.html`; opening `web/index.html` with VS Code Live Server; or `cd web && python3 -m http.server 8000 --bind 127.0.0.1`.

### Common commands (run inside `web/`)

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm start` | Start the local demo server |
| `npm test` | Test the pure logic for activity recommendations, selection and skins |
| `npm run check` | Check JavaScript syntax of the app and server |
| `npm run build:templates` | Regenerate `index.html` and images from the design sources |

## Features and demo flow

1. **Home**: Tap Rongrong on the home screen to interact; the dog and its accessories hop lightly while the cream window-light/plant illustration behind stays fixed. Pick Calm, Happy, Tired, Sad or Tense from five matching hand-painted portraits to log today's mood.
2. **Reply**: Read the matching reply, hug Rongrong, save the reply; browse three mood-based activity recommendations, view their duration and steps, then select one. Home can reopen today's activity, and Journal shows activities for past dates.
3. **Journal**: Switch month or year, tap a date with an entry to view the reply, save a text note, and see the monthly summary.
4. **Me**: Change nickname and birthday, pick an accessory or open the wardrobe; accessories show on Rongrong on Home.
5. **Plus**: Enter via the Plus button on Home or a locked accessory to simulate starting a membership, checking restore status, or ending the membership.

Pages are navigated via URL hash: `#home`, `#reply`, `#journal`, `#me`, `#plus`. Clear demo data via **Me → Settings → Reset demo data**.

## Development and design updates

- Page interactions or local state: edit `web/src/js/app.js`; the activity catalog and recommendation rules live in `web/src/js/activities.js`, skin rules in `web/src/js/skins.js`.
- Responsive layout or interaction styles: edit `web/src/styles/app.css`.
- Updating the original page designs: replace the corresponding HTML in `web/design/exports/`, then run `npm run build:templates` in `web/` (the first time you need `python3 -m pip install -r requirements-dev.txt`) to regenerate `index.html`. Manual edits to `index.html` are overwritten on the next generation.

## Data and demo scope

- Nickname, birthday, moods, notes, daily activity selection, accessories, skins and their purchase records, and simulated membership status are stored in browser `localStorage` under the key `rongrong-demo-v1`.
- Rongrong's replies are preset text; at runtime there is no AI, account system, cloud sync or real payment.

## Collaboration files at a glance

| File | What it's for |
|---|---|
| [AGENTS.md](AGENTS.md) | Project rules; AI coding assistants read this before starting |
| [docs/design-system.md](docs/design-system.md) | Color / typography / spacing / component tokens |
| [docs/architecture.md](docs/architecture.md) | Tech stack, module breakdown, iOS component mapping |
| [docs/changelog.md](docs/changelog.md) | Development log and feature update history |
| [docs/decisions.md](docs/decisions.md) | Technical/product choices that have been settled |
| [docs/specs/](docs/specs/) | Interaction flow for each feature |
| [docs/pet-animation-asset.md](docs/pet-animation-asset.md) | Cutout character, home background and generation prompts |
| [docs/mood-portrait-assets.md](docs/mood-portrait-assets.md) | Five hand-painted mood portraits, asset paths and prompts |
| [docs/verification.md](docs/verification.md) | Automated check commands, browser acceptance steps and known scope |
| [docs/technical-debt-review.md](docs/technical-debt-review.md) | Technical debt / security review record |
| [prototypes/plus-standalone/](prototypes/plus-standalone/README.md) | Early paywall prototype, superseded by web/, reference only |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | Checks that run automatically on every push |
| [.github/pull_request_template.md](.github/pull_request_template.md) | Definition of Done checklist before merging |

## Commercialization: pet skins

Open the shop via the **Skins** button on Home, the wardrobe in Me, or **Explore pet skins** on the Plus page. After previewing, confirm a simulated purchase and the skin is applied to Home immediately; it can be combined with accessories.

| Skin | One-time sample price | Look |
| --- | --- | --- |
| Classic Cream | Free | Original cream |
| Mint Cloud | US$0.99 | Mint with leaves |
| Cherry Blossom | US$1.99 | Blossom pink with flowers |
| Starlight | US$2.99 | Lavender with moon and stars |

Skins are separate from the US$4.99/month Plus accessory membership; ending the membership does not affect purchased skins. **All transactions are simulated locally; no real charges are made.** `skin` and `ownedSkins` are stored in the existing localStorage, persist across refreshes, and are cleared by resetting demo data. Older data is automatically backfilled with the free default skin.

Run `npm test` to verify skin pricing, purchase and wearing logic. Product spec: [pet-skins.md](docs/specs/pet-skins.md).

## Release 1.1: mood activities

Each of the five moods recommends three free activities. Card → **View details** → **Select activity**; closing the details does not select the activity. After confirming, the cutout Rongrong hops, sways and floats hearts on its own while the background stays fixed, then stops after a short celebration; the system reduce-motion setting is respected. Each date keeps one selection; re-checking in with the same mood keeps it, changing the mood clears it. Selections are stored only on this device; there is no timer or completion reward. Spec: [mood-activities.md](docs/specs/mood-activities.md).

## Visual assets and animation

The home screen and the activity confirmation dialog use a transparent dog layer; skin tinting is confined to the character's outline, and accessories move with the character. The window-light/plant background and ground shadow on the home screen stay fixed. The animation is a CSS whole-body translate, rotate and scale; skeletal animation of ears, tail or legs is not implemented yet. When the system reduce-motion setting is on, the static character and text feedback remain.

The hand-painted portraits, cutout dog and scene are local assets made during development with the built-in image_gen; opening the demo does not call any generation service. Asset paths and prompts are in the collaboration files above. At runtime app.js applies the new character layer and portraits, so they still take effect after regenerating the HTML templates.

Try the activity flow: pick a mood → View details → Select activity → happy feedback → Back to activities. After a refresh the activity selection is kept but the celebration does not replay. If the browser still shows old assets after an update, force-refresh with ⌘ Shift R on macOS.

## Wishing Wheel
Open `wheel.html` or enter through the pet skin shop. The English mobile experience has Wheel, Wallet, Wardrobe and Odds & Rules pages, with persistent bottom navigation. Seven exclusive skins are drawn without replacement, with lower weights for rarer rewards. The seven draws cost $1 / $2 / $3 / $4 / $6 / $8 / $10 ($34 total).
Top up $1, $5, $10 or a custom $1–$100 amount (up to two decimals); $1 buys 100 coins. Payments are simulated locally. Collected skins can be equipped on Home. Original direct-purchase skins retain their prices and permanent ownership independently of Plus. See the [wheel spec](docs/specs/skin-wheel.md).
