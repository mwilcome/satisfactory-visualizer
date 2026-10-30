import {
  BUILDINGS,
  ITEMS,
  RECIPES,
  beltByMk,
  targetItems,
  type BeltMk,
  type Recipe,
  type RecipeId,
} from "../data/catalog";
import type { InputSource, WiredStage } from "../data/chains";
import { solveWired, type ChainPlan } from "./chain";

const SUPPORTED = new Set(["smelter", "constructor", "foundry", "assembler"]);
const MACHINE_RANK: Record<string, number> = { smelter: 0, constructor: 1, foundry: 2, assembler: 3 };

/** Recipes that output this item, standard one first. */
export function recipesFor(itemId: string): Recipe[] {
  return Object.values(RECIPES)
    .filter((recipe) => recipe.outputs.some((stack) => stack.itemId === itemId))
    .sort((a, b) => Number(a.alternate) - Number(b.alternate) || a.name.localeCompare(b.name));
}

export function standardRecipe(itemId: string): Recipe | undefined {
  const all = recipesFor(itemId);
  const supported = all.filter((recipe) => SUPPORTED.has(recipe.buildingId) && !recipe.alternate);
  const pool = supported.length > 0 ? supported : all.filter((recipe) => !recipe.alternate);
  const pick = pool.length > 0 ? pool : all;
  return [...pick].sort(
    (a, b) => (MACHINE_RANK[a.buildingId] ?? 9) - (MACHINE_RANK[b.buildingId] ?? 9) || a.name.localeCompare(b.name),
  )[0];
}

export interface RecipeChoice {
  itemId: string;
  itemName: string;
  selectedId: string;
  options: { id: string; name: string; alternate: boolean; building: string }[];
}

/**
 * Item, then the recipe used for every made part in that chain.
 * Raw ores stay feed belts unless this item is the one you picked.
 */
export function recipeChoices(
  itemId: string,
  chosen: Readonly<Partial<Record<string, string>>>,
): RecipeChoice[] {
  const groups: RecipeChoice[] = [];
  const seen = new Set<string>();
  const walk = (current: string, isGoal: boolean, visiting: Set<string>): void => {
    if (visiting.has(current) || seen.has(current)) return;
    const item = ITEMS[current];
    if (!item || item.fluid) return;
    const picked = chosen[current];
    const recipe = picked && RECIPES[picked]?.outputs.some((stack) => stack.itemId === current)
      ? RECIPES[picked]
      : !isGoal && item.raw
        ? undefined
        : standardRecipe(current);
    if (!recipe) return;
    seen.add(current);
    const options = recipesFor(current);
    if (options.length > 1) {
      groups.push({
        itemId: current,
        itemName: item.name,
        selectedId: recipe.id,
        options: options.map((option) => ({
          id: option.id,
          name: option.name,
          alternate: option.alternate,
          building: BUILDINGS[option.buildingId]?.name ?? option.buildingId,
        })),
      });
    }
    visiting.add(current);
    for (const input of recipe.inputs) walk(input.itemId, false, visiting);
    visiting.delete(current);
  };
  walk(itemId, true, new Set());
  return groups;
}

/** Build the factory for one item. Machines come from the recipes, not from a machine list. */
export function solveTarget(
  itemId: string,
  beltMk: BeltMk,
  chosen: Readonly<Partial<Record<string, string>>> = {},
): ChainPlan {
  const belt = beltByMk(beltMk);
  const item = ITEMS[itemId];
  const empty: ChainPlan = {
    chainId: itemId,
    beltMk,
    beltPerMin: belt.perMin,
    goalItemId: itemId,
    stages: [],
    limitNote: null,
    blockedReason: null,
  };
  if (!item) return { ...empty, blockedReason: "That part is not in the recipe set." };
  if (item.fluid) {
    return { ...empty, blockedReason: `${item.name} is a fluid. Pipes are not in this layout.` };
  }
  const wired: WiredStage[] = [];
  const reason = expand(itemId, true, chosen, new Set(), wired);
  if (reason) return { ...empty, blockedReason: reason };
  const goal = wired[wired.length - 1];
  if (!goal) return { ...empty, blockedReason: `${item.name} has no recipe in this set.` };
  return solveWired(wired, beltMk, itemId, goal.recipeId);
}

/** True when the recipe graph can be placed, or the only limit is the belt. */
export function canLayOut(itemId: string, chosen: Readonly<Partial<Record<string, string>>> = {}): boolean {
  const plan = solveTarget(itemId, 4, chosen);
  return !plan.blockedReason || plan.blockedReason.startsWith("Mk");
}

export function selectableItems(): { id: string; name: string }[] {
  return targetItems().filter((item) => canLayOut(item.id));
}

function expand(
  itemId: string,
  isGoal: boolean,
  chosen: Readonly<Partial<Record<string, string>>>,
  visiting: Set<string>,
  out: WiredStage[],
): string | null {
  if (out.length > 40) return "This chain is too deep to lay out.";
  const item = ITEMS[itemId];
  if (!item) return `${itemId} is outside the Smelter, Constructor, Foundry, and Assembler set.`;
  if (item.fluid) return `${item.name} is a fluid. Pipes are not in this layout.`;
  const picked = chosen[itemId];
  const forced = picked ? RECIPES[picked] : undefined;
  if (picked && (!forced || !forced.outputs.some((stack) => stack.itemId === itemId))) {
    return `That recipe does not make ${item.name}.`;
  }
  const recipe = forced ?? (!isGoal && item.raw ? undefined : standardRecipe(itemId));
  if (!recipe) return null;
  if (visiting.has(itemId)) return `Those recipe choices loop on ${item.name}.`;
  const shape = unsupported(recipe);
  if (shape) return shape;
  visiting.add(itemId);
  const from: InputSource[] = [];
  for (const input of recipe.inputs) {
    const before = out.length;
    const problem = expand(input.itemId, false, chosen, visiting, out);
    if (problem) return problem;
    from.push(out.length === before ? "feed" : out.length - 1);
  }
  visiting.delete(itemId);
  const seen = out.filter((stage) => stage.recipeId === recipe.id).length;
  out.push({
    id: seen === 0 ? recipe.id : `${recipe.id}-${seen + 1}`,
    recipeId: recipe.id as RecipeId,
    from,
  });
  return null;
}

function unsupported(recipe: Recipe): string | null {
  if (!SUPPORTED.has(recipe.buildingId)) {
    return `${recipe.name} uses a ${recipe.buildingId}. This layout is Smelter, Constructor, Foundry, and Assembler.`;
  }
  if (recipe.outputs.length !== 1) return `${recipe.name} has more than one output.`;
  if (recipe.inputs.length < 1 || recipe.inputs.length > 2) {
    return `${recipe.name} has ${recipe.inputs.length} inputs. This layout uses one or two.`;
  }
  return null;
}
