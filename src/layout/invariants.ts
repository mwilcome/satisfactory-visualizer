import { BUILDINGS, FOUNDATION_HEIGHT_M, FOUNDATION_SIZE_M, LIFT, RECIPES } from "../data/catalog";
import { SURPLUS_EPSILON } from "../solve/chain";
import { beltAabb, overlaps, rampAabb, solidAabb } from "./aabb";
import type { Aabb, Plant, Solid } from "./types";

const TILE = FOUNDATION_SIZE_M;

/** Layout rules for a doc manifold. Empty list means the plant is valid. */
export function layoutIssues(plant: Plant): string[] {
  const issues: string[] = [];
  const { plan } = plant;

  if (!plant.dedicatedNodes) issues.push("ore input must be a dedicated belt, not a siphon");
  if (plan.blockedReason) issues.push(plan.blockedReason);
  if (plan.stages.length < 2) issues.push("need at least a smelting stage and a constructor stage");
  if (plant.floors.length !== plan.stages.length || plant.rows.length !== plan.stages.length) {
    issues.push("floors and rows do not match the chain");
  }

  for (let index = 0; index < plan.stages.length; index += 1) {
    const stage = plan.stages[index];
    if (!stage) continue;
    const recipe = RECIPES[stage.recipeId];
    const input = recipe.inputs[0];
    const output = recipe.outputs[0];
    if (!input || !output) {
      issues.push(`${stage.recipeId} is missing a stack`);
      continue;
    }
    if (stage.machines < 1) issues.push(`${stage.recipeId} has no machines`);
    if (Math.abs(stage.outputPerMin - stage.machines * output.perMin) > 1e-6) {
      issues.push(`${stage.recipeId} output is not machines × ${output.perMin}`);
    }
    if (Math.abs(stage.inputPerMin - stage.machines * input.perMin) > 1e-6) {
      issues.push(`${stage.recipeId} input is not machines × ${input.perMin}`);
    }
    if (stage.outputPerMin > plan.beltPerMin + 1e-6) issues.push(`${stage.recipeId} output exceeds the belt`);
    if (stage.inputPerMin > plan.beltPerMin + 1e-6) issues.push(`${stage.recipeId} input exceeds the belt`);
    const next = plan.stages[index + 1];
    if (next && stage.outputPerMin + 1e-6 < next.inputPerMin && !next.underfedNote) {
      issues.push(`${stage.recipeId} does not feed ${next.recipeId}`);
    }
    if (stage.underfedNote) {
      const prev = plan.stages[index - 1];
      if (!prev || prev.outputPerMin + SURPLUS_EPSILON >= stage.inputPerMin) {
        issues.push(`${stage.recipeId} is marked underfed but supply covers it`);
      }
      if (!plant.labels.some((label) => label.id === `${stage.recipeId}-underfed`)) {
        issues.push(`${stage.recipeId} underfed note is missing from the plant`);
      }
    }
    const overflow = plant.belts.filter((belt) => belt.role === "overflow-stub" && belt.rowId === stage.recipeId);
    const surplus = next ? stage.outputPerMin - next.inputPerMin : 0;
    const smart = plant.solids.find((solid) => solid.kind === "smartSplitter" && solid.rowId === stage.recipeId);
    const sink = plant.solids.find((solid) => solid.kind === "sink" && solid.rowId === stage.recipeId);
    const bank = plant.solids.find((solid) => solid.kind === "bank" && solid.rowId === stage.recipeId);
    if (surplus > SURPLUS_EPSILON) {
      if (overflow.length < 1) issues.push(`${stage.recipeId} surplus has no overflow belts`);
      for (const belt of overflow) {
        if (output && belt.itemId !== output.itemId) issues.push(`${belt.id} is not the surplus item`);
        if (Math.abs(belt.designPerMin - surplus) > 1e-6) issues.push(`${belt.id} is not the surplus rate`);
      }
      if (!smart || !sink || !bank) issues.push(`${stage.recipeId} overflow path is missing a building`);
      if (smart && sink && !(sink.base.z > smart.base.z)) issues.push(`${stage.recipeId} sink is not after the splitter`);
      if (sink && bank && !(bank.base.z > sink.base.z + sink.size.z / 2)) {
        issues.push(`${stage.recipeId} bank is not after the sink`);
      }
      const sinkBox = BUILDINGS.awesomeSink;
      const bankBox = BUILDINGS.storageContainer;
      if (sink && (sink.size.x !== sinkBox.width || sink.size.y !== sinkBox.height || sink.size.z !== sinkBox.length)) {
        issues.push(`${stage.recipeId} sink is not the wiki footprint`);
      }
      if (bank && (bank.size.x !== bankBox.width || bank.size.y !== bankBox.height || bank.size.z !== bankBox.length)) {
        issues.push(`${stage.recipeId} bank is not the storage container footprint`);
      }
      if (smart && (smart.size.x !== 4 || smart.size.y !== 1 || smart.size.z !== 4)) {
        issues.push(`${stage.recipeId} smart splitter is not 4×4×1`);
      }
    } else if (overflow.length > 0 || smart || sink || bank) {
      issues.push(`${stage.recipeId} has an overflow path without surplus`);
    }
  }

  const lower = plant.floors[0];
  const upper = plant.floors[plant.floors.length - 1];
  if (!lower || !upper) return issues;
  for (const floor of plant.floors) {
    if (floor.foundationHeightM !== 1) issues.push(`${floor.id} foundation is not 1 m`);
    if (floor.heightClearanceM !== 12 || floor.wallCount !== 3 || floor.storyKind !== "production") {
      issues.push(`${floor.id} is not a 3-wall production story`);
    }
  }
  for (let index = 1; index < plant.floors.length; index += 1) {
    const below = plant.floors[index - 1];
    const above = plant.floors[index];
    if (below && above && above.z - below.z !== 12) issues.push("floor pitch is not 12 m");
  }

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
    const expected = plan.stages.find((stage) => stage.recipeId === row.id)?.machines;
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
  const stories = Math.max(0, plant.floors.length - 1) * 12;
  if (Math.abs(rise - stories) > 1e-6) issues.push("ramp does not climb the full story");
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

  const blockers: Solid["kind"][] = ["machine", "splitter", "merger", "buffer", "lift", "smartSplitter", "sink", "bank"];
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

  for (const solid of plant.solids) {
    if (solid.kind !== "smartSplitter" && solid.kind !== "sink" && solid.kind !== "bank") continue;
    const box = solidAabb(solid);
    for (const belt of plant.belts) {
      if (overlaps(box, beltAabb(belt))) issues.push(`${belt.id} intersects ${solid.id}`);
    }
    for (const other of plant.solids) {
      if (other.id === solid.id || other.kind === "foundation" || other.kind === "support") continue;
      if (overlaps(box, solidAabb(other))) issues.push(`${solid.id} overlaps ${other.id}`);
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

  if (plant.solids.some((solid) => solid.buildingId === "foundry")) issues.push("foundry was placed");
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
