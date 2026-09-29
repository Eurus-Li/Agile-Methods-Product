# Rongrong iOS App — Not Started Yet

This directory is a placeholder for the future native SwiftUI app. The tech stack, architecture, module breakdown and UI design tokens are already settled in [../docs/architecture.md](../docs/architecture.md); when you start writing code, set up the project following it without re-deciding anything.

The product logic (mood check-in, Journal, Me, Plus) already works and has been validated in [../web/](../web/); see [../docs/specs/](../docs/specs/). The iOS version implements the same product logic natively rather than designing from scratch.

Read [../AGENTS.md](../AGENTS.md) before starting work in this directory.

Release 1.1 activity recommendations are defined in the [activity spec](../docs/specs/mood-activities.md) and implemented on web first. The future Reply module reuses the fixed catalog IDs, mood mapping and selection rules; SwiftData adds a nullable activityId, with old records defaulting to nil.

Activity confirmation feedback: per the activity spec, show a brief happy dog animation plus the selection text, using the system accessibilityReduceMotion to decide whether to disable translation/scaling; no new persisted fields or Bond rewards.

Visual alignment: Home uses a transparent character, a separate illustrated background and a fixed shadow; accessories move with the character, and the five mood options use the matching hand-painted expressions. Asset paths and prompts are in [character/background](../docs/pet-animation-asset.md) and [mood portraits](../docs/mood-portrait-assets.md). These currently exist only on web; iOS still needs the project set up and native adaptation.
