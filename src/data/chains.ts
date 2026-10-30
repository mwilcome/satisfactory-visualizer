import { RECIPES, type RecipeId } from "./catalog";

/**
 * One manifold floor per stage, ore at the bottom, product at the top.
 * Phase 1 stages are smelter + constructor. Assembler and Foundry are
 * machine builds: pick the machine, then which inputs join. This is not
 * a catalog of every part those machines can make.
 *
 * Cable's constructor recipe is the same either way. The two cable chains
 * differ by which Wire recipe feeds them. With no saved choice, Cable
 * opens on copper wire. Iron Wire stays the other feed.
 *
 * TODO(oil): refineries, pipes, and closed loops are the next bound.
 * Do not extend this wiring into fluids or aluminum.
 */
export type ProductId = "screws" | "iron-plate" | "iron-rod" | "wire" | "cable" | "assembler" | "foundry";

/** Upstream stage index, or an external belt at the feed end. */
export type InputSource = number | "feed";

export interface ChainDef {
  id: string;
  productId: ProductId;
  title: string;
  choiceLabel: string;
  lede: string;
  stages: readonly RecipeId[];
  /**
   * Row id per stage. Required when one recipe is used twice.
   * Defaults to the recipe id.
   */
  stageIds?: readonly string[];
  /**
   * Per stage, one source per recipe input, in recipe order.
   * Defaults to a linear chain: stage 0 is a feed belt, every later stage takes the previous stage.
   */
  from?: readonly (readonly InputSource[])[];
}

export interface WiredStage {
  id: string;
  recipeId: RecipeId;
  from: readonly InputSource[];
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
  "foundry-steel": {
    id: "foundry-steel",
    productId: "foundry",
    title: "Foundry",
    choiceLabel: "Iron ore + Coal",
    lede: "Foundry. Iron ore and coal arrive on two feed belts. The coal lane is 2 m higher and 1 m closer to the machines. One ingot belt leaves. Clocks stay at 100%.",
    stages: ["steel-ingot"],
    from: [["feed", "feed"]],
  },
  "foundry-alloy": {
    id: "foundry-alloy",
    productId: "foundry",
    title: "Foundry",
    choiceLabel: "Iron ore + Copper ore",
    lede: "Foundry, Iron Alloy Ingot. Iron ore and copper ore use the same stair as coal and iron. Mk1 cannot hold one machine.",
    stages: ["iron-alloy-ingot"],
    from: [["feed", "feed"]],
  },
  // Plates and cast screws are paths that already exist. They join on the assembler.
  // TODO: more joins are data. Do not add a parts catalog here.
  "assembler-plates-screws": {
    id: "assembler-plates-screws",
    productId: "assembler",
    title: "Assembler",
    choiceLabel: "Plates + Cast screws",
    lede: "Assembler. One line casts screws, one line makes plates, and both feed a single assembler row. The screw lane is higher and 1 m closer in. There is no conveyor lift between the two splitters.",
    stages: ["iron-ingot", "iron-plate", "iron-ingot", "cast-screw", "reinforced-iron-plate"],
    stageIds: ["plate-ingot", "iron-plate", "screw-ingot", "cast-screw", "reinforced-iron-plate"],
    from: [["feed"], [0], ["feed"], [2], [1, 3]],
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
  assembler: {
    id: "assembler",
    name: "Assembler",
    legend: "Inputs",
    chains: ["assembler-plates-screws"],
  },
  foundry: {
    id: "foundry",
    name: "Foundry",
    legend: "Inputs",
    chains: ["foundry-steel", "foundry-alloy"],
  },
};

export const PRODUCT_ORDER: readonly ProductId[] = [
  "screws",
  "iron-plate",
  "iron-rod",
  "wire",
  "cable",
  "assembler",
  "foundry",
];

export function wiredStages(chain: ChainDef): WiredStage[] {
  const ids = chain.stageIds ?? chain.stages;
  if (ids.length !== chain.stages.length) {
    throw new Error(`${chain.id} stage ids do not match its stages.`);
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${chain.id} repeats a stage id.`);
  }
  if (chain.from && chain.from.length !== chain.stages.length) {
    throw new Error(`${chain.id} wiring length does not match its stages.`);
  }
  return chain.stages.map((recipeId, index) => {
    const recipe = RECIPES[recipeId];
    const from = chain.from?.[index] ?? (index === 0 ? (["feed"] as const) : ([index - 1] as const));
    if (from.length !== recipe.inputs.length) {
      throw new Error(`${chain.id} stage ${ids[index] ?? index} does not match ${recipe.name} inputs.`);
    }
    for (const source of from) {
      if (source !== "feed" && (source < 0 || source >= index)) {
        throw new Error(`${chain.id} stage ${ids[index] ?? index} reads a stage that is not upstream.`);
      }
    }
    return { id: ids[index] ?? recipeId, recipeId, from };
  });
}

export function isLinearWiring(wired: readonly WiredStage[]): boolean {
  return wired.every((stage, index) => {
    if (stage.from.length !== 1) return false;
    const source = stage.from[0];
    return index === 0 ? source === "feed" : source === index - 1;
  });
}

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
