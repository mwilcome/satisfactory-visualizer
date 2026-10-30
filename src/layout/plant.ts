import {
  BELT,
  BUILDINGS,
  FOUNDATION_HEIGHT_M,
  FOUNDATION_SIZE_M,
  LIFT,
  WALKWAY,
  storyClearanceM,
  type BeltMk,
} from "../data/catalog";
import { solveScrewsFromIron, type ScrewPlan } from "../solve/screws";
import type { Belt, Floor, Plant, PlantLabel, Ramp, Solid, Vec3, WalkCorridor } from "./types";

/**
 * Doc-style manifold for Cast Screws.
 *
 * Feed end (low x): ore comes in on a belt, ingots rise on a lift, screws leave,
 * and the player ramp sits here. The open end only has a grow stub.
 * Looking from feed toward open, input is on -z and output is on +z.
 * Every belt segment uses the selected mark. Clocks stay at 100%.
 * Foundations are 8×8×1. Players walk the gaps between machines.
 * Power poles and miners are not placed.
 */

const TILE = FOUNDATION_SIZE_M;
const FEED_X = 0;
const APRON_TILES = 4;
const INPUT_Z = 0;
const MACHINE_Z = 8;
const PORT_PAD = 1;
const MIN_WALK = 2;
const SPLIT = BUILDINGS.splitter.width;
const MERGER_Z = MACHINE_Z + BUILDINGS.smelter.length / 2 + PORT_PAD + SPLIT / 2;

const LIFT_X = -28;
const LIFT_Z = 25;
const BUFFER_X = -12;
const SCREW_EXIT_X = -12;
const SCREW_EXIT_Z = 30;

interface Draft {
  mk: BeltMk;
  solids: Solid[];
  belts: Belt[];
  ramps: Ramp[];
  corridors: WalkCorridor[];
  labels: PlantLabel[];
  keys: Set<string>;
}

interface RowSpec {
  id: "smelt" | "cast";
  floor: Floor;
  count: number;
  strideTiles: number;
  buildingId: "smelter" | "constructor";
  recipeId: "iron-ingot" | "cast-screw";
  inputPerMin: number;
  outputPerMin: number;
  inputItem: Belt["itemId"];
  outputItem: Belt["itemId"];
}

export function buildScrewPlant(plan: ScrewPlan): Plant {
  const clearance = storyClearanceM("production");
  const smeltFloor: Floor = {
    id: "smelt",
    z: 0,
    foundationHeightM: FOUNDATION_HEIGHT_M,
    heightClearanceM: clearance,
    storyKind: "production",
    wallCount: 3,
  };
  const castFloor: Floor = {
    id: "cast",
    z: clearance,
    foundationHeightM: FOUNDATION_HEIGHT_M,
    heightClearanceM: clearance,
    storyKind: "production",
    wallCount: 3,
  };

  const rows: RowSpec[] = [
    {
      id: "smelt",
      floor: smeltFloor,
      count: plan.smelters,
      strideTiles: strideTilesFor(BUILDINGS.smelter.width),
      buildingId: "smelter",
      recipeId: "iron-ingot",
      inputPerMin: 30,
      outputPerMin: 30,
      inputItem: "iron-ore",
      outputItem: "iron-ingot",
    },
    {
      id: "cast",
      floor: castFloor,
      count: plan.constructors,
      strideTiles: strideTilesFor(BUILDINGS.constructor.width),
      buildingId: "constructor",
      recipeId: "cast-screw",
      inputPerMin: 12.5,
      outputPerMin: 50,
      inputItem: "iron-ingot",
      outputItem: "screw",
    },
  ];

  const draft: Draft = {
    mk: plan.beltMk,
    solids: [],
    belts: [],
    ramps: [],
    corridors: [],
    labels: [],
    keys: new Set<string>(),
  };

  const rowMeta = rows.map((row) => {
    const openEndX = row.count * row.strideTiles * TILE;
    layRow(draft, row, openEndX);
    return {
      id: row.id,
      floorId: row.floor.id,
      feedEndX: FEED_X,
      openEndX,
      machineCount: row.count,
    };
  });

  const castRow = rowMeta[1];
  if (!castRow) throw new Error("constructor row missing");

  layLogistics(draft, plan, smeltFloor, castFloor);
  layRamp(draft, smeltFloor, castFloor);
  laySupports(draft, smeltFloor, castFloor, castRow.openEndX);

  const air = clearance - FOUNDATION_HEIGHT_M;
  if (BUILDINGS.smelter.height > air || BUILDINGS.constructor.height > air) {
    throw new Error("Machine is taller than the production-story air gap.");
  }

  return {
    goalItemId: "screw",
    dedicatedNodes: true,
    plan,
    feedEndX: FEED_X,
    floors: [smeltFloor, castFloor],
    solids: draft.solids,
    belts: draft.belts,
    ramps: draft.ramps,
    walkCorridors: draft.corridors,
    labels: draft.labels,
    rows: rowMeta,
  };
}

export function buildDemoPlant(beltMk: BeltMk): Plant {
  return buildScrewPlant(solveScrewsFromIron(beltMk));
}

function strideTilesFor(machineWidth: number): number {
  return Math.max(1, Math.ceil((machineWidth + MIN_WALK) / TILE - 1e-9));
}

function walkY(floor: Floor): number {
  return floor.z + floor.foundationHeightM;
}

function beltCenterY(floor: Floor): number {
  return walkY(floor) + BELT.height / 2;
}

function machineCenterX(index: number, strideTiles: number): number {
  return index * strideTiles * TILE + TILE / 2;
}

function addFoundation(draft: Draft, floor: Floor, ix: number, iz: number): void {
  const key = `${floor.id}:${ix}:${iz}`;
  if (draft.keys.has(key)) return;
  draft.keys.add(key);
  draft.solids.push({
    id: `fdn-${key}`,
    kind: "foundation",
    floorId: floor.id,
    base: { x: ix * TILE + TILE / 2, y: floor.z, z: iz * TILE + TILE / 2 },
    size: { x: TILE, y: FOUNDATION_HEIGHT_M, z: TILE },
  });
}

function fillPad(
  draft: Draft,
  floor: Floor,
  ix0: number,
  ix1: number,
  iz0: number,
  iz1: number,
): void {
  for (let ix = ix0; ix <= ix1; ix += 1) {
    for (let iz = iz0; iz <= iz1; iz += 1) addFoundation(draft, floor, ix, iz);
  }
}

function addBelt(
  draft: Draft,
  id: string,
  from: Vec3,
  to: Vec3,
  fields: Omit<Belt, "id" | "from" | "to" | "mk">,
): void {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const dz = Math.abs(to.z - from.z);
  if ([dx, dy, dz].filter((value) => value > 1e-6).length !== 1) {
    throw new Error(`Belt ${id} is not axis-aligned.`);
  }
  if (Math.hypot(dx, dy, dz) < 0.2) return;
  draft.belts.push({ id, from, to, mk: draft.mk, ...fields });
}

function layRow(draft: Draft, row: RowSpec, openEndX: number): void {
  const building = BUILDINGS[row.buildingId];
  const yWalk = walkY(row.floor);
  const yBelt = beltCenterY(row.floor);
  const stubIx = row.count * row.strideTiles;
  fillPad(draft, row.floor, -APRON_TILES, stubIx, -1, 2);

  const portInZ = MACHINE_Z - building.length / 2;
  const portOutZ = MACHINE_Z + building.length / 2;

  for (let index = 0; index < row.count; index += 1) {
    const x = machineCenterX(index, row.strideTiles);
    draft.solids.push({
      id: `${row.id}-m-${index}`,
      kind: "machine",
      floorId: row.floor.id,
      rowId: row.id,
      rowIndex: index,
      buildingId: row.buildingId,
      recipeId: row.recipeId,
      clock: 100,
      base: { x, y: yWalk, z: MACHINE_Z },
      size: { x: building.width, y: building.height, z: building.length },
    });
    draft.solids.push({
      id: `${row.id}-sp-${index}`,
      kind: "splitter",
      floorId: row.floor.id,
      rowId: row.id,
      rowIndex: index,
      base: { x, y: yWalk, z: INPUT_Z },
      size: { x: SPLIT, y: BUILDINGS.splitter.height, z: SPLIT },
    });
    draft.solids.push({
      id: `${row.id}-mg-${index}`,
      kind: "merger",
      floorId: row.floor.id,
      rowId: row.id,
      rowIndex: index,
      base: { x, y: yWalk, z: MERGER_Z },
      size: { x: SPLIT, y: BUILDINGS.merger.height, z: SPLIT },
    });

    addBelt(
      draft,
      `${row.id}-in-port-${index}`,
      { x, y: yBelt, z: INPUT_Z + SPLIT / 2 },
      { x, y: yBelt, z: portInZ },
      { itemId: row.inputItem, role: "input-port", rowId: row.id, designPerMin: row.inputPerMin },
    );
    addBelt(
      draft,
      `${row.id}-out-port-${index}`,
      { x, y: yBelt, z: portOutZ },
      { x, y: yBelt, z: MERGER_Z - SPLIT / 2 },
      { itemId: row.outputItem, role: "output-port", rowId: row.id, designPerMin: row.outputPerMin },
    );

    if (index < row.count - 1) {
      const next = machineCenterX(index + 1, row.strideTiles);
      const downstream = row.count - index - 1;
      addBelt(
        draft,
        `${row.id}-in-run-${index}`,
        { x: x + SPLIT / 2, y: yBelt, z: INPUT_Z },
        { x: next - SPLIT / 2, y: yBelt, z: INPUT_Z },
        {
          itemId: row.inputItem,
          role: "input-manifold",
          rowId: row.id,
          designPerMin: downstream * row.inputPerMin,
        },
      );
      addBelt(
        draft,
        `${row.id}-out-run-${index}`,
        { x: next - SPLIT / 2, y: yBelt, z: MERGER_Z },
        { x: x + SPLIT / 2, y: yBelt, z: MERGER_Z },
        {
          itemId: row.outputItem,
          role: "output-manifold",
          rowId: row.id,
          designPerMin: downstream * row.outputPerMin,
        },
      );

      const gapStart = x + building.width / 2;
      const gapEnd = next - building.width / 2;
      if (gapEnd - gapStart + 1e-6 < MIN_WALK) {
        throw new Error(`${row.id} walk gap is ${(gapEnd - gapStart).toFixed(2)} m.`);
      }
      draft.corridors.push({
        id: `${row.id}-walk-${index}`,
        min: { x: gapStart, y: yWalk + 0.05, z: portInZ },
        max: { x: gapEnd, y: yWalk + 2.2, z: portOutZ },
      });
    }
  }

  const lastX = machineCenterX(row.count - 1, row.strideTiles);
  addBelt(
    draft,
    `${row.id}-stub`,
    { x: lastX + SPLIT / 2, y: yBelt, z: INPUT_Z },
    { x: openEndX + TILE / 2, y: yBelt, z: INPUT_Z },
    { itemId: row.inputItem, role: "grow-stub", rowId: row.id, designPerMin: 0 },
  );

  draft.labels.push({
    id: `${row.id}-open`,
    text: "Open end",
    position: { x: openEndX + TILE * 0.75, y: yWalk + 0.35, z: INPUT_Z - 3 },
  });
}

function layLogistics(
  draft: Draft,
  plan: ScrewPlan,
  smelt: Floor,
  cast: Floor,
): void {
  const y0 = beltCenterY(smelt);
  const y1 = beltCenterY(cast);
  const firstFace = TILE / 2 - SPLIT / 2;
  const storage = BUILDINGS.storageIndustrial;

  addFoundation(draft, smelt, -APRON_TILES, 3);
  addFoundation(draft, cast, -2, 3);

  addBelt(
    draft,
    "ore-in",
    { x: -APRON_TILES * TILE, y: y0, z: INPUT_Z },
    { x: firstFace, y: y0, z: INPUT_Z },
    { itemId: "iron-ore", role: "ore-input", rowId: "smelt", designPerMin: plan.orePerMin },
  );

  addBelt(
    draft,
    "ingot-apron",
    { x: firstFace, y: y0, z: MERGER_Z },
    { x: LIFT_X, y: y0, z: MERGER_Z },
    {
      itemId: "iron-ingot",
      role: "stage-link",
      rowId: "smelt",
      designPerMin: plan.ingotsProducedPerMin,
    },
  );
  addBelt(
    draft,
    "ingot-to-lift",
    { x: LIFT_X, y: y0, z: MERGER_Z },
    { x: LIFT_X, y: y0, z: LIFT_Z - LIFT.length / 2 },
    {
      itemId: "iron-ingot",
      role: "stage-link",
      rowId: "smelt",
      designPerMin: plan.ingotsProducedPerMin,
    },
  );

  const liftHeight = walkY(cast) + BELT.height - walkY(smelt);
  draft.solids.push({
    id: "ingot-lift",
    kind: "lift",
    floorId: smelt.id,
    base: { x: LIFT_X, y: walkY(smelt), z: LIFT_Z },
    size: { x: LIFT.width, y: liftHeight, z: LIFT.length },
  });

  draft.solids.push({
    id: "ingot-buffer",
    kind: "buffer",
    floorId: cast.id,
    base: { x: BUFFER_X, y: walkY(cast), z: INPUT_Z },
    size: { x: storage.length, y: storage.height, z: storage.width },
  });

  addBelt(
    draft,
    "ingot-from-lift",
    { x: LIFT_X, y: y1, z: LIFT_Z - LIFT.length / 2 },
    { x: LIFT_X, y: y1, z: INPUT_Z },
    {
      itemId: "iron-ingot",
      role: "stage-link",
      rowId: "cast",
      designPerMin: plan.ingotsProducedPerMin,
    },
  );
  addBelt(
    draft,
    "ingot-to-buffer",
    { x: LIFT_X, y: y1, z: INPUT_Z },
    { x: BUFFER_X - storage.length / 2, y: y1, z: INPUT_Z },
    {
      itemId: "iron-ingot",
      role: "stage-link",
      rowId: "cast",
      designPerMin: plan.ingotsProducedPerMin,
    },
  );
  addBelt(
    draft,
    "ingot-to-manifold",
    { x: BUFFER_X + storage.length / 2, y: y1, z: INPUT_Z },
    { x: firstFace, y: y1, z: INPUT_Z },
    {
      itemId: "iron-ingot",
      role: "input-manifold",
      rowId: "cast",
      designPerMin: plan.ingotsConsumedPerMin,
    },
  );

  addBelt(
    draft,
    "screw-apron",
    { x: firstFace, y: y1, z: MERGER_Z },
    { x: SCREW_EXIT_X, y: y1, z: MERGER_Z },
    { itemId: "screw", role: "product-output", rowId: "cast", designPerMin: plan.screwsPerMin },
  );
  addBelt(
    draft,
    "screw-exit",
    { x: SCREW_EXIT_X, y: y1, z: MERGER_Z },
    { x: SCREW_EXIT_X, y: y1, z: SCREW_EXIT_Z },
    { itemId: "screw", role: "product-output", rowId: "cast", designPerMin: plan.screwsPerMin },
  );

  draft.labels.push(
    {
      id: "label-ore",
      text: "Iron ore in",
      position: { x: -APRON_TILES * TILE + 2, y: walkY(smelt) + 2.2, z: INPUT_Z },
    },
    {
      id: "label-buffer",
      text: "Ingot buffer",
      position: { x: BUFFER_X, y: walkY(cast) + storage.height + 0.6, z: INPUT_Z },
    },
    {
      id: "label-screws",
      text: "Screws out",
      position: { x: SCREW_EXIT_X, y: walkY(cast) + 2.4, z: SCREW_EXIT_Z },
    },
  );
}

function layRamp(draft: Draft, lower: Floor, upper: Floor): void {
  const z = -14;
  fillPad(draft, lower, -APRON_TILES, -1, -2, -2);
  fillPad(draft, upper, -APRON_TILES, -1, -2, -2);

  const segments = (walkY(upper) - walkY(lower)) / WALKWAY.rise;
  if (!Number.isInteger(segments)) {
    throw new Error("Ramp rise does not match the floor pitch.");
  }
  for (let index = 0; index < segments; index += 1) {
    const from: Vec3 = {
      x: -WALKWAY.length * index,
      y: walkY(lower) + WALKWAY.rise * index,
      z,
    };
    const to: Vec3 = {
      x: from.x - WALKWAY.length,
      y: from.y + WALKWAY.rise,
      z,
    };
    draft.ramps.push({ id: `ramp-${index}`, from, to, width: WALKWAY.width });
  }

  draft.labels.push({
    id: "label-feed",
    text: "Feed end",
    position: { x: -2, y: walkY(lower) + 3.2, z },
  });
}

function laySupports(draft: Draft, lower: Floor, upper: Floor, castOpenEndX: number): void {
  const top = upper.z;
  const edgeZ = [-TILE, MERGER_Z + TILE];
  const maxX = castOpenEndX + TILE;
  for (let x = -APRON_TILES * TILE; x <= maxX + 1e-6; x += TILE * 2) {
    for (const z of edgeZ) {
      const onLower = draft.solids.some(
        (solid) =>
          solid.kind === "foundation" &&
          solid.floorId === lower.id &&
          Math.abs(solid.base.x - x) <= TILE / 2 &&
          Math.abs(solid.base.z - z) <= TILE / 2,
      );
      const y0 = onLower ? walkY(lower) : lower.z;
      const height = top - y0;
      if (height <= 0) continue;
      draft.solids.push({
        id: `support-${x}-${z}`,
        kind: "support",
        floorId: lower.id,
        base: { x, y: y0, z },
        size: { x: 1.4, y: height, z: 1.4 },
      });
    }
  }
}
