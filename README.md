# Satisfactory visualizer

A small, deterministic 3D factory view. The first plant is **screws from iron** using the [Cast Screws](https://satisfactory.wiki.gg/wiki/Screw) alternate: iron ore in on a belt, smelters, then constructors. No map, no AI, no miners.

## Run

```bash
npm install
npm run dev
```

`npm test` checks recipe math and layout rules. `npm run build` writes a static site to `dist/` (Netlify publishes that folder).

## Happy path

Open the app. A Mk3 screw plant is already on screen — zero clicks.

**Demo: Screws from Iron** rebuilds that plant (Mk3, 250 screws/min). The belt-mark control rescales the same layout in one click:

| Mark | Belt | Constructors | Smelters | Screws |
| --- | --- | --- | --- | --- |
| Mk1 | 60 | 1 | 1 | 50 / min |
| Mk2 | 120 | 2 | 1 | 100 / min |
| Mk3 | 270 | 5 | 3 | 250 / min |
| Mk4 | 480 | 9 | 4 | 450 / min |

Every line uses the mark you picked. A manifold is never a mix of marks. Screw output is what limits the row (`floor(belt / 50)`). Drag to orbit the camera.

## Recipes

Checked against satisfactory.wiki.gg:

- **Iron Ingot** — Smelter, 2 s. 1 iron ore (30/min) → 1 iron ingot (30/min).
- **Cast Screws** (`Recipe_Alternate_Screw_C`) — Constructor, 24 s. 5 iron ingots (12.5/min) → 20 screws (50/min).

Machines stay at 100%. If the smelters make more ingots than the constructors draw, the extra backs up in the ingot buffer instead of underclocking.

## Layout

- Foundations are **8×8×1 m**. 2 m and 4 m slabs are not built in this version.
- Production floors are **3 wall-heights (12 m)** apart, so an 8.5 m smelter or constructor fits under the next slab. Logistics stories are 2 walls; a manufacturer story is 4. Only the production story is used here.
- Footprints: Smelter 5×10×8.5, Constructor 8×10×8.5. Ports have a 1 m belt pad. Splitters and mergers are 4×4×1.
- Feed end: ore belt in, ingot lift, screw belt out, player ramp. The ramp does not cross the manifolds or the open end.
- Open end: empty foundation and an input-belt stub. Nothing terminates there.
- Gaps between machines are wide enough to walk (constructors sit on every other foundation because they are exactly 8 m wide). There is no side-walkway spine.
- Ore is an input belt. Miners are not placed. Power is not drawn.

More recipes can be added in `src/data/catalog.ts`. The solver and layout for this chain live in `src/solve/screws.ts` and `src/layout/plant.ts`.
