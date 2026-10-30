import { BUILDINGS, ITEMS, RECIPES, isBeltMk, type BeltMk, type ItemId } from "./data/catalog";
import {
  CHAINS,
  PRODUCT_ORDER,
  PRODUCTS,
  productOf,
  type ChainId,
  type ProductId,
} from "./data/chains";
import { layoutIssues } from "./layout/invariants";
import { buildChainPlant } from "./layout/plant";
import type { Plant } from "./layout/types";
import { FactoryView } from "./render/view";
import { SURPLUS_EPSILON, solveChain, type StagePlan } from "./solve/chain";
import { STORAGE_KEY, chainForProduct, parseSelection, serializeSelection } from "./ui/selection";

const viewportEl = document.querySelector<HTMLElement>("#viewport");
const summaryEl = document.querySelector<HTMLElement>("#summary");
const demoEl = document.querySelector<HTMLButtonElement>("#demo");
const titleEl = document.querySelector<HTMLElement>("#title");
const ledeEl = document.querySelector<HTMLElement>("#lede");
const productsEl = document.querySelector<HTMLElement>("#products");
const recipeFieldEl = document.querySelector<HTMLElement>("#recipe-field");
const recipeLegendEl = document.querySelector<HTMLElement>("#recipe-legend");
const recipesEl = document.querySelector<HTMLElement>("#recipes");

if (
  !viewportEl ||
  !summaryEl ||
  !demoEl ||
  !titleEl ||
  !ledeEl ||
  !productsEl ||
  !recipeFieldEl ||
  !recipeLegendEl ||
  !recipesEl
) {
  throw new Error("App shell is missing.");
}

const viewport: HTMLElement = viewportEl;
const summary: HTMLElement = summaryEl;
const demo: HTMLButtonElement = demoEl;
const title: HTMLElement = titleEl;
const lede: HTMLElement = ledeEl;
const products: HTMLElement = productsEl;
const recipeField: HTMLElement = recipeFieldEl;
const recipeLegend: HTMLElement = recipeLegendEl;
const recipesHost: HTMLElement = recipesEl;
const view = new FactoryView(viewport);

let selection = parseSelection(localStorage.getItem(STORAGE_KEY));

function persist(): void {
  localStorage.setItem(STORAGE_KEY, serializeSelection(selection));
}

function selectedMk(): BeltMk {
  const checked = document.querySelector<HTMLInputElement>('input[name="mk"]:checked');
  const value = Number(checked?.value);
  return isBeltMk(value) ? value : selection.mk;
}

function setMk(mk: BeltMk): void {
  const radio = document.querySelector<HTMLInputElement>(`input[name="mk"][value="${mk}"]`);
  if (radio) radio.checked = true;
}

function showChain(chainId: ChainId, mk: BeltMk): void {
  selection = {
    chainId,
    mk,
    byProduct: { ...selection.byProduct, [productOf(chainId)]: chainId },
  };
  persist();
  syncControls(chainId);
  const chain = CHAINS[chainId];
  title.textContent = chain.title;
  lede.textContent = chain.lede;
  document.title = `${chain.title} — Satisfactory visualizer`;

  const plan = solveChain(chainId, mk);
  if (plan.blockedReason) {
    view.clear();
    renderBlocked(summary, plan.blockedReason);
    return;
  }
  const plant = buildChainPlant(plan);
  const issues = layoutIssues(plant);
  if (issues.length > 0) {
    view.clear();
    summary.textContent = issues.join(" ");
    return;
  }
  view.show(plant);
  renderSummary(summary, plant);
}

function chooseProduct(productId: ProductId): void {
  showChain(chainForProduct(productId, selection.byProduct), selectedMk());
}

function syncControls(chainId: ChainId): void {
  const productId = productOf(chainId);
  syncProduct(productId);
  renderRecipeChoices(productId, chainId);
  setMk(selection.mk);
}

function syncProduct(productId: ProductId): void {
  const radio = document.querySelector<HTMLInputElement>(`input[name="product"][value="${productId}"]`);
  if (radio) radio.checked = true;
}

function renderRecipeChoices(productId: ProductId, selected: ChainId | null): void {
  const product = PRODUCTS[productId];
  recipesHost.replaceChildren();
  if (product.chains.length < 2) {
    recipeField.hidden = true;
    return;
  }
  recipeField.hidden = false;
  recipeLegend.textContent = product.legend;
  for (const chainId of product.chains) {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "recipe";
    input.value = chainId;
    input.checked = chainId === selected;
    input.addEventListener("change", () => {
      if (input.checked) showChain(chainId, selectedMk());
    });
    const label = document.createElement("label");
    label.append(input, document.createTextNode(CHAINS[chainId].choiceLabel));
    recipesHost.append(label);
  }
}

function renderProducts(): void {
  for (const productId of PRODUCT_ORDER) {
    const product = PRODUCTS[productId];
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "product";
    input.value = productId;
    input.addEventListener("change", () => {
      if (input.checked) chooseProduct(productId);
    });
    const label = document.createElement("label");
    label.append(input, document.createTextNode(product.name));
    products.append(label);
  }
}

function renderBlocked(host: HTMLElement, reason: string): void {
  host.replaceChildren();
  const p = document.createElement("p");
  p.className = "stat";
  p.textContent = "Belt-limited";
  const detail = document.createElement("p");
  detail.textContent = reason;
  host.append(p, detail);
}

function renderSummary(host: HTMLElement, plant: Plant): void {
  const { plan } = plant;
  host.replaceChildren();
  const goal = plan.stages[plan.stages.length - 1];
  const lines: string[] = [];
  if (goal) {
    lines.push(`${trim(goal.outputPerMin)} ${itemName(plan.goalItemId)} / min`);
  }
  for (const [index, stage] of plan.stages.entries()) {
    const recipe = RECIPES[stage.recipeId];
    const building = BUILDINGS[recipe.buildingId];
    lines.push(`count:${stage.machines} ${plural(building.name, stage.machines)} · Floor ${index + 1}`);
  }
  if (plan.limitNote) lines.push(plan.limitNote);
  for (const stage of plan.stages) {
    if (stage.underfedNote) lines.push(stage.underfedNote);
  }
  lines.push(`Mk${plan.beltMk} belt · ${plan.beltPerMin} items/min on every line`);
  for (const stage of plan.stages) lines.push(...stageLines(stage));
  for (const stage of plan.stages) {
    if (stage.drawnPerMin <= 0) continue;
    const recipe = RECIPES[stage.recipeId];
    const item = itemName(recipe.outputs[0]?.itemId ?? "");
    if (stage.surplusPerMin > SURPLUS_EPSILON) {
      lines.push(
        `Surplus ${trim(stage.surplusPerMin)} ${item} / min. Feed end: smart splitter, Any to the bank, Overflow out (to sink). Clocks stay at 100%.`,
      );
    } else if (Math.abs(stage.outputPerMin - stage.drawnPerMin) <= SURPLUS_EPSILON) {
      lines.push(`${item} balances the next machines. Clocks stay at 100%.`);
    }
  }
  const seen = new Set<string>();
  for (const stage of plan.stages) {
    if (seen.has(stage.recipeId)) continue;
    seen.add(stage.recipeId);
    lines.push(cite(stage));
  }
  if (plan.stages.some((stage) => (RECIPES[stage.recipeId].inputs.length ?? 0) > 1)) {
    lines.push("Input lanes step 1 m outward per height. The lowest lane is farthest from the machines.");
  }
  lines.push("1 m foundations, 8 m grid. Floors are 3 wall-heights (12 m) apart.");
  lines.push("Walk the gaps between machines. The ramp is at the feed end.");
  for (const [index, line] of lines.entries()) {
    const p = document.createElement("p");
    if (index === 0) p.className = "stat";
    else if (line.startsWith("count:")) {
      p.className = "counts";
      p.textContent = line.slice("count:".length);
      host.append(p);
      continue;
    } else if (line.includes("is receiving")) p.className = "warn";
    p.textContent = line;
    host.append(p);
  }
}

function stageLines(stage: StagePlan): string[] {
  const recipe = RECIPES[stage.recipeId];
  const building = BUILDINGS[recipe.buildingId];
  const output = recipe.outputs[0];
  const lines = [`${stage.machines} ${plural(building.name, stage.machines)} · ${recipe.name} · 100%`];
  if (!stage.underfedNote) {
    const inputs = recipe.inputs
      .map((stack, index) => `${itemName(stack.itemId)} in ${trim(stage.inputsPerMin[index] ?? 0)} / min`)
      .join(" + ");
    lines.push(`${inputs} → ${itemName(output?.itemId ?? "")} out ${trim(stage.outputPerMin)} / min`);
  }
  return lines;
}

function cite(stage: StagePlan): string {
  const recipe = RECIPES[stage.recipeId];
  const inputs = recipe.inputs
    .map((stack) => `${stack.perCycle} × ${itemName(stack.itemId)} (${trim(stack.perMin)}/min)`)
    .join(" + ");
  const output = recipe.outputs[0];
  return `${recipe.name}: ${inputs} → ${output?.perCycle ?? "?"} × ${itemName(output?.itemId ?? "")} (${trim(output?.perMin ?? 0)}/min) in ${recipe.cycleSeconds} s.`;
}

function itemName(itemId: string): string {
  if (isItemId(itemId)) return ITEMS[itemId].name;
  return itemId;
}

function isItemId(itemId: string): itemId is ItemId {
  return Object.prototype.hasOwnProperty.call(ITEMS, itemId);
}

function plural(name: string, count: number): string {
  if (count === 1) return name;
  if (name === "Foundry") return "Foundries";
  return `${name}s`;
}

function trim(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

renderProducts();
demo.addEventListener("click", () => {
  showChain("cast-screw", 3);
});

for (const input of document.querySelectorAll<HTMLInputElement>('input[name="mk"]')) {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    showChain(selection.chainId, selectedMk());
  });
}

showChain(selection.chainId, selection.mk);
