import { ITEMS, RECIPES, beltByMk, machinesPerBelt, type BeltMk, type RecipeId } from "../data/catalog";
import { CHAINS, type ChainId } from "../data/chains";

export interface StagePlan {
  recipeId: RecipeId;
  machines: number;
  inputPerMin: number;
  outputPerMin: number;
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

/**
 * Whole machines at 100%. The belt mark caps every line.
 * The goal row starts at what its own belt can hold, then drops until
 * each earlier row can feed the next one without going over its belt.
 * Surplus backs up in the stage buffer. Clocks are not changed.
 */
export function solveChain(chainId: ChainId, beltMk: BeltMk): ChainPlan {
  const chain = CHAINS[chainId];
  const belt = beltByMk(beltMk);
  const recipes = chain.stages.map((id) => {
    const recipe = RECIPES[id];
    const input = recipe.inputs[0];
    const output = recipe.outputs[0];
    if (!input || !output || recipe.inputs.length !== 1 || recipe.outputs.length !== 1) {
      throw new Error(`${recipe.name} is not a single-belt recipe.`);
    }
    return recipe;
  });
  const last = recipes.length - 1;
  const goal = recipes[last];
  if (!goal) throw new Error(`Chain ${chainId} has no stages.`);
  const goalOutput = goal.outputs[0];
  const goalInput = goal.inputs[0];
  if (!goalOutput || !goalInput) throw new Error(`Chain ${chainId} goal has no stacks.`);

  const cap = recipes.map((recipe) => machinesPerBelt(recipe, belt.perMin));
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
    const peak = Math.max(goalInput.perMin, goalOutput.perMin);
    return {
      ...empty,
      blockedReason: `Mk${beltMk} cannot carry one ${goal.name} machine (${trim(peak)} / min on a ${belt.perMin} belt).`,
    };
  }

  let goalCount = goalCap;
  let counts: number[] | null = null;
  while (goalCount >= 1) {
    counts = fitCounts(recipes, cap, goalCount);
    if (counts) break;
    goalCount -= 1;
  }

  if (!counts) {
    return { ...empty, blockedReason: blockedReason(recipes, cap, beltMk) };
  }

  const stages: StagePlan[] = recipes.map((recipe, index) => {
    const machines = counts?.[index] ?? 0;
    const input = recipe.inputs[0];
    const output = recipe.outputs[0];
    return {
      recipeId: recipe.id,
      machines,
      inputPerMin: machines * (input?.perMin ?? 0),
      outputPerMin: machines * (output?.perMin ?? 0),
    };
  });

  const building = goal.buildingId === "smelter" ? "smelter" : "constructor";
  const placed = stages[last]?.machines ?? 0;
  const made = stages[last]?.outputPerMin ?? 0;
  return {
    ...empty,
    stages,
    limitNote:
      placed < goalCap
        ? `Output is belt-limited to ${trim(made)} / min (${placed} ${building}${placed === 1 ? "" : "s"}). The output belt could hold ${goalCap}.`
        : null,
  };
}

function fitCounts(
  recipes: ReturnType<typeof recipeList>,
  cap: number[],
  goalCount: number,
): number[] | null {
  const last = recipes.length - 1;
  const goalCap = cap[last] ?? 0;
  if (goalCount < 1 || goalCount > goalCap) return null;
  const counts = recipes.map(() => 0);
  counts[last] = goalCount;
  for (let index = last; index > 0; index -= 1) {
    const downstream = recipes[index];
    const upstream = recipes[index - 1];
    const input = downstream?.inputs[0];
    const output = upstream?.outputs[0];
    if (!downstream || !upstream || !input || !output) return null;
    const demand = (counts[index] ?? 0) * input.perMin;
    const need = Math.ceil(demand / output.perMin - 1e-9);
    const upstreamCap = cap[index - 1] ?? 0;
    if (need < 1 || need > upstreamCap) return null;
    counts[index - 1] = need;
  }
  return counts;
}

function recipeList(chainId: ChainId) {
  return CHAINS[chainId].stages.map((id) => RECIPES[id]);
}

function blockedReason(
  recipes: ReturnType<typeof recipeList>,
  cap: number[],
  beltMk: BeltMk,
): string {
  const last = recipes.length - 1;
  const goal = recipes[last];
  const goalInput = goal?.inputs[0];
  if (!goal || !goalInput) return `Mk${beltMk} cannot feed this chain.`;
  let demand = goalInput.perMin;
  let demandItem = goalInput.itemId;
  for (let index = last - 1; index >= 0; index -= 1) {
    const recipe = recipes[index];
    const output = recipe?.outputs[0];
    const input = recipe?.inputs[0];
    if (!recipe || !output || !input) break;
    const need = Math.ceil(demand / output.perMin - 1e-9);
    const stageCap = cap[index] ?? 0;
    if (need > stageCap) {
      const supply = stageCap * output.perMin;
      const item = ITEMS[demandItem as keyof typeof ITEMS]?.name ?? demandItem;
      return `Mk${beltMk} cannot feed one ${goal.name} machine. It draws ${trim(demand)} ${item}/min from ${recipe.name}, and that belt supplies ${trim(supply)}/min.`;
    }
    demand = need * input.perMin;
    demandItem = input.itemId;
  }
  return `Mk${beltMk} cannot feed one ${goal.name} machine.`;
}

function trim(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
