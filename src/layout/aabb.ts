import type { Aabb, Belt, Ramp, Solid, Vec3 } from "./types";

export function solidAabb(solid: Solid): Aabb {
  return {
    min: {
      x: solid.base.x - solid.size.x / 2,
      y: solid.base.y,
      z: solid.base.z - solid.size.z / 2,
    },
    max: {
      x: solid.base.x + solid.size.x / 2,
      y: solid.base.y + solid.size.y,
      z: solid.base.z + solid.size.z / 2,
    },
  };
}

export function beltAabb(belt: Belt): Aabb {
  const y = belt.from.y;
  const halfH = 0.5;
  const halfW = 1;
  const dx = Math.abs(belt.to.x - belt.from.x);
  const dz = Math.abs(belt.to.z - belt.from.z);
  if (dx >= dz) {
    return {
      min: {
        x: Math.min(belt.from.x, belt.to.x),
        y: y - halfH,
        z: belt.from.z - halfW,
      },
      max: {
        x: Math.max(belt.from.x, belt.to.x),
        y: y + halfH,
        z: belt.from.z + halfW,
      },
    };
  }
  return {
    min: {
      x: belt.from.x - halfW,
      y: y - halfH,
      z: Math.min(belt.from.z, belt.to.z),
    },
    max: {
      x: belt.from.x + halfW,
      y: y + halfH,
      z: Math.max(belt.from.z, belt.to.z),
    },
  };
}

export function rampAabb(ramp: Ramp): Aabb {
  return {
    min: {
      x: Math.min(ramp.from.x, ramp.to.x),
      y: Math.min(ramp.from.y, ramp.to.y),
      z: ramp.from.z - ramp.width / 2,
    },
    max: {
      x: Math.max(ramp.from.x, ramp.to.x),
      y: Math.max(ramp.from.y, ramp.to.y),
      z: ramp.from.z + ramp.width / 2,
    },
  };
}

/** True when the boxes share volume. Face contact is not an overlap. */
export function overlaps(a: Aabb, b: Aabb): boolean {
  return (
    a.min.x < b.max.x &&
    a.max.x > b.min.x &&
    a.min.y < b.max.y &&
    a.max.y > b.min.y &&
    a.min.z < b.max.z &&
    a.max.z > b.min.z
  );
}

export function add(a: Vec3, b: Partial<Vec3>): Vec3 {
  return { x: a.x + (b.x ?? 0), y: a.y + (b.y ?? 0), z: a.z + (b.z ?? 0) };
}
