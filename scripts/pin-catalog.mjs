/**
 * Rebuild src/data/generated-catalog.ts from a SatisfactoryTools data.json.
 * Usage: node scripts/pin-catalog.mjs path/to/data.json
 *
 * Ids that the hand-authored chains already use are kept. New parts get a slug.
 */
import fs from "node:fs";

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Pass the data.json path.");
  process.exit(1);
}

const BUILDING = {
  Desc_SmelterMk1_C: "smelter",
  Desc_ConstructorMk1_C: "constructor",
  Desc_FoundryMk1_C: "foundry",
  Desc_AssemblerMk1_C: "assembler",
  Desc_ManufacturerMk1_C: "manufacturer",
  Desc_OilRefinery_C: "refinery",
  Desc_Blender_C: "blender",
  Desc_Packager_C: "packager",
  Desc_HadronCollider_C: "particle-accelerator",
  Desc_Converter_C: "converter",
  Desc_QuantumEncoder_C: "quantum-encoder",
};

/** Chain ids and the few real class names already in the repo. */
const RECIPE_ID_BY_CLASS = {
  Recipe_IngotIron_C: "iron-ingot",
  Recipe_Alternate_Screw_C: "cast-screw",
  Recipe_Screw_C: "screw",
  Recipe_IronRod_C: "iron-rod",
  Recipe_IronPlate_C: "iron-plate",
  Recipe_Wire_C: "wire",
  Recipe_Alternate_Wire_1_C: "iron-wire",
  Recipe_Cable_C: "cable",
  Recipe_IngotSteel_C: "steel-ingot",
  Recipe_Alternate_IngotIron_C: "iron-alloy-ingot",
  Recipe_IronPlateReinforced_C: "reinforced-iron-plate",
  Recipe_IngotCopper_C: "copper-ingot",
};

const ITEM_ID_BY_CLASS = {
  Desc_IronScrew_C: "screw",
  Desc_OreIron_C: "iron-ore",
  Desc_OreCopper_C: "copper-ore",
  Desc_Coal_C: "coal",
  Desc_Stone_C: "limestone",
  Desc_OreGold_C: "caterium-ore",
  Desc_Sulfur_C: "sulfur",
  Desc_RawQuartz_C: "raw-quartz",
  Desc_IronIngot_C: "iron-ingot",
  Desc_CopperIngot_C: "copper-ingot",
  Desc_SteelIngot_C: "steel-ingot",
  Desc_IronPlate_C: "iron-plate",
  Desc_IronRod_C: "iron-rod",
  Desc_Wire_C: "wire",
  Desc_Cable_C: "cable",
  Desc_IronPlateReinforced_C: "reinforced-iron-plate",
};

const previous = fs.readFileSync(new URL("../src/data/generated-catalog.ts", import.meta.url), "utf8");
const recipeIdByNorm = new Map();
for (const match of previous.matchAll(
  /\{ id: "([^"]+)", name: "((?:\\.|[^"\\])*)", alternate: (?:true|false), className:/g,
)) {
  recipeIdByNorm.set(norm(unescape(match[2])), match[1]);
}
const itemIdByNorm = new Map();
for (const match of previous.matchAll(/\{ id: "([^"]+)", name: "((?:\\.|[^"\\])*)", raw:/g)) {
  itemIdByNorm.set(norm(unescape(match[2])), match[1]);
}

const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const itemIdByClass = new Map();
const usedItemIds = new Set();
const items = [];

for (const item of Object.values(data.items)) {
  const id = claim(ITEM_ID_BY_CLASS[item.className] ?? itemIdByNorm.get(norm(item.name)) ?? slug(item.name), usedItemIds);
  itemIdByClass.set(item.className, id);
}

const produced = new Set();
for (const recipe of Object.values(data.recipes)) {
  if (!recipe.inMachine || recipe.forBuilding) continue;
  for (const product of recipe.products ?? []) produced.add(product.item);
}
// Mined resources stay input belts even when a converter recipe also makes them.
const resources = new Set(Object.keys(data.resources ?? {}));

for (const item of Object.values(data.items).sort((a, b) => a.name.localeCompare(b.name))) {
  const id = itemIdByClass.get(item.className);
  items.push({
    id,
    name: item.name,
    raw: resources.has(item.className) || !produced.has(item.className),
    fluid: Boolean(item.liquid),
  });
}

const usedRecipeIds = new Set();
const recipes = [];
for (const recipe of Object.values(data.recipes)) {
  if (!recipe.inMachine || recipe.forBuilding) continue;
  const buildingId = (recipe.producedIn ?? []).map((id) => BUILDING[id]).find(Boolean);
  if (!buildingId) continue;
  if (!recipe.products?.length || !recipe.ingredients?.length) continue;
  if (recipe.products.some((stack) => !itemIdByClass.has(stack.item))) continue;
  if (recipe.ingredients.some((stack) => !itemIdByClass.has(stack.item))) continue;
  const preferred =
    RECIPE_ID_BY_CLASS[recipe.className] ??
    recipeIdByNorm.get(norm(recipe.name.replace(/^Alternate:\s*/i, ""))) ??
    slug(recipe.name.replace(/^Alternate:\s*/i, ""));
  const id = claim(preferred, usedRecipeIds);
  const time = recipe.time || 1;
  recipes.push({
    id,
    name: recipe.name.replace(/^Alternate:\s*/i, ""),
    alternate: Boolean(recipe.alternate),
    className: recipe.className,
    buildingId,
    cycleSeconds: time,
    inputs: recipe.ingredients.map((stack) => stackOf(stack, time)),
    outputs: recipe.products.map((stack) => stackOf(stack, time)),
  });
}
recipes.sort((a, b) => Number(a.alternate) - Number(b.alternate) || a.name.localeCompare(b.name));

const schematics = {};
for (const schematic of Object.values(data.schematics)) {
  const unlocked = schematic.unlock?.recipes ?? [];
  if (unlocked.length === 0) continue;
  schematics[schematic.className] = unlocked;
}

const header = `/**
 * Pinned recipe snapshot. Do not hand-edit.
 * Source: greeny/SatisfactoryTools dev data.json
 * Commit: 2bd164690a29136365fcfda6f9adcaaf2d6de214 (2026-02-02)
 * https://github.com/greeny/SatisfactoryTools/blob/2bd164690a29136365fcfda6f9adcaaf2d6de214/data/data.json
 * Retrieved 2026-11-02. Regenerate with scripts/pin-catalog.mjs.
 */
export interface CatalogStack { itemId: string; perCycle: number; perMin: number }
export interface CatalogItem { id: string; name: string; raw: boolean; fluid: boolean }
export interface CatalogRecipe {
  id: string; name: string; alternate: boolean; className: string;
  buildingId: string;
  cycleSeconds: number; inputs: CatalogStack[]; outputs: CatalogStack[];
}
`;

const body = [
  header,
  `export const ITEM_LIST: CatalogItem[] = ${JSON.stringify(items, null, 0)};`,
  "",
  `export const RECIPE_LIST: CatalogRecipe[] = ${JSON.stringify(recipes)};`,
  "",
  `export const SCHEMATIC_RECIPES: Record<string, readonly string[]> = ${JSON.stringify(schematics)};`,
  "",
].join("\n");

const out = new URL("../src/data/generated-catalog.ts", import.meta.url);
fs.writeFileSync(out, prettyLists(body));
console.log(`items ${items.length}, recipes ${recipes.length}, schematics ${Object.keys(schematics).length}`);

function stackOf(stack, time) {
  return {
    itemId: itemIdByClass.get(stack.item),
    perCycle: stack.amount,
    perMin: round(stack.amount / time * 60),
  };
}

function claim(base, used) {
  let id = base || "part";
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function norm(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function unescape(value) {
  return value.replace(/\\"/g, '"');
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

/** Keep the generated file readable without a second formatter. */
function prettyLists(source) {
  return source
    .replaceAll('{"id":', "\n  { id: ")
    .replaceAll('",name":', '", name: ')
    .replaceAll(',"raw":', ", raw: ")
    .replaceAll(',"fluid":', ", fluid: ")
    .replaceAll(',"alternate":', ", alternate: ")
    .replaceAll(',"className":', ", className: ")
    .replaceAll(',"buildingId":', ", buildingId: ")
    .replaceAll(',"cycleSeconds":', ", cycleSeconds: ")
    .replaceAll(',"inputs":', ", inputs: ")
    .replaceAll(',"outputs":', ", outputs: ")
    .replaceAll(',"itemId":', ", itemId: ")
    .replaceAll(',"perCycle":', ", perCycle: ")
    .replaceAll(',"perMin":', ", perMin: ")
    .replaceAll("[{", "[\n  {")
    .replaceAll("}]", "}\n]")
    .replaceAll("},{", "},\n  {");
}
