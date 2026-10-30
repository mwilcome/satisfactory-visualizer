/**
 * Satisfactory building and recipe data.
 * Recipe rates below were checked against satisfactory.wiki.gg on 2026-10-30
 * at 100% clock. Each new recipe cites the wiki page in a comment.
 *
 * Footprints were checked against satisfactory.wiki.gg on 2026-10-30:
 * - Smelter (Desc_SmelterMk1_C): 5 × 10 × 8.5 m
 * - Constructor (Desc_ConstructorMk1_C): 8 × 10 × 8.5 m
 * - Foundry (Desc_FoundryMk1_C): 10 × 10 × 9 m
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

export const RECIPES = {
  "iron-ingot": {
    id: "iron-ingot",
    name: "Iron Ingot",
    alternate: false,
    className: "Recipe_IngotIron_C",
    buildingId: "smelter",
    cycleSeconds: 2,
    inputs: [{ itemId: "iron-ore", perCycle: 1, perMin: 30 }],
    outputs: [{ itemId: "iron-ingot", perCycle: 1, perMin: 30 }],
  },
  "cast-screw": {
    id: "cast-screw",
    name: "Cast Screws",
    alternate: true,
    className: "Recipe_Alternate_Screw_C",
    buildingId: "constructor",
    cycleSeconds: 24,
    inputs: [{ itemId: "iron-ingot", perCycle: 5, perMin: 12.5 }],
    outputs: [{ itemId: "screw", perCycle: 20, perMin: 50 }],
  },
  // https://satisfactory.wiki.gg/wiki/Copper_Ingot — Smelter, 2 s.
  // 1 Copper Ore (30/min) → 1 Copper Ingot (30/min).
  "copper-ingot": {
    id: "copper-ingot",
    name: "Copper Ingot",
    alternate: false,
    className: "Recipe_IngotCopper_C",
    buildingId: "smelter",
    cycleSeconds: 2,
    inputs: [{ itemId: "copper-ore", perCycle: 1, perMin: 30 }],
    outputs: [{ itemId: "copper-ingot", perCycle: 1, perMin: 30 }],
  },
  // https://satisfactory.wiki.gg/wiki/Iron_Plate — Constructor, 6 s.
  // 3 Iron Ingot (30/min) → 2 Iron Plate (20/min). Default recipe.
  "iron-plate": {
    id: "iron-plate",
    name: "Iron Plate",
    alternate: false,
    className: "Recipe_IronPlate_C",
    buildingId: "constructor",
    cycleSeconds: 6,
    inputs: [{ itemId: "iron-ingot", perCycle: 3, perMin: 30 }],
    outputs: [{ itemId: "iron-plate", perCycle: 2, perMin: 20 }],
  },
  // https://satisfactory.wiki.gg/wiki/Iron_Rod — Constructor, 4 s.
  // 1 Iron Ingot (15/min) → 1 Iron Rod (15/min). Default recipe.
  "iron-rod": {
    id: "iron-rod",
    name: "Iron Rod",
    alternate: false,
    className: "Recipe_IronRod_C",
    buildingId: "constructor",
    cycleSeconds: 4,
    inputs: [{ itemId: "iron-ingot", perCycle: 1, perMin: 15 }],
    outputs: [{ itemId: "iron-rod", perCycle: 1, perMin: 15 }],
  },
  // https://satisfactory.wiki.gg/wiki/Screw — Constructor, 6 s.
  // 1 Iron Rod (10/min) → 4 Screws (40/min). Default recipe (1.1 name: Screws).
  screw: {
    id: "screw",
    name: "Screws",
    alternate: false,
    className: "Recipe_Screw_C",
    buildingId: "constructor",
    cycleSeconds: 6,
    inputs: [{ itemId: "iron-rod", perCycle: 1, perMin: 10 }],
    outputs: [{ itemId: "screw", perCycle: 4, perMin: 40 }],
  },
  // https://satisfactory.wiki.gg/wiki/Wire — Constructor, 4 s.
  // 1 Copper Ingot (15/min) → 2 Wire (30/min). Default recipe.
  wire: {
    id: "wire",
    name: "Wire",
    alternate: false,
    className: "Recipe_Wire_C",
    buildingId: "constructor",
    cycleSeconds: 4,
    inputs: [{ itemId: "copper-ingot", perCycle: 1, perMin: 15 }],
    outputs: [{ itemId: "wire", perCycle: 2, perMin: 30 }],
  },
  // https://satisfactory.wiki.gg/wiki/Wire — Iron Wire alternate. Constructor, 24 s.
  // 5 Iron Ingot (12.5/min) → 9 Wire (22.5/min).
  // Class Recipe_Alternate_Wire_1_C matches those rates (not Wire_2).
  "iron-wire": {
    id: "iron-wire",
    name: "Iron Wire",
    alternate: true,
    className: "Recipe_Alternate_Wire_1_C",
    buildingId: "constructor",
    cycleSeconds: 24,
    inputs: [{ itemId: "iron-ingot", perCycle: 5, perMin: 12.5 }],
    outputs: [{ itemId: "wire", perCycle: 9, perMin: 22.5 }],
  },
  // https://satisfactory.wiki.gg/wiki/Cable — Constructor, 2 s.
  // 2 Wire (60/min) → 1 Cable (30/min). Default recipe.
  cable: {
    id: "cable",
    name: "Cable",
    alternate: false,
    className: "Recipe_Cable_C",
    buildingId: "constructor",
    cycleSeconds: 2,
    inputs: [{ itemId: "wire", perCycle: 2, perMin: 60 }],
    outputs: [{ itemId: "cable", perCycle: 1, perMin: 30 }],
  },
} as const satisfies Record<string, Recipe>;

export type RecipeId = keyof typeof RECIPES;

export const ITEMS = {
  "iron-ore": { id: "iron-ore", name: "Iron Ore" },
  "iron-ingot": { id: "iron-ingot", name: "Iron Ingot" },
  "iron-plate": { id: "iron-plate", name: "Iron Plate" },
  "iron-rod": { id: "iron-rod", name: "Iron Rod" },
  screw: { id: "screw", name: "Screws" },
  "copper-ore": { id: "copper-ore", name: "Copper Ore" },
  "copper-ingot": { id: "copper-ingot", name: "Copper Ingot" },
  wire: { id: "wire", name: "Wire" },
  cable: { id: "cable", name: "Cable" },
} as const;

export type ItemId = keyof typeof ITEMS;

/** How many whole machines of this recipe one belt mark can feed and empty. */
export function machinesPerBelt(recipe: Recipe, perMin: number): number {
  const limits = [...recipe.inputs, ...recipe.outputs].map((stack) =>
    Math.floor((perMin + 1e-9) / stack.perMin),
  );
  return Math.min(...limits);
}
