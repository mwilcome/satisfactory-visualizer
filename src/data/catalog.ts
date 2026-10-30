import { ITEM_LIST, RECIPE_LIST } from "./generated-catalog";

/**
 * Satisfactory building and recipe data.
 * Recipe rates below were checked against satisfactory.wiki.gg on 2026-10-30
 * at 100% clock. Each new recipe cites the wiki page in a comment.
 *
 * Footprints were checked against satisfactory.wiki.gg on 2026-10-30:
 * - Smelter (Desc_SmelterMk1_C): 5 × 10 × 8.5 m
 * - Constructor (Desc_ConstructorMk1_C): 8 × 10 × 8.5 m
 * - Foundry (Desc_FoundryMk1_C): 10 × 10 × 9 m
 * - Assembler (Desc_AssemblerMk1_C): 9 × 16 × 11 m
 *   https://satisfactory.wiki.gg/wiki/Assembler
 * - Conveyor Splitter / Merger: 4 × 4 m, height 2n+1 m (one unit is 1 m; stack step 2 m)
 * - Smart Splitter (Desc_ConveyorAttachmentSplitterSmart_C): 4 × 4 m, height 2n+1 m
 *   https://satisfactory.wiki.gg/wiki/Smart_Splitter
 * - AWESOME Sink (Desc_ResourceSink_C): 16 × 13 × 24 m, one conveyor input
 *   https://satisfactory.wiki.gg/wiki/AWESOME_Sink
 * - Storage Container (Desc_StorageContainerMk1_C): 5 × 11 × 4 m, one input and one output
 *   https://satisfactory.wiki.gg/wiki/Storage_Container
 * - Conveyor belt: 2 m wide × 1 m tall
 * - Industrial Storage Container (Desc_StorageContainerMk2_C): 5 × 11 × 8 m
 * - Foundation: 8 × 8 m. v1 emits the 1 m thickness only.
 * - Walkway: 4 × 4 × 2 m. A walkway ramp rises 2 m over a 4 m run.
 * - Basic wall segment: 4 m. Story clearance is counted in wall-heights.
 *
 * Conveyor lift footprint is 2 × 2 m (clearance used by the lift housing).
 * Power draw is intentionally absent — poles and MW can be added later
 * without changing these footprints.
 */

export const FOUNDATION_SIZE_M = 8;
/** v1 default. 2 m and 4 m slabs exist in game and are not built yet. */
export const FOUNDATION_HEIGHT_M = 1 as const;
export const FOUNDATION_HEIGHTS_LATER_M = [2, 4] as const;

export const WALL_HEIGHT_M = 4;

/** Vertical clear from one foundation bottom to the next, in wall segments. */
export const STORY_WALLS = {
  logistics: 2,
  production: 3,
  manufacturer: 4,
} as const;

export type StoryKind = keyof typeof STORY_WALLS;

export function storyClearanceM(kind: StoryKind): number {
  return STORY_WALLS[kind] * WALL_HEIGHT_M;
}

/** Air under the next 1 m slab. Assemblers (11 m) fit a production story. */
export function storyAirM(kind: StoryKind, foundationHeight = FOUNDATION_HEIGHT_M): number {
  return storyClearanceM(kind) - foundationHeight;
}

export interface BuildingFootprint {
  id: string;
  name: string;
  className: string;
  /** Along the manifold row, meters. */
  width: number;
  /** Port-to-port, meters. */
  length: number;
  height: number;
  inputs: number;
  outputs: number;
}

export const BUILDINGS = {
  smelter: {
    id: "smelter",
    name: "Smelter",
    className: "Desc_SmelterMk1_C",
    width: 5,
    length: 10,
    height: 8.5,
    inputs: 1,
    outputs: 1,
  },
  constructor: {
    id: "constructor",
    name: "Constructor",
    className: "Desc_ConstructorMk1_C",
    width: 8,
    length: 10,
    height: 8.5,
    inputs: 1,
    outputs: 1,
  },
  foundry: {
    id: "foundry",
    name: "Foundry",
    className: "Desc_FoundryMk1_C",
    width: 10,
    length: 10,
    height: 9,
    inputs: 2,
    outputs: 1,
  },
  assembler: {
    id: "assembler",
    name: "Assembler",
    className: "Desc_AssemblerMk1_C",
    width: 9,
    length: 16,
    height: 11,
    inputs: 2,
    outputs: 1,
  },
  splitter: {
    id: "splitter",
    name: "Conveyor Splitter",
    className: "Desc_ConveyorAttachmentSplitter_C",
    width: 4,
    length: 4,
    height: 1,
    inputs: 1,
    outputs: 3,
  },
  smartSplitter: {
    id: "smartSplitter",
    name: "Smart Splitter",
    className: "Desc_ConveyorAttachmentSplitterSmart_C",
    width: 4,
    length: 4,
    /** Wiki height is 2n+1 m. One unit is 1 m, same as the conveyor splitter. */
    height: 1,
    inputs: 1,
    outputs: 3,
  },
  awesomeSink: {
    id: "awesomeSink",
    name: "AWESOME Sink",
    className: "Desc_ResourceSink_C",
    width: 16,
    length: 13,
    height: 24,
    inputs: 1,
    outputs: 0,
  },
  storageContainer: {
    id: "storageContainer",
    name: "Storage Container",
    className: "Desc_StorageContainerMk1_C",
    width: 5,
    length: 11,
    height: 4,
    inputs: 1,
    outputs: 1,
  },
  merger: {
    id: "merger",
    name: "Conveyor Merger",
    className: "Desc_ConveyorAttachmentMerger_C",
    width: 4,
    length: 4,
    height: 1,
    inputs: 3,
    outputs: 1,
  },
  storageIndustrial: {
    id: "storageIndustrial",
    name: "Industrial Storage Container",
    className: "Desc_StorageContainerMk2_C",
    width: 5,
    length: 11,
    height: 8,
    inputs: 2,
    outputs: 2,
  },
} as const satisfies Record<string, BuildingFootprint>;

export type BuildingId = keyof typeof BUILDINGS;

export const BELT = { width: 2, height: 1 } as const;
export const LIFT = { width: 2, length: 2 } as const;
export const WALKWAY = { width: 4, length: 4, height: 2, rise: 2 } as const;

/**
 * World coordinates are meters. Foundations stay on an 8 m grid; belt nudges do not.
 * In game, nudge is 1 m and Ctrl-nudge is 0.5 m.
 */
export const INPUT_STAIR_NUDGE_M = 1;

/**
 * Vertical step between input-lane belt centers.
 * A belt is 1 m tall, so 2 m (the splitter stack step) leaves a 1 m gap.
 * The lanes are also nudged apart in plan. This rise is not a lift between splitters.
 * TODO: swap in measured connector heights if a port table becomes available.
 */
export const INPUT_LANE_RISE_M = 2;

/** Meters the lane sits farther from the machine than the innermost input. Lane 0 is farthest. */
export function inputLaneOutboardM(lane: number, inputCount: number): number {
  return (inputCount - 1 - lane) * INPUT_STAIR_NUDGE_M;
}

/**
 * Manufacturer is not built in this phase. The stair helper above is the stub:
 * four inputs would sit 0, 1, 2, and 3 m outboard, lowest farthest.
 * Wiki 2026-10-30: 18 × 20 × 12 m, 4 conveyor inputs, 1 output.
 * TODO: mesh, port heights, and a build once oil is not the next bound.
 */
export const MANUFACTURER_LATER = {
  id: "manufacturer",
  className: "Desc_ManufacturerMk1_C",
  width: 18,
  length: 20,
  height: 12,
  inputs: 4,
  outputs: 1,
} as const;

/**
 * Selectable belt marks. A manifold is one mark end to end — never a mix.
 * Mk1 is the conceptual start; Mk2–Mk4 lengthen the same layout.
 * Later marks can be appended here. Nothing in the layout assumes one mark.
 */
export const BELT_MARKS = [
  { mk: 1, perMin: 60 },
  { mk: 2, perMin: 120 },
  { mk: 3, perMin: 270 },
  { mk: 4, perMin: 480 },
] as const;

export type BeltMk = (typeof BELT_MARKS)[number]["mk"];

export function beltByMk(mk: BeltMk): (typeof BELT_MARKS)[number] {
  const found = BELT_MARKS.find((belt) => belt.mk === mk);
  if (!found) throw new Error(`Belt mark Mk${mk} is not in the v1 set.`);
  return found;
}

export function isBeltMk(value: unknown): value is BeltMk {
  return typeof value === "number" && BELT_MARKS.some((belt) => belt.mk === value);
}

export interface ItemStack {
  itemId: string;
  perCycle: number;
  perMin: number;
}

export interface Recipe {
  id: string;
  name: string;
  alternate: boolean;
  className: string;
  buildingId: BuildingId;
  cycleSeconds: number;
  inputs: ItemStack[];
  outputs: ItemStack[];
}

export const ITEMS: Record<string, { id: string; name: string; raw: boolean; fluid: boolean }> =
  Object.fromEntries(ITEM_LIST.map((item) => [item.id, item]));

export type ItemId = string;

export const RECIPES: Record<string, Recipe> = Object.fromEntries(
  RECIPE_LIST.map((recipe) => [recipe.id, recipe]),
);

export type RecipeId = string;

/** Parts you can aim the factory at. Raw ores and fluids stay inputs, not targets. */
export function targetItems(): { id: string; name: string; raw: boolean; fluid: boolean }[] {
  const made = new Set<string>();
  for (const recipe of Object.values(RECIPES)) {
    for (const output of recipe.outputs) made.add(output.itemId);
  }
  return ITEM_LIST.filter((item) => made.has(item.id) && !item.fluid).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** How many whole machines of this recipe one belt mark can feed and empty. */
export function machinesPerBelt(recipe: Recipe, perMin: number): number {
  const limits = [...recipe.inputs, ...recipe.outputs].map((stack) =>
    Math.floor((perMin + 1e-9) / stack.perMin),
  );
  return Math.min(...limits);
}
