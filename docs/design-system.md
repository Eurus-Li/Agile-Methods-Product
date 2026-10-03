# Rongrong Design System

There is only one product: **Rongrong**. This document is the single source of truth for its visual specs, covering every current implementation (`web/`, `prototypes/plus-standalone/`, and the future `ios/`), however the code architecture ends up being integrated. **All color / typography / spacing / radius / shadow / motion values come from here; do not invent them on the spot.**

## 0. Current state: one remaining drift

`web/` (the main implementation) and `prototypes/plus-standalone/` (an early paywall prototype, superseded by the Plus flow built into `web/`) were once developed as two separate codebases. The mascot name has been unified as "Rongrong" (`web/` used to call it "Pip" and has been renamed), but colors and fonts have not been aligned yet. This is recorded honestly rather than hidden:

| Item | web/ (authoritative) | prototypes/plus-standalone/ |
|---|---|---|
| Main background | `#EEE5DF` | `#EEE8E2` |
| Main font stack | `Nunito, ui-rounded, 'Arial Rounded MT Bold', system-ui` | `ui-rounded, 'Segoe UI', system-ui` |
| Main orange | `#FF8A5B` | `#FF8757` |

`web/` has the more complete token extraction (including mood colors, component mapping and accessibility notes), so this document treats it as authoritative. `prototypes/plus-standalone/` is a reference prototype that no longer gets new features, so there is no need to schedule work to fix it; if someone happens to touch its styles, align them to the values here.

## 1. Brand tone

A warm, relaxed, soothing companion product: a cream base + one warm orange primary + five soft macaron mood colors + a lavender "Plus" accent. Rounded, low contrast, no sharp corners.

## 2. Color tokens

| Token | Hex | Usage |
|---|---|---|
| `background.base` | `#EEE5DF` | Overall background |
| `background.screen` | `#FBF3EC` | Single-screen background (phone) |
| `text.primary` | `#3A302B` | Primary text |
| `text.muted` | `#897567` | Secondary description text |
| `accent.primary` | `#FF8A5B` | Primary buttons, selected state, emphasis |
| `accent.primaryFocus` | `#B56B42` | Focus / accessibility outline |
| `accent.plus` | Text `#775797` / background `#EDE0FA` | "Plus" membership tags and buttons |
| `surface.card` | `#FBF3EC` | Card / tile background |
| `surface.secondaryButton` | `#F2E5DB` | Secondary button background |
| `mood.calm` | `#DDEBDC` | Mood: calm |
| `mood.happy` | `#FFE3B5` | Mood: happy |
| `mood.tired` | `#E6DFF4` | Mood: tired |
| `mood.sad` | `#DCE6F2` | Mood: sad |
| `mood.tense` | `#F4D8D8` | Mood: tense |
| `toast.background` | `#3A302B` | Toast background |

Mood colors are part of the product semantics; do not tweak them for looks. Changes must go through the product's `decisions.md`.

## 3. Typography

- Font stack: `Nunito, ui-rounded, 'Arial Rounded MT Bold', system-ui, sans-serif`.
- iOS Phase 1 uses the system **SF Rounded** by default (good performance, automatic Dynamic Type support); no embedded custom fonts.
- Dialog title 22pt Bold · Body 14–15pt Regular · Captions 11–12pt · Numeric emphasis (Lv./streak) 15–17pt Bold.

## 4. Spacing and corner radius

- Spacing follows a 4pt base grid (4/8/12/16/24).
- Primary button radius 24–28pt (pill); secondary buttons / cards / dialogs 18–26pt; calendar cells / icon buttons are circular.

## 5. Shadows

Low-opacity, tinted shadows (`text.primary` with transparency), not the system default pure black. Card level `0 24px 80px rgba(100,75,57,0.15)`; dialogs one step heavier.

## 6. Motion

- Interaction feedback is "bouncy but not over the top": light bounce animations 0.5s; bottom sheets slide up + fade in 0.25s ease-out; regular state changes 0.2s ease.
- Must respect the system "reduce motion" setting (web: `prefers-reduced-motion`; iOS: `accessibilityReduceMotion`); when true, turn off non-essential animation.
- Activity selection celebration: the dog hops on a 0.5s cycle, plays 3 times, then returns to rest; 12px translation, 5deg rotation left/right, 4% squash on landing / stretch on takeoff. Hearts float up 24px, also 3 times. Reuses the 192px skin detail preview, 22px decoration font size, 12/24px spacing and the main orange; accessories move with the dog. Under reduce motion there is no translation, rotation or scaling.
- The celebration character uses the real alpha outline of `rongrong-cutout.png`; the skin color is overlaid through the same alpha mask, and the background is not transformed. A separate ground shadow is half the character's width, 12px tall, `text.primary` at 15% opacity, elliptical, fixed 24px from the bottom of the stage.
- Home likewise uses the transparent character with outline tinting; the background is the fixed cream hand-painted window-light/plant scene `rongrong-home-scene.png`. It keeps the Stage dimensions and the original 210×262px character positioning, a 24px scene corner radius, and the original Home accessory font size of 38px with 12px top offset, moving with the character. The original Aura and ground shadow layers are kept.

## 7. Icons

- Outfits / accessories are represented directly with emoji; no custom illustration assets.
- Where line icons are needed (settings / close, etc.): web uses simple stroke SVGs (1.5px stroke, round caps); iOS prefers SF Symbols.
- Quick Moods use five soft hand-painted expression portraits of the same Rongrong on a cream paper texture, keeping the original 44×44px circular size; files `mood-{calm,happy,tired,sad,tense}-painted.png`. Text labels and aria mood names are kept; state is never conveyed by expression alone.

## 8. Core components

| Component | Key points |
|---|---|
| Primary button | Pill radius, `accent.primary` background, reduced opacity when disabled |
| Secondary button | `surface.secondaryButton` background |
| Mood / option tile | Selected state uses the matching semantic color background + outline, with a text/label fallback (never color alone) |
| Bottom sheet | Slides up from the bottom, focus management, dismissible via Escape / swipe |
| Info dialog | Native dialog / alert / sheet depending on content size |
| Toast | Bottom overlay, auto-dismisses after 3 seconds |
| Bottom tab bar | Current item highlighted with `accent.primary` |

## 9. Accessibility

Every interactive element needs a textual accessible name (`aria-label` / `accessibilityLabel`); support system text scaling (Dynamic Type); respect reduce motion; semantic information (mood, status) must not be conveyed by color alone.

## 10. Dark Mode

Not in Phase 1; both implementations currently only have a light mode. If it is added later, define the dark variant values here first, then change the code.

## 11. Platform mapping

- **Web (CSS)**: name CSS custom properties with the same prefix as the token name, e.g. `--color-accent-primary`, `--radius-pill`.
- **iOS (SwiftUI)**: Color Sets in the Asset Catalog use the same semantic names (`background.base` → `Color("BackgroundBase")`); don't invent a separate naming scheme.
- On any platform, check this document for an existing token before adding UI; if there isn't one, add a row here first and then write the code, not the other way round with values hard-coded first.

## 12. Skin display
Reuses the original pet image, presenting skins with a CSS blend color and emoji theme decorations. Cream has no blend; Mint uses `mood.calm`; Cherry uses `mood.tense`; Starlight uses `mood.tired`. Uses multiply blending; theme decorations are cosmetic only and do not change mood semantics.
Skin card preview height 128px, detail preview 192px; decoration font size 22px, padding 12px; card grid minimum column width 128px. Keeps the existing card radius 18px, spacing 12px, body 14px.

## 13. Wishing Wheel
Reuse the app cream, ink, orange, lavender and focus palette. Skin colors: Honey #FFE3B5, Aurora #DCE6F2, Celestial #EDE0FA, Peach #FFD9BD, Pistachio #E4E9B6, Cocoa #DEC7B2, Silver #D4DBDE. Direct Mint, Cherry and Starlight colors remain unchanged. Use the same tones in wheel sectors, wardrobe previews and Home. Keep legacy wish-mint / wish-cherry / wish-starlight IDs for the recolored rewards.
The shell is 390px wide, up to 844px high; on mobile use 100dvh and a maximum 430px width. Desktop padding 24px 12px, shell radius 44px. Fixed header and bottom navigation surround scrolling content. Headings 26px (22px below 360px), navigation 11px, balance 32px, eyebrow labels 8px.
Wheel maximum 300px, rim 8px, center 64px, center microcopy 6px. Seven equal sectors are presentation only, never probability. Prize positions use radius 33cqw, images 48px (40px on narrow screens), labels 8px. Spin transition: 3s cubic-bezier(.16,1,.3,1), disabled for reduced motion. Wardrobe hero 160px, prize previews 112px, two-column cards. Result preview 192px. Minimum touch targets 44–48px. Dialog width up to 358px and height 85dvh; toast duration 4 seconds.
Custom top-up input: radius 18px, padding 12px, body 14px and helper/error copy 12px, with existing focus styling. Four entry points: $1, $5, $10 and Custom. Wallet and odds use the same card and button tokens.

## 14. User profile
New About-you rows clone the Pencil Nickname row (36px icon box, 11px label, 15px bold value, 1px `#EADCD1` divider from the export) and use a 17px emoji instead of a line icon. Choice lists in dialogs reuse `surface.card`, 12px padding and radius, 14px body, `accent.primary` for the checked outline and control accent; disabled options at 50% opacity. The birthday 🎂 sits on the same line as the worn accessory at the existing accessory size.
Growth dialog: 38px stage emoji (same as the Home accessory), 15px bold stage line, 8px progress bar with 4px radius in `accent.primary` on `surface.card`, stage list items on `surface.card` with 12px padding and radius; locked stages use `text.muted`.
