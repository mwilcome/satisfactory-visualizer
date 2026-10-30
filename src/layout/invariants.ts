import { BUILDINGS, FOUNDATION_HEIGHT_M, FOUNDATION_SIZE_M, LIFT } from "../data/catalog";
import { beltAabb, overlaps, rampAabb, solidAabb } from "./aabb";
import type { Aabb, Plant, Solid } from "./types";

const TILE = FOUNDATION_SIZE_M;

/** Layout rules for the v1 screw plant. Empty list means the plant is valid. */
export function layoutIssues(plant: Plant): string[] {
  const issues: string[] = [];
  const { plan } = plant;

  if (!plant.dedicatedNodes) issues.push("ore input must be a dedicated belt, not a siphon");
  if (plan.constructors < 1 || plan.smelters < 1) issues.push("need at least one smelter and constructor");
  if (plan.screwsPerMin !== plan.constructors * 50) issues.push("screw total is not constructors × 50");
  if (Math.abs(plan.ingotsConsumedPerMin - plan.constructors * 12.5) > 1e-6) {
    issues.push("ingot demand is not constructors × 12.5");
  }
  if (plan.ingotsProducedPerMin !== plan.smelters * 30) issues.push("ingot supply is not smelters × 30");
  if (plan.orePerMin !== plan.smelters * 30) issues.push("ore input is not smelters × 30");
  if (plan.ingotSurplusPerMin < -1e-6) issues.push("ingot surplus went negative");
  if (plan.screwsPerMin > plan.beltPerMin + 1e-6) issues.push("screw rate exceeds the belt");
  if (plan.ingotsProducedPerMin > plan.beltPerMin + 1e-6) issues.push("ingot rate exceeds the belt");
  if (plan.orePerMin > plan.beltPerMin + 1e-6) issues.push("ore rate exceeds the belt");

  if (plant.floors.length !== 2) issues.push("expected two floors");
  const [lower, upper] = plant.floors;
  if (!lower || !upper) return issues;
  for (const floor of plant.floors) {
    if (floor.foundationHeightM !== 1) issues.push(`${floor.id} foundation is not 1 m`);
    if (floor.heightClearanceM !== 12 || floor.wallCount !== 3 || floor.storyKind !== "production") {
      issues.push(`${floor.id} is not a 3-wall production story`);
    }
  }
  if (upper.z - lower.z !== 12) issues.push("floor pitch is not 12 m");

  const marks = new Set(plant.belts.map((belt) => belt.mk));
  if (marks.size !== 1 || !marks.has(plan.beltMk)) issues.push("a line mixes belt marks");
  for (const belt of plant.belts) {
    if (belt.designPerMin > plan.beltPerMin + 1e-6) {
      issues.push(`${belt.id} carries ${belt.designPerMin} on a ${plan.beltPerMin} belt`);
    }
    const dx = Math.abs(belt.to.x - belt.from.x);
    const dy = Math.abs(belt.to.y - belt.from.y);
    const dz = Math.abs(belt.to.z - belt.from.z);
    if ([dx, dy, dz].filter((value) => value > 1e-6).length !== 1) issues.push(`${belt.id} is diagonal`);
  }

  for (const solid of plant.solids) {
    if (solid.kind === "foundation") {
      if (solid.size.x !== TILE || solid.size.z !== TILE || solid.size.y !== FOUNDATION_HEIGHT_M) {
        issues.push(`${solid.id} is not an 8×8×1 foundation`);
      }
      if (Math.abs(solid.base.x - TILE / 2) % TILE > 1e-6 || Math.abs(solid.base.z - TILE / 2) % TILE > 1e-6) {
        issues.push(`${solid.id} is off the foundation grid`);
      }
      const floor = plant.floors.find((item) => item.id === solid.floorId);
      if (!floor || solid.base.y !== floor.z) issues.push(`${solid.id} is not on its floor datum`);
    }
    if ((solid.kind === "splitter" || solid.kind === "merger") && (solid.size.x !== 4 || solid.size.y !== 1 || solid.size.z !== 4)) {
      issues.push(`${solid.id} is not a 4×4×1 ${solid.kind}`);
    }
    if (solid.kind === "buffer") {
      const box = BUILDINGS.storageIndustrial;
      if (solid.size.x !== box.length || solid.size.y !== box.height || solid.size.z !== box.width) {
        issues.push("buffer does not match the industrial storage footprint");
      }
    }
    if (solid.kind === "lift" && (solid.size.x !== LIFT.width || solid.size.z !== LIFT.length)) {
      issues.push("lift footprint is not 2×2");
    }
  }

  for (const row of plant.rows) {
    const machines = plant.solids.filter((solid) => solid.kind === "machine" && solid.rowId === row.id);
    const splitters = plant.solids.filter((solid) => solid.kind === "splitter" && solid.rowId === row.id);
    const mergers = plant.solids.filter((solid) => solid.kind === "merger" && solid.rowId === row.id);
    if (machines.length !== row.machineCount) issues.push(`${row.id} machine count drifted`);
    if (splitters.length !== machines.length || mergers.length !== machines.length) {
      issues.push(`${row.id} is not one splitter and one merger per machine`);
    }
    const expected = row.id === "smelt" ? plan.smelters : plan.constructors;
    if (machines.length !== expected) issues.push(`${row.id} does not match the belt-limited plan`);

    for (const machine of machines) {
      if (machine.clock !== 100) issues.push(`${machine.id} is not at 100%`);
      if (machine.buildingId !== "smelter" && machine.buildingId !== "constructor") {
        issues.push(`${machine.id} is an unexpected building`);
        continue;
      }
      const spec = BUILDINGS[machine.buildingId];
      if (machine.size.x !== spec.width || machine.size.y !== spec.height || machine.size.z !== spec.length) {
        issues.push(`${machine.id} does not match the wiki footprint`);
      }
      if (spec.height > 12 - FOUNDATION_HEIGHT_M) issues.push(`${machine.id} does not fit the story`);
      const splitter = splitters.find((item) => item.rowIndex === machine.rowIndex);
      const merger = mergers.find((item) => item.rowIndex === machine.rowIndex);
      if (!splitter || !merger) {
        issues.push(`${machine.id} is missing a manifold pair`);
        continue;
      }
      const machineIn = machine.base.z - machine.size.z / 2;
      const machineOut = machine.base.z + machine.size.z / 2;
      const padIn = machineIn - (splitter.base.z + splitter.size.z / 2);
      const padOut = merger.base.z - merger.size.z / 2 - machineOut;
      if (Math.abs(padIn - 1) > 1e-6 || Math.abs(padOut - 1) > 1e-6) {
        issues.push(`${machine.id} port pad is not 1 m`);
      }
      if (!(splitter.base.z < machine.base.z && machine.base.z < merger.base.z)) {
        issues.push(`${machine.id} does not face input on -z and output on +z`);
      }
      if (machine.base.x < row.feedEndX) issues.push(`${machine.id} sits on the feed apron`);
      const half = machine.size.x / 2;
      if (machine.base.x + half > row.openEndX + 1e-6) issues.push(`${machine.id} crosses the open end`);
    }

    if (machines.length > 1) {
      const ordered = [...machines].sort((a, b) => a.base.x - b.base.x);
      for (let index = 0; index < ordered.length - 1; index += 1) {
        const a = ordered[index];
        const b = ordered[index + 1];
        if (!a || !b) continue;
        const gap = b.base.x - b.size.x / 2 - (a.base.x + a.size.x / 2);
        if (gap < 2 - 1e-6) issues.push(`${row.id} walk gap is ${gap.toFixed(2)} m`);
      }
    }

    const stub = plant.belts.find((belt) => belt.role === "grow-stub" && belt.rowId === row.id);
    if (!stub) issues.push(`${row.id} has no grow stub`);
    else if (Math.max(stub.from.x, stub.to.x) <= row.openEndX) issues.push(`${row.id} stub does not enter the open end`);

    const lastMerger = mergers.reduce<Solid | undefined>(
      (best, merger) => (!best || merger.base.x > best.base.x ? merger : best),
      undefined,
    );
    if (lastMerger) {
      const limitX = lastMerger.base.x + lastMerger.size.x / 2 + 1e-6;
      for (const belt of plant.belts) {
        if (belt.rowId !== row.id) continue;
        if (belt.role !== "output-manifold" && belt.role !== "output-port" && belt.role !== "product-output") continue;
        const maxX = Math.max(belt.from.x, belt.to.x);
        if (maxX > limitX) issues.push(`${belt.id} terminates past the open end of ${row.id}`);
      }
    }

    const stubFoundation = plant.solids.some(
      (solid) =>
        solid.kind === "foundation" &&
        solid.floorId === row.floorId &&
        solid.base.x - solid.size.x / 2 >= row.openEndX - 1e-6,
    );
    if (!stubFoundation) issues.push(`${row.id} has no foundation past the open end`);
  }

  if (plant.ramps.length === 0) issues.push("missing the feed-end ramp");
  let rise = 0;
  for (const ramp of plant.ramps) {
    const run = Math.abs(ramp.to.x - ramp.from.x);
    const climbed = ramp.to.y - ramp.from.y;
    if (Math.abs(run - 4) > 1e-6 || Math.abs(climbed - 2) > 1e-6) issues.push(`${ramp.id} is not a 4 m / 2 m ramp`);
    if (ramp.width !== 4) issues.push(`${ramp.id} is not a 4 m walkway`);
    if (Math.max(ramp.from.x, ramp.to.x) > plant.feedEndX + 1e-6) issues.push(`${ramp.id} leaves the feed end`);
    rise += climbed;
  }
  if (Math.abs(rise - 12) > 1e-6) issues.push("ramp does not climb the full story");
  for (const ramp of plant.ramps) {
    for (const belt of plant.belts) {
      if (overlaps(rampAabb(ramp), beltAabb(belt))) issues.push(`${ramp.id} blocks ${belt.id}`);
    }
  }

  for (const solid of plant.solids) {
    if (solid.kind !== "lift" && solid.kind !== "buffer") continue;
    const box = solidAabb(solid);
    if (box.max.x > plant.feedEndX + 1e-6) issues.push(`${solid.id} is not kept at the feed end`);
    if (box.min.x > rowOpen(plant)) issues.push(`${solid.id} blocks the open end`);
  }

  const lifts = plant.solids.filter((solid) => solid.kind === "lift");
  const manifolds = plant.solids.filter((solid) => solid.kind === "splitter" || solid.kind === "merger");
  for (const lift of lifts) {
    for (const piece of manifolds) {
      if (aabbGap(solidAabb(lift), solidAabb(piece)) < 2 - 1e-6) {
        issues.push(`${lift.id} is glued to ${piece.id}`);
      }
    }
  }

  for (const corridor of plant.walkCorridors) {
    const width = corridor.max.x - corridor.min.x;
    if (width < 2 - 1e-6) issues.push(`${corridor.id} is narrower than 2 m`);
    for (const solid of plant.solids) {
      if (solid.kind === "foundation" || solid.kind === "support") continue;
      if (overlaps(corridor, solidAabb(solid))) issues.push(`${solid.id} blocks ${corridor.id}`);
    }
    for (const belt of plant.belts) {
      if (overlaps(corridor, beltAabb(belt))) issues.push(`${belt.id} blocks ${corridor.id}`);
    }
  }

  const blockers: Solid["kind"][] = ["machine", "splitter", "merger", "buffer", "lift"];
  for (const support of plant.solids.filter((solid) => solid.kind === "support")) {
    const box = solidAabb(support);
    for (const solid of plant.solids) {
      if (solid.id === support.id || solid.kind === "foundation" || solid.kind === "support") continue;
      if (blockers.includes(solid.kind) && overlaps(box, solidAabb(solid))) {
        issues.push(`${support.id} intersects ${solid.id}`);
      }
    }
    for (const belt of plant.belts) {
      if (overlaps(box, beltAabb(belt))) issues.push(`${support.id} intersects ${belt.id}`);
    }
    for (const ramp of plant.ramps) {
      if (overlaps(box, rampAabb(ramp))) issues.push(`${support.id} intersects ${ramp.id}`);
    }
  }

  const machines = plant.solids.filter((solid) => solid.kind === "machine");
  for (let i = 0; i < machines.length; i += 1) {
    for (let j = i + 1; j < machines.length; j += 1) {
      const a = machines[i];
      const b = machines[j];
      if (a && b && overlaps(solidAabb(a), solidAabb(b))) issues.push(`${a.id} overlaps ${b.id}`);
    }
  }

  if (plant.solids.some((solid) => solid.buildingId === "foundry")) issues.push("foundry was placed in the screw demo");
  if (plant.belts.some((belt) => belt.mk !== plan.beltMk)) issues.push("belt mark drifted");

  return issues;
}

function rowOpen(plant: Plant): number {
  return Math.max(...plant.rows.map((row) => row.openEndX));
}

function aabbGap(a: Aabb, b: Aabb): number {
  const dx = Math.max(0, a.min.x - b.max.x, b.min.x - a.max.x);
  const dy = Math.max(0, a.min.y - b.max.y, b.min.y - a.max.y);
  const dz = Math.max(0, a.min.z - b.max.z, b.min.z - a.max.z);
  return Math.hypot(dx, dy, dz);
}
