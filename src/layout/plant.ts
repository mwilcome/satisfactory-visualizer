import {
  BELT,
  BUILDINGS,
  FOUNDATION_HEIGHT_M,
  FOUNDATION_SIZE_M,
  INPUT_LANE_RISE_M,
  ITEMS,
  LIFT,
  RECIPES,
  WALKWAY,
  inputLaneOutboardM,
  storyClearanceM,
  type BeltMk,
  type BuildingId,
  type ItemId,
} from "../data/catalog";
import { INDUSTRIAL_PORT_ENTRY, INDUSTRIAL_PORT_Y } from "../data/parts";
import { isLinearWiring, type ChainId, type InputSource } from "../data/chains";
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
 *
 * Coordinates are meters. Machine rows still step on the 8 m foundation grid.
 * A second input is not another foundation out: it is 1 m farther from the
 * machine and 2 m higher than the lane inside it. No conveyor lift sits between
 * those splitters.
 *
 * TODO: multi-row only for a 1-in/1-out stage whose belt would overflow.
 * Multi-input machines stay on one line. A second manifold per input waits.
 * TODO: assembler and foundry ports are on the input-face centerline.
 * Move a lane in x when a measured connector offset exists.
 */

const TILE = FOUNDATION_SIZE_M;
const FEED_X = 0;
/** Single-input belt line. Also the innermost dual-input lane. */
const INPUT_Z = 0;
const INPUT_FACE_Z = 3;
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

interface LaneIn {
  itemId: string;
  perMin: number;
  from: InputSource;
}

interface RowSpec {
  id: string;
  stageIndex: number;
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
  /** Output minus downstream draw. Zero when nothing downstream draws. */
  surplusPerMin: number;
  underfedNote: string | null;
  inputCount: number;
  inputs: LaneIn[];
  laneZ: number[];
  machineZ: number;
  mergerZ: number;
  inputFaceZ: number;
  outputFaceZ: number;
}

export function buildChainPlant(plan: ChainPlan): Plant {
  if (plan.blockedReason || plan.stages.length < 1 || plan.stages.some((stage) => stage.machines < 1)) {
    throw new Error(plan.blockedReason ?? "Chain cannot be laid out.");
  }

  const clearance = storyClearanceM("production");
  const wired = plan.stages.map((stage) => ({
    id: stage.stageId,
    recipeId: stage.recipeId,
    from: stage.inputFrom,
  }));
  const rows = plan.stages.map((stage, index) => {
    const recipe = RECIPES[stage.recipeId];
    const building = BUILDINGS[recipe.buildingId];
    if (!building) throw new Error(`${stage.recipeId} is not laid out.`);
    const floor: Floor = {
      id: stage.stageId,
      z: clearance * index,
      foundationHeightM: FOUNDATION_HEIGHT_M,
      heightClearanceM: clearance,
      storyKind: "production",
      wallCount: 3,
    };
    const machineZ = INPUT_FACE_Z + building.length / 2;
    return {
      id: stage.stageId,
      stageIndex: index,
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
      surplusPerMin: stage.surplusPerMin,
      underfedNote: stage.underfedNote,
      inputCount: recipe.inputs.length,
      inputs: recipe.inputs.map((stack, slot) => ({
        itemId: stack.itemId,
        perMin: stack.perMin,
        from: stage.inputFrom[slot] ?? "feed",
      })),
      laneZ: recipe.inputs.map((_, slot) => laneZFor(slot, recipe.inputs.length)),
      machineZ,
      mergerZ: INPUT_FACE_Z + building.length + PORT_PAD + SPLIT / 2,
      inputFaceZ: INPUT_FACE_Z,
      outputFaceZ: INPUT_FACE_Z + building.length,
    } satisfies RowSpec;
  });

  const mergerZ = rows[0]?.mergerZ ?? INPUT_FACE_Z + PORT_PAD + SPLIT / 2;

  const draft: Draft = {
    mk: plan.beltMk,
    solids: [],
    belts: [],
    ramps: [],
    corridors: [],
    labels: [],
    keys: new Set<string>(),
  };

  const apron = apronTiles(rows.length, isLinearWiring(wired) ? 0 : linkSlotCount(rows));
  const rowMeta = rows.map((row) => {
    const openEndX = row.count * row.strideTiles * TILE;
    layRow(draft, row, openEndX, apron);
    return {
      id: row.id,
      floorId: row.floor.id,
      feedEndX: FEED_X,
      openEndX,
      machineCount: row.count,
    };
  });

  if (isLinearWiring(wired)) layLogistics(draft, plan, rows, apron, mergerZ);
  else layJoinedLogistics(draft, plan, rows, apron);
  layRamp(draft, rows.map((row) => row.floor));
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

function apronTiles(floors: number, linkSlots: number): number {
  // Each story's ramp switchback fits in three foundation tiles.
  // Lifts and joined-link columns still step one tile further out per slot.
  const farthestLiftTile = 4 + Math.max(0, floors - 2);
  const slotTiles = linkSlots > 0 ? 4 + (linkSlots - 1) * 2 : 0;
  return Math.max(4, farthestLiftTile, slotTiles, 3);
}

function linkSlotCount(rows: RowSpec[]): number {
  let slots = 0;
  for (const row of rows) {
    for (const input of row.inputs) {
      if (input.from === "feed") {
        if (row.stageIndex > 0) slots += 1;
      } else {
        slots += 1;
      }
    }
  }
  return slots;
}

function laneZFor(lane: number, inputCount: number): number {
  const inner = INPUT_FACE_Z - PORT_PAD - SPLIT / 2;
  return inner - inputLaneOutboardM(lane, inputCount);
}

function laneBaseY(floor: Floor, lane: number): number {
  return walkY(floor) + lane * INPUT_LANE_RISE_M;
}

function laneBeltY(floor: Floor, lane: number): number {
  return beltCenterY(floor) + lane * INPUT_LANE_RISE_M;
}

function slotX(slot: number): number {
  // 16 m leaves room for an 11 m buffer beside the lift without touching the next column.
  return -28 - slot * (TILE * 2);
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

function layRow(draft: Draft, row: RowSpec, openEndX: number, apron: number): void {
  const building = BUILDINGS[row.buildingId];
  const yWalk = walkY(row.floor);
  const yBelt = beltCenterY(row.floor);
  const stubIx = row.count * row.strideTiles;
  const zMin = Math.min(...row.laneZ, row.mergerZ) - SPLIT;
  const zMax = Math.max(...row.laneZ, row.mergerZ, row.outputFaceZ) + SPLIT;
  fillPad(draft, row.floor, -apron, stubIx, Math.min(tileIndex(zMin), -1), Math.max(tileIndex(zMax - 1e-6), 2));

  const portInZ = row.inputFaceZ;
  const portOutZ = row.outputFaceZ;
  const multi = row.inputCount > 1;

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
      base: { x, y: yWalk, z: row.machineZ },
      size: { x: building.width, y: building.height, z: building.length },
    });
    for (let lane = 0; lane < row.inputCount; lane += 1) {
      const input = row.inputs[lane];
      const z = row.laneZ[lane] ?? INPUT_Z;
      const suffix = multi ? `-l${lane}` : "";
      draft.solids.push({
        id: `${row.id}-sp-${index}${suffix}`,
        kind: "splitter",
        floorId: row.floor.id,
        rowId: row.id,
        rowIndex: index,
        lane,
        base: { x, y: laneBaseY(row.floor, lane), z },
        size: { x: SPLIT, y: BUILDINGS.splitter.height, z: SPLIT },
      });
      if (lane > 0) {
        // Posts under the raised splitter, outside the 2 m belt on the centerline.
        for (const side of [-1, 1] as const) {
          draft.solids.push({
            id: `${row.id}-sp-post-${index}-l${lane}-${side > 0 ? "p" : "n"}`,
            kind: "support",
            floorId: row.floor.id,
            rowId: row.id,
            base: { x: x + side * 1.6, y: yWalk, z: z + 1.2 },
            size: { x: 0.3, y: lane * INPUT_LANE_RISE_M, z: 0.3 },
          });
        }
      }
      addBelt(
        draft,
        `${row.id}-in-port-${index}${suffix}`,
        { x, y: laneBeltY(row.floor, lane), z: z + SPLIT / 2 },
        { x, y: laneBeltY(row.floor, lane), z: portInZ },
        { itemId: input?.itemId ?? row.inputItem, role: "input-port", rowId: row.id, designPerMin: input?.perMin ?? row.inputPerMin },
      );
    }
    draft.solids.push({
      id: `${row.id}-mg-${index}`,
      kind: "merger",
      floorId: row.floor.id,
      rowId: row.id,
      rowIndex: index,
      base: { x, y: yWalk, z: row.mergerZ },
      size: { x: SPLIT, y: BUILDINGS.merger.height, z: SPLIT },
    });
    addBelt(
      draft,
      `${row.id}-out-port-${index}`,
      { x, y: yBelt, z: portOutZ },
      { x, y: yBelt, z: row.mergerZ - SPLIT / 2 },
      { itemId: row.outputItem, role: "output-port", rowId: row.id, designPerMin: row.outputPerMin },
    );

    if (index < row.count - 1) {
      const next = machineCenterX(index + 1, row.strideTiles);
      const downstream = row.count - index - 1;
      for (let lane = 0; lane < row.inputCount; lane += 1) {
        const input = row.inputs[lane];
        const z = row.laneZ[lane] ?? INPUT_Z;
        const suffix = multi ? `-l${lane}` : "";
        addBelt(
          draft,
          `${row.id}-in-run-${index}${suffix}`,
          { x: x + SPLIT / 2, y: laneBeltY(row.floor, lane), z },
          { x: next - SPLIT / 2, y: laneBeltY(row.floor, lane), z },
          {
            itemId: input?.itemId ?? row.inputItem,
            role: "input-manifold",
            rowId: row.id,
            designPerMin: downstream * (input?.perMin ?? row.inputPerMin),
          },
        );
      }
      addBelt(
        draft,
        `${row.id}-out-run-${index}`,
        { x: next - SPLIT / 2, y: yBelt, z: row.mergerZ },
        { x: x + SPLIT / 2, y: yBelt, z: row.mergerZ },
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
  for (let lane = 0; lane < row.inputCount; lane += 1) {
    const input = row.inputs[lane];
    const z = row.laneZ[lane] ?? INPUT_Z;
    const suffix = multi ? `-l${lane}` : "";
    addBelt(
      draft,
      `${row.id}-stub${suffix}`,
      { x: lastX + SPLIT / 2, y: laneBeltY(row.floor, lane), z },
      { x: openEndX + TILE / 2, y: laneBeltY(row.floor, lane), z },
      { itemId: input?.itemId ?? row.inputItem, role: "grow-stub", rowId: row.id, designPerMin: 0 },
    );
  }

  const outerZ = row.laneZ[0] ?? INPUT_Z;
  draft.labels.push({
    id: `${row.id}-open`,
    text: "Open end",
    position: { x: openEndX + TILE * 0.75, y: yWalk + 0.35, z: outerZ - 3 },
  });

  if (row.underfedNote) {
    draft.labels.push({
      id: `${row.id}-underfed`,
      text: row.underfedNote,
      position: { x: machineCenterX(0, row.strideTiles), y: yWalk + 3.6, z: outerZ - 5 },
    });
  }
}

/**
 * Surplus block at the feed end of this stage's merged output.
 * Any continues toward the industrial storage. Overflow goes +z straight into the sink.
 * Floors are spaced in x so a 24 m sink does not sit on the next floor's belt.
 */
function layFeedSurplus(
  draft: Draft,
  row: RowSpec,
  mergerZ: number,
  yWalk: number,
  yBelt: number,
  firstFace: number,
  liftXPos: number,
  splitX: number,
): void {
  const overflowEndZ = 40;
  const flow = {
    itemId: row.outputItem,
    role: "overflow-stub" as const,
    rowId: row.id,
    designPerMin: row.surplusPerMin,
  };
  const main = {
    itemId: row.outputItem,
    role: "stage-link" as const,
    rowId: row.id,
    designPerMin: row.outputPerMin,
  };

  addBelt(
    draft,
    `${row.id}-to-split`,
    { x: firstFace, y: yBelt, z: mergerZ },
    { x: splitX + SPLIT / 2, y: yBelt, z: mergerZ },
    main,
  );
  draft.solids.push({
    id: `${row.id}-smart`,
    kind: "smartSplitter",
    floorId: row.floor.id,
    rowId: row.id,
    base: { x: splitX, y: yWalk, z: mergerZ },
    size: { x: SPLIT, y: BUILDINGS.smartSplitter.height, z: SPLIT },
  });
  addBelt(
    draft,
    `${row.id}-any-to-lift`,
    { x: splitX - SPLIT / 2, y: yBelt, z: mergerZ },
    { x: liftXPos, y: yBelt, z: mergerZ },
    main,
  );
  addBelt(
    draft,
    `${row.id}-overflow-to-sink`,
    { x: splitX, y: yBelt, z: mergerZ + SPLIT / 2 },
    { x: splitX, y: yBelt, z: overflowEndZ },
    flow,
  );
  draft.labels.push(
    {
      id: `${row.id}-smart-label`,
      text: "Smart splitter",
      position: { x: splitX, y: yWalk + 2.6, z: mergerZ - 3 },
    },
    {
      id: `${row.id}-any-label`,
      text: "Any",
      position: { x: splitX - 8, y: yWalk + 1.6, z: mergerZ + 3 },
    },
    {
      id: `${row.id}-overflow-label`,
      text: "Overflow out (to sink)",
      position: { x: splitX, y: yWalk + 2.4, z: overflowEndZ },
    },
  );
}

/** Feed-apron x for this stage's output. Higher floors sit closer to the machines. */
function feedSplitX(gap: number, gaps: number): number {
  return -10 - (gaps - 1 - gap) * (BUILDINGS.awesomeSink.width + 2);
}

function layJoinedLogistics(draft: Draft, plan: ChainPlan, rows: RowSpec[], apron: number): void {
  const goal = rows[rows.length - 1];
  const ground = rows[0]?.floor;
  if (!goal || !ground) return;

  let slot = 0;
  const seenSurplus = new Set<string>();
  for (const row of rows) {
    const stage = plan.stages[row.stageIndex];
    if (!stage) continue;
    for (let lane = 0; lane < row.inputCount; lane += 1) {
      const input = row.inputs[lane];
      if (!input) continue;
      const drawn = stage.inputsPerMin[lane] ?? 0;
      if (input.from === "feed") {
        if (row.stageIndex === 0) layGroundFeed(draft, row, lane, apron, input.itemId, drawn);
        else {
          layUpperFeed(draft, row, lane, slot, apron, input.itemId, drawn, ground);
          slot += 1;
        }
        continue;
      }
      const source = rows[input.from];
      const sourceStage = plan.stages[input.from];
      if (!source || !sourceStage) throw new Error(`${row.id} is missing an upstream row.`);
      const placeSurplus = source.surplusPerMin > SURPLUS_EPSILON && !seenSurplus.has(source.id);
      if (placeSurplus) seenSurplus.add(source.id);
      layJoinedLink(draft, source, row, lane, slot, sourceStage, drawn, placeSurplus);
      slot += 1;
    }
  }

  layProductExit(draft, goal, plan.stages[plan.stages.length - 1]?.outputPerMin ?? 0);
}

function layGroundFeed(draft: Draft, row: RowSpec, lane: number, apron: number, item: string, rate: number): void {
  const yFloor = beltCenterY(row.floor);
  const yLane = laneBeltY(row.floor, lane);
  const zLane = row.laneZ[lane] ?? INPUT_Z;
  const firstFace = TILE / 2 - SPLIT / 2;
  const flow = { itemId: item, role: "ore-input" as const, rowId: row.id, designPerMin: rate };
  if (Math.abs(yLane - yFloor) < 1e-6) {
    addBelt(
      draft,
      `${row.id}-feed-${lane}`,
      { x: -apron * TILE, y: yFloor, z: zLane },
      { x: firstFace, y: yFloor, z: zLane },
      flow,
    );
    draft.labels.push({
      id: `${row.id}-feed-label-${lane}`,
      text: `${itemName(item)} in`,
      position: { x: -apron * TILE + 2, y: walkY(row.floor) + 2.2, z: zLane },
    });
    return;
  }

  // Rise beside the outer lane, far enough that a 2×2 lift does not touch that splitter.
  const outer = row.laneZ[0] ?? INPUT_Z;
  const zLift = outer - (SPLIT / 2 + 2 + LIFT.length / 2);
  const xLift = -6;
  addBelt(
    draft,
    `${row.id}-feed-${lane}`,
    { x: -apron * TILE, y: yFloor, z: zLift },
    { x: xLift - LIFT.width / 2, y: yFloor, z: zLift },
    flow,
  );
  draft.solids.push({
    id: `lift-feed-${row.id}-l${lane}`,
    kind: "lift",
    floorId: row.floor.id,
    base: { x: xLift, y: walkY(row.floor), z: zLift },
    size: { x: LIFT.width, y: yLane - yFloor + BELT.height, z: LIFT.length },
  });
  addFoundation(draft, row.floor, tileIndex(xLift), tileIndex(zLift));
  addBelt(
    draft,
    `${row.id}-feed-${lane}-up-z`,
    { x: xLift, y: yLane, z: zLift + Math.sign(zLane - zLift) * (LIFT.length / 2) },
    { x: xLift, y: yLane, z: zLane },
    flow,
  );
  addBelt(
    draft,
    `${row.id}-feed-${lane}-run`,
    { x: xLift, y: yLane, z: zLane },
    { x: firstFace, y: yLane, z: zLane },
    flow,
  );
  draft.labels.push({
    id: `${row.id}-feed-label-${lane}`,
    text: `${itemName(item)} in`,
    position: { x: -apron * TILE + 2, y: walkY(row.floor) + 2.2 + lane * INPUT_LANE_RISE_M, z: zLift },
  });
}

function layUpperFeed(
  draft: Draft,
  row: RowSpec,
  lane: number,
  slot: number,
  apron: number,
  item: string,
  rate: number,
  ground: Floor,
): void {
  const x = slotX(slot);
  const zLift = -6;
  const y0 = beltCenterY(ground);
  const y1 = laneBeltY(row.floor, lane);
  const zLane = row.laneZ[lane] ?? INPUT_Z;
  const firstFace = TILE / 2 - SPLIT / 2;
  const flow = { itemId: item, role: "ore-input" as const, rowId: row.id, designPerMin: rate };
  addBelt(
    draft,
    `${row.id}-feed-${lane}`,
    { x: -apron * TILE, y: y0, z: zLift },
    { x: x - LIFT.width / 2, y: y0, z: zLift },
    flow,
  );
  draft.solids.push({
    id: `lift-feed-${row.id}-l${lane}`,
    kind: "lift",
    floorId: ground.id,
    base: { x, y: walkY(ground), z: zLift },
    size: { x: LIFT.width, y: y1 - y0 + BELT.height, z: LIFT.length },
  });
  addFoundation(draft, ground, tileIndex(x), tileIndex(zLift));
  addFoundation(draft, row.floor, tileIndex(x), tileIndex(zLift));
  const zFace = zLift + Math.sign(zLane - zLift) * (LIFT.length / 2);
  addBelt(draft, `${row.id}-feed-${lane}-z`, { x, y: y1, z: zFace }, { x, y: y1, z: zLane }, flow);
  addBelt(
    draft,
    `${row.id}-feed-${lane}-run`,
    { x, y: y1, z: zLane },
    { x: firstFace, y: y1, z: zLane },
    flow,
  );
  draft.labels.push({
    id: `${row.id}-feed-label-${lane}`,
    text: `${itemName(item)} in`,
    position: { x: -apron * TILE + 2, y: walkY(ground) + 2.2, z: zLift },
  });
}

function layJoinedLink(
  draft: Draft,
  source: RowSpec,
  dest: RowSpec,
  lane: number,
  slot: number,
  sourceStage: StagePlan,
  drawn: number,
  placeSurplus: boolean,
): void {
  const yLower = beltCenterY(source.floor);
  const yUpper = beltCenterY(dest.floor);
  const x = slotX(slot);
  const mergerZ = source.mergerZ;
  const item = source.outputItem;
  const firstFace = TILE / 2 - SPLIT / 2;
  const storage = BUILDINGS.storageIndustrial;
  const carried = {
    itemId: item,
    role: "stage-link" as const,
    rowId: source.id,
    designPerMin: sourceStage.outputPerMin,
  };

  addFoundation(draft, source.floor, tileIndex(x), tileIndex(LIFT_Z));
  if (placeSurplus) {
    layFeedSurplus(draft, source, mergerZ, walkY(source.floor), yLower, firstFace, x, -10);
  } else {
    addBelt(
      draft,
      `${source.id}-to-${dest.id}-x`,
      { x: firstFace, y: yLower, z: mergerZ },
      { x, y: yLower, z: mergerZ },
      carried,
    );
  }
  addBelt(
    draft,
    `${source.id}-to-${dest.id}-z`,
    { x, y: yLower, z: mergerZ },
    { x, y: yLower, z: LIFT_Z - LIFT.length / 2 },
    carried,
  );
  const liftHeight = walkY(dest.floor) + BELT.height - walkY(source.floor);
  draft.solids.push({
    id: `lift-${source.id}-to-${dest.id}`,
    kind: "lift",
    floorId: source.floor.id,
    base: { x, y: walkY(source.floor), z: LIFT_Z },
    size: { x: LIFT.width, y: liftHeight, z: LIFT.length },
  });

  const elevated = lane > 0;
  const bufferX = x + LIFT.width / 2 + 1 + storage.length / 2;
  draft.solids.push({
    id: `buffer-${dest.id}-l${lane}`,
    kind: placeSurplus ? "bank" : "buffer",
    floorId: dest.floor.id,
    rowId: source.id,
    base: { x: bufferX, y: walkY(dest.floor), z: INPUT_Z },
    size: { x: storage.length, y: storage.height, z: storage.width },
  });
  addFoundation(draft, dest.floor, tileIndex(bufferX), tileIndex(INPUT_Z));

  addBelt(
    draft,
    `${dest.id}-l${lane}-from-lift`,
    { x, y: yUpper, z: LIFT_Z - LIFT.length / 2 },
    { x, y: yUpper, z: INPUT_Z },
    carried,
  );
  const faceIn = bufferX - storage.length / 2;
  const faceOut = bufferX + storage.length / 2;
  const stand = 1;
  const portY = walkY(dest.floor) + INDUSTRIAL_PORT_Y;
  const intoBank = { ...carried, rowId: dest.id };
  addBelt(draft, `${dest.id}-l${lane}-to-buffer`, { x, y: yUpper, z: INPUT_Z }, { x: faceIn - stand, y: yUpper, z: INPUT_Z }, intoBank);
  addBelt(
    draft,
    `${dest.id}-l${lane}-to-buffer-up`,
    { x: faceIn - stand, y: yUpper, z: INPUT_Z },
    { x: faceIn - stand, y: portY, z: INPUT_Z },
    intoBank,
  );
  addBelt(
    draft,
    `${dest.id}-l${lane}-to-buffer-port`,
    { x: faceIn - stand, y: portY, z: INPUT_Z },
    { x: faceIn + INDUSTRIAL_PORT_ENTRY, y: portY, z: INPUT_Z },
    intoBank,
  );
  const outOfBank = {
    itemId: item,
    role: "input-manifold" as const,
    rowId: dest.id,
    designPerMin: drawn,
  };
  addBelt(
    draft,
    `${dest.id}-l${lane}-from-buffer-port`,
    { x: faceOut - INDUSTRIAL_PORT_ENTRY, y: portY, z: INPUT_Z },
    { x: faceOut + stand, y: portY, z: INPUT_Z },
    outOfBank,
  );
  addBelt(
    draft,
    `${dest.id}-l${lane}-from-buffer-down`,
    { x: faceOut + stand, y: portY, z: INPUT_Z },
    { x: faceOut + stand, y: yUpper, z: INPUT_Z },
    outOfBank,
  );
  const exitX = faceOut + stand;
  routeToLane(draft, dest, lane, exitX, item, drawn, elevated);
  draft.labels.push({
    id: `label-buffer-${dest.id}-l${lane}`,
    text: placeSurplus ? "Bank" : `${itemName(item)} buffer`,
    position: { x: bufferX, y: walkY(dest.floor) + storage.height + 0.6, z: INPUT_Z },
  });
}

function routeToLane(
  draft: Draft,
  row: RowSpec,
  lane: number,
  fromX: number,
  item: string,
  rate: number,
  elevated: boolean,
): void {
  const yFloor = beltCenterY(row.floor);
  const yLane = laneBeltY(row.floor, lane);
  const zLane = row.laneZ[lane] ?? INPUT_Z;
  const firstFace = TILE / 2 - SPLIT / 2;
  const flow = { itemId: item, role: "input-manifold" as const, rowId: row.id, designPerMin: rate };
  let x = fromX;
  let y = yFloor;
  let z = INPUT_Z;
  if (elevated) {
    const liftAt = fromX + 2;
    addBelt(draft, `${row.id}-l${lane}-to-rise`, { x, y, z }, { x: liftAt - LIFT.width / 2, y, z }, flow);
    const rise = yLane - yFloor;
    draft.solids.push({
      id: `lift-lane-${row.id}-l${lane}`,
      kind: "lift",
      floorId: row.floor.id,
      base: { x: liftAt, y: walkY(row.floor), z },
      size: { x: LIFT.width, y: rise + BELT.height, z: LIFT.length },
    });
    addFoundation(draft, row.floor, tileIndex(liftAt), tileIndex(z));
    x = liftAt + LIFT.width / 2;
    y = yLane;
    // Buffers on z = 0 are 8 m tall. Cross them at z = 6, then come back to the lane.
    const clearZ = 6;
    const pastX = -4;
    addBelt(draft, `${row.id}-l${lane}-clear-z`, { x, y, z }, { x, y, z: clearZ }, flow);
    addBelt(draft, `${row.id}-l${lane}-clear-x`, { x, y, z: clearZ }, { x: pastX, y, z: clearZ }, flow);
    x = pastX;
    z = clearZ;
  }
  if (Math.abs(z - zLane) > 1e-6) {
    addBelt(draft, `${row.id}-l${lane}-jog`, { x, y, z }, { x, y, z: zLane }, flow);
    z = zLane;
  }
  addBelt(draft, `${row.id}-l${lane}-to-row`, { x, y, z }, { x: firstFace, y, z }, flow);
}

function layProductExit(draft: Draft, row: RowSpec, made: number): void {
  const y = beltCenterY(row.floor);
  const firstFace = TILE / 2 - SPLIT / 2;
  const flow = { itemId: row.outputItem, role: "product-output" as const, rowId: row.id, designPerMin: made };
  addBelt(draft, "product-apron", { x: firstFace, y, z: row.mergerZ }, { x: EXIT_X, y, z: row.mergerZ }, flow);
  addBelt(draft, "product-exit", { x: EXIT_X, y, z: row.mergerZ }, { x: EXIT_X, y, z: EXIT_Z }, flow);
  addFoundation(draft, row.floor, tileIndex(EXIT_X), tileIndex(EXIT_Z));
  draft.labels.push({
    id: "label-product",
    text: `${itemName(row.outputItem)} out`,
    position: { x: EXIT_X, y: walkY(row.floor) + 2.4, z: EXIT_Z },
  });
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

  if (lower.surplusPerMin > SURPLUS_EPSILON) {
    layFeedSurplus(draft, lower, mergerZ, walkY(lower.floor), yLower, firstFace, x, feedSplitX(gap, gaps));
  } else {
    addBelt(
      draft,
      `${lower.id}-to-lift-x`,
      { x: firstFace, y: yLower, z: mergerZ },
      { x, y: yLower, z: mergerZ },
      { itemId: item, role: "stage-link", rowId: lower.id, designPerMin: lowerStage.outputPerMin },
    );
  }
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

  const surplus = lower.surplusPerMin > SURPLUS_EPSILON;
  draft.solids.push({
    id: `buffer-${upper.id}`,
    kind: surplus ? "bank" : "buffer",
    floorId: upper.floor.id,
    rowId: lower.id,
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
  const faceIn = BUFFER_X - storage.length / 2;
  const faceOut = BUFFER_X + storage.length / 2;
  const stand = 1;
  const portY = walkY(upper.floor) + INDUSTRIAL_PORT_Y;
  const intoBank = {
    itemId: item,
    role: "stage-link" as const,
    rowId: upper.id,
    designPerMin: lowerStage.outputPerMin,
  };
  addBelt(
    draft,
    `${upper.id}-to-buffer`,
    { x, y: yUpper, z: INPUT_Z },
    { x: faceIn - stand, y: yUpper, z: INPUT_Z },
    intoBank,
  );
  addBelt(
    draft,
    `${upper.id}-to-buffer-up`,
    { x: faceIn - stand, y: yUpper, z: INPUT_Z },
    { x: faceIn - stand, y: portY, z: INPUT_Z },
    intoBank,
  );
  addBelt(
    draft,
    `${upper.id}-to-buffer-port`,
    { x: faceIn - stand, y: portY, z: INPUT_Z },
    { x: faceIn + INDUSTRIAL_PORT_ENTRY, y: portY, z: INPUT_Z },
    intoBank,
  );
  const outOfBank = {
    itemId: item,
    role: "input-manifold" as const,
    rowId: upper.id,
    designPerMin: upperStage.inputPerMin,
  };
  addBelt(
    draft,
    `${upper.id}-from-buffer-port`,
    { x: faceOut - INDUSTRIAL_PORT_ENTRY, y: portY, z: INPUT_Z },
    { x: faceOut + stand, y: portY, z: INPUT_Z },
    outOfBank,
  );
  addBelt(
    draft,
    `${upper.id}-from-buffer-down`,
    { x: faceOut + stand, y: portY, z: INPUT_Z },
    { x: faceOut + stand, y: yUpper, z: INPUT_Z },
    outOfBank,
  );
  addBelt(
    draft,
    `${upper.id}-from-buffer`,
    { x: faceOut + stand, y: yUpper, z: INPUT_Z },
    { x: firstFace, y: yUpper, z: INPUT_Z },
    outOfBank,
  );

  draft.labels.push({
    id: `label-buffer-${upper.id}`,
    text: surplus ? "Bank" : `${itemName(item)} buffer`,
    position: {
      x: BUFFER_X + gap * 4,
      y: walkY(upper.floor) + storage.height + 0.6,
      z: INPUT_Z,
    },
  });
}

/**
 * One switchback per story, reused in plan at every floor.
 * Outbound 6 m, a flat landing, return 6 m, arriving on the next walk surface
 * at the feed edge. The slope stays outside that floor's slab so it does not
 * punch through the foundation.
 */
const RAMP_EDGE_X = -8;
const RAMP_OUT_Z = -14;
const RAMP_BACK_Z = -22;
const RAMP_HALF = 3;

function layRamp(draft: Draft, floors: Floor[]): void {
  const lower = floors[0];
  if (!lower) return;
  for (const [index, floor] of floors.entries()) {
    addFoundation(draft, floor, -1, -1);
    addFoundation(draft, floor, -1, -2);
    addFoundation(draft, floor, -1, -3);
    for (const ix of [-3, -2]) {
      addFoundation(draft, floor, ix, -2);
      // The incoming return crosses this tile while it is still inside the slab.
      if (!(index > 0 && ix === -2)) addFoundation(draft, floor, ix, -3);
    }
  }

  for (let index = 0; index < floors.length - 1; index += 1) {
    const fromFloor = floors[index];
    const toFloor = floors[index + 1];
    if (!fromFloor || !toFloor) continue;
    const y0 = walkY(fromFloor);
    const midY = y0 + RAMP_HALF * WALKWAY.rise;
    const farX = RAMP_EDGE_X - RAMP_HALF * WALKWAY.length;
    for (let step = 0; step < RAMP_HALF; step += 1) {
      const from: Vec3 = { x: RAMP_EDGE_X - WALKWAY.length * step, y: y0 + WALKWAY.rise * step, z: RAMP_OUT_Z };
      const to: Vec3 = { x: from.x - WALKWAY.length, y: from.y + WALKWAY.rise, z: RAMP_OUT_Z };
      draft.ramps.push({ id: `ramp-${index}-out-${step}`, from, to, width: WALKWAY.width, kind: "rise" });
    }
    draft.ramps.push({
      id: `ramp-${index}-land-0`,
      from: { x: farX, y: midY, z: RAMP_OUT_Z },
      to: { x: farX, y: midY, z: (RAMP_OUT_Z + RAMP_BACK_Z) / 2 },
      width: WALKWAY.width,
      kind: "landing",
    });
    draft.ramps.push({
      id: `ramp-${index}-land-1`,
      from: { x: farX, y: midY, z: (RAMP_OUT_Z + RAMP_BACK_Z) / 2 },
      to: { x: farX, y: midY, z: RAMP_BACK_Z },
      width: WALKWAY.width,
      kind: "landing",
    });
    for (let step = 0; step < RAMP_HALF; step += 1) {
      const from: Vec3 = { x: farX + WALKWAY.length * step, y: midY + WALKWAY.rise * step, z: RAMP_BACK_Z };
      const to: Vec3 = { x: from.x + WALKWAY.length, y: from.y + WALKWAY.rise, z: RAMP_BACK_Z };
      draft.ramps.push({ id: `ramp-${index}-back-${step}`, from, to, width: WALKWAY.width, kind: "rise" });
    }
    const arrived = walkY(toFloor);
    const last = draft.ramps[draft.ramps.length - 1];
    if (!last || Math.abs(last.to.y - arrived) > 1e-6 || Math.abs(last.to.x - RAMP_EDGE_X) > 1e-6) {
      throw new Error("Ramp does not land on the next floor.");
    }
  }

  draft.labels.push({
    id: "label-feed",
    text: "Feed end",
    position: { x: -2, y: walkY(lower) + 3.2, z: RAMP_OUT_Z },
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
