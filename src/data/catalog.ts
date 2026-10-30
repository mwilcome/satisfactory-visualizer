/**
 * Satisfactory building and recipe data for the screws-from-iron demo.
 *
 * Footprints were checked against satisfactory.wiki.gg on 2026-10-30:
 * - Smelter (Desc_SmelterMk1_C): 5 × 10 × 8.5 m
 * - Constructor (Desc_ConstructorMk1_C): 8 × 10 × 8.5 m
 * - Foundry (Desc_FoundryMk1_C): 10 × 10 × 9 m
 * - Conveyor Splitter / Merger: 4 × 4 m, height 2n+1 m (one unit is 1 m; stack step 2 m)
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
} as const satisfies Record<string, Recipe>;

export type RecipeId = keyof typeof RECIPES;

export const ITEMS = {
  "iron-ore": { id: "iron-ore", name: "Iron Ore" },
  "iron-ingot": { id: "iron-ingot", name: "Iron Ingot" },
  screw: { id: "screw", name: "Screws" },
} as const;

/** How many whole machines of this recipe one belt mark can feed and empty. */
export function machinesPerBelt(recipe: Recipe, perMin: number): number {
  const limits = [...recipe.inputs, ...recipe.outputs].map((stack) =>
    Math.floor((perMin + 1e-9) / stack.perMin),
  );
  return Math.min(...limits);
}
