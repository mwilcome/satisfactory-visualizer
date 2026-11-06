import { BUILDINGS, FOUNDATION_HEIGHT_M, FOUNDATION_SIZE_M, INPUT_LANE_RISE_M, LIFT, RECIPES, inputLaneOutboardM } from "../data/catalog";
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
  if (plan.stages.length < 1) issues.push("plant has no stages");
  if (plant.floors.length !== plan.stages.length || plant.rows.length !== plan.stages.length) {
    issues.push("floors and rows do not match the chain");
  }

  for (let index = 0; index < plan.stages.length; index += 1) {
    const stage = plan.stages[index];
    if (!stage) continue;
    const recipe = RECIPES[stage.recipeId];
    const output = recipe.outputs[0];
    if (!output || recipe.inputs.length < 1 || recipe.outputs.length !== 1) {
      issues.push(`${stage.stageId} is missing a stack`);
      continue;
    }
    if (stage.machines < 1) issues.push(`${stage.stageId} has no machines`);
    if (Math.abs(stage.outputPerMin - stage.machines * output.perMin) > 1e-6) {
      issues.push(`${stage.stageId} output is not machines × ${output.perMin}`);
    }
    if (stage.inputsPerMin.length !== recipe.inputs.length) issues.push(`${stage.stageId} input lanes drifted`);
    for (const [slot, input] of recipe.inputs.entries()) {
      const actual = stage.inputsPerMin[slot] ?? -1;
      if (Math.abs(actual - stage.machines * input.perMin) > 1e-6) {
        issues.push(`${stage.stageId} input ${slot} is not machines × ${input.perMin}`);
      }
      if (actual > plan.beltPerMin + 1e-6) issues.push(`${stage.stageId} input exceeds the belt`);
    }
    if (Math.abs(stage.inputPerMin - (stage.inputsPerMin[0] ?? 0)) > 1e-6) {
      issues.push(`${stage.stageId} input total drifted`);
    }
    if (stage.outputPerMin > plan.beltPerMin + 1e-6) issues.push(`${stage.stageId} output exceeds the belt`);
    for (const consumer of plan.stages) {
      consumer.inputFrom.forEach((source, slot) => {
        if (source !== index) return;
        const need = consumer.inputsPerMin[slot] ?? 0;
        if (stage.outputPerMin + 1e-6 < need && !consumer.underfedNote) {
          issues.push(`${stage.stageId} does not feed ${consumer.stageId}`);
        }
      });
    }
    if (stage.underfedNote) {
      const short = stage.inputFrom.some((source, slot) => {
        if (source === "feed") return false;
        const upstream = plan.stages[source];
        const need = stage.inputsPerMin[slot] ?? 0;
        return !upstream || upstream.outputPerMin + SURPLUS_EPSILON < need;
      });
      if (!short) issues.push(`${stage.stageId} is marked underfed but supply covers it`);
      if (!plant.labels.some((label) => label.id === `${stage.stageId}-underfed`)) {
        issues.push(`${stage.stageId} underfed note is missing from the plant`);
      }
    }
    const overflow = plant.belts.filter((belt) => belt.role === "overflow-stub" && belt.rowId === stage.stageId);
    const expectedSurplus =
      stage.drawnPerMin > SURPLUS_EPSILON && stage.outputPerMin > stage.drawnPerMin + SURPLUS_EPSILON
        ? stage.outputPerMin - stage.drawnPerMin
        : 0;
    if (Math.abs(stage.surplusPerMin - expectedSurplus) > 1e-6) issues.push(`${stage.stageId} surplus drifted`);
    const surplus = stage.surplusPerMin;
    const smart = plant.solids.find((solid) => solid.kind === "smartSplitter" && solid.rowId === stage.stageId);
    const sink = plant.solids.find((solid) => solid.kind === "sink" && solid.rowId === stage.stageId);
    const bank = plant.solids.find((solid) => solid.kind === "bank" && solid.rowId === stage.stageId);
    if (surplus > SURPLUS_EPSILON) {
      if (overflow.length < 1) issues.push(`${stage.stageId} surplus has no overflow belts`);
      for (const belt of overflow) {
        if (output && belt.itemId !== output.itemId) issues.push(`${belt.id} is not the surplus item`);
        if (Math.abs(belt.designPerMin - surplus) > 1e-6) issues.push(`${belt.id} is not the surplus rate`);
      }
      if (!smart || !bank) issues.push(`${stage.stageId} overflow path is missing a building`);
      if (plant.solids.some((solid) => solid.kind === "sink" && solid.rowId === stage.stageId)) {
        issues.push(`${stage.stageId} draws an Awesome Sink`);
      }
      const row = plant.rows.find((item) => item.id === stage.stageId);
      if (smart && smart.base.x >= plant.feedEndX) issues.push(`${stage.stageId} smart splitter is not at the feed end`);
      if (smart && row && smart.base.x > row.feedEndX) issues.push(`${stage.stageId} smart splitter is on the open end`);
      const overflowBelt = overflow.find((belt) => belt.id.endsWith("overflow-to-sink"));
      if (!overflowBelt) issues.push(`${stage.stageId} has no overflow out belt`);
      if (overflowBelt && smart) {
        if (Math.abs(overflowBelt.from.x - overflowBelt.to.x) > 1e-6 || Math.abs(overflowBelt.from.x - smart.base.x) > 1e-6) {
          issues.push(`${stage.stageId} overflow belt is not a straight side output`);
        }
        const endZ = Math.max(overflowBelt.from.z, overflowBelt.to.z);
        if (endZ < 40 - 1e-6) issues.push(`${stage.stageId} overflow belt does not leave the factory`);
      }
      if (
        !plant.labels.some(
          (label) => label.id === `${stage.stageId}-overflow-label` && label.text === "Overflow out (to sink)",
        )
      ) {
        issues.push(`${stage.stageId} overflow label is missing`);
      }
      const bankBox = BUILDINGS.storageIndustrial;
      if (bank && (bank.size.x !== bankBox.length || bank.size.y !== bankBox.height || bank.size.z !== bankBox.width)) {
        issues.push(`${stage.stageId} bank is not the industrial storage footprint`);
      }
      if (smart && (smart.size.x !== 4 || smart.size.y !== 1 || smart.size.z !== 4)) {
        issues.push(`${stage.stageId} smart splitter is not 4×4×1`);
      }
    } else if (overflow.length > 0 || smart || sink || bank) {
      issues.push(`${stage.stageId} has an overflow path without surplus`);
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
    if (solid.kind === "buffer" || solid.kind === "bank") {
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
    const stage = plan.stages.find((item) => item.stageId === row.id);
    const recipe = stage ? RECIPES[stage.recipeId] : undefined;
    const inputCount = recipe?.inputs.length ?? 1;
    const outputCount = recipe?.outputs.length ?? 1;
    if (machines.length !== row.machineCount) issues.push(`${row.id} machine count drifted`);
    if (splitters.length !== machines.length * inputCount || mergers.length !== machines.length * outputCount) {
      issues.push(`${row.id} is not one splitter per input and one merger per output`);
    }
    if (outputCount !== 1) issues.push(`${row.id} has more than one output`);
    if (machines.length !== stage?.machines) issues.push(`${row.id} does not match the belt-limited plan`);

    for (const machine of machines) {
      if (machine.clock !== 100) issues.push(`${machine.id} is not at 100%`);
      if (
        machine.buildingId !== "smelter" &&
        machine.buildingId !== "constructor" &&
        machine.buildingId !== "assembler" &&
        machine.buildingId !== "foundry"
      ) {
        issues.push(`${machine.id} is an unexpected building`);
        continue;
      }
      const spec = BUILDINGS[machine.buildingId];
      if (machine.size.x !== spec.width || machine.size.y !== spec.height || machine.size.z !== spec.length) {
        issues.push(`${machine.id} does not match the wiki footprint`);
      }
      if (spec.height > 12 - FOUNDATION_HEIGHT_M) issues.push(`${machine.id} does not fit the story`);
      const laneSplitters = splitters.filter((item) => item.rowIndex === machine.rowIndex);
      const merger = mergers.find((item) => item.rowIndex === machine.rowIndex);
      if (laneSplitters.length !== inputCount || !merger) {
        issues.push(`${machine.id} is missing a manifold pair`);
        continue;
      }
      const machineIn = machine.base.z - machine.size.z / 2;
      const machineOut = machine.base.z + machine.size.z / 2;
      const padOut = merger.base.z - merger.size.z / 2 - machineOut;
      if (Math.abs(padOut - 1) > 1e-6) issues.push(`${machine.id} output pad is not 1 m`);
      for (const splitter of laneSplitters) {
        const lane = splitter.lane ?? 0;
        const padIn = machineIn - (splitter.base.z + splitter.size.z / 2);
        const outboard = inputLaneOutboardM(lane, inputCount);
        if (Math.abs(padIn - (1 + outboard)) > 1e-6) issues.push(`${machine.id} lane ${lane} pad is not ${1 + outboard} m`);
        if (Math.abs(splitter.base.y - (machine.base.y + lane * INPUT_LANE_RISE_M)) > 1e-6) {
          issues.push(`${machine.id} lane ${lane} is not ${lane * INPUT_LANE_RISE_M} m above the floor`);
        }
        if (!(splitter.base.z < machine.base.z && machine.base.z < merger.base.z)) {
          issues.push(`${machine.id} does not face input on -z and output on +z`);
        }
      }
      if (inputCount > 1) {
        const ordered = [...laneSplitters].sort((a, b) => (a.lane ?? 0) - (b.lane ?? 0));
        for (let lane = 0; lane < ordered.length; lane += 1) {
          for (let other = lane + 1; other < ordered.length; other += 1) {
            const a = ordered[lane];
            const b = ordered[other];
            if (!a || !b) continue;
            if (Math.abs(a.base.x - b.base.x) < 1e-6 && Math.abs(a.base.z - b.base.z) < 1e-6) {
              issues.push(`${machine.id} stacks input splitters`);
            }
            const nudge = Math.abs((a.lane ?? 0) - (b.lane ?? 0)) * 1;
            if (Math.abs(Math.abs(a.base.z - b.base.z) - nudge) > 1e-6) {
              issues.push(`${machine.id} stair nudge is not 1 m`);
            }
            const span = {
              min: {
                x: Math.min(a.base.x, b.base.x) - a.size.x / 2,
                y: Math.min(a.base.y, b.base.y),
                z: Math.min(a.base.z, b.base.z),
              },
              max: {
                x: Math.max(a.base.x, b.base.x) + a.size.x / 2,
                y: Math.max(a.base.y + a.size.y, b.base.y + b.size.y),
                z: Math.max(a.base.z, b.base.z),
              },
            };
            for (const lift of plant.solids) {
              if (lift.kind === "lift" && overlaps(span, solidAabb(lift))) {
                issues.push(`${lift.id} is a lift between ${machine.id} input splitters`);
              }
            }
          }
        }
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

    const stubs = plant.belts.filter((belt) => belt.role === "grow-stub" && belt.rowId === row.id);
    if (stubs.length !== inputCount) issues.push(`${row.id} has no grow stub`);
    for (const stub of stubs) {
      if (Math.max(stub.from.x, stub.to.x) <= row.openEndX) issues.push(`${row.id} stub does not enter the open end`);
    }

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

  if (plant.floors.length > 1 && !plant.ramps.some((ramp) => ramp.kind === "rise")) {
    issues.push("missing the feed-end ramp");
  }
  let rise = 0;
  for (const ramp of plant.ramps) {
    const run = Math.hypot(ramp.to.x - ramp.from.x, ramp.to.z - ramp.from.z);
    const climbed = ramp.to.y - ramp.from.y;
    if (ramp.kind === "landing") {
      if (Math.abs(climbed) > 1e-6 || run < 4 - 1e-6) issues.push(`${ramp.id} landing is not flat`);
    } else if (Math.abs(run - 4) > 1e-6 || Math.abs(climbed - 2) > 1e-6) {
      issues.push(`${ramp.id} is not a 4 m / 2 m ramp`);
    } else {
      rise += climbed;
    }
    if (ramp.width !== 4) issues.push(`${ramp.id} is not a 4 m walkway`);
    if (Math.max(ramp.from.x, ramp.to.x) > plant.feedEndX + 1e-6) issues.push(`${ramp.id} leaves the feed end`);
  }
  const stories = Math.max(0, plant.floors.length - 1) * 12;
  if (Math.abs(rise - stories) > 1e-6) issues.push("ramp does not climb the full story");
  for (const ramp of plant.ramps) {
    const box = rampAabb(ramp);
    for (const solid of plant.solids) {
      if (solid.kind === "foundation" && overlaps(box, solidAabb(solid))) {
        issues.push(`${ramp.id} cuts through ${solid.id}`);
      }
    }
  }
  issues.push(...rampAccessIssues(plant));
  for (const ramp of plant.ramps) {
    for (const belt of plant.belts) {
      if (overlaps(rampAabb(ramp), beltAabb(belt))) issues.push(`${ramp.id} blocks ${belt.id}`);
    }
  }

  for (const solid of plant.solids) {
    if (solid.kind !== "lift" && solid.kind !== "buffer" && solid.kind !== "bank" && solid.kind !== "smartSplitter" && solid.kind !== "sink") continue;
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

  if (plant.belts.some((belt) => belt.mk !== plan.beltMk)) issues.push("belt mark drifted");

  return issues;
}

/** Every production floor can be walked from the ground floor: ramp, landing, then slab. */
function rampAccessIssues(plant: Plant): string[] {
  if (plant.floors.length < 2) return [];
  const issues: string[] = [];
  const foundations = plant.solids.filter((solid) => solid.kind === "foundation");
  const reached = new Set<string>();
  const queue: string[] = [];
  const ground = plant.floors[0];
  if (!ground) return ["ramp has no ground floor"];
  for (const solid of foundations) {
    if (solid.base.y + solid.size.y !== ground.z + ground.foundationHeightM) continue;
    reached.add(solid.id);
    queue.push(solid.id);
  }
  const usedRamps = new Set<string>();
  let guard = 0;
  while (queue.length > 0 && guard < 10000) {
    guard += 1;
    const id = queue.shift();
    const solid = foundations.find((item) => item.id === id);
    if (!solid) continue;
    const top = solid.base.y + solid.size.y;
    for (const other of foundations) {
      if (reached.has(other.id)) continue;
      if (Math.abs(other.base.y + other.size.y - top) > 1e-6) continue;
      if (!sharesEdge(solid, other)) continue;
      reached.add(other.id);
      queue.push(other.id);
    }
    for (const ramp of plant.ramps) {
      if (usedRamps.has(ramp.id)) continue;
      const starts = pointOnFoundation(ramp.from, solid);
      if (starts && Math.abs(ramp.from.y - top) < 1e-4) {
        const landed = foundations.find(
          (item) => !reached.has(item.id) && pointOnFoundation(ramp.to, item) && Math.abs(item.base.y + item.size.y - ramp.to.y) < 1e-4,
        );
        usedRamps.add(ramp.id);
        if (landed) {
          reached.add(landed.id);
          queue.push(landed.id);
        }
      }
    }
  }

  // Landings are not on a slab. Walk ramp-to-ramp, then onto a slab.
  let grew = true;
  while (grew) {
    grew = false;
    for (const ramp of plant.ramps) {
      if (usedRamps.has(ramp.id)) continue;
      const fromReached = endpointReached(ramp.from, foundations, reached, plant.ramps, usedRamps);
      if (!fromReached) continue;
      usedRamps.add(ramp.id);
      grew = true;
      for (const solid of foundations) {
        if (reached.has(solid.id)) continue;
        if (pointOnFoundation(ramp.to, solid) && Math.abs(solid.base.y + solid.size.y - ramp.to.y) < 1e-4) {
          reached.add(solid.id);
          queue.push(solid.id);
        }
      }
    }
    while (queue.length > 0) {
      const id = queue.shift();
      const solid = foundations.find((item) => item.id === id);
      if (!solid) continue;
      const top = solid.base.y + solid.size.y;
      for (const other of foundations) {
        if (reached.has(other.id)) continue;
        if (Math.abs(other.base.y + other.size.y - top) > 1e-6) continue;
        if (!sharesEdge(solid, other)) continue;
        reached.add(other.id);
        queue.push(other.id);
        grew = true;
      }
    }
  }

  for (const floor of plant.floors) {
    const walk = floor.z + floor.foundationHeightM;
    const onFloor = foundations.filter((solid) => Math.abs(solid.base.y + solid.size.y - walk) < 1e-6);
    if (onFloor.length === 0) {
      issues.push(`${floor.id} has no walk surface`);
      continue;
    }
    const besideMachines = onFloor.filter((solid) => solid.base.x > 0);
    if (!besideMachines.some((solid) => reached.has(solid.id))) {
      issues.push(`${floor.id} cannot be reached from the ground floor`);
    }
  }
  return issues;
}

function sharesEdge(a: Solid, b: Solid): boolean {
  const ax0 = a.base.x - a.size.x / 2;
  const ax1 = a.base.x + a.size.x / 2;
  const az0 = a.base.z - a.size.z / 2;
  const az1 = a.base.z + a.size.z / 2;
  const bx0 = b.base.x - b.size.x / 2;
  const bx1 = b.base.x + b.size.x / 2;
  const bz0 = b.base.z - b.size.z / 2;
  const bz1 = b.base.z + b.size.z / 2;
  const xTouch = Math.abs(ax1 - bx0) < 1e-4 || Math.abs(bx1 - ax0) < 1e-4;
  const zTouch = Math.abs(az1 - bz0) < 1e-4 || Math.abs(bz1 - az0) < 1e-4;
  const xOverlap = ax0 < bx1 - 1e-4 && ax1 > bx0 + 1e-4;
  const zOverlap = az0 < bz1 - 1e-4 && az1 > bz0 + 1e-4;
  return (xTouch && zOverlap) || (zTouch && xOverlap);
}

function pointOnFoundation(point: { x: number; y: number; z: number }, solid: Solid): boolean {
  const top = solid.base.y + solid.size.y;
  if (Math.abs(point.y - top) > 1e-4) return false;
  const x0 = solid.base.x - solid.size.x / 2;
  const x1 = solid.base.x + solid.size.x / 2;
  const z0 = solid.base.z - solid.size.z / 2;
  const z1 = solid.base.z + solid.size.z / 2;
  return point.x >= x0 - 1e-4 && point.x <= x1 + 1e-4 && point.z >= z0 - 1e-4 && point.z <= z1 + 1e-4;
}

function endpointReached(
  point: { x: number; y: number; z: number },
  foundations: Solid[],
  reached: Set<string>,
  ramps: Plant["ramps"],
  used: Set<string>,
): boolean {
  if (foundations.some((solid) => reached.has(solid.id) && pointOnFoundation(point, solid))) return true;
  return ramps.some((ramp) => used.has(ramp.id) && (samePoint(point, ramp.from) || samePoint(point, ramp.to)));
}

function samePoint(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): boolean {
  return Math.abs(a.x - b.x) < 1e-4 && Math.abs(a.y - b.y) < 1e-4 && Math.abs(a.z - b.z) < 1e-4;
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
