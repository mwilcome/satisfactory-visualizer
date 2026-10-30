import { RECIPES, type RecipeId } from "./catalog";

/**
 * One manifold floor per stage, ore at the bottom, product at the top.
 * Stages stay on smelter + constructor. Alts that need another building
 * (Coated Iron Plate, Steel Screws, Insulated Cable, …) are not listed.
 *
 * Cable's constructor recipe is the same either way. The two cable chains
 * differ by which Wire recipe feeds them. With no saved choice, Cable
 * opens on copper wire. Iron Wire stays the other feed.
 */
export type ProductId = "screws" | "iron-plate" | "iron-rod" | "wire" | "cable";

export interface ChainDef {
  id: string;
  productId: ProductId;
  title: string;
  choiceLabel: string;
  lede: string;
  stages: readonly RecipeId[];
}

export const CHAINS = {
  "cast-screw": {
    id: "cast-screw",
    productId: "screws",
    title: "Cast Screws",
    choiceLabel: "Cast Screws (alternate)",
    lede: "Cast Screws alternate. Iron ore arrives on a belt, smelters make ingots, constructors cast screws.",
    stages: ["iron-ingot", "cast-screw"],
  },
  "screw-rod": {
    id: "screw-rod",
    productId: "screws",
    title: "Screws",
    choiceLabel: "Screws (Iron Rod)",
    lede: "Default Screws recipe. Iron ore to ingots, iron rods, then screws.",
    stages: ["iron-ingot", "iron-rod", "screw"],
  },
  "iron-plate": {
    id: "iron-plate",
    productId: "iron-plate",
    title: "Iron Plate",
    choiceLabel: "Iron Plate",
    lede: "Default Iron Plate recipe. Iron ore to ingots, then plates.",
    stages: ["iron-ingot", "iron-plate"],
  },
  "iron-rod": {
    id: "iron-rod",
    productId: "iron-rod",
    title: "Iron Rod",
    choiceLabel: "Iron Rod",
    lede: "Default Iron Rod recipe. Iron ore to ingots, then rods.",
    stages: ["iron-ingot", "iron-rod"],
  },
  "wire-copper": {
    id: "wire-copper",
    productId: "wire",
    title: "Wire",
    choiceLabel: "Wire (copper)",
    lede: "Default Wire recipe. Copper ore to ingots, then wire.",
    stages: ["copper-ingot", "wire"],
  },
  "wire-iron": {
    id: "wire-iron",
    productId: "wire",
    title: "Iron Wire",
    choiceLabel: "Iron Wire (alternate)",
    lede: "Iron Wire alternate. Iron ore to ingots, then wire.",
    stages: ["iron-ingot", "iron-wire"],
  },
  "cable-copper": {
    id: "cable-copper",
    productId: "cable",
    title: "Cable",
    choiceLabel: "Copper wire",
    lede: "Cable from copper wire. This is the feed selected when you first pick Cable. Copper ore to ingots, wire, then cable.",
    stages: ["copper-ingot", "wire", "cable"],
  },
  "cable-iron": {
    id: "cable-iron",
    productId: "cable",
    title: "Cable",
    choiceLabel: "Iron wire",
    lede: "Cable from Iron Wire. Iron ore to ingots, wire, then cable.",
    stages: ["iron-ingot", "iron-wire", "cable"],
  },
} as const satisfies Record<string, ChainDef>;

export type ChainId = keyof typeof CHAINS;

export interface ProductDef {
  id: ProductId;
  name: string;
  legend: string;
  chains: readonly ChainId[];
}

export const PRODUCTS: Record<ProductId, ProductDef> = {
  screws: {
    id: "screws",
    name: "Screws",
    legend: "Recipe",
    chains: ["cast-screw", "screw-rod"],
  },
  "iron-plate": {
    id: "iron-plate",
    name: "Iron Plate",
    legend: "Recipe",
    chains: ["iron-plate"],
  },
  "iron-rod": {
    id: "iron-rod",
    name: "Iron Rod",
    legend: "Recipe",
    chains: ["iron-rod"],
  },
  wire: {
    id: "wire",
    name: "Wire",
    legend: "Recipe",
    chains: ["wire-copper", "wire-iron"],
  },
  cable: {
    id: "cable",
    name: "Cable",
    legend: "Wire chain",
    chains: ["cable-copper", "cable-iron"],
  },
};

export const PRODUCT_ORDER: readonly ProductId[] = [
  "screws",
  "iron-plate",
  "iron-rod",
  "wire",
  "cable",
];

export function isChainId(value: unknown): value is ChainId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(CHAINS, value);
}

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PRODUCTS, value);
}

export function productOf(chainId: ChainId): ProductId {
  return CHAINS[chainId].productId;
}

/**
 * Chain to use when this product has no saved choice.
 * A single chain is that chain. Wire uses the non-alternate recipe (copper).
 * Screws uses the non-alternate recipe (Iron Rod) unless Cast Screws was saved.
 * Cable opens on copper wire. Both cable chains share the Cable recipe.
 */
export function standardChain(productId: ProductId): ChainId {
  const product = PRODUCTS[productId];
  if (product.chains.length === 1) {
    const only = product.chains[0];
    if (only) return only;
  }
  if (productId === "cable") return "cable-copper";
  const matches = product.chains.filter((id) => {
    const stages = CHAINS[id].stages;
    const finalId = stages[stages.length - 1];
    return finalId ? !RECIPES[finalId].alternate : false;
  });
  const chainId = matches.length === 1 ? matches[0] : undefined;
  if (!chainId) throw new Error(`No standard chain for ${productId}.`);
  return chainId;
}
