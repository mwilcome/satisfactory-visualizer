import {
  BELT,
  BUILDINGS,
  FOUNDATION_HEIGHT_M,
  FOUNDATION_SIZE_M,
  INPUT_LANE_RISE_M,
  ITEMS,
  LIFT,
  RECIPES,
  STORY_WALLS,
  WALKWAY,
  inputLaneOutboardM,
  beltByMk,
  isBuildingId,
  storyClearanceM,
  type BeltMk,
  type BuildingId,
  type ItemId,
  type StoryKind,
} from "../data/catalog";
import { INDUSTRIAL_PORT_ENTRY, INDUSTRIAL_PORT_Y } from "../data/parts";
import { isLinearWiring, type ChainId, type InputSource } from "../data/chains";
import { SURPLUS_EPSILON, solveChain, type ChainPlan, type StagePlan } from "../solve/chain";
import { beltAabb, overlaps } from "./aabb";
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
 * Coordinates are meters. Machines pack on a 1 m stride. Every machine on one
 * side of a row shares one Z. Foundations stay 8×8.
 * A further input is 1 m farther from the machine and 2 m higher than the lane
 * inside it. No conveyor lift sits between those splitters.
 * A stage uses two facing rows only when its busiest item is at least twice
 * the quietest. That item gets two belts. The other lines stay one trunk.
 * Ports stay on the face centerline until a measured connector offset exists.
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

/**
 * One straight machine line.
 * sign +1 keeps input on -z, which is the single-row facing.
 * sign +1 and inputFaceZ 3: one input sits at lane z 0, and the machine
 * center is 3 + length/2. sign -1 mirrors that across z = 0.
 */
interface SideSpec {
  sign: 1 | -1;
  count: number;
  indexBase: number;
  inputFaceZ: number;
  machineZ: number;
  mergerZ: number;
  outputFaceZ: number;
  laneZ: number[];
}

interface RowSpec {
  id: string;
  stageIndex: number;
  floor: Floor;
  count: number;
  strideM: number;
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
  doubled: boolean;
  fatIsOutput: boolean;
  fatInputSlot: number | null;
  sides: SideSpec[];
}

export function buildChainPlant(plan: ChainPlan): Plant {
  if (plan.blockedReason || plan.stages.length < 1 || plan.stages.some((stage) => stage.machines < 1)) {
    throw new Error(plan.blockedReason ?? "Chain cannot be laid out.");
  }

  const wired = plan.stages.map((stage) => ({
    id: stage.stageId,
    recipeId: stage.recipeId,
    from: stage.inputFrom,
  }));
  let floorZ = 0;
  const rows = plan.stages.map((stage, index) => {
    const recipe = RECIPES[stage.recipeId];
    if (!recipe || !isBuildingId(recipe.buildingId)) {
      throw new Error(`${stage.recipeId} is not laid out.`);
    }
    const building = BUILDINGS[recipe.buildingId];
    const storyKind: StoryKind = recipe.buildingId === "manufacturer" ? "manufacturer" : "production";
    const clearance = storyClearanceM(storyKind);
    const floor: Floor = {
      id: stage.stageId,
      z: floorZ,
      foundationHeightM: FOUNDATION_HEIGHT_M,
      heightClearanceM: clearance,
      storyKind,
      wallCount: STORY_WALLS[storyKind],
    };
    floorZ += clearance;
    const sides = posesFor(stage.doubled, stage.fatIsOutput, stage.machines, building.length, recipe.inputs.length);
    const primary = sides[0];
    if (!primary) throw new Error(`${stage.stageId} has no machine line.`);
    return {
      id: stage.stageId,
      stageIndex: index,
      floor,
      count: stage.machines,
      strideM: strideMeters(building.width),
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
      laneZ: primary.laneZ,
      machineZ: primary.machineZ,
      mergerZ: primary.mergerZ,
      inputFaceZ: primary.inputFaceZ,
      outputFaceZ: primary.outputFaceZ,
      doubled: sides.length > 1,
      fatIsOutput: stage.fatIsOutput,
      fatInputSlot: stage.fatInputSlot,
      sides,
    } satisfies RowSpec;
  });

  const skirtZs = rows.flatMap((row) => row.sides.flatMap((side) => [...side.laneZ, side.mergerZ]));
  const skirtHigh = Math.max(...skirtZs) + TILE;
  const skirtLow = rows.some((row) => row.doubled) ? Math.min(...skirtZs) - TILE : -TILE;

  const draft: Draft = {
    mk: plan.beltMk,
    solids: [],
    belts: [],
    ramps: [],
    corridors: [],
    labels: [],
    keys: new Set<string>(),
  };

  const apron = apronTiles(rows.length, isLinearWiring(wired) ? 0 : linkSlotCount(rows)) + (rows.some((row) => row.doubled) ? 2 : 0);
  const rowMeta = rows.map((row) => {
    const openEndX = Math.max(...row.sides.map((side) => side.count)) * row.strideM;
    layRow(draft, row, openEndX, apron);
    return {
      id: row.id,
      floorId: row.floor.id,
      feedEndX: FEED_X,
      openEndX,
      machineCount: row.count,
    };
  });

  if (isLinearWiring(wired)) layLogistics(draft, plan, rows, apron);
  else layJoinedLogistics(draft, plan, rows, apron);
  layRamp(draft, rows.map((row) => row.floor));
  const openEnd = Math.max(...rowMeta.map((row) => row.openEndX));
  laySupports(draft, rows[0]?.floor, rows[rows.length - 1]?.floor, openEnd, apron, skirtLow, skirtHigh);

  for (const row of rows) {
    const air = row.floor.heightClearanceM - FOUNDATION_HEIGHT_M;
    if (BUILDINGS[row.buildingId].height > air) {
      throw new Error(`${row.buildingId} is taller than its story air gap.`);
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

function sidePose(
  sign: 1 | -1,
  inputFaceZ: number,
  length: number,
  inputCount: number,
  count: number,
  indexBase: number,
): SideSpec {
  const laneZ = Array.from({ length: inputCount }, (_, lane) => {
    const outboard = inputLaneOutboardM(lane, inputCount);
    return inputFaceZ - sign * (PORT_PAD + SPLIT / 2 + outboard);
  });
  return {
    sign,
    count,
    indexBase,
    inputFaceZ,
    machineZ: inputFaceZ + sign * (length / 2),
    mergerZ: inputFaceZ + sign * (length + PORT_PAD + SPLIT / 2),
    outputFaceZ: inputFaceZ + sign * length,
    laneZ,
  };
}

/** Two facing lines only when both sides have a machine. Otherwise the single row at z face 3. */
function posesFor(doubled: boolean, fatIsOutput: boolean, machines: number, length: number, inputCount: number): SideSpec[] {
  const alone = sidePose(1, INPUT_FACE_Z, length, inputCount, machines, 0);
  if (!doubled) return [alone];
  const sideA = Math.ceil(machines / 2);
  const sideB = Math.floor(machines / 2);
  if (sideB < 1) return [alone];
  if (fatIsOutput) {
    const gap = 6 + (inputCount - 1);
    return [
      sidePose(1, gap, length, inputCount, sideA, 0),
      sidePose(-1, -gap, length, inputCount, sideB, 100),
    ];
  }
  return [
    sidePose(-1, length + 6, length, inputCount, sideA, 0),
    sidePose(1, -(length + 6), length, inputCount, sideB, 100),
  ];
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

/** Pack machines on a 1 m lattice. The walk gap stays at least 2 m. Foundations stay 8 m. */
function strideMeters(machineWidth: number): number {
  return Math.ceil(machineWidth + MIN_WALK);
}

function feedFaceX(width: number): number {
  return width / 2 - SPLIT / 2;
}

function walkY(floor: Floor): number {
  return floor.z + floor.foundationHeightM;
}

function beltCenterY(floor: Floor): number {
  return walkY(floor) + BELT.height / 2;
}

function machineCenterX(index: number, strideM: number, width: number): number {
  return index * strideM + width / 2;
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
    for (let iz = iz0; iz <= iz1; iz += 1) {
      // The return ramp crosses this tile on the way onto an upper floor.
      if (floor.z > 0 && ix === -2 && iz === -3) continue;
      addFoundation(draft, floor, ix, iz);
    }
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
  if (Math.hypot(dx, dy, dz) < 0.2) return;
  if ([dx, dy, dz].filter((value) => value > 1e-6).length !== 1) {
    throw new Error(`Belt ${id} is not axis-aligned.`);
  }
  draft.belts.push({ id, from, to, mk: draft.mk, ...fields });
}

function rowFaceX(row: RowSpec): number {
  return feedFaceX(BUILDINGS[row.buildingId].width);
}

function laySide(
  draft: Draft,
  row: RowSpec,
  side: SideSpec,
  sideIndex: number,
  yWalk: number,
  yBelt: number,
  building: { width: number; height: number; length: number },
  stubEndX: number,
): void {
  const multi = row.inputCount > 1;
  const tag = sideIndex === 0 ? "" : `-s${sideIndex}`;
  for (let index = 0; index < side.count; index += 1) {
    const rowIndex = side.indexBase + index;
    const x = machineCenterX(index, row.strideM, building.width);
    const portInZ = side.inputFaceZ;
    const portOutZ = side.outputFaceZ;
    draft.solids.push({
      id: `${row.id}-m-${rowIndex}`,
      kind: "machine",
      floorId: row.floor.id,
      rowId: row.id,
      rowIndex,
      buildingId: row.buildingId,
      recipeId: row.recipeId,
      clock: 100,
      base: { x, y: yWalk, z: side.machineZ },
      size: { x: building.width, y: building.height, z: building.length },
    });
    for (let lane = 0; lane < row.inputCount; lane += 1) {
      const input = row.inputs[lane];
      const z = side.laneZ[lane] ?? INPUT_Z;
      const suffix = multi ? `-l${lane}` : "";
      draft.solids.push({
        id: `${row.id}-sp-${rowIndex}${suffix}`,
        kind: "splitter",
        floorId: row.floor.id,
        rowId: row.id,
        rowIndex,
        lane,
        base: { x, y: laneBaseY(row.floor, lane), z },
        size: { x: SPLIT, y: BUILDINGS.splitter.height, z: SPLIT },
      });
      if (lane > 0) {
        for (const post of [-1, 1] as const) {
          draft.solids.push({
            id: `${row.id}-sp-post-${rowIndex}-l${lane}-${post > 0 ? "p" : "n"}`,
            kind: "support",
            floorId: row.floor.id,
            rowId: row.id,
            base: { x: x + post * 1.6, y: yWalk, z: z + side.sign * 1.2 },
            size: { x: 0.3, y: lane * INPUT_LANE_RISE_M, z: 0.3 },
          });
        }
      }
      const laneY = laneBeltY(row.floor, lane);
      addBelt(
        draft,
        `${row.id}-in-port-${rowIndex}${suffix}`,
        { x, y: laneY, z: z + side.sign * (SPLIT / 2) },
        { x, y: laneY, z: portInZ },
        { itemId: input?.itemId ?? row.inputItem, role: "input-port", rowId: row.id, designPerMin: input?.perMin ?? row.inputPerMin },
      );
    }
    draft.solids.push({
      id: `${row.id}-mg-${rowIndex}`,
      kind: "merger",
      floorId: row.floor.id,
      rowId: row.id,
      rowIndex,
      base: { x, y: yWalk, z: side.mergerZ },
      size: { x: SPLIT, y: BUILDINGS.merger.height, z: SPLIT },
    });
    addBelt(
      draft,
      `${row.id}-out-port-${rowIndex}`,
      { x, y: yBelt, z: portOutZ },
      { x, y: yBelt, z: side.mergerZ - side.sign * (SPLIT / 2) },
      {
        itemId: row.outputItem,
        role: "output-port",
        rowId: row.id,
        designPerMin: Math.min(row.outputPerMin, beltByMk(draft.mk).perMin),
      },
    );

    if (index < side.count - 1) {
      const next = machineCenterX(index + 1, row.strideM, building.width);
      const downstream = side.count - index - 1;
      for (let lane = 0; lane < row.inputCount; lane += 1) {
        const input = row.inputs[lane];
        const z = side.laneZ[lane] ?? INPUT_Z;
        const suffix = multi ? `-l${lane}` : "";
        const y = laneBeltY(row.floor, lane);
        addBelt(
          draft,
          `${row.id}-in-run-${rowIndex}${suffix}`,
          { x: x + SPLIT / 2, y, z },
          { x: next - SPLIT / 2, y, z },
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
        `${row.id}-out-run-${rowIndex}`,
        { x: next - SPLIT / 2, y: yBelt, z: side.mergerZ },
        { x: x + SPLIT / 2, y: yBelt, z: side.mergerZ },
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
        id: `${row.id}-walk-${rowIndex}`,
        min: { x: gapStart, y: yWalk + 0.05, z: Math.min(portInZ, portOutZ) },
        max: { x: gapEnd, y: yWalk + 2.2, z: Math.max(portInZ, portOutZ) },
      });
    }
  }

  const lastX = machineCenterX(side.count - 1, row.strideM, building.width);
  for (let lane = 0; lane < row.inputCount; lane += 1) {
    const input = row.inputs[lane];
    const z = side.laneZ[lane] ?? INPUT_Z;
    const suffix = multi ? `-l${lane}` : "";
    addBelt(
      draft,
      `${row.id}-stub${tag}${suffix}`,
      { x: lastX + SPLIT / 2, y: laneBeltY(row.floor, lane), z },
      { x: stubEndX, y: laneBeltY(row.floor, lane), z },
      { itemId: input?.itemId ?? row.inputItem, role: "grow-stub", rowId: row.id, designPerMin: 0 },
    );
  }
}

function layRow(draft: Draft, row: RowSpec, openEndX: number, apron: number): void {
  const building = BUILDINGS[row.buildingId];
  const yWalk = walkY(row.floor);
  const yBelt = beltCenterY(row.floor);
  const stubIx = Math.ceil(openEndX / TILE);
  const laneZs = row.sides.flatMap((side) => side.laneZ);
  const mergerZs = row.sides.map((side) => side.mergerZ);
  const zMin = Math.min(...laneZs, ...mergerZs) - SPLIT;
  const zMax = Math.max(...laneZs, ...mergerZs, ...row.sides.map((side) => side.outputFaceZ)) + SPLIT;
  const farZ = Math.max(...mergerZs) + TILE;
  let iz0 = Math.min(tileIndex(zMin), -1);
  let iz1 = Math.max(tileIndex(zMax - 1e-6), tileIndex(farZ), 2);
  if (row.doubled) iz0 = Math.min(iz0, tileIndex(Math.min(...mergerZs) - TILE));
  fillPad(draft, row.floor, -apron, stubIx, iz0, iz1);

  const stubEndX = (stubIx + 1) * TILE;
  for (const [sideIndex, side] of row.sides.entries()) {
    laySide(draft, row, side, sideIndex, yWalk, yBelt, building, stubEndX);
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
      position: { x: machineCenterX(0, row.strideM, building.width), y: yWalk + 3.6, z: outerZ - 5 },
    });
  }
}

/**
 * Surplus block at the feed end of this stage's merged output.
 * Any continues toward the industrial storage. Overflow goes +z straight into the sink.
 * Floors are spaced in x so a 24 m sink does not sit on the next floor's belt.
 */
/** What keeps going after Overflow is peeled. Never more than one belt. */
function forwardRate(draft: Draft, row: RowSpec): number {
  const belt = beltByMk(draft.mk).perMin;
  const made = row.count * row.outputPerMin;
  const kept = Math.max(0, made - row.surplusPerMin);
  return Math.min(belt, kept);
}

function addOverflowRun(
  draft: Draft,
  row: RowSpec,
  id: string,
  x: number,
  y: number,
  z: number,
): void {
  const belt = beltByMk(draft.mk).perMin;
  let left = row.surplusPerMin;
  let index = 0;
  while (left > 1e-6) {
    const rate = Math.min(left, belt);
    addBelt(
      draft,
      index === 0 ? id : `${id}-${index}`,
      { x, y: y + index * 2, z },
      { x, y: y + index * 2, z: 40 },
      { itemId: row.outputItem, role: "overflow-stub", rowId: row.id, designPerMin: rate },
    );
    left -= rate;
    index += 1;
  }
}

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
  const onward = forwardRate(draft, row);
  const main = {
    itemId: row.outputItem,
    role: "stage-link" as const,
    rowId: row.id,
    designPerMin: onward,
  };
  const fromLeft = firstFace < splitX;
  const inFace = splitX + (fromLeft ? -SPLIT / 2 : SPLIT / 2);
  const outFace = splitX + (fromLeft ? SPLIT / 2 : -SPLIT / 2);

  addBelt(draft, `${row.id}-to-split`, { x: firstFace, y: yBelt, z: mergerZ }, { x: inFace, y: yBelt, z: mergerZ }, main);
  draft.solids.push({
    id: `${row.id}-smart`,
    kind: "smartSplitter",
    floorId: row.floor.id,
    rowId: row.id,
    base: { x: splitX, y: yWalk, z: mergerZ },
    size: { x: SPLIT, y: BUILDINGS.smartSplitter.height, z: SPLIT },
  });
  addBelt(draft, `${row.id}-any-to-lift`, { x: outFace, y: yBelt, z: mergerZ }, { x: liftXPos, y: yBelt, z: mergerZ }, main);
  addOverflowRun(draft, row, `${row.id}-overflow-to-sink`, splitX, yBelt, mergerZ + SPLIT / 2);
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
      position: { x: splitX, y: yWalk + 2.4, z: 40 },
    },
  );
}

/** Feed-apron x for this stage's output. Higher floors sit closer to the machines. */
function feedSplitX(gap: number, gaps: number): number {
  return -10 - (gaps - 1 - gap) * (BUILDINGS.awesomeSink.width + 2);
}

function layJoinedLogistics(draft: Draft, plan: ChainPlan, rows: RowSpec[], apron: number): void {
  if (rows.some((row) => row.doubled)) {
    layJoinedMulti(draft, plan, rows, apron);
    return;
  }
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
  const firstFace = rowFaceX(row);
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
  const firstFace = rowFaceX(row);
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
  const firstFace = rowFaceX(source);
  const storage = BUILDINGS.storageIndustrial;
  const carried = {
    itemId: item,
    role: "stage-link" as const,
    rowId: source.id,
    designPerMin: placeSurplus ? forwardRate(draft, source) : sourceStage.outputPerMin,
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
  const firstFace = rowFaceX(row);
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
  const firstFace = rowFaceX(row);
  const kept = Math.min(beltByMk(draft.mk).perMin, Math.max(0, made - row.surplusPerMin));
  const flow = { itemId: row.outputItem, role: "product-output" as const, rowId: row.id, designPerMin: kept };
  if (row.surplusPerMin > SURPLUS_EPSILON) {
    const splitX = -6;
    const yWalk = walkY(row.floor);
    addBelt(draft, "product-apron", { x: firstFace, y, z: row.mergerZ }, { x: splitX + SPLIT / 2, y, z: row.mergerZ }, flow);
    draft.solids.push({
      id: `${row.id}-smart`,
      kind: "smartSplitter",
      floorId: row.floor.id,
      rowId: row.id,
      base: { x: splitX, y: yWalk, z: row.mergerZ },
      size: { x: SPLIT, y: BUILDINGS.smartSplitter.height, z: SPLIT },
    });
    addBelt(draft, "product-any", { x: splitX - SPLIT / 2, y, z: row.mergerZ }, { x: EXIT_X, y, z: row.mergerZ }, flow);
    addBelt(draft, "product-exit", { x: EXIT_X, y, z: row.mergerZ }, { x: EXIT_X, y, z: EXIT_Z }, flow);
    addOverflowRun(draft, row, `${row.id}-overflow-to-sink`, splitX, y, row.mergerZ + SPLIT / 2);
    draft.labels.push(
      { id: `${row.id}-smart-label`, text: "Smart splitter", position: { x: splitX, y: yWalk + 2.6, z: row.mergerZ - 3 } },
      { id: `${row.id}-overflow-label`, text: "Overflow out (to sink)", position: { x: splitX, y: yWalk + 2.4, z: 40 } },
    );
  } else {
    addBelt(draft, "product-apron", { x: firstFace, y, z: row.mergerZ }, { x: EXIT_X, y, z: row.mergerZ }, flow);
    addBelt(draft, "product-exit", { x: EXIT_X, y, z: row.mergerZ }, { x: EXIT_X, y, z: EXIT_Z }, flow);
  }
  addFoundation(draft, row.floor, tileIndex(EXIT_X), tileIndex(EXIT_Z));
  draft.labels.push({
    id: "label-product",
    text: `${itemName(row.outputItem)} out`,
    position: { x: EXIT_X, y: walkY(row.floor) + 2.4, z: EXIT_Z },
  });
}

function layLogistics(draft: Draft, plan: ChainPlan, rows: RowSpec[], apron: number): void {
  if (rows.some((row) => row.doubled)) {
    layLinearMulti(draft, plan, rows, apron);
    return;
  }
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return;
  const storage = BUILDINGS.storageIndustrial;
  const y0 = beltCenterY(first.floor);
  const oreZ = first.laneZ[0] ?? INPUT_Z;

  addBelt(
    draft,
    "ore-in",
    { x: -apron * TILE, y: y0, z: oreZ },
    { x: rowFaceX(first), y: y0, z: oreZ },
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
    position: { x: -apron * TILE + 2, y: walkY(first.floor) + 2.2, z: oreZ },
  });

  for (let index = 0; index < rows.length - 1; index += 1) {
    const lower = rows[index];
    const upper = rows[index + 1];
    const lowerStage = plan.stages[index];
    const upperStage = plan.stages[index + 1];
    if (!lower || !upper || !lowerStage || !upperStage) continue;
    layStageLink(draft, lower, upper, lowerStage, upperStage, index, rows.length - 1, storage);
  }

  const made = plan.stages[plan.stages.length - 1]?.outputPerMin ?? 0;
  layProductExit(draft, last, made);
}

function layStageLink(
  draft: Draft,
  lower: RowSpec,
  upper: RowSpec,
  lowerStage: StagePlan,
  upperStage: StagePlan,
  gap: number,
  gaps: number,
  storage: { length: number; height: number; width: number },
): void {
  const yLower = beltCenterY(lower.floor);
  const yUpper = beltCenterY(upper.floor);
  const x = liftX(gap, gaps);
  const item = lower.outputItem;
  const firstFace = rowFaceX(lower);
  const upperFace = rowFaceX(upper);
  const mergerZ = lower.mergerZ;
  const upperZ = upper.laneZ[0] ?? INPUT_Z;

  addFoundation(draft, lower.floor, tileIndex(x), tileIndex(LIFT_Z));

  const linkRate =
    lower.surplusPerMin > SURPLUS_EPSILON ? forwardRate(draft, lower) : lowerStage.outputPerMin;
  if (lower.surplusPerMin > SURPLUS_EPSILON) {
    layFeedSurplus(draft, lower, mergerZ, walkY(lower.floor), yLower, firstFace, x, feedSplitX(gap, gaps));
  } else {
    addBelt(
      draft,
      `${lower.id}-to-lift-x`,
      { x: firstFace, y: yLower, z: mergerZ },
      { x, y: yLower, z: mergerZ },
      { itemId: item, role: "stage-link", rowId: lower.id, designPerMin: linkRate },
    );
  }
  addBelt(
    draft,
    `${lower.id}-to-lift-z`,
    { x, y: yLower, z: mergerZ },
    { x, y: yLower, z: LIFT_Z - LIFT.length / 2 },
    { itemId: item, role: "stage-link", rowId: lower.id, designPerMin: linkRate },
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
    { itemId: item, role: "stage-link", rowId: upper.id, designPerMin: linkRate },
  );
  const faceIn = BUFFER_X - storage.length / 2;
  const faceOut = BUFFER_X + storage.length / 2;
  const stand = 1;
  const portY = walkY(upper.floor) + INDUSTRIAL_PORT_Y;
  const intoBank = {
    itemId: item,
    role: "stage-link" as const,
    rowId: upper.id,
    designPerMin: linkRate,
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
  const exitX = faceOut + stand;
  if (Math.abs(upperZ - INPUT_Z) > 1e-6) {
    addBelt(
      draft,
      `${upper.id}-from-buffer-z`,
      { x: exitX, y: yUpper, z: INPUT_Z },
      { x: exitX, y: yUpper, z: upperZ },
      outOfBank,
    );
  }
  addBelt(
    draft,
    `${upper.id}-from-buffer`,
    { x: exitX, y: yUpper, z: upperZ },
    { x: upperFace, y: yUpper, z: upperZ },
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
const TRUNK_X = -16;
const JOIN_X = -18;

/** A belt on this z misses a buffer sitting on z = 0. */
function apronZ(z: number): number {
  if (Math.abs(z) >= 8) return z;
  return (z >= 0 ? 1 : -1) * 10;
}

function capped(rate: number, belt: number, where: string): number {
  if (rate > belt + 1e-6) throw new Error(`${where} carries ${rate} on a ${belt} belt.`);
  return rate;
}

function runToLane(
  draft: Draft,
  id: string,
  row: RowSpec,
  side: SideSpec,
  lane: number,
  fromX: number,
  fromZ: number,
  item: string,
  rate: number,
  role: Belt["role"],
): void {
  const yFloor = beltCenterY(row.floor);
  const yLane = laneBeltY(row.floor, lane);
  const zLane = side.laneZ[lane] ?? INPUT_Z;
  const face = rowFaceX(row);
  const flow = { itemId: item, role, rowId: row.id, designPerMin: rate };
  if (Math.abs(yLane - yFloor) < 1e-6) {
    let x = fromX;
    let z = fromZ;
    if (Math.abs(z - zLane) > 1e-6) {
      addBelt(draft, `${id}-z`, { x, y: yFloor, z }, { x, y: yFloor, z: zLane }, flow);
      z = zLane;
    }
    addBelt(draft, `${id}-x`, { x, y: yFloor, z }, { x: face, y: yFloor, z }, flow);
    return;
  }
  const outer = side.laneZ[0] ?? zLane;
  const zLift = outer - side.sign * (SPLIT / 2 + 2 + LIFT.length / 2);
  const xLift = -6;
  // Banks sit on z = 0. Step off that line before running in x, or the belt cuts through them.
  let x = fromX;
  let z = fromZ;
  if (Math.abs(z) < 8 && Math.abs(x - xLift) > 1e-6) {
    const clear = zLane >= 0 ? 10 : -10;
    if (Math.abs(clear - z) > 1e-6) {
      addBelt(draft, `${id}-off-bank`, { x, y: yFloor, z }, { x, y: yFloor, z: clear }, flow);
      z = clear;
    }
  }
  if (Math.abs(x - xLift) > 1e-6) {
    addBelt(draft, `${id}-to-lift-x`, { x, y: yFloor, z }, { x: xLift, y: yFloor, z }, flow);
    x = xLift;
  }
  if (Math.abs(z - zLift) > 1e-6) {
    addBelt(draft, `${id}-to-lift-z`, { x, y: yFloor, z }, { x, y: yFloor, z: zLift }, flow);
  }
  draft.solids.push({
    id: `lift-${id}`,
    kind: "lift",
    floorId: row.floor.id,
    base: { x: xLift, y: walkY(row.floor), z: zLift },
    size: { x: LIFT.width, y: yLane - yFloor + BELT.height, z: LIFT.length },
  });
  addFoundation(draft, row.floor, tileIndex(xLift), tileIndex(zLift));
  const zFace = zLift + Math.sign(zLane - zLift) * (LIFT.length / 2);
  addBelt(draft, `${id}-up`, { x: xLift, y: yLane, z: zFace }, { x: xLift, y: yLane, z: zLane }, flow);
  addBelt(draft, `${id}-run`, { x: xLift, y: yLane, z: zLane }, { x: face, y: yLane, z: zLane }, flow);
}

function liftColumn(
  draft: Draft,
  source: RowSpec,
  dest: RowSpec,
  fromX: number,
  fromZ: number,
  liftXPos: number,
  item: string,
  carried: number,
  tag: string,
  bank: boolean,
): { exitX: number; exitZ: number } {
  const yLower = beltCenterY(source.floor);
  const yUpper = beltCenterY(dest.floor);
  const storage = BUILDINGS.storageIndustrial;
  const flow = { itemId: item, role: "stage-link" as const, rowId: source.id, designPerMin: carried };
  addFoundation(draft, source.floor, tileIndex(liftXPos), tileIndex(LIFT_Z));
  if (Math.abs(fromX - liftXPos) > 1e-6) {
    addBelt(draft, `${tag}-to-lift-x`, { x: fromX, y: yLower, z: fromZ }, { x: liftXPos, y: yLower, z: fromZ }, flow);
  }
  addBelt(
    draft,
    `${tag}-to-lift-z`,
    { x: liftXPos, y: yLower, z: fromZ },
    { x: liftXPos, y: yLower, z: LIFT_Z - LIFT.length / 2 },
    flow,
  );
  const liftHeight = walkY(dest.floor) + BELT.height - walkY(source.floor);
  draft.solids.push({
    id: `lift-${tag}`,
    kind: "lift",
    floorId: source.floor.id,
    base: { x: liftXPos, y: walkY(source.floor), z: LIFT_Z },
    size: { x: LIFT.width, y: liftHeight, z: LIFT.length },
  });
  const bufferX = liftXPos + LIFT.width / 2 + 1 + storage.length / 2;
  draft.solids.push({
    id: `buffer-${tag}`,
    kind: bank ? "bank" : "buffer",
    floorId: dest.floor.id,
    rowId: source.id,
    base: { x: bufferX, y: walkY(dest.floor), z: INPUT_Z },
    size: { x: storage.length, y: storage.height, z: storage.width },
  });
  addFoundation(draft, dest.floor, tileIndex(bufferX), tileIndex(INPUT_Z));
  addBelt(draft, `${tag}-from-lift`, { x: liftXPos, y: yUpper, z: LIFT_Z - LIFT.length / 2 }, { x: liftXPos, y: yUpper, z: INPUT_Z }, flow);
  const faceIn = bufferX - storage.length / 2;
  const faceOut = bufferX + storage.length / 2;
  const stand = 1;
  const portY = walkY(dest.floor) + INDUSTRIAL_PORT_Y;
  const into = { ...flow, rowId: dest.id };
  addBelt(draft, `${tag}-to-buffer`, { x: liftXPos, y: yUpper, z: INPUT_Z }, { x: faceIn - stand, y: yUpper, z: INPUT_Z }, into);
  addBelt(draft, `${tag}-to-buffer-up`, { x: faceIn - stand, y: yUpper, z: INPUT_Z }, { x: faceIn - stand, y: portY, z: INPUT_Z }, into);
  addBelt(
    draft,
    `${tag}-to-buffer-port`,
    { x: faceIn - stand, y: portY, z: INPUT_Z },
    { x: faceIn + INDUSTRIAL_PORT_ENTRY, y: portY, z: INPUT_Z },
    into,
  );
  const exitX = faceOut + stand;
  addBelt(draft, `${tag}-from-buffer-port`, { x: faceOut - INDUSTRIAL_PORT_ENTRY, y: portY, z: INPUT_Z }, { x: exitX, y: portY, z: INPUT_Z }, into);
  addBelt(draft, `${tag}-from-buffer-down`, { x: exitX, y: portY, z: INPUT_Z }, { x: exitX, y: yUpper, z: INPUT_Z }, into);
  draft.labels.push({
    id: `label-buffer-${tag}`,
    text: bank ? "Bank" : `${itemName(item)} buffer`,
    position: { x: bufferX, y: walkY(dest.floor) + storage.height + 0.6, z: INPUT_Z },
  });
  return { exitX, exitZ: INPUT_Z };
}

function layProductMulti(draft: Draft, row: RowSpec, made: number): void {
  const y = beltCenterY(row.floor);
  const face = rowFaceX(row);
  if (row.fatIsOutput) {
    for (const [sideIndex, side] of row.sides.entries()) {
      const rate = side.count * row.outputPerMin;
      const exitX = EXIT_X - sideIndex * 4;
      const outward = side.mergerZ >= 0 ? 1 : -1;
      const exitZ = side.mergerZ + outward * 16;
      const flow = { itemId: row.outputItem, role: "product-output" as const, rowId: row.id, designPerMin: rate };
      addBelt(draft, `product-apron-s${sideIndex}`, { x: face, y, z: side.mergerZ }, { x: exitX, y, z: side.mergerZ }, flow);
      addBelt(draft, `product-exit-s${sideIndex}`, { x: exitX, y, z: side.mergerZ }, { x: exitX, y, z: exitZ }, flow);
      addFoundation(draft, row.floor, tileIndex(exitX), tileIndex(exitZ));
      draft.labels.push({
        id: sideIndex === 0 ? "label-product" : `label-product-${sideIndex}`,
        text: `${itemName(row.outputItem)} out`,
        position: { x: exitX, y: walkY(row.floor) + 2.4, z: exitZ },
      });
    }
    return;
  }
  // Input banks sit on z = 0. Meet on the clear apron so the product belts do not cut them.
  const joinZ = 10;
  const meetX = -4;
  for (const [sideIndex, side] of row.sides.entries()) {
    const rate = side.count * row.outputPerMin;
    const flow = { itemId: row.outputItem, role: "product-output" as const, rowId: row.id, designPerMin: rate };
    const clear = apronZ(side.mergerZ);
    addBelt(draft, `product-join-x-s${sideIndex}`, { x: face, y, z: side.mergerZ }, { x: meetX, y, z: side.mergerZ }, flow);
    addBelt(draft, `product-join-z-s${sideIndex}`, { x: meetX, y, z: side.mergerZ }, { x: meetX, y, z: clear }, flow);
    if (Math.abs(clear - joinZ) > 1e-6) {
      addBelt(draft, `product-join-cross-s${sideIndex}`, { x: meetX, y, z: clear }, { x: meetX, y, z: joinZ }, flow);
    }
    addBelt(draft, `product-join-out-s${sideIndex}`, { x: meetX, y, z: joinZ }, { x: JOIN_X, y, z: joinZ }, flow);
  }
  draft.solids.push({
    id: `${row.id}-product-merge`,
    kind: "merger",
    floorId: row.floor.id,
    base: { x: JOIN_X, y: walkY(row.floor), z: joinZ },
    size: { x: SPLIT, y: BUILDINGS.merger.height, z: SPLIT },
  });
  const flow = { itemId: row.outputItem, role: "product-output" as const, rowId: row.id, designPerMin: made };
  addBelt(draft, "product-apron", { x: JOIN_X - SPLIT / 2, y, z: joinZ }, { x: EXIT_X, y, z: joinZ }, flow);
  addBelt(draft, "product-exit", { x: EXIT_X, y, z: joinZ }, { x: EXIT_X, y, z: EXIT_Z }, flow);
  addFoundation(draft, row.floor, tileIndex(EXIT_X), tileIndex(EXIT_Z));
  draft.labels.push({
    id: "label-product",
    text: `${itemName(row.outputItem)} out`,
    position: { x: EXIT_X, y: walkY(row.floor) + 2.4, z: EXIT_Z },
  });
}

function placeSideSurplus(
  draft: Draft,
  row: RowSpec,
  side: SideSpec,
  sideIndex: number,
  overflow: number,
  belt: number,
): number {
  const y = beltCenterY(row.floor);
  const yWalk = walkY(row.floor);
  const face = rowFaceX(row);
  const splitX = -12 - sideIndex * 8;
  const kept = capped(side.count * row.outputPerMin - overflow, belt, `${row.id} kept`);
  const onward = { itemId: row.outputItem, role: "stage-link" as const, rowId: row.id, designPerMin: kept };
  addBelt(draft, `${row.id}-s${sideIndex}-to-split`, { x: face, y, z: side.mergerZ }, { x: splitX + SPLIT / 2, y, z: side.mergerZ }, onward);
  draft.solids.push({
    id: `${row.id}-smart-s${sideIndex}`,
    kind: "smartSplitter",
    floorId: row.floor.id,
    rowId: row.id,
    base: { x: splitX, y: yWalk, z: side.mergerZ },
    size: { x: SPLIT, y: BUILDINGS.smartSplitter.height, z: SPLIT },
  });
  let left = overflow;
  let index = 0;
  while (left > 1e-6) {
    const rate = Math.min(left, belt);
    addBelt(
      draft,
      index === 0 ? `${row.id}-s${sideIndex}-overflow-to-sink` : `${row.id}-s${sideIndex}-overflow-to-sink-${index}`,
      { x: splitX, y: y + index * 2, z: side.mergerZ + SPLIT / 2 },
      { x: splitX, y: y + index * 2, z: 40 },
      { itemId: row.outputItem, role: "overflow-stub", rowId: row.id, designPerMin: rate },
    );
    left -= rate;
    index += 1;
  }
  if (sideIndex === 0) {
    draft.labels.push(
      { id: `${row.id}-smart-label`, text: "Smart splitter", position: { x: splitX, y: yWalk + 2.6, z: side.mergerZ - 3 } },
      { id: `${row.id}-overflow-label`, text: "Overflow out (to sink)", position: { x: splitX, y: yWalk + 2.4, z: 40 } },
    );
  }
  return splitX - SPLIT / 2;
}

function layFeedMulti(
  draft: Draft,
  plan: ChainPlan,
  row: RowSpec,
  lane: number,
  apron: number,
  ground: Floor,
  slot: number,
): number {
  const input = row.inputs[lane];
  if (!input) return 0;
  const belt = plan.beltPerMin;
  const per = input.perMin;
  const groundFloor = row.stageIndex === 0;
  if (row.fatInputSlot === lane) {
    let used = 0;
    for (const [sideIndex, side] of row.sides.entries()) {
      const rate = capped(side.count * per, belt, `${row.id} ${input.itemId}`);
      const z = side.laneZ[lane] ?? INPUT_Z;
      if (groundFloor && lane === 0) {
        const y = beltCenterY(row.floor);
        addBelt(
          draft,
          `${row.id}-feed-${lane}-s${sideIndex}`,
          { x: -apron * TILE, y, z },
          { x: rowFaceX(row), y, z },
          { itemId: input.itemId, role: "ore-input", rowId: row.id, designPerMin: rate },
        );
      } else if (groundFloor) {
        runToLane(draft, `${row.id}-feed-${lane}-s${sideIndex}`, row, side, lane, -apron * TILE, z, input.itemId, rate, "ore-input");
      } else {
        const x = slotX(slot + used);
        const y0 = beltCenterY(ground);
        const y1 = beltCenterY(row.floor);
        addBelt(
          draft,
          `${row.id}-feed-${lane}-s${sideIndex}`,
          { x: -apron * TILE, y: y0, z: -6 },
          { x: x - LIFT.width / 2, y: y0, z: -6 },
          { itemId: input.itemId, role: "ore-input", rowId: row.id, designPerMin: rate },
        );
        draft.solids.push({
          id: `lift-feed-${row.id}-l${lane}-s${sideIndex}`,
          kind: "lift",
          floorId: ground.id,
          base: { x, y: walkY(ground), z: -6 },
          size: { x: LIFT.width, y: y1 - y0 + BELT.height, z: LIFT.length },
        });
        addFoundation(draft, ground, tileIndex(x), tileIndex(-6));
        addFoundation(draft, row.floor, tileIndex(x), tileIndex(-6));
        runToLane(draft, `${row.id}-feed-${lane}-s${sideIndex}-on`, row, side, lane, x, -6, input.itemId, rate, "ore-input");
        used += 1;
      }
      draft.labels.push({
        id: `${row.id}-feed-label-${lane}-s${sideIndex}`,
        text: `${itemName(input.itemId)} in`,
        position: { x: -apron * TILE + 2, y: walkY(groundFloor ? row.floor : ground) + 2.2, z },
      });
    }
    return Math.max(used, 0);
  }

  const total = capped(
    row.sides.reduce((sum, side) => sum + side.count * per, 0),
    belt,
    `${row.id} ${input.itemId}`,
  );
  let splitX = TRUNK_X;
  let splitZ = 0;
  let used = 0;
  const y = beltCenterY(row.floor);
  if (groundFloor) {
    addBelt(
      draft,
      `${row.id}-feed-${lane}`,
      { x: -apron * TILE, y, z: 0 },
      { x: TRUNK_X, y, z: 0 },
      { itemId: input.itemId, role: "ore-input", rowId: row.id, designPerMin: total },
    );
  } else {
    const x = slotX(slot);
    const y0 = beltCenterY(ground);
    addBelt(
      draft,
      `${row.id}-feed-${lane}`,
      { x: -apron * TILE, y: y0, z: -6 },
      { x: x - LIFT.width / 2, y: y0, z: -6 },
      { itemId: input.itemId, role: "ore-input", rowId: row.id, designPerMin: total },
    );
    draft.solids.push({
      id: `lift-feed-${row.id}-l${lane}`,
      kind: "lift",
      floorId: ground.id,
      base: { x, y: walkY(ground), z: -6 },
      size: { x: LIFT.width, y: beltCenterY(row.floor) - y0 + BELT.height, z: LIFT.length },
    });
    addFoundation(draft, ground, tileIndex(x), tileIndex(-6));
    addFoundation(draft, row.floor, tileIndex(x), tileIndex(-6));
    splitX = x + 8;
    splitZ = -6;
    addBelt(
      draft,
      `${row.id}-feed-${lane}-to-split`,
      { x, y, z: -6 },
      { x: splitX, y, z: -6 },
      { itemId: input.itemId, role: "ore-input", rowId: row.id, designPerMin: total },
    );
    used = 1;
  }
  draft.solids.push({
    id: `${row.id}-feed-split-${lane}`,
    kind: "splitter",
    floorId: row.floor.id,
    base: { x: splitX, y: walkY(row.floor), z: splitZ },
    size: { x: SPLIT, y: BUILDINGS.splitter.height, z: SPLIT },
  });
  addFoundation(draft, row.floor, tileIndex(splitX), tileIndex(splitZ));
  for (const [sideIndex, side] of row.sides.entries()) {
    const rate = capped(side.count * per, belt, `${row.id} ${input.itemId} side`);
    runToLane(draft, `${row.id}-feed-${lane}-s${sideIndex}`, row, side, lane, splitX, splitZ, input.itemId, rate, "ore-input");
  }
  draft.labels.push({
    id: `${row.id}-feed-label-${lane}`,
    text: `${itemName(input.itemId)} in`,
    position: { x: -apron * TILE + 2, y: walkY(groundFloor ? row.floor : ground) + 2.2, z: splitZ },
  });
  return used;
}

function layLinkMulti(
  draft: Draft,
  plan: ChainPlan,
  source: RowSpec,
  dest: RowSpec,
  lane: number,
  slot: number,
  sourceStage: StagePlan,
  drawn: number,
  placeSurplus: boolean,
): number {
  const belt = plan.beltPerMin;
  const item = source.outputItem;
  const perIn = dest.inputs[lane]?.perMin ?? 0;
  const srcRates = source.sides.map((side) => side.count * source.outputPerMin);
  const dstRates = dest.sides.map((side) => side.count * perIn);
  const output = sourceStage.outputPerMin;
  const pair = source.doubled && dest.doubled && source.fatIsOutput && dest.fatInputSlot === lane;
  const y = beltCenterY(source.floor);
  const face = rowFaceX(source);

  if (pair) {
    let extra = Math.max(0, output - drawn);
    const overflows = srcRates.map((src) => {
      const take = Math.min(src, extra);
      extra -= take;
      return take;
    });
    for (const [sideIndex, side] of source.sides.entries()) {
      const src = srcRates[sideIndex] ?? 0;
      const overflow = placeSurplus ? (overflows[sideIndex] ?? 0) : 0;
      const kept = capped(src - overflow, belt, `${source.id} side ${sideIndex}`);
      let fromX = face;
      if (overflow > SURPLUS_EPSILON) fromX = placeSideSurplus(draft, source, side, sideIndex, overflow, belt);
      else {
        addBelt(
          draft,
          `${source.id}-s${sideIndex}-pull`,
          { x: face, y, z: side.mergerZ },
          { x: slotX(slot + sideIndex), y, z: side.mergerZ },
          { itemId: item, role: "stage-link", rowId: source.id, designPerMin: kept },
        );
        fromX = slotX(slot + sideIndex);
      }
      const dst = dest.sides[sideIndex] ?? dest.sides[0];
      if (!dst) continue;
      const arrived = liftColumn(draft, source, dest, fromX, side.mergerZ, slotX(slot + sideIndex), item, kept, `${source.id}-s${sideIndex}-to-${dest.id}`, placeSurplus && sideIndex === 0 && source.surplusPerMin > SURPLUS_EPSILON);
      const need = capped(dstRates[sideIndex] ?? kept, belt, `${dest.id} ${item}`);
      runToLane(draft, `${dest.id}-l${lane}-s${sideIndex}`, dest, dst, lane, arrived.exitX, arrived.exitZ, item, need, "input-manifold");
    }
    return source.sides.length;
  }

  const sent = Math.min(output, drawn > 0 ? drawn : output, belt);
  if (source.sides.length === 1 && source.sides[0]) {
    const side = source.sides[0];
    const liftAt = slotX(slot);
    const rawSide = srcRates[0] ?? output;
    const sideRate = placeSurplus ? forwardRate(draft, source) : capped(rawSide, belt, `${source.id} output`);
    if (placeSurplus) {
      layFeedSurplus(draft, source, side.mergerZ, walkY(source.floor), y, face, liftAt, -10 - slot * 6);
    } else {
      addBelt(draft, `${source.id}-pull-${dest.id}-l${lane}`, { x: face, y, z: side.mergerZ }, { x: liftAt, y, z: side.mergerZ }, {
        itemId: item, role: "stage-link", rowId: source.id, designPerMin: sideRate,
      });
    }
    const arrived = liftColumn(
      draft, source, dest, liftAt, side.mergerZ, liftAt, item, sideRate,
      `${source.id}-to-${dest.id}-l${lane}`, placeSurplus,
    );
    deliverToDest(draft, dest, lane, arrived.exitX, arrived.exitZ, item, dstRates, belt, sent);
    return 1;
  }
  const joinX = slotX(slot) - 16;
  let streamX = joinX;
  let streamZ = 0;
  if (output <= belt + 1e-6) {
    for (const [sideIndex, side] of source.sides.entries()) {
      const rate = capped(srcRates[sideIndex] ?? 0, belt, `${source.id} join`);
      const clear = apronZ(side.mergerZ);
      addBelt(draft, `${source.id}-join-x-s${sideIndex}`, { x: face, y, z: side.mergerZ }, { x: -4, y, z: side.mergerZ }, {
        itemId: item, role: "stage-link", rowId: source.id, designPerMin: rate,
      });
      addBelt(draft, `${source.id}-join-clear-s${sideIndex}-l${lane}`, { x: -4, y, z: side.mergerZ }, { x: -4, y, z: clear }, {
        itemId: item, role: "stage-link", rowId: source.id, designPerMin: rate,
      });
      addBelt(draft, `${source.id}-join-out-s${sideIndex}-l${lane}`, { x: -4, y, z: clear }, { x: joinX, y, z: clear }, {
        itemId: item, role: "stage-link", rowId: source.id, designPerMin: rate,
      });
      addBelt(draft, `${source.id}-join-z-s${sideIndex}-l${lane}`, { x: joinX, y, z: clear }, { x: joinX, y, z: streamZ }, {
        itemId: item, role: "stage-link", rowId: source.id, designPerMin: rate,
      });
    }
    if (source.sides.length > 1) {
      draft.solids.push({
        id: `${source.id}-join-${dest.id}-l${lane}`,
        kind: "merger",
        floorId: source.floor.id,
        base: { x: joinX, y: walkY(source.floor), z: streamZ },
        size: { x: SPLIT, y: 1, z: SPLIT },
      });
      streamX = joinX - SPLIT / 2;
    }
    if (placeSurplus) {
      const liftAt = slotX(slot);
      const splitX = (streamX + liftAt) / 2;
      layFeedSurplus(draft, source, streamZ, walkY(source.floor), y, streamX, liftAt, splitX);
      streamX = liftAt;
      streamZ = streamZ;
    }
  } else {
    let extra = Math.max(0, output - sent);
    for (const [sideIndex, side] of source.sides.entries()) {
      const src = srcRates[sideIndex] ?? 0;
      const overflow = placeSurplus ? Math.min(src, extra) : 0;
      extra -= overflow;
      const kept = capped(src - overflow, belt, `${source.id} kept`);
      let fromX = face;
      if (overflow > SURPLUS_EPSILON) fromX = placeSideSurplus(draft, source, side, sideIndex, overflow, belt);
      const clear = apronZ(side.mergerZ);
      const flow = { itemId: item, role: "stage-link" as const, rowId: source.id, designPerMin: kept };
      // Stay off the merger line once a smart splitter owns it. A run back through x = -4 cuts that splitter.
      let x = fromX;
      let z = side.mergerZ;
      if (Math.abs(z - clear) > 1e-6) {
        addBelt(draft, `${source.id}-join-clear-s${sideIndex}-l${lane}`, { x, y, z }, { x, y, z: clear }, flow);
        z = clear;
      }
      if (Math.abs(x - joinX) > 1e-6) {
        addBelt(draft, `${source.id}-join-out-s${sideIndex}-l${lane}`, { x, y, z }, { x: joinX, y, z }, flow);
      }
      if (Math.abs(z) > 1e-6) {
        addBelt(draft, `${source.id}-join-z-s${sideIndex}-l${lane}`, { x: joinX, y, z }, { x: joinX, y, z: 0 }, flow);
      }
    }
    draft.solids.push({
      id: `${source.id}-join-${dest.id}-l${lane}`,
      kind: "merger",
      floorId: source.floor.id,
      base: { x: joinX, y: walkY(source.floor), z: 0 },
      size: { x: SPLIT, y: 1, z: SPLIT },
    });
    streamX = joinX - SPLIT / 2;
    streamZ = 0;
  }
  const carried = capped(output <= belt + 1e-6 ? output : sent, belt, `${source.id} to ${dest.id}`);
  const arrived = liftColumn(
    draft, source, dest, streamX, streamZ, slotX(slot), item, carried,
    `${source.id}-to-${dest.id}-l${lane}`,
    placeSurplus,
  );
  deliverToDest(draft, dest, lane, arrived.exitX, arrived.exitZ, item, dstRates, belt, carried);
  return 1;
}

/** One trunk cannot carry both sides' recipe demand. Share whatever actually arrived. */
function shareRates(needs: number[], arrived: number): number[] {
  const sum = needs.reduce((total, rate) => total + rate, 0);
  if (sum <= 1e-9 || sum <= arrived + 1e-6) return needs;
  return needs.map((rate) => (rate / sum) * arrived);
}

function deliverToDest(
  draft: Draft,
  dest: RowSpec,
  lane: number,
  exitX: number,
  exitZ: number,
  item: string,
  dstRates: number[],
  belt: number,
  arrived: number,
): void {
  const shares = shareRates(dstRates, arrived);
  const y = beltCenterY(dest.floor);
  const flow = { itemId: item, role: "input-manifold" as const, rowId: dest.id, designPerMin: 0 };
  if (dest.sides.length === 1 && dest.sides[0]) {
    const need = capped(shares[0] ?? 0, belt, `${dest.id} ${item}`);
    runToLane(draft, `${dest.id}-l${lane}`, dest, dest.sides[0], lane, exitX, exitZ, item, need, "input-manifold");
    return;
  }
  // The next slot's container starts 5 m past this one. A 4 m splitter fits that gap; the extra 2 m landed on the neighbor.
  const branchX = exitX + SPLIT / 2;
  const trunk = capped(shares.reduce((sum, rate) => sum + rate, 0), belt, `${dest.id} ${item}`);
  addBelt(draft, `${dest.id}-l${lane}-branch-x`, { x: exitX, y, z: exitZ }, { x: branchX - SPLIT / 2, y, z: exitZ }, { ...flow, designPerMin: trunk });
  draft.solids.push({
    id: `${dest.id}-l${lane}-branch`,
    kind: "splitter",
    floorId: dest.floor.id,
    base: { x: branchX, y: walkY(dest.floor), z: exitZ },
    size: { x: SPLIT, y: 1, z: SPLIT },
  });
  for (const [sideIndex, side] of dest.sides.entries()) {
    const need = capped(shares[sideIndex] ?? 0, belt, `${dest.id} ${item}`);
    runToLane(draft, `${dest.id}-l${lane}-s${sideIndex}`, dest, side, lane, branchX, exitZ, item, need, "input-manifold");
  }
}

function layLinearMulti(draft: Draft, plan: ChainPlan, rows: RowSpec[], apron: number): void {
  const first = rows[0];
  const ground = first?.floor;
  if (!first || !ground) return;
  if (first.doubled) layFeedMulti(draft, plan, first, 0, apron, ground, 0);
  else {
    const y0 = beltCenterY(first.floor);
    const oreZ = first.laneZ[0] ?? INPUT_Z;
    addBelt(draft, "ore-in", { x: -apron * TILE, y: y0, z: oreZ }, { x: rowFaceX(first), y: y0, z: oreZ }, {
      itemId: first.inputItem,
      role: "ore-input",
      rowId: first.id,
      designPerMin: plan.stages[0]?.inputPerMin ?? 0,
    });
    draft.labels.push({
      id: "label-ore",
      text: `${itemName(first.inputItem)} in`,
      position: { x: -apron * TILE + 2, y: walkY(first.floor) + 2.2, z: oreZ },
    });
  }
  let slot = 0;
  const seen = new Set<string>();
  for (let index = 0; index < rows.length - 1; index += 1) {
    const lower = rows[index];
    const upper = rows[index + 1];
    const lowerStage = plan.stages[index];
    const upperStage = plan.stages[index + 1];
    if (!lower || !upper || !lowerStage || !upperStage) continue;
    if (!lower.doubled && !upper.doubled) {
      layStageLink(draft, lower, upper, lowerStage, upperStage, index, rows.length - 1, BUILDINGS.storageIndustrial);
      continue;
    }
    const place = lower.surplusPerMin > SURPLUS_EPSILON && !seen.has(lower.id);
    if (place) seen.add(lower.id);
    slot += layLinkMulti(draft, plan, lower, upper, 0, slot, lowerStage, upperStage.inputPerMin, place);
  }
  const last = rows[rows.length - 1];
  const made = plan.stages[plan.stages.length - 1]?.outputPerMin ?? 0;
  if (!last) return;
  if (last.doubled) layProductMulti(draft, last, made);
  else layProductExit(draft, last, made);
}

function layJoinedMulti(draft: Draft, plan: ChainPlan, rows: RowSpec[], apron: number): void {
  const goal = rows[rows.length - 1];
  const ground = rows[0]?.floor;
  if (!goal || !ground) return;
  let slot = 0;
  const seen = new Set<string>();
  for (const row of rows) {
    const stage = plan.stages[row.stageIndex];
    if (!stage) continue;
    for (let lane = 0; lane < row.inputCount; lane += 1) {
      const input = row.inputs[lane];
      if (!input) continue;
      const drawn = stage.inputsPerMin[lane] ?? 0;
      if (input.from === "feed") {
        if (!row.doubled) {
          if (row.stageIndex === 0) layGroundFeed(draft, row, lane, apron, input.itemId, drawn);
          else {
            layUpperFeed(draft, row, lane, slot, apron, input.itemId, drawn, ground);
            slot += 1;
          }
        } else {
          slot += layFeedMulti(draft, plan, row, lane, apron, ground, slot);
        }
        continue;
      }
      const source = rows[input.from];
      const sourceStage = plan.stages[input.from];
      if (!source || !sourceStage) throw new Error(`${row.id} is missing an upstream row.`);
      if (!source.doubled && !row.doubled) {
        const place = source.surplusPerMin > SURPLUS_EPSILON && !seen.has(source.id);
        if (place) seen.add(source.id);
        layJoinedLink(draft, source, row, lane, slot, sourceStage, drawn, place);
        slot += 1;
        continue;
      }
      const place = source.surplusPerMin > SURPLUS_EPSILON && !seen.has(source.id);
      if (place) seen.add(source.id);
      slot += layLinkMulti(draft, plan, source, row, lane, slot, sourceStage, drawn, place);
    }
  }
  const made = plan.stages[plan.stages.length - 1]?.outputPerMin ?? 0;
  if (goal.doubled) layProductMulti(draft, goal, made);
  else layProductExit(draft, goal, made);
}

const RAMP_EDGE_X = -8;
const RAMP_OUT_Z = -14;
const RAMP_BACK_Z = -22;

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
    const pitch = toFloor.z - fromFloor.z;
    const steps = Math.round(pitch / (WALKWAY.rise * 2));
    if (steps < 1 || Math.abs(steps * WALKWAY.rise * 2 - pitch) > 1e-6) {
      throw new Error(`Ramp cannot climb ${pitch} m.`);
    }
    const midY = y0 + steps * WALKWAY.rise;
    const farX = RAMP_EDGE_X - steps * WALKWAY.length;
    for (let step = 0; step < steps; step += 1) {
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
    for (let step = 0; step < steps; step += 1) {
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
  edgeLow: number,
  edgeHigh: number,
): void {
  if (!lower || !upper) return;
  const top = upper.z;
  const edgeZ = [edgeLow, edgeHigh];
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
      const column = {
        min: { x: x - 0.7, y: y0, z: z - 0.7 },
        max: { x: x + 0.7, y: top, z: z + 0.7 },
      };
      if (draft.belts.some((belt) => overlaps(column, beltAabb(belt)))) continue;
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
