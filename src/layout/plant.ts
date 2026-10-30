import {
  BELT,
  BUILDINGS,
  FOUNDATION_HEIGHT_M,
  FOUNDATION_SIZE_M,
  ITEMS,
  LIFT,
  RECIPES,
  WALKWAY,
  storyClearanceM,
  type BeltMk,
  type BuildingId,
  type ItemId,
} from "../data/catalog";
import type { ChainId } from "../data/chains";
import { SURPLUS_EPSILON, solveChain, type ChainPlan, type StagePlan } from "../solve/chain";
import type { Belt, Floor, Plant, PlantLabel, Ramp, Solid, Vec3, WalkCorridor } from "./types";

/**
 * Doc-style manifold. One floor and one row per stage.
 *
 * Feed end (low x): ore comes in on a belt, each stage's output rises on a
 * lift into the next floor's buffer, the product leaves from the top floor,
 * and the player ramp sits here. The open end only has a grow stub.
 * Looking from feed toward open, input is on -z and output is on +z.
 * Every belt segment uses the selected mark. Clocks stay at 100%.
 * Foundations are 8×8×1. Players walk the gaps between machines.
 * Power poles and miners are not placed.
 */

const TILE = FOUNDATION_SIZE_M;
const FEED_X = 0;
const INPUT_Z = 0;
const MACHINE_Z = 8;
const PORT_PAD = 1;
const MIN_WALK = 2;
const SPLIT = BUILDINGS.splitter.width;
const LIFT_Z = 25;
const BUFFER_X = -12;
const EXIT_X = -12;
const EXIT_Z = 30;

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
  id: string;
  floor: Floor;
  count: number;
  strideTiles: number;
  buildingId: BuildingId;
  recipeId: string;
  inputPerMin: number;
  outputPerMin: number;
  inputItem: string;
  outputItem: string;
  length: number;
  /** Output of this stage minus the next stage's draw. Zero on the goal row. */
  surplusPerMin: number;
}

export function buildChainPlant(plan: ChainPlan): Plant {
  if (plan.blockedReason || plan.stages.length < 2 || plan.stages.some((stage) => stage.machines < 1)) {
    throw new Error(plan.blockedReason ?? "Chain cannot be laid out.");
  }

  const clearance = storyClearanceM("production");
    const rows = plan.stages.map((stage, index) => {
    const recipe = RECIPES[stage.recipeId];
    const building = BUILDINGS[recipe.buildingId];
    const next = plan.stages[index + 1];
    const surplusPerMin = next ? stage.outputPerMin - next.inputPerMin : 0;
    const floor: Floor = {
      id: stage.recipeId,
      z: clearance * index,
      foundationHeightM: FOUNDATION_HEIGHT_M,
      heightClearanceM: clearance,
      storyKind: "production",
      wallCount: 3,
    };
    return {
      id: stage.recipeId,
      floor,
      count: stage.machines,
      strideTiles: strideTilesFor(building.width),
      buildingId: recipe.buildingId,
      recipeId: stage.recipeId,
      inputPerMin: recipe.inputs[0]?.perMin ?? 0,
      outputPerMin: recipe.outputs[0]?.perMin ?? 0,
      inputItem: recipe.inputs[0]?.itemId ?? "",
      outputItem: recipe.outputs[0]?.itemId ?? "",
      length: building.length,
      surplusPerMin,
    } satisfies RowSpec;
  });

  const length = rows[0]?.length;
  if (length === undefined || rows.some((row) => row.length !== length)) {
    throw new Error("Mixed machine lengths need a layout rule that is not set.");
  }
  const mergerZ = MACHINE_Z + length / 2 + PORT_PAD + SPLIT / 2;

  const draft: Draft = {
    mk: plan.beltMk,
    solids: [],
    belts: [],
    ramps: [],
    corridors: [],
    labels: [],
    keys: new Set<string>(),
  };

  const apron = apronTiles(rows.length);
  const rowMeta = rows.map((row, index) => {
    const openEndX = row.count * row.strideTiles * TILE;
    layRow(draft, row, openEndX, apron, mergerZ, index);
    return {
      id: row.id,
      floorId: row.floor.id,
      feedEndX: FEED_X,
      openEndX,
      machineCount: row.count,
    };
  });

  layLogistics(draft, plan, rows, apron, mergerZ);
  layRamp(draft, rows.map((row) => row.floor), apron);
  const openEnd = Math.max(...rowMeta.map((row) => row.openEndX));
  laySupports(draft, rows[0]?.floor, rows[rows.length - 1]?.floor, openEnd, apron, mergerZ);

  const air = clearance - FOUNDATION_HEIGHT_M;
  for (const row of rows) {
    if (BUILDINGS[row.buildingId].height > air) {
      throw new Error(`${row.buildingId} is taller than the production-story air gap.`);
    }
  }

  return {
    goalItemId: plan.goalItemId,
    dedicatedNodes: true,
    plan,
    feedEndX: FEED_X,
    floors: rows.map((row) => row.floor),
    solids: draft.solids,
    belts: draft.belts,
    ramps: draft.ramps,
    walkCorridors: draft.corridors,
    labels: draft.labels,
    rows: rowMeta,
  };
}

export function buildPlant(chainId: ChainId, beltMk: BeltMk): Plant | null {
  const plan = solveChain(chainId, beltMk);
  if (plan.blockedReason) return null;
  return buildChainPlant(plan);
}

export function buildDemoPlant(beltMk: BeltMk): Plant {
  const plant = buildPlant("cast-screw", beltMk);
  if (!plant) throw new Error("Cast Screws demo did not fit on this belt.");
  return plant;
}

function apronTiles(floors: number): number {
  const segments = (floors - 1) * (storyClearanceM("production") / WALKWAY.rise);
  const rampTiles = Math.ceil((segments * WALKWAY.length) / TILE - 1e-9);
  const farthestLiftTile = 4 + Math.max(0, floors - 2);
  return Math.max(4, rampTiles, farthestLiftTile);
}

/**
 * Lowest lift is farthest from the machines. Higher lifts step back toward
 * the feed line so an incoming lift column does not cross the next output belt.
 * One story stays at x = -28, matching the Cast Screws demo.
 */
function liftX(gap: number, gaps: number): number {
  const ix = -(4 + (gaps - 1 - gap));
  return ix * TILE + TILE / 2;
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

function layRow(
  draft: Draft,
  row: RowSpec,
  openEndX: number,
  apron: number,
  mergerZ: number,
  floorIndex: number,
): void {
  const building = BUILDINGS[row.buildingId];
  const yWalk = walkY(row.floor);
  const yBelt = beltCenterY(row.floor);
  const stubIx = row.count * row.strideTiles;
  fillPad(draft, row.floor, -apron, stubIx, -1, 2);

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
      base: { x, y: yWalk, z: mergerZ },
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
      { x, y: yBelt, z: mergerZ - SPLIT / 2 },
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
        { x: next - SPLIT / 2, y: yBelt, z: mergerZ },
        { x: x + SPLIT / 2, y: yBelt, z: mergerZ },
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

  if (row.surplusPerMin > SURPLUS_EPSILON) {
    layOverflow(draft, row, mergerZ, yWalk, yBelt, lastX, floorIndex);
  }
}

/**
 * Surplus leaves the last merger outward (+z), clear of the other rows.
 * Smart splitter, then the AWESOME Sink, then the storage container.
 * The sink has one input, so the bank is the splitter's other output.
 */
function layOverflow(
  draft: Draft,
  row: RowSpec,
  mergerZ: number,
  yWalk: number,
  yBelt: number,
  lastX: number,
  floorIndex: number,
): void {
  const sink = BUILDINGS.awesomeSink;
  const bank = BUILDINGS.storageContainer;
  const gap = 2;
  const splitZ = mergerZ + SPLIT / 2 + gap + SPLIT / 2;
  const sinkMinZ = splitZ + SPLIT / 2 + gap;
  const sinkZ = sinkMinZ + sink.length / 2;
  const bankMinZ = sinkMinZ + sink.length + gap;
  const bankZ = bankMinZ + bank.length / 2;
  // Each floor gets its own lane. A 24 m sink reaches the belt height of the floor above.
  const laneX = outwardLaneX(lastX, SPLIT / 2 + gap) + floorIndex * (sink.width + gap);
  const bankX = laneX + sink.width / 2 + gap + bank.width / 2;

  const flow = {
    itemId: row.outputItem,
    role: "overflow-stub" as const,
    rowId: row.id,
    designPerMin: row.surplusPerMin,
  };

  addBelt(
    draft,
    `${row.id}-overflow-to-split`,
    { x: lastX, y: yBelt, z: mergerZ + SPLIT / 2 },
    { x: lastX, y: yBelt, z: splitZ - SPLIT / 2 },
    flow,
  );
  draft.solids.push({
    id: `${row.id}-smart`,
    kind: "smartSplitter",
    floorId: row.floor.id,
    rowId: row.id,
    base: { x: lastX, y: yWalk, z: splitZ },
    size: { x: SPLIT, y: BUILDINGS.smartSplitter.height, z: SPLIT },
  });
  addBelt(
    draft,
    `${row.id}-overflow-to-lane`,
    { x: lastX + SPLIT / 2, y: yBelt, z: splitZ },
    { x: laneX, y: yBelt, z: splitZ },
    flow,
  );
  addBelt(
    draft,
    `${row.id}-overflow-to-sink`,
    { x: laneX, y: yBelt, z: splitZ },
    { x: laneX, y: yBelt, z: sinkMinZ },
    flow,
  );
  draft.solids.push({
    id: `${row.id}-sink`,
    kind: "sink",
    floorId: row.floor.id,
    rowId: row.id,
    base: { x: laneX, y: yWalk, z: sinkZ },
    size: { x: sink.width, y: sink.height, z: sink.length },
  });
  addBelt(
    draft,
    `${row.id}-overflow-to-bank-x`,
    { x: laneX, y: yBelt, z: splitZ },
    { x: bankX, y: yBelt, z: splitZ },
    flow,
  );
  addBelt(
    draft,
    `${row.id}-overflow-to-bank-z`,
    { x: bankX, y: yBelt, z: splitZ },
    { x: bankX, y: yBelt, z: bankMinZ },
    flow,
  );
  draft.solids.push({
    id: `${row.id}-bank`,
    kind: "bank",
    floorId: row.floor.id,
    rowId: row.id,
    base: { x: bankX, y: yWalk, z: bankZ },
    size: { x: bank.width, y: bank.height, z: bank.length },
  });

  coverFoundations(
    draft,
    row.floor,
    Math.min(lastX - SPLIT / 2, laneX - sink.width / 2),
    bankX + bank.width / 2,
    mergerZ,
    bankZ + bank.length / 2,
  );

  draft.labels.push(
    {
      id: `${row.id}-smart-label`,
      text: "Smart splitter",
      position: { x: lastX, y: yWalk + 2.4, z: splitZ },
    },
    {
      id: `${row.id}-sink-label`,
      text: "Awesome Sink",
      position: { x: laneX, y: yWalk + sink.height + 1.2, z: sinkZ },
    },
    {
      id: `${row.id}-bank-label`,
      text: "Bank",
      position: { x: bankX, y: yWalk + bank.height + 1.2, z: bankZ },
    },
  );
}

/** Belt lane on the 8 m mod 16 grid, clear of the support columns. */
function outwardLaneX(originX: number, minOffset: number): number {
  const minX = originX + minOffset;
  let x = Math.ceil((minX - 8) / 16) * 16 + 8;
  if (x < minX) x += 16;
  return x;
}

function coverFoundations(
  draft: Draft,
  floor: Floor,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
): void {
  const ix0 = Math.floor(minX / TILE);
  const ix1 = Math.floor((maxX - 1e-9) / TILE);
  const iz0 = Math.floor(minZ / TILE);
  const iz1 = Math.floor((maxZ - 1e-9) / TILE);
  fillPad(draft, floor, ix0, ix1, iz0, iz1);
}

function layLogistics(
  draft: Draft,
  plan: ChainPlan,
  rows: RowSpec[],
  apron: number,
  mergerZ: number,
): void {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return;
  const firstFace = TILE / 2 - SPLIT / 2;
  const storage = BUILDINGS.storageIndustrial;
  const y0 = beltCenterY(first.floor);

  addBelt(
    draft,
    "ore-in",
    { x: -apron * TILE, y: y0, z: INPUT_Z },
    { x: firstFace, y: y0, z: INPUT_Z },
    {
      itemId: first.inputItem,
      role: "ore-input",
      rowId: first.id,
      designPerMin: plan.stages[0]?.inputPerMin ?? 0,
    },
  );
  draft.labels.push({
    id: "label-ore",
    text: `${itemName(first.inputItem)} in`,
    position: { x: -apron * TILE + 2, y: walkY(first.floor) + 2.2, z: INPUT_Z },
  });

  for (let index = 0; index < rows.length - 1; index += 1) {
    const lower = rows[index];
    const upper = rows[index + 1];
    const lowerStage = plan.stages[index];
    const upperStage = plan.stages[index + 1];
    if (!lower || !upper || !lowerStage || !upperStage) continue;
    layStageLink(draft, lower, upper, lowerStage, upperStage, index, rows.length - 1, firstFace, mergerZ, storage);
  }

  const yTop = beltCenterY(last.floor);
  const made = plan.stages[plan.stages.length - 1]?.outputPerMin ?? 0;
  addBelt(
    draft,
    "product-apron",
    { x: firstFace, y: yTop, z: mergerZ },
    { x: EXIT_X, y: yTop, z: mergerZ },
    { itemId: last.outputItem, role: "product-output", rowId: last.id, designPerMin: made },
  );
  addBelt(
    draft,
    "product-exit",
    { x: EXIT_X, y: yTop, z: mergerZ },
    { x: EXIT_X, y: yTop, z: EXIT_Z },
    { itemId: last.outputItem, role: "product-output", rowId: last.id, designPerMin: made },
  );
  addFoundation(draft, last.floor, tileIndex(EXIT_X), tileIndex(EXIT_Z));
  draft.labels.push({
    id: "label-product",
    text: `${itemName(last.outputItem)} out`,
    position: { x: EXIT_X, y: walkY(last.floor) + 2.4, z: EXIT_Z },
  });
}

function layStageLink(
  draft: Draft,
  lower: RowSpec,
  upper: RowSpec,
  lowerStage: StagePlan,
  upperStage: StagePlan,
  gap: number,
  gaps: number,
  firstFace: number,
  mergerZ: number,
  storage: { length: number; height: number; width: number },
): void {
  const yLower = beltCenterY(lower.floor);
  const yUpper = beltCenterY(upper.floor);
  const x = liftX(gap, gaps);
  const item = lower.outputItem;

  addFoundation(draft, lower.floor, tileIndex(x), tileIndex(LIFT_Z));

  addBelt(
    draft,
    `${lower.id}-to-lift-x`,
    { x: firstFace, y: yLower, z: mergerZ },
    { x, y: yLower, z: mergerZ },
    { itemId: item, role: "stage-link", rowId: lower.id, designPerMin: lowerStage.outputPerMin },
  );
  addBelt(
    draft,
    `${lower.id}-to-lift-z`,
    { x, y: yLower, z: mergerZ },
    { x, y: yLower, z: LIFT_Z - LIFT.length / 2 },
    { itemId: item, role: "stage-link", rowId: lower.id, designPerMin: lowerStage.outputPerMin },
  );

  const liftHeight = walkY(upper.floor) + BELT.height - walkY(lower.floor);
  draft.solids.push({
    id: `lift-${lower.id}`,
    kind: "lift",
    floorId: lower.floor.id,
    base: { x, y: walkY(lower.floor), z: LIFT_Z },
    size: { x: LIFT.width, y: liftHeight, z: LIFT.length },
  });

  draft.solids.push({
    id: `buffer-${upper.id}`,
    kind: "buffer",
    floorId: upper.floor.id,
    base: { x: BUFFER_X, y: walkY(upper.floor), z: INPUT_Z },
    size: { x: storage.length, y: storage.height, z: storage.width },
  });

  addBelt(
    draft,
    `${upper.id}-from-lift`,
    { x, y: yUpper, z: LIFT_Z - LIFT.length / 2 },
    { x, y: yUpper, z: INPUT_Z },
    { itemId: item, role: "stage-link", rowId: upper.id, designPerMin: lowerStage.outputPerMin },
  );
  addBelt(
    draft,
    `${upper.id}-to-buffer`,
    { x, y: yUpper, z: INPUT_Z },
    { x: BUFFER_X - storage.length / 2, y: yUpper, z: INPUT_Z },
    { itemId: item, role: "stage-link", rowId: upper.id, designPerMin: lowerStage.outputPerMin },
  );
  addBelt(
    draft,
    `${upper.id}-from-buffer`,
    { x: BUFFER_X + storage.length / 2, y: yUpper, z: INPUT_Z },
    { x: firstFace, y: yUpper, z: INPUT_Z },
    { itemId: item, role: "input-manifold", rowId: upper.id, designPerMin: upperStage.inputPerMin },
  );

  draft.labels.push({
    id: `label-buffer-${upper.id}`,
    text: `${itemName(item)} buffer`,
    position: { x: BUFFER_X, y: walkY(upper.floor) + storage.height + 0.6, z: INPUT_Z },
  });
}

function layRamp(draft: Draft, floors: Floor[], apron: number): void {
  const lower = floors[0];
  const upper = floors[floors.length - 1];
  if (!lower || !upper) return;
  const z = -14;
  for (const floor of floors) fillPad(draft, floor, -apron, -1, -2, -2);

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

function laySupports(
  draft: Draft,
  lower: Floor | undefined,
  upper: Floor | undefined,
  openEndX: number,
  apron: number,
  mergerZ: number,
): void {
  if (!lower || !upper) return;
  const top = upper.z;
  const edgeZ = [-TILE, mergerZ + TILE];
  const maxX = openEndX + TILE;
  for (let x = -apron * TILE; x <= maxX + 1e-6; x += TILE * 2) {
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

function tileIndex(coord: number): number {
  return Math.floor(coord / TILE);
}

function itemName(itemId: string): string {
  if (isItemId(itemId)) return ITEMS[itemId].name;
  return itemId;
}

function isItemId(itemId: string): itemId is ItemId {
  return Object.prototype.hasOwnProperty.call(ITEMS, itemId);
}
