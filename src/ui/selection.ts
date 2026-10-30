import { ITEMS, RECIPES, isBeltMk, type BeltMk } from "../data/catalog";
import { PRODUCTS, isChainId, standardChain, type ChainId, type ProductId } from "../data/chains";

/** First visit: Screws, Cast Screws recipe, Mk3. */
export const DEFAULT_ITEM_ID = "screw";
export const DEFAULT_BELT_MK: BeltMk = 3;
export const STORAGE_KEY = "satisfactory-visualizer.v1";

export interface Selection {
  itemId: string;
  mk: BeltMk;
  /** Recipe id chosen for a part. Missing means the standard recipe. */
  recipes: Partial<Record<string, string>>;
}

const FROM_CHAIN: Record<string, Selection> = {
  "cast-screw": { itemId: "screw", mk: 3, recipes: { screw: "cast-screw" } },
  "screw-rod": { itemId: "screw", mk: 3, recipes: { screw: "screw" } },
  "iron-plate": { itemId: "iron-plate", mk: 3, recipes: {} },
  "iron-rod": { itemId: "iron-rod", mk: 3, recipes: {} },
  "wire-copper": { itemId: "wire", mk: 3, recipes: { wire: "wire" } },
  "wire-iron": { itemId: "wire", mk: 3, recipes: { wire: "iron-wire" } },
  "cable-copper": { itemId: "cable", mk: 3, recipes: { wire: "wire" } },
  "cable-iron": { itemId: "cable", mk: 3, recipes: { wire: "iron-wire" } },
  "foundry-steel": { itemId: "steel-ingot", mk: 3, recipes: {} },
  "foundry-alloy": { itemId: "iron-ingot", mk: 3, recipes: { "iron-ingot": "iron-alloy-ingot" } },
  "assembler-plates-screws": {
    itemId: "reinforced-iron-plate",
    mk: 3,
    recipes: { screw: "cast-screw" },
  },
};

export function defaultSelection(): Selection {
  return { itemId: DEFAULT_ITEM_ID, mk: DEFAULT_BELT_MK, recipes: { screw: "cast-screw" } };
}

/** Restore the last item, recipe choices, and belt. Old chain saves map onto an item. */
export function parseSelection(raw: string | null): Selection {
  const fallback = defaultSelection();
  if (!raw) return fallback;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!value || typeof value !== "object") return fallback;
  const record = value as { itemId?: unknown; mk?: unknown; recipes?: unknown; chainId?: unknown };
  if (!isBeltMk(record.mk)) return fallback;
  if (typeof record.itemId === "string" && ITEMS[record.itemId]) {
    return { itemId: record.itemId, mk: record.mk, recipes: sanitizeRecipes(record.recipes) };
  }
  if (isChainId(record.chainId)) {
    const mapped = FROM_CHAIN[record.chainId];
    if (mapped) return { ...mapped, mk: record.mk };
  }
  return fallback;
}

export function serializeSelection(selection: Selection): string {
  return JSON.stringify(selection);
}

function sanitizeRecipes(value: unknown): Partial<Record<string, string>> {
  if (!value || typeof value !== "object") return {};
  const clean: Partial<Record<string, string>> = {};
  for (const [itemId, recipeId] of Object.entries(value)) {
    if (!ITEMS[itemId] || typeof recipeId !== "string") continue;
    const recipe = RECIPES[recipeId];
    if (!recipe || !recipe.outputs.some((stack) => stack.itemId === itemId)) continue;
    clean[itemId] = recipeId;
  }
  return clean;
}

/** Saved chain for this product, or the standard one. Cable with no save is copper. */
export function chainForProduct(
  productId: ProductId,
  byProduct: Partial<Record<ProductId, ChainId>> | undefined,
): ChainId {
  const remembered = byProduct?.[productId];
  const product = PRODUCTS[productId];
  if (remembered && product.chains.includes(remembered)) return remembered;
  return standardChain(productId);
}
