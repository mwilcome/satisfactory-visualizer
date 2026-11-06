# Satisfactory visualizer

A small, deterministic 3D factory view. The first plant is **screws from iron** using the [Cast Screws](https://satisfactory.wiki.gg/wiki/Screw) alternate: iron ore in on a belt, smelters, then constructors. No map, no AI, no miners.

## Run

```bash
npm install
npm run dev
```

`npm test` checks recipe math and layout rules. `npm run build` writes a static site to `dist/` (Netlify publishes that folder).

## Happy path

Open the app. The first visit builds Screws at Mk3 using Cast Screws. After that, pick an item, alt recipes, and a belt mark, then press Generate. The plant rebuilds only then. Every item in the pinned snapshot is listed. An item can be chosen when some whole chain uses only Smelters, Constructors, Foundries, Assemblers, and Manufacturers, with raw resources on input belts. The rest stay listed and cannot be selected. An alt that needs a fluid, or an input this layout cannot make, stays listed and cannot be turned on. The alt list has a checkbox, off by default, that shows only alts for the item you picked.

Alt recipes replace the default recipe for that item. The list is the full snapshot, or the alts unlocked in a save. The `.sav` file is parsed in the browser and is not uploaded. The belt mark is the rate. Machines follow the recipe and stay at 100%. Cast Screws, as a reference. The screw stage uses two belts, so the constructor count is twice what one belt holds:

| Mark | Belt | Constructors | Smelters | Screws |
| --- | --- | --- | --- | --- |
| Mk1 | 60 | 2 | 1 | 100 / min |
| Mk2 | 120 | 4 | 2 | 200 / min |
| Mk3 | 270 | 10 | 5 | 500 / min |
| Mk4 | 480 | 18 | 8 | 900 / min |

Every line uses the mark you picked. A manifold is never a mix of marks. Drag to orbit the camera.

## Recipes

Recipes come from a pinned [SatisfactoryTools](https://github.com/greeny/SatisfactoryTools) `dev` snapshot, commit `2bd16469` (2026-02-02). That is after 1.0 and before the June 2026 1.2 docs export, so recipes added after February 2026 are not in this build. Rates below are the 100% clock values from that snapshot.

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

Machines stay at 100%. If a stage makes more than the next stage draws, the extra backs up in that stage's buffer. When a stage has surplus, its feed-end output gets a smart splitter: Any continues to the industrial storage, and Overflow is a belt labeled “Overflow out (to sink).” The open end stays clear. If a stage is receiving less than it needs, the plant stays up and the panel says so. Clocks stay at 100%. Mk1 Iron Wire → Cable needs 120 wire/min and receives 45.

Heavy Modular Frame generates when the chain fits on these buildings. Heavy Encased Frame is the placeable frame alt. Heavy Flexible Frame needs rubber, so it stays listed and off. A Pure Iron Ingot alt needs a Refinery and stays off. If the chosen alts cannot be laid out, the panel says why and the previous plant stays up. A stage whose busiest item per machine is at least twice the quietest item uses two belts of that busy item, and the panel names it (“Screws uses two belts.”). Recipes under that ratio stay one row. A stage that still cannot fit one machine on the belt stays blocked. A stage that fits the belt but is short on supply stays up and the panel says it is receiving less than it needs.

## Layout

- Foundations are **8×8×1 m**. Coordinates are meters. A stair nudge is **1 m**, not a foundation. 2 m and 4 m slabs are not built in this version.
- A machine with two or more inputs keeps one aligned row. Each input has its own splitter lane. The lowest lane is farthest from the machines; each next lane is 1 m closer and 2 m higher. Nothing puts a conveyor lift between those splitters. Each machine still has one merger on the output.
- When the busiest item on a machine is at least twice the quietest, that stage is two facing rows. The fat item gets two outer belts. The thin item is the center trunk. The other inputs are raised lanes on the outer faces. Machines on each row stay on one Z. The middle is two splitter lines, one per row, with the same 1 m pad. One splitter does not feed both faces.
- A floor is reached by a switchback: 6 m out, a landing, 6 m back onto the next walk surface at the feed edge. The slope does not pass through the slab.
- Production floors are **3 wall-heights (12 m)** apart, so an 8.5 m smelter or constructor fits under the next slab. A Manufacturer floor is **4 wall-heights (16 m)**.
- Footprints: Smelter 5×10×8.5, Constructor 8×10×8.5, Foundry 10×10×9, Assembler 9×16×11, Manufacturer 18×20×12. The innermost input keeps a 1 m belt pad; each lower lane adds 1 m. Splitters and mergers are 4×4×1. Lifts are 2×2.
- Feed end: ore belt in, a lift and buffer between floors, product belt out, player ramp. The ramp does not cross the manifolds or the open end.
- Open end: empty foundation and an input-belt stub. Nothing terminates there.
- Machines pack on a 1 m stride with at least a 2 m walk gap. A single-row stage is one straight line. A two-belt stage is two straight lines. Foundations stay 8×8. There is no side-walkway spine.
- Ore is an input belt. Miners are not placed. Power is not drawn. Pipes are a later phase.

Chains live in `src/data/chains.ts`. The belt solver is `src/solve/chain.ts`. Layout is `src/layout/plant.ts`.

Open TODOs: measured port offsets (the lanes sit on the face centerline for now). Oil, refineries, and pipes stay out.
