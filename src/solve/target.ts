import {
  BUILDINGS,
  ITEMS,
  RECIPES,
  beltByMk,
  isBuildingId,
  type BeltMk,
  type Recipe,
  type RecipeId,
} from "../data/catalog";
import type { InputSource, WiredStage } from "../data/chains";
import { solveWired, type ChainPlan } from "./chain";

const SUPPORTED = new Set(["smelter", "constructor", "foundry", "assembler", "manufacturer"]);
const MACHINE_RANK: Record<string, number> = {
  smelter: 0,
  constructor: 1,
  foundry: 2,
  assembler: 3,
  manufacturer: 4,
};

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
  // Several standard recipes for one item: start from the smallest batch.
  // Biomass then opens on Leaves. Wood, Mycelia, and Alien Protein stay in the list.
  return [...pick].sort((a, b) => {
    const byOutput = (a.outputs[0]?.perMin ?? 0) - (b.outputs[0]?.perMin ?? 0);
    if (Math.abs(byOutput) > 1e-9) return byOutput;
    return (MACHINE_RANK[a.buildingId] ?? 9) - (MACHINE_RANK[b.buildingId] ?? 9) || a.name.localeCompare(b.name);
  })[0];
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
          building: isBuildingId(option.buildingId) ? BUILDINGS[option.buildingId].name : option.buildingId,
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

/** This phase can place the recipe's own building. Fluids and extra ports wait. */
export function recipePlaceable(recipe: Recipe): boolean {
  return unsupported(recipe) === null;
}

/**
 * An item is selectable when some combination of placeable recipes builds it.
 * The player's current alt picks are applied later, at Generate.
 */
export function supportedItemIds(): Set<string> {
  const known = new Map<string, boolean>();
  const visit = (itemId: string, stack: Set<string>): boolean => {
    const cached = known.get(itemId);
    if (cached !== undefined && !stack.has(itemId)) return cached;
    if (stack.has(itemId)) return false;
    const item = ITEMS[itemId];
    if (!item || item.fluid) {
      known.set(itemId, false);
      return false;
    }
    const options = recipesFor(itemId).filter(recipePlaceable);
    if (options.length === 0) {
      known.set(itemId, false);
      return false;
    }
    stack.add(itemId);
    let ok = false;
    for (const recipe of options) {
      const inputsOk = recipe.inputs.every((input) => {
        const next = ITEMS[input.itemId];
        if (!next || next.fluid) return false;
        if (next.raw) return true;
        return visit(input.itemId, stack);
      });
      if (inputsOk) {
        ok = true;
        break;
      }
    }
    stack.delete(itemId);
    known.set(itemId, ok);
    return ok;
  };
  for (const itemId of Object.keys(ITEMS)) visit(itemId, new Set());
  return new Set([...known.entries()].filter((entry) => entry[1]).map((entry) => entry[0]));
}

export function selectableItems(): { id: string; name: string }[] {
  return pickerItems().filter((item) => item.selectable);
}

/** Every item in the snapshot. Unsupported parts stay in the list and cannot be chosen. */
export function pickerItems(): { id: string; name: string; selectable: boolean }[] {
  const supported = supportedItemIds();
  return Object.values(ITEMS)
    .map((item) => ({ id: item.id, name: item.name, selectable: supported.has(item.id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface AltEntry {
  id: string;
  name: string;
  itemId: string;
  itemName: string;
  className: string;
  placeable: boolean;
}

/** Alternates, plus every standard recipe when an item has more than one. */
export function altEntries(): AltEntry[] {
  const supported = supportedItemIds();
  const recipes = Object.values(RECIPES);
  const standardCount = new Map<string, number>();
  for (const recipe of recipes) {
    if (recipe.alternate) continue;
    const itemId = recipe.outputs[0]?.itemId ?? "";
    standardCount.set(itemId, (standardCount.get(itemId) ?? 0) + 1);
  }
  return recipes
    .filter((recipe) => {
      if (recipe.alternate) return true;
      const itemId = recipe.outputs[0]?.itemId ?? "";
      return (standardCount.get(itemId) ?? 0) > 1;
    })
    .map((recipe) => {
      const itemId = recipe.outputs[0]?.itemId ?? "";
      const inputsOk = recipe.inputs.every((input) => {
        const item = ITEMS[input.itemId];
        return !!item && !item.fluid && (item.raw || supported.has(input.itemId));
      });
      return {
        id: recipe.id,
        name: recipe.name,
        itemId,
        itemName: ITEMS[itemId]?.name ?? itemId,
        className: recipe.className,
        placeable: unsupported(recipe) === null && inputsOk,
      };
    })
    .sort((a, b) => a.itemName.localeCompare(b.itemName) || a.name.localeCompare(b.name));
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
  if (!item) return `${itemId} is outside the buildings this layout can place.`;
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
  if (recipe.inputs.some((input) => ITEMS[input.itemId]?.fluid) || recipe.outputs.some((output) => ITEMS[output.itemId]?.fluid)) {
    return `${recipe.name} needs a fluid. Pipes are not in this layout.`;
  }
  if (!SUPPORTED.has(recipe.buildingId)) {
    return `${recipe.name} uses a ${recipe.buildingId}. This layout is Smelter, Constructor, Foundry, Assembler, and Manufacturer.`;
  }
  if (recipe.outputs.length !== 1) return `${recipe.name} has more than one output.`;
  if (recipe.inputs.length < 1 || recipe.inputs.length > 4) {
    return `${recipe.name} has ${recipe.inputs.length} inputs. This layout uses one to four.`;
  }
  return null;
}
