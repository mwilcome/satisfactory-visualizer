# Satisfactory visualizer

A small, deterministic 3D factory view. The first plant is **screws from iron** using the [Cast Screws](https://satisfactory.wiki.gg/wiki/Screw) alternate: iron ore in on a belt, smelters, then constructors. No map, no AI, no miners.

## Run

```bash
npm install
npm run dev
```

`npm test` checks recipe math and layout rules. `npm run build` writes a static site to `dist/` (Netlify publishes that folder).

## Happy path

Open the app. The first visit shows Screws at Mk3 using Cast Screws. Search any Smelter, Constructor, Foundry, or Assembler part, pick a recipe when there is an alternate, and set the belt. The belt mark is the rate. Machines follow the recipe. Cast Screws, as a reference:

| Mark | Belt | Constructors | Smelters | Screws |
| --- | --- | --- | --- | --- |
| Mk1 | 60 | 1 | 1 | 50 / min |
| Mk2 | 120 | 2 | 1 | 100 / min |
| Mk3 | 270 | 5 | 3 | 250 / min |
| Mk4 | 480 | 9 | 4 | 450 / min |

Every line uses the mark you picked. A manifold is never a mix of marks. On Cast Screws the screw belt is the tight line (`floor(belt / 50)`). Drag to orbit the camera.

## Recipes

Checked against satisfactory.wiki.gg at 100% clock. The item list is every part made by a Smelter, Constructor, Foundry, or Assembler. Assembler and Foundry show up when a recipe uses them. Oil, pipes, and other buildings are not in this set.

- **Iron Ingot** — Smelter, 2 s. 1 iron ore (30/min) → 1 iron ingot (30/min).
- **Copper Ingot** — Smelter, 2 s. 1 copper ore (30/min) → 1 copper ingot (30/min).
- **Cast Screws** (`Recipe_Alternate_Screw_C`) — Constructor, 24 s. 5 iron ingots (12.5/min) → 20 screws (50/min).
- **Iron Rod** — Constructor, 4 s. 1 iron ingot (15/min) → 1 iron rod (15/min).
- **Screws** — Constructor, 6 s. 1 iron rod (10/min) → 4 screws (40/min).
- **Iron Plate** — Constructor, 6 s. 3 iron ingots (30/min) → 2 iron plates (20/min).
- **Wire** — Constructor, 4 s. 1 copper ingot (15/min) → 2 wire (30/min).
- **Iron Wire** — Constructor, 24 s. 5 iron ingots (12.5/min) → 9 wire (22.5/min).
- **Cable** — Constructor, 2 s. 2 wire (60/min) → 1 cable (30/min). Opens on copper wire. Iron Wire is the other feed.
- **Steel Ingot** — Foundry, 4 s. 3 iron ore (45/min) + 3 coal (45/min) → 3 steel ingots (45/min). Both inputs are feed belts.
- **Iron Alloy Ingot** — Foundry, 12 s. 8 iron ore (40/min) + 2 copper ore (10/min) → 15 iron ingots (75/min). Mk1 cannot hold one machine.
- **Reinforced Iron Plate** — Assembler, 12 s. 6 iron plates (30/min) + 12 screws (60/min) → 1 reinforced iron plate (5/min). The two inputs are the plate path and the Cast Screws path.

Machines stay at 100%. If a stage makes more than the next stage draws, the extra backs up in that stage's buffer. When a stage has surplus, its feed-end output gets a smart splitter: Any continues to the industrial storage, and Overflow is a belt labeled “Overflow out (to sink).” The open end stays clear. If a stage is receiving less than it needs, the plant stays up and the panel says so. Clocks stay at 100%. Mk1 Iron Wire → Cable needs 60 wire/min and receives 45.

Other assembler and foundry recipes are not listed. Adding one is data: a recipe plus which upstream stage or feed belt supplies each input. The stair layout does not care which part it is. Alts that need oil (Coated Iron Plate, Insulated Cable, and the rest) are not in this picker.

## Layout

- Foundations are **8×8×1 m**. Coordinates are meters. A stair nudge is **1 m**, not a foundation. 2 m and 4 m slabs are not built in this version.
- Assembler and foundry rows keep one machine line. Each input has its own splitter lane. The lowest lane is farthest from the machines; the next lane is 1 m closer and 2 m higher. Nothing puts a conveyor lift between those splitters. Each machine still has one merger on the output.
- A floor is reached by a switchback: 6 m out, a landing, 6 m back onto the next walk surface at the feed edge. The slope does not pass through the slab.
- Production floors are **3 wall-heights (12 m)** apart, so an 8.5 m smelter or constructor fits under the next slab. Logistics stories are 2 walls; a manufacturer story is 4. Only the production story is used here.
- Footprints: Smelter 5×10×8.5, Constructor 8×10×8.5, Foundry 10×10×9, Assembler 9×16×11. The innermost input keeps a 1 m belt pad; each lower lane adds 1 m. Splitters and mergers are 4×4×1. Lifts are 2×2.
- Feed end: ore belt in, a lift and buffer between floors, product belt out, player ramp. The ramp does not cross the manifolds or the open end.
- Open end: empty foundation and an input-belt stub. Nothing terminates there.
- Gaps between machines are wide enough to walk (constructors sit on every other foundation because they are exactly 8 m wide). There is no side-walkway spine.
- Ore is an input belt. Miners are not placed. Power is not drawn.

Chains live in `src/data/chains.ts`. The belt solver is `src/solve/chain.ts`. Layout is one manifold row per stage in `src/layout/plant.ts`. A stage with two inputs still occupies one row; the extra input is a second lane on that row.

Open TODOs: measured assembler and foundry port offsets (the lanes sit on the face centerline for now), a manufacturer mesh when that build is in scope, and a second manifold row when a single input would overflow one belt. Multi-input machines do not get that second row yet.
