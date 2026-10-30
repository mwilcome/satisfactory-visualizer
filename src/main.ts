import { BUILDINGS, ITEMS, RECIPES, isBeltMk, type BeltMk, type ItemId } from "./data/catalog";
import { layoutIssues } from "./layout/invariants";
import { buildChainPlant } from "./layout/plant";
import type { Plant } from "./layout/types";
import { FactoryView } from "./render/view";
import { SURPLUS_EPSILON, type StagePlan } from "./solve/chain";
import { canLayOut, recipeChoices, selectableItems, solveTarget, standardRecipe } from "./solve/target";
import { STORAGE_KEY, parseSelection, serializeSelection, type Selection } from "./ui/selection";

const viewportEl = document.querySelector<HTMLElement>("#viewport");
const summaryEl = document.querySelector<HTMLElement>("#summary");
const titleEl = document.querySelector<HTMLElement>("#title");
const ledeEl = document.querySelector<HTMLElement>("#lede");
const searchEl = document.querySelector<HTMLInputElement>("#item-search");
const listEl = document.querySelector<HTMLUListElement>("#item-list");
const recipeFieldEl = document.querySelector<HTMLElement>("#recipe-field");
const recipesEl = document.querySelector<HTMLElement>("#recipes");

if (!viewportEl || !summaryEl || !titleEl || !ledeEl || !searchEl || !listEl || !recipeFieldEl || !recipesEl) {
  throw new Error("App shell is missing.");
}

const viewport: HTMLElement = viewportEl;
const summary: HTMLElement = summaryEl;
const title: HTMLElement = titleEl;
const lede: HTMLElement = ledeEl;
const search: HTMLInputElement = searchEl;
const itemList: HTMLUListElement = listEl;
const recipeField: HTMLElement = recipeFieldEl;
const recipesHost: HTMLElement = recipesEl;
const targets = selectableItems();
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

function showItem(next: Selection): void {
  selection = next;
  persist();
  const item = ITEMS[selection.itemId];
  const picked = selection.recipes[selection.itemId];
  const goal = (picked && RECIPES[picked]) || standardRecipe(selection.itemId);
  title.textContent = item?.name ?? selection.itemId;
  const inputs = goal?.inputs.map((stack) => itemName(stack.itemId)).join(" + ") ?? "";
  lede.textContent = goal ? `${goal.name}. ${inputs} in. The belt sets the rate.` : "Search for a part.";
  document.title = `${title.textContent} — Satisfactory visualizer`;
  search.value = item?.name ?? "";
  renderRecipeChoices();
  setMk(selection.mk);

  const plan = solveTarget(selection.itemId, selection.mk, selection.recipes);
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

function renderRecipeChoices(): void {
  const groups = recipeChoices(selection.itemId, selection.recipes);
  recipesHost.replaceChildren();
  for (const group of groups) {
    const block = document.createElement("div");
    block.className = "recipe-group";
    const heading = document.createElement("p");
    heading.textContent = group.itemName;
    const marks = document.createElement("div");
    marks.className = "marks col";
    marks.setAttribute("role", "radiogroup");
    marks.setAttribute("aria-label", group.itemName);
    const options = group.options.filter(
      (option) =>
        option.id === group.selectedId ||
        canLayOut(selection.itemId, { ...selection.recipes, [group.itemId]: option.id }),
    );
    if (options.length < 2) continue;
    for (const option of options) {
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `recipe-${group.itemId}`;
      input.value = option.id;
      input.checked = option.id === group.selectedId;
      input.addEventListener("change", () => {
        if (!input.checked) return;
        showItem({
          ...selection,
          recipes: { ...selection.recipes, [group.itemId]: option.id },
        });
      });
      const label = document.createElement("label");
      label.append(input, document.createTextNode(option.alternate ? `${option.name} (alternate)` : option.name));
      marks.append(label);
    }
    block.append(heading, marks);
    recipesHost.append(block);
  }
  recipeField.hidden = recipesHost.childElementCount === 0;
}

let activeOption = -1;

function openList(query: string): void {
  const needle = query.trim().toLowerCase();
  const matches = targets.filter((item) => item.name.toLowerCase().includes(needle)).slice(0, 80);
  itemList.replaceChildren();
  activeOption = -1;
  for (const [index, item] of matches.entries()) {
    const option = document.createElement("li");
    option.id = `item-opt-${index}`;
    option.setAttribute("role", "option");
    option.textContent = item.name;
    option.addEventListener("mousedown", (event) => {
      event.preventDefault();
      chooseItem(item.id);
    });
    itemList.append(option);
  }
  const open = matches.length > 0;
  itemList.hidden = !open;
  search.setAttribute("aria-expanded", open ? "true" : "false");
}

function chooseItem(itemId: string): void {
  itemList.hidden = true;
  search.setAttribute("aria-expanded", "false");
  showItem({ itemId, mk: selectedMk(), recipes: { ...selection.recipes } });
}

function moveActive(delta: number): void {
  const options = [...itemList.querySelectorAll<HTMLElement>('[role="option"]')];
  if (options.length === 0) return;
  activeOption = (activeOption + delta + options.length) % options.length;
  for (const [index, option] of options.entries()) {
    option.setAttribute("aria-selected", index === activeOption ? "true" : "false");
    if (index === activeOption) {
      search.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    }
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

search.addEventListener("focus", () => openList(search.value));
search.addEventListener("input", () => openList(search.value));
search.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (itemList.hidden) openList(search.value);
    moveActive(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    moveActive(-1);
  } else if (event.key === "Enter") {
    const selectedOption = itemList.querySelector<HTMLElement>('[aria-selected="true"]');
    const name = selectedOption?.textContent;
    const item = targets.find((entry) => entry.name === name);
    if (item) {
      event.preventDefault();
      chooseItem(item.id);
    }
  } else if (event.key === "Escape") {
    itemList.hidden = true;
    search.setAttribute("aria-expanded", "false");
  }
});
search.addEventListener("blur", () => {
  itemList.hidden = true;
  search.setAttribute("aria-expanded", "false");
  const item = ITEMS[selection.itemId];
  if (item) search.value = item.name;
});

for (const input of document.querySelectorAll<HTMLInputElement>('input[name="mk"]')) {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    showItem({ ...selection, mk: selectedMk() });
  });
}

showItem(selection);
