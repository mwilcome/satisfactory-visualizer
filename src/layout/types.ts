import type { BeltMk, BuildingId, StoryKind } from "../data/catalog";
import type { ChainPlan } from "../solve/chain";

/** Meters. x grows from the feed end toward the open end. y is up. z is lateral. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Aabb {
  min: Vec3;
  max: Vec3;
}

export type SolidKind =
  | "foundation"
  | "machine"
  | "splitter"
  | "merger"
  | "buffer"
  | "lift"
  | "support"
  | "smartSplitter"
  | "sink"
  | "bank";

export interface Solid {
  id: string;
  kind: SolidKind;
  floorId: string;
  /** Bottom-center of the footprint. Parts rise in +y from here. */
  base: Vec3;
  size: Vec3;
  buildingId?: BuildingId;
  recipeId?: string;
  clock?: 100;
  rowIndex?: number;
  /** Manifold lane id. One row per production stage. */
  rowId?: string;
}

export type BeltRole =
  | "ore-input"
  | "input-manifold"
  | "input-port"
  | "grow-stub"
  | "output-port"
  | "output-manifold"
  | "stage-link"
  | "product-output"
  | "overflow-stub";

export interface Belt {
  id: string;
  mk: BeltMk;
  itemId: string;
  role: BeltRole;
  rowId?: string;
  from: Vec3;
  to: Vec3;
  /** 100% throughput this segment is sized for. */
  designPerMin: number;
}

export interface Ramp {
  id: string;
  from: Vec3;
  to: Vec3;
  width: number;
}

export interface Floor {
  id: string;
  /** Foundation bottom, meters. Schema field name. */
  z: number;
  foundationHeightM: 1;
  /** Foundation-bottom to next foundation-bottom. Production is 3 × 4 m walls. */
  heightClearanceM: number;
  storyKind: StoryKind;
  wallCount: number;
}

export interface WalkCorridor {
  id: string;
  min: Vec3;
  max: Vec3;
}

export interface PlantLabel {
  id: string;
  text: string;
  position: Vec3;
}

/**
 * Plant → Floor → Row (manifold lane).
 * feedEndX is the apron side (logistics in). openEndX is the grow side.
 * Each stage is one floor and one row. Looking from feed toward open,
 * input is on -z and output is on +z.
 */
export interface Plant {
  goalItemId: string;
  dedicatedNodes: true;
  plan: ChainPlan;
  feedEndX: number;
  floors: Floor[];
  solids: Solid[];
  belts: Belt[];
  ramps: Ramp[];
  walkCorridors: WalkCorridor[];
  labels: PlantLabel[];
  rows: {
    id: string;
    floorId: string;
    feedEndX: number;
    openEndX: number;
    machineCount: number;
  }[];
}
