# Landing page

Notes on the public landing page ([app/pages/(public)/index.vue](../app/pages/(public)/index.vue))
and its supporting components.

## Paw trail — make the SVG path count-aware before wiring pets to the DB

**Status:** deferred. Needed when the pet cards stop being the 3 hardcoded entries in
`index.vue` and are fetched from the database (planned: list ~5 registers).

### Current behavior

The paw trail is drawn by [app/components/landing/PawTrail.vue](../app/components/landing/PawTrail.vue),
with paw placement and scroll animation in
[app/composables/usePawTrail.ts](../app/composables/usePawTrail.ts).

Vertical coverage already scales to any number of cards:

- The trail box is `h-full` (desktop) / `inset-y-0` (mobile), so it grows with the
  cards wrapper.
- The SVG uses `preserveAspectRatio="none"`, so the path stretches to the box height.
- `buildPaws()` derives paw count and `scaleY` from the live box height, and
  `useResizeObserver` → `rebuild()` (which calls `ScrollTrigger.refresh()`) reacts to
  height changes, including async-loaded data.

So the dotted trail **will reach the bottom** regardless of card count.

### The limitation

`DESKTOP_PATH` / `MOBILE_PATH` are hardcoded path strings with a fixed number of
S-bends, hand-tuned so each bend weaves between the image/info columns of the current
**3-card** layout (respecting each card's alternating `reverse` side).

With more cards (e.g. 5) and `preserveAspectRatio="none"`, the same fixed curves get
stretched vertically: each bend elongates and the bends **no longer line up** with each
card's left/right position. It still looks like a continuous trail, but the per-card
weave drifts out of sync with the alternating layout.

### Planned fix

Generate the path **procedurally from the card count** instead of hardcoding it — one
consistent S-segment per card at the right Y positions — so N cards produce N matching
bends aligned to the alternating layout. Likely shape: a `count` prop (or computed from
the fetched pets) passed into `PawTrail`, used to build the `d` string.

This is a contained change to `PawTrail.vue` (+ possibly a small helper in
`usePawTrail.ts`); do it when the pets list becomes DB-driven.
