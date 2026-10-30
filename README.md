# Satisfactory visualizer

A small, deterministic 3D factory view. The first plant is **screws from iron** using the [Cast Screws](https://satisfactory.wiki.gg/wiki/Screw) alternate: iron ore in on a belt, smelters, then constructors. No map, no AI, no miners.

## Run

```bash
npm install
npm run dev
```

`npm test` checks recipe math and layout rules. `npm run build` writes a static site to `dist/` (Netlify publishes that folder).

## Happy path

Open the app. The first visit shows a Mk3 Cast Screws plant — zero clicks. After that, the page restores the last output and belt mark.

**Demo: Screws from Iron** jumps back to Cast Screws at Mk3 (250 screws/min). The belt-mark control rescales whichever output is selected. There is no separate rate field. Cast Screws, as a reference:

| Mark | Belt | Constructors | Smelters | Screws |
| --- | --- | --- | --- | --- |
| Mk1 | 60 | 1 | 1 | 50 / min |
| Mk2 | 120 | 2 | 1 | 100 / min |
| Mk3 | 270 | 5 | 3 | 250 / min |
| Mk4 | 480 | 9 | 4 | 450 / min |

Every line uses the mark you picked. A manifold is never a mix of marks. On Cast Screws the screw belt is the tight line (`floor(belt / 50)`). Drag to orbit the camera.

## Recipes

Checked against satisfactory.wiki.gg at 100% clock. The picker is smelter + constructor only.

- **Iron Ingot** — Smelter, 2 s. 1 iron ore (30/min) → 1 iron ingot (30/min).
- **Copper Ingot** — Smelter, 2 s. 1 copper ore (30/min) → 1 copper ingot (30/min).
- **Cast Screws** (`Recipe_Alternate_Screw_C`) — Constructor, 24 s. 5 iron ingots (12.5/min) → 20 screws (50/min).
- **Iron Rod** — Constructor, 4 s. 1 iron ingot (15/min) → 1 iron rod (15/min).
- **Screws** — Constructor, 6 s. 1 iron rod (10/min) → 4 screws (40/min).
- **Iron Plate** — Constructor, 6 s. 3 iron ingots (30/min) → 2 iron plates (20/min).
- **Wire** — Constructor, 4 s. 1 copper ingot (15/min) → 2 wire (30/min).
- **Iron Wire** — Constructor, 24 s. 5 iron ingots (12.5/min) → 9 wire (22.5/min).
- **Cable** — Constructor, 2 s. 2 wire (60/min) → 1 cable (30/min). Opens on copper wire. Iron Wire is the other feed.

Machines stay at 100%. If a stage makes more than the next stage draws, the extra backs up in that stage's buffer. When a stage has surplus, its feed-end output gets a smart splitter: Any continues to the industrial storage, Overflow goes straight to the AWESOME Sink. The open end stays clear. If a stage is receiving less than it needs, the plant stays up and the panel says so. Clocks stay at 100%. Mk1 Iron Wire → Cable needs 60 wire/min and receives 45.

Alts that need another building (Coated Iron Plate, Steel Screws, Insulated Cable, and the rest) are not in this picker.

## Layout

- Foundations are **8×8×1 m**. 2 m and 4 m slabs are not built in this version.
- Production floors are **3 wall-heights (12 m)** apart, so an 8.5 m smelter or constructor fits under the next slab. Logistics stories are 2 walls; a manufacturer story is 4. Only the production story is used here.
- Footprints: Smelter 5×10×8.5, Constructor 8×10×8.5. Ports have a 1 m belt pad. Splitters and mergers are 4×4×1.
- Feed end: ore belt in, a lift and buffer between floors, product belt out, player ramp. The ramp does not cross the manifolds or the open end.
- Open end: empty foundation and an input-belt stub. Nothing terminates there.
- Gaps between machines are wide enough to walk (constructors sit on every other foundation because they are exactly 8 m wide). There is no side-walkway spine.
- Ore is an input belt. Miners are not placed. Power is not drawn.

Chains live in `src/data/chains.ts`. The belt solver is `src/solve/chain.ts`. Layout is still one manifold row per floor in `src/layout/plant.ts`.
