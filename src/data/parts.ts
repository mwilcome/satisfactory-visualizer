/**
 * Machine silhouettes as solid parts.
 * Coordinates: x across the row, z port-to-port (negative z is the input face),
 * y up from the foundation the building sits on.
 * The union touches the wiki footprint and must not leave it.
 */

export type PartMaterial =
  | "body"
  | "dark"
  | "steel"
  | "orange"
  | "port"
  | "hazard"
  | "splitter";

export interface SolidPart {
  size: [number, number, number];
  center: [number, number, number];
  material: PartMaterial;
}

export interface FootprintBox {
  x: number;
  y: number;
  z: number;
}

export function footprintErrors(parts: SolidPart[], size: FootprintBox): string[] {
  const errors: string[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  parts.forEach((part, index) => {
    const hx = part.size[0] / 2;
    const hy = part.size[1] / 2;
    const hz = part.size[2] / 2;
    const pminX = part.center[0] - hx;
    const pminY = part.center[1] - hy;
    const pminZ = part.center[2] - hz;
    const pmaxX = part.center[0] + hx;
    const pmaxY = part.center[1] + hy;
    const pmaxZ = part.center[2] + hz;
    if (
      pminX < -size.x / 2 - 1e-6 ||
      pmaxX > size.x / 2 + 1e-6 ||
      pminY < -1e-6 ||
      pmaxY > size.y + 1e-6 ||
      pminZ < -size.z / 2 - 1e-6 ||
      pmaxZ > size.z / 2 + 1e-6
    ) {
      errors.push(`part ${index} (${part.material}) leaves the ${size.x}×${size.z}×${size.y} footprint`);
    }
    minX = Math.min(minX, pminX);
    minY = Math.min(minY, pminY);
    minZ = Math.min(minZ, pminZ);
    maxX = Math.max(maxX, pmaxX);
    maxY = Math.max(maxY, pmaxY);
    maxZ = Math.max(maxZ, pmaxZ);
  });

  const touch = 1e-3;
  if (Math.abs(minX + size.x / 2) > touch) errors.push("does not reach the -x face");
  if (Math.abs(maxX - size.x / 2) > touch) errors.push("does not reach the +x face");
  if (Math.abs(minZ + size.z / 2) > touch) errors.push("does not reach the input face");
  if (Math.abs(maxZ - size.z / 2) > touch) errors.push("does not reach the output face");
  if (Math.abs(minY) > touch) errors.push("does not sit on the foundation");
  if (Math.abs(maxY - size.y) > touch) errors.push("does not reach the wiki height");
  return errors;
}

/** Smelter: low front maw, tall rear tower. Footprint 5 × 10 × 8.5. */
export const SMELTER_PARTS: SolidPart[] = [
  { size: [5, 0.35, 10], center: [0, 0.175, 0], material: "dark" },
  { size: [0.55, 0.5, 1.2], center: [-1.85, 0.25, -4.15], material: "dark" },
  { size: [0.55, 0.5, 1.2], center: [1.85, 0.25, -4.15], material: "dark" },
  { size: [0.55, 0.5, 1.2], center: [-1.85, 0.25, 4.15], material: "dark" },
  { size: [0.55, 0.5, 1.2], center: [1.85, 0.25, 4.15], material: "dark" },
  { size: [3.4, 0.14, 0.16], center: [0, 0.32, -4.91], material: "hazard" },
  { size: [4.35, 3.55, 3.5], center: [0, 2.15, -2.85], material: "body" },
  { size: [2.35, 1.85, 0.2], center: [0, 1.5, -4.9], material: "port" },
  { size: [2.75, 0.16, 0.16], center: [0, 2.55, -4.91], material: "orange" },
  { size: [2.75, 0.16, 0.16], center: [0, 0.52, -4.91], material: "orange" },
  { size: [0.16, 2.15, 0.16], center: [-1.3, 1.52, -4.91], material: "orange" },
  { size: [0.16, 2.15, 0.16], center: [1.3, 1.52, -4.91], material: "orange" },
  { size: [4.5, 4.3, 3.1], center: [0, 2.55, 0.35], material: "steel" },
  { size: [0.16, 2.5, 2.1], center: [-2.25, 3.15, 0.25], material: "orange" },
  { size: [0.16, 2.5, 2.1], center: [2.25, 3.15, 0.25], material: "orange" },
  { size: [2.55, 6.15, 3.15], center: [0.1, 3.55, 2.9], material: "body" },
  { size: [1.35, 3.1, 0.18], center: [0.1, 5.7, 4.5], material: "dark" },
  { size: [0.28, 0.28, 3.6], center: [2.15, 3.55, 0.4], material: "steel" },
  { size: [2.15, 0.4, 2.45], center: [0.1, 8.3, 2.75], material: "dark" },
  { size: [1.35, 1.15, 0.16], center: [0, 1.25, 4.92], material: "port" },
];

/** Constructor: gray core, four posts, orange gantry. Footprint 8 × 10 × 8.5. */
export const CONSTRUCTOR_PARTS: SolidPart[] = [
  { size: [8, 0.4, 10], center: [0, 0.2, 0], material: "dark" },
  { size: [0.7, 0.55, 1.3], center: [-3.35, 0.28, -4.1], material: "dark" },
  { size: [0.7, 0.55, 1.3], center: [3.35, 0.28, -4.1], material: "dark" },
  { size: [0.7, 0.55, 1.3], center: [-3.35, 0.28, 4.1], material: "dark" },
  { size: [0.7, 0.55, 1.3], center: [3.35, 0.28, 4.1], material: "dark" },
  { size: [5.6, 0.14, 0.14], center: [0, 0.36, -4.92], material: "hazard" },
  { size: [5.1, 3.55, 6.6], center: [0, 2.2, -0.55], material: "steel" },
  { size: [2.45, 2.05, 0.18], center: [0, 1.65, -4.91], material: "port" },
  { size: [1.25, 2.55, 2.3], center: [-2.95, 2.25, -1.15], material: "orange" },
  { size: [1.25, 2.55, 2.3], center: [2.95, 2.25, -1.15], material: "orange" },
  { size: [0.62, 2.25, 0.62], center: [-1.65, 5.1, -1.45], material: "steel" },
  { size: [0.62, 2.25, 0.62], center: [1.65, 5.1, -1.45], material: "steel" },
  { size: [0.62, 2.25, 0.62], center: [-1.65, 5.1, 1.25], material: "steel" },
  { size: [0.62, 2.25, 0.62], center: [1.65, 5.1, 1.25], material: "steel" },
  { size: [6.5, 1.3, 7.2], center: [0, 6.8, 0.1], material: "orange" },
  { size: [5.8, 0.28, 6.4], center: [0, 7.55, 0.15], material: "dark" },
  { size: [4.6, 0.36, 5], center: [0, 8.32, 0.2], material: "body" },
  { size: [0.32, 1.35, 0.32], center: [2.55, 7.55, 3.35], material: "dark" },
  { size: [1.5, 1.2, 0.16], center: [0, 1.45, 4.92], material: "port" },
];

/** 4 × 4 × 1 splitter. Arrow on the top points toward +x (down the manifold). */
export const SPLITTER_PARTS: SolidPart[] = [
  { size: [4, 0.72, 4], center: [0, 0.36, 0], material: "splitter" },
  { size: [3.15, 0.16, 3.15], center: [0, 0.8, 0], material: "dark" },
  { size: [1.5, 0.08, 0.42], center: [0.1, 0.96, 0], material: "splitter" },
  { size: [0.42, 0.08, 0.85], center: [0.55, 0.96, 0], material: "splitter" },
];

/**
 * Smart splitter, same 4 × 4 × 1 envelope as the conveyor splitter.
 * Wiki: orange top, one input, three outputs. The mesh is rotated in the
 * view so the arrow points at the overflow output.
 */
export const SMART_SPLITTER_PARTS: SolidPart[] = [
  { size: [4, 0.72, 4], center: [0, 0.36, 0], material: "splitter" },
  { size: [3.15, 0.16, 3.15], center: [0, 0.8, 0], material: "orange" },
  { size: [2.4, 0.08, 2.4], center: [0, 0.92, 0], material: "dark" },
  { size: [1.5, 0.08, 0.42], center: [0.1, 0.96, 0], material: "orange" },
  { size: [0.42, 0.08, 0.85], center: [0.55, 0.96, 0], material: "orange" },
];

/** Same envelope as a splitter. Arrow points toward -x, back to the feed end. */
export const MERGER_PARTS: SolidPart[] = [
  { size: [4, 0.72, 4], center: [0, 0.36, 0], material: "splitter" },
  { size: [3.15, 0.16, 3.15], center: [0, 0.8, 0], material: "dark" },
  { size: [1.5, 0.08, 0.42], center: [-0.1, 0.96, 0], material: "splitter" },
  { size: [0.42, 0.08, 0.85], center: [-0.55, 0.96, 0], material: "splitter" },
];

/**
 * Storage Container. Footprint 5 × 11 × 4, length along z, port on each end.
 * https://satisfactory.wiki.gg/wiki/Storage_Container
 */
export const STORAGE_CONTAINER_PARTS: SolidPart[] = [
  { size: [5, 0.35, 11], center: [0, 0.175, 0], material: "dark" },
  { size: [4.6, 2.7, 10.6], center: [0, 1.7, 0], material: "splitter" },
  { size: [5, 0.45, 11], center: [0, 3.775, 0], material: "dark" },
  { size: [4.3, 0.16, 10.2], center: [0, 1.15, 0], material: "dark" },
  { size: [4.3, 0.16, 10.2], center: [0, 2.15, 0], material: "dark" },
  { size: [4.3, 0.16, 10.2], center: [0, 3.05, 0], material: "dark" },
  { size: [0.22, 2.4, 0.22], center: [-2.15, 1.7, -5.15], material: "steel" },
  { size: [0.22, 2.4, 0.22], center: [2.15, 1.7, -5.15], material: "steel" },
  { size: [0.22, 2.4, 0.22], center: [-2.15, 1.7, 5.15], material: "steel" },
  { size: [0.22, 2.4, 0.22], center: [2.15, 1.7, 5.15], material: "steel" },
  { size: [1.6, 1.15, 0.12], center: [0, 1.15, -5.44], material: "port" },
  { size: [1.6, 1.15, 0.12], center: [0, 1.15, 5.44], material: "port" },
];

/**
 * AWESOME Sink. Footprint 16 × 13 × 24. Input on the -z face (the 16 m side).
 * https://satisfactory.wiki.gg/wiki/AWESOME_Sink
 */
export const AWESOME_SINK_PARTS: SolidPart[] = [
  { size: [16, 0.8, 13], center: [0, 0.4, 0], material: "dark" },
  { size: [14.5, 6.5, 10.5], center: [0, 4.05, -0.4], material: "steel" },
  { size: [10, 3.4, 1.6], center: [0, 2.3, -5.7], material: "body" },
  { size: [2.4, 1.7, 0.2], center: [0, 1.45, -6.4], material: "port" },
  { size: [12, 0.35, 0.2], center: [0, 3.7, -6.4], material: "orange" },
  { size: [1.1, 14, 12.2], center: [-7.45, 7.4, 0.2], material: "body" },
  { size: [1.1, 14, 12.2], center: [7.45, 7.4, 0.2], material: "body" },
  { size: [8.5, 24, 3.2], center: [0, 12, 4.9], material: "steel" },
  { size: [6.4, 8, 2.4], center: [0, 16, 4.6], material: "dark" },
  { size: [7.2, 0.45, 0.25], center: [0, 18.5, 6.2], material: "orange" },
  { size: [7.2, 0.45, 0.25], center: [0, 10.5, 6.2], material: "orange" },
  { size: [5.5, 1.4, 2.6], center: [0, 22.6, 4.8], material: "body" },
  { size: [3.2, 0.7, 1.6], center: [0, 23.65, 4.9], material: "orange" },
];

/**
 * Industrial storage, length along x. Footprint 11 × 5 × 8.
 * End ports are centered on the ±x faces. Their center is 1.15 m above the base,
 * and the opening is wide enough for the 2 m belt.
 */
export const INDUSTRIAL_PORT_Y = 1.15;

export const BUFFER_PARTS: SolidPart[] = [
  { size: [11, 7.2, 5], center: [0, 3.6, 0], material: "splitter" },
  { size: [11, 0.45, 5], center: [0, 7.775, 0], material: "dark" },
  { size: [10.2, 0.28, 4.55], center: [0, 2.15, 0], material: "dark" },
  { size: [10.2, 0.28, 4.55], center: [0, 4.35, 0], material: "dark" },
  { size: [10.2, 0.28, 4.55], center: [0, 6.2, 0], material: "dark" },
  { size: [0.08, 1.5, 2.2], center: [-5.46, INDUSTRIAL_PORT_Y, 0], material: "port" },
  { size: [0.08, 1.5, 2.2], center: [5.46, INDUSTRIAL_PORT_Y, 0], material: "port" },
];
