# Commercialization

This folder contains the standalone, all-English **Rongrong Plus commercialization demo** for Rongrong. Other product features can live in sibling folders at the repository root.

## Run locally

Install Node.js 20 or later, then from the repository root run:

```sh
cd Commercialization
node server.js
```

Open **http://localhost:3000**. No package installation, API key, or build step is needed. Use an HTTP server; opening `index.html` directly with `file://` does not support the module entry point reliably.

Run tests from inside the `Commercialization` folder:

```sh
node --test tests/*.test.js
```

If npm is available, `npm start` and `npm test` are equivalent. `PORT` optionally changes the server port. The development server listens on localhost only.

## Separate commercialization function and files

- `src/commercialization.js`: exported `createCommercializationPage(root, options)` renders the complete feature, including dialogs and membership controls. It also exports a local demo membership adapter and date/state helpers.
- `src/commercialization.css`: responsive, scoped styles matching the cream, coral, lavender, and mint prototype palette. Companion artwork uses CSS and has no external image dependency.
- `index.html`: runnable standalone host.
- `server.js`: dependency-free development server serving only the public app files.
- `tests/commercialization.test.js`: membership lifecycle, restoration, date boundary, corrupt storage, and storage failure tests.

Integrate the feature with a host app:

```js
import { createCommercializationPage } from './src/commercialization.js';

// Include src/commercialization.css in the host document or build pipeline.
const page = createCommercializationPage(document.querySelector('#membership'), {
  onBack: () => navigateToProfile(), // Replace with your own router callback.
});

// Call when leaving the screen to remove event listeners and its timer.
page.destroy();
```

`storage` (a getItem/setItem adapter) and `now` (a function returning a Date) are optional injectable dependencies. The back button appears only if the host supplies `onBack`.

## Try the flow

1. Select **Try monthly membership** and review the demo confirmation.
2. Select **Activate demo membership**. Status becomes active for one calendar month.
3. Reload, or choose **Restore demo**. The same browser restores saved membership.
4. Choose **Cancel demo renewal** and confirm. Access remains active through the displayed end date.
5. Open **Terms**, **Privacy**, or the help button for functional information dialogs.

The screen uses a proposed **$4.99 USD/month** price. Membership state persists in this browser's localStorage under `rongrong.plus.demo.v1`. Restore is local to this browser and is not an App Store or Google Play restore. The demo never renews automatically, even if its renewal setting is enabled. An expired demo can be activated again. If local storage is blocked or full, the page reports the failure without claiming payment or activation succeeded.

## Incomplete production work

This is an operational UI and local membership-flow prototype. **It does not charge money, create real subscriptions, unlock implemented paid content, or sync accounts.** Outfits, themes, rituals, and mood stories are proposed benefits, not implemented content features.

Before taking payments, replace the demo adapter with authenticated server-side billing or native in-app purchases, verify purchases and renewal/cancellation events on the server, and use trusted entitlements. Do not use editable localStorage as proof of a paid subscription. Add account-based restore, finalized pricing and legal terms, and the actual member content. Never put payment-provider secrets in this frontend.

