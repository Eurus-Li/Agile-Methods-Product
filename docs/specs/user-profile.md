# Spec: User Profile

**Status:** Implemented in the web demo · **iOS modules:** `Features/Me`, `Features/Home`

## Goal

Make Rongrong feel like *your* companion: the user can name the pet, choose how it addresses them, keep a few personal goals on their profile, get a small surprise on their birthday, and keep (and restore) a copy of their local data.

## Features

| Feature | English name | New field |
|---|---|---|
| 幫絨絨取名 | **Pet Naming** | `petName` |
| 稱呼偏好 | **Call-Me Preference** | `callMe` |
| 生日驚喜 | **Birthday Surprise** | none (uses `birthday`) |
| 個人小目標 | **Personal Goals** | `goals` |
| 匯出／備份資料 | **Data Backup (Export)** | none |
| 從備份還原 | **Restore from Backup** | none |
| 成長進度 | **Avatar Growth** | none (derived from `bond`) |

## User stories

- As a user, I want to give my companion its own name, so that it feels like mine.
- As a user, I want to choose how the pet addresses me, so that its greetings feel natural to me.
- As a user, I want a small surprise on my birthday, so that I feel remembered.
- As a user, I want to note what I'm working on for myself, so that my profile reflects my intentions.
- As a user, I want to download my data, so that I don't lose it when the browser data is cleared.
- As a user, I want to load a backup file back in, so that I can get my data back after clearing the browser or switching devices.
- As a user, I want to see my companion grow as we spend time together, so that I feel my daily check-ins matter.

## Core interaction flow

1. **Me → About you** shows five rows: Nickname, Birthday, Pet name, "{petName} calls you", My little goals. Every row opens an edit dialog.
2. **Pet Naming:** free text, trimmed and whitespace-collapsed, max 20 characters. Saving an empty value restores the default `Rongrong`. The name appears on the Home header, the "Tap {petName} to pet" hint, the Me profile card and profile copy. Product-level copy (tab labels, toasts about the app, Plus) keeps "Rongrong".
3. **Call-Me Preference:** single choice from a fixed list: `nickname` (default) / `dear` / `friend` / `sunshine`. Used wherever the pet greets the user (pet tap line, birthday greeting). With `nickname` and an empty nickname, fall back to "friend".
4. **Birthday Surprise:** when today's month/day equals `birthday` (Feb 29 birthdays are celebrated on Feb 28 in non-leap years):
   - Home speech bubble shows "Happy birthday, {address}! 🎂".
   - A toast "{petName} saved a birthday cake for you today 🎂" appears once per app session.
   - A 🎂 accessory is shown next to the worn accessory on Home and in the activity celebration, for that day only. It is not persisted and does not change `outfit`.
   - Me → Birthday row shows "· Today! 🎂".
5. **Personal Goals:** multi-select from a fixed catalog of 6 goals, at most 3 (other options are disabled once 3 are chosen). Shown on the Me row. Goals are display-only: they do **not** change mood replies, activity recommendations or Bond.
6. **Data Backup (Export):** Settings → "Back up my data (.json)" downloads `rongrong-backup-{yyyy-MM-dd}.json` locally. Nothing is uploaded.
7. **Restore from Backup:** Settings → "Restore from backup" opens a file picker for a `.json` file. The file is read locally and must have `app: 'rongrong'` and `format: 'rongrong-demo-v1'` and an object `data`; otherwise a toast explains why (not JSON / not a Rongrong backup / unsupported format / no data / too large, over 1,000,000 characters) and nothing changes. A valid file goes through the same load flow as stored data (entries with a valid date key and mood, outfit, bond, skins, profile, activity ids), then a confirmation dialog shows "{petName} · N check-ins · backed up {date}" with **Replace my data** / **Keep my data**. Replace overwrites all local data (no merge), clears the in-memory chat, goes to Home and shows "Backup restored".
8. **Avatar Growth:** four stages derived from `bond`: ☁️ Fluff (0), 🌱 Sprout (200), 🌸 Bloom (500), ✨ Glow (1000). Home shows "Day N together · {emoji} {stage}"; Me shows "Lv.X · {stage} stage". Tapping the level opens a growth dialog with the current stage, a progress bar to the next stage, bond still needed, every stage with Reached / Now / Locked, and how to earn bond (check-in +15, first hug +5). Crossing a threshold shows a toast "{petName} grew into the {stage} stage". Stages never go down because bond never decreases.

## Data fields

```
petName: string   // default 'Rongrong', 1–20 chars
callMe: 'nickname' | 'dear' | 'friend' | 'sunshine'   // default 'nickname'
goals: string[]   // ids from the goal catalog, unique, max 3, default []
```

Backup file format:

```
{ app: 'rongrong', format: 'rongrong-demo-v1', exportedAt: ISO string, data: <normalized state> }
```

Goal catalog ids: `sleep`, `calm`, `kind`, `move`, `connect`, `focus`.

## Edge cases

- Old saved data without the new fields gets defaults on load; other fields (entries, skins, wheel) are untouched.
- Unknown `callMe` values fall back to `nickname`; unknown / duplicate goal ids are dropped and the list is capped at 3; non-string or blank `petName` falls back to `Rongrong`.
- All user text is rendered with `textContent`, never HTML.
- Reset demo data restores all profile defaults.
- When storage is unavailable, changes last only for the current session (same as other fields).
- A restored backup with unknown or invalid fields gets the same defaults as old saved data; fields the app does not know are kept as-is (same as load).

## Acceptance criteria

- [ ] Each of the three new rows opens its dialog and saved values persist after reload.
- [ ] Pet name shows on Home header, pet hint and Me card; empty input restores `Rongrong`.
- [ ] The pet tap line and birthday greeting use the chosen call-me preference.
- [ ] On the birthday date: greeting, one-time toast, 🎂 accessory, "Today!" on Me; on other dates none of these appear.
- [ ] A 4th goal cannot be selected; goals do not affect activity recommendations.
- [ ] Backup downloads a valid JSON file containing the current state, and the page makes no network request to send it.
- [ ] Restoring that file after Reset demo data brings back the same check-ins, profile and skins; Keep my data changes nothing; invalid files show a toast and change nothing.
- [ ] Stage, progress and bond-to-next match the thresholds; the stage-up toast appears only when a threshold is crossed.
- [ ] 320px width has no horizontal overflow; all controls are keyboard reachable with accessible names.

## iOS notes

Add the three fields to the SwiftData model with the same defaults; migrate old records with the defaults above. Export uses `ShareLink` / file exporter with the same JSON format; restore uses `fileImporter`, the same `app`/`format` checks and a confirmation alert before replacing the store.

## Related

- Pure logic: [`web/src/js/profile.js`](../../web/src/js/profile.js), tests in [`web/tests/profile.test.js`](../../web/tests/profile.test.js)
- Decision: [decisions.md](../decisions.md) · 2026-09-29 · User profile; 2026-10-06 · Restore from backup
- Demo data: [`web/demo/rongrong-demo-backup.json`](../../web/demo/rongrong-demo-backup.json) (presentation only, not linked from the app)
