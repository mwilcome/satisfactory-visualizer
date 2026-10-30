import { ITEMS, RECIPES, beltByMk, machinesPerBelt, type BeltMk, type Recipe, type RecipeId } from "../data/catalog";
import { CHAINS, wiredStages, type ChainId, type InputSource, type WiredStage } from "../data/chains";

/** A stage this close to the next draw is treated as balanced. */
export const SURPLUS_EPSILON = 0.05;

export interface StagePlan {
  stageId: string;
  recipeId: RecipeId;
  machines: number;
  /** One entry per recipe input, in recipe order. machines × that input's rate. */
  inputsPerMin: number[];
  /** First input. Linear chains only have this one. */
  inputPerMin: number;
  outputPerMin: number;
  /** Sum of what downstream stages draw. 0 on the goal stage. */
  drawnPerMin: number;
  /** Extra output after downstream draws. 0 when nothing downstream draws, or when the stage is short. */
  surplusPerMin: number;
  /** Parallel to the recipe inputs. */
  inputFrom: InputSource[];
  /** Set when an upstream stage cannot cover one of this stage's draws. */
  underfedNote: string | null;
}

export interface ChainPlan {
  chainId: ChainId;
  beltMk: BeltMk;
  beltPerMin: number;
  goalItemId: string;
  stages: StagePlan[];
  /** Goal row was shortened because an earlier belt could not fill the output belt. */
  limitNote: string | null;
  /** Not even one goal machine fits on this mark. */
  blockedReason: string | null;
}

interface Counted {
  counts: number[];
  notes: (string | null)[];
  drawn: number[];
}

/**
 * Whole machines at 100%. The belt mark caps every line.
 * The goal row starts at what its own belt can hold, then drops until
 * each earlier row can feed the next one without going over its belt.
 * Surplus backs up in the stage buffer. Clocks are not changed.
 * A feed belt has no upstream machines. Two inputs each take their own source.
 */
export function solveChain(chainId: ChainId, beltMk: BeltMk): ChainPlan {
  const chain = CHAINS[chainId];
  const belt = beltByMk(beltMk);
  const wired = wiredStages(chain);
  const stages = wired.map((stage) => ({ ...stage, recipe: RECIPES[stage.recipeId] }));
  const last = stages.length - 1;
  const goal = stages[last];
  if (!goal) throw new Error(`Chain ${chainId} has no stages.`);
  const goalOutput = goal.recipe.outputs[0];
  if (!goalOutput) throw new Error(`Chain ${chainId} goal has no output.`);

  const cap = stages.map((stage) => machinesPerBelt(stage.recipe, belt.perMin));
  const goalCap = cap[last] ?? 0;
  const empty: ChainPlan = {
    chainId,
    beltMk,
    beltPerMin: belt.perMin,
    goalItemId: goalOutput.itemId,
    stages: [],
    limitNote: null,
    blockedReason: null,
  };

  if (goalCap < 1) {
    const peak = Math.max(...goal.recipe.inputs.map((stack) => stack.perMin), goalOutput.perMin);
    return {
      ...empty,
      blockedReason: `Mk${beltMk} cannot carry one ${goal.recipe.name} machine (${trim(peak)} / min on a ${belt.perMin} belt).`,
    };
  }

  let goalCount = goalCap;
  let counted: Counted | null = null;
  while (goalCount >= 1) {
    counted = propagate(stages, cap, goalCount, "exact");
    if (counted) break;
    goalCount -= 1;
  }

  const underfed = !counted;
  if (!counted) {
    counted = propagate(stages, cap, goalCap, "underfed");
  }
  if (!counted) throw new Error(`Chain ${chainId} has a stage nothing draws.`);

  const built: StagePlan[] = stages.map((stage, index) => {
    const machines = counted?.counts[index] ?? 0;
    const output = stage.recipe.outputs[0];
    const inputsPerMin = stage.recipe.inputs.map((stack) => machines * stack.perMin);
    const outputPerMin = machines * (output?.perMin ?? 0);
    const drawnPerMin = counted?.drawn[index] ?? 0;
    const surplusPerMin =
      drawnPerMin > 0 && outputPerMin > drawnPerMin + SURPLUS_EPSILON ? outputPerMin - drawnPerMin : 0;
    return {
      stageId: stage.id,
      recipeId: stage.recipeId,
      machines,
      inputsPerMin,
      inputPerMin: inputsPerMin[0] ?? 0,
      outputPerMin,
      drawnPerMin,
      surplusPerMin,
      inputFrom: [...stage.from],
      underfedNote: counted?.notes[index] ?? null,
    };
  });

  const placed = built[last]?.machines ?? 0;
  const made = built[last]?.outputPerMin ?? 0;
  const building = goal.recipe.buildingId;
  const noun = buildingName(building, placed);
  return {
    ...empty,
    stages: built,
    limitNote:
      !underfed && placed < goalCap
        ? `Output is belt-limited to ${trim(made)} / min (${placed} ${noun}). The output belt could hold ${goalCap}.`
        : null,
  };
}

function buildingName(buildingId: string, count: number): string {
  if (count === 1) return buildingId;
  if (buildingId === "foundry") return "foundries";
  return `${buildingId}s`;
}

type StageInfo = WiredStage & { recipe: Recipe };

function propagate(
  stages: StageInfo[],
  cap: number[],
  goalCount: number,
  mode: "exact" | "underfed",
): Counted | null {
  const last = stages.length - 1;
  const counts = stages.map(() => 0);
  counts[last] = goalCount;
  const notes = stages.map(() => null as string | null);
  const drawn = stages.map(() => 0);

  for (let index = last; index >= 0; index -= 1) {
    const stage = stages[index];
    if (!stage) return null;
    if (index !== last) {
      const outputRate = stage.recipe.outputs[0]?.perMin ?? 0;
      if (outputRate <= 0) return null;
      const demand = drawn[index] ?? 0;
      const need = Math.ceil(demand / outputRate - 1e-9);
      const upstreamCap = cap[index] ?? 0;
      if (mode === "exact") {
        if (need < 1 || need > upstreamCap) return null;
        counts[index] = need;
      } else if (need < 1) {
        return null;
      } else if (need > upstreamCap) {
        counts[index] = upstreamCap;
        noteShortConsumers(stages, counts, index, upstreamCap * outputRate, notes);
      } else {
        counts[index] = need;
      }
    }

    const machines = counts[index] ?? 0;
    stage.from.forEach((source, slot) => {
      if (source === "feed") return;
      const input = stage.recipe.inputs[slot];
      if (!input) return;
      drawn[source] = (drawn[source] ?? 0) + machines * input.perMin;
    });
  }

  return { counts, notes, drawn };
}

function noteShortConsumers(
  stages: StageInfo[],
  counts: number[],
  sourceIndex: number,
  supply: number,
  notes: (string | null)[],
): void {
  for (let consumer = sourceIndex + 1; consumer < stages.length; consumer += 1) {
    const stage = stages[consumer];
    if (!stage) continue;
    const slot = stage.from.indexOf(sourceIndex);
    if (slot < 0) continue;
    const input = stage.recipe.inputs[slot];
    if (!input) continue;
    const demand = (counts[consumer] ?? 0) * input.perMin;
    if (supply + 1e-6 >= demand) continue;
    if (notes[consumer]) continue;
    const item = ITEMS[input.itemId as keyof typeof ITEMS]?.name ?? input.itemId;
    // TODO: when one stage feeds two consumers, split `supply` instead of repeating it.
    notes[consumer] = `${stage.recipe.name} stays at 100%. It needs ${trim(demand)} ${item}/min and is receiving ${trim(supply)}.`;
  }
}

function trim(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
