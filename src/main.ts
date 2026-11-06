import { BUILDINGS, ITEMS, RECIPES, isBeltMk, isBuildingId, type BeltMk, type ItemId } from "./data/catalog";
import { layoutIssues } from "./layout/invariants";
import { buildChainPlant } from "./layout/plant";
import type { Plant } from "./layout/types";
import { FactoryView } from "./render/view";
import { SURPLUS_EPSILON, type StagePlan } from "./solve/chain";
import { altEntries, pickerItems, solveTarget, standardRecipe, supportedItemIds } from "./solve/target";
import { STORAGE_KEY, parseSelection, serializeSelection, type Selection } from "./ui/selection";
import { unlockedRecipeClasses } from "./ui/save-alts";

const viewportEl = document.querySelector<HTMLElement>("#viewport");
const summaryEl = document.querySelector<HTMLElement>("#summary");
const titleEl = document.querySelector<HTMLElement>("#title");
const ledeEl = document.querySelector<HTMLElement>("#lede");
const searchEl = document.querySelector<HTMLInputElement>("#item-search");
const listEl = document.querySelector<HTMLUListElement>("#item-list");
const altsEl = document.querySelector<HTMLElement>("#alts");
const altSearchEl = document.querySelector<HTMLInputElement>("#alt-search");
const altItemOnlyEl = document.querySelector<HTMLInputElement>("#alt-item-only");
const altItemOnlyLabelEl = document.querySelector<HTMLElement>("#alt-item-only-label");
const saveFileEl = document.querySelector<HTMLInputElement>("#save-file");
const saveNoteEl = document.querySelector<HTMLElement>("#save-note");
const generateEl = document.querySelector<HTMLButtonElement>("#generate");

if (
  !viewportEl ||
  !summaryEl ||
  !titleEl ||
  !ledeEl ||
  !searchEl ||
  !listEl ||
  !altsEl ||
  !altSearchEl ||
  !altItemOnlyEl ||
  !altItemOnlyLabelEl ||
  !saveFileEl ||
  !saveNoteEl ||
  !generateEl
) {
  throw new Error("App shell is missing.");
}

const viewport: HTMLElement = viewportEl;
const summary: HTMLElement = summaryEl;
const title: HTMLElement = titleEl;
const lede: HTMLElement = ledeEl;
const search: HTMLInputElement = searchEl;
const itemList: HTMLUListElement = listEl;
const altsHost: HTMLElement = altsEl;
const altSearch: HTMLInputElement = altSearchEl;
const altItemOnly: HTMLInputElement = altItemOnlyEl;
const altItemOnlyLabel: HTMLElement = altItemOnlyLabelEl;
const saveFile: HTMLInputElement = saveFileEl;
const saveNote: HTMLElement = saveNoteEl;
const generateButton: HTMLButtonElement = generateEl;
const targets = pickerItems();
const supported = supportedItemIds();
const alts = altEntries();
const view = new FactoryView(viewport);

let selection = parseSelection(localStorage.getItem(STORAGE_KEY));
let altMode: "all" | "save" = "all";
let unlockedClasses = new Set<string>();

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
  syncForm();
  const plan = solveTarget(selection.itemId, selection.mk, selection.recipes);
  if (plan.blockedReason) {
    renderBlocked(summary, plan.blockedReason);
    return;
  }
  let plant: Plant;
  try {
    plant = buildChainPlant(plan);
  } catch (error) {
    renderBlocked(summary, error instanceof Error ? error.message : "This chain cannot be laid out.");
    return;
  }
  const issues = layoutIssues(plant);
  if (issues.length > 0) {
    summary.textContent = issues.join(" ");
    return;
  }
  view.show(plant);
  renderSummary(summary, plant);
}

function refreshBeltMarks(): void {
  for (const mk of [1, 2, 3, 4] as const) {
    const input = document.querySelector<HTMLInputElement>(`input[name="mk"][value="${mk}"]`);
    const label = input?.closest("label");
    if (!input || !label) continue;
    let reason: string | null = null;
    try {
      reason = solveTarget(selection.itemId, mk, selection.recipes).blockedReason;
    } catch (error) {
      reason = error instanceof Error ? error.message : "This belt cannot build that item.";
    }
    input.disabled = reason !== null;
    label.title = reason ?? "";
  }
}

function syncForm(): void {
  const item = ITEMS[selection.itemId];
  const picked = selection.recipes[selection.itemId];
  const goal = (picked && RECIPES[picked]) || standardRecipe(selection.itemId);
  refreshBeltMarks();
  title.textContent = item?.name ?? selection.itemId;
  const inputs = goal?.inputs.map((stack) => itemName(stack.itemId)).join(" + ") ?? "";
  lede.textContent = goal ? `${goal.name}. ${inputs} in. Press Generate after you change the item, alts, or belt.` : "Search for a part.";
  document.title = `${title.textContent} — Satisfactory visualizer`;
  search.value = item?.name ?? "";
  setMk(selection.mk);
  altItemOnlyLabel.textContent = `${item?.name ?? "This item"} only`;
  renderAlts();
}

function renderAlts(): void {
  const needle = altSearch.value.trim().toLowerCase();
  const itemOnly = altItemOnly.checked;
  const visible = alts.filter((alt) => {
    if (altMode === "save" && !unlockedClasses.has(alt.className)) return false;
    if (itemOnly && alt.itemId !== selection.itemId) return false;
    if (!needle) return true;
    return `${alt.itemName} ${alt.name}`.toLowerCase().includes(needle);
  });
  altsHost.replaceChildren();
  let lastItem = "";
  for (const alt of visible) {
    if (alt.itemId !== lastItem) {
      lastItem = alt.itemId;
      const heading = document.createElement("p");
      heading.textContent = alt.itemName;
      altsHost.append(heading);
    }
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = selection.recipes[alt.itemId] === alt.id;
    input.disabled = !alt.placeable;
    input.addEventListener("change", () => {
      const recipes = { ...selection.recipes };
      if (input.checked) recipes[alt.itemId] = alt.id;
      else if (recipes[alt.itemId] === alt.id) delete recipes[alt.itemId];
      selection = { ...selection, recipes };
      persist();
      renderAlts();
      refreshBeltMarks();
    });
    const name = document.createElement("span");
    name.textContent = alt.placeable ? alt.name : `${alt.name} (needs a later building)`;
    const label = document.createElement("label");
    label.className = "alt-row";
    label.append(input, name);
    altsHost.append(label);
  }
  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    const itemLabel = ITEMS[selection.itemId]?.name ?? "this item";
    empty.textContent =
      altMode === "save"
        ? "No unlocked alts yet. Load a save, or switch to all alts."
        : itemOnly
          ? `No alts for ${itemLabel}.`
          : "No alts match.";
    altsHost.append(empty);
  }
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
    option.textContent = item.selectable ? item.name : `${item.name} — not in this phase`;
    option.setAttribute("aria-disabled", item.selectable ? "false" : "true");
    option.addEventListener("mousedown", (event) => {
      event.preventDefault();
      if (!item.selectable) return;
      chooseItem(item.id);
    });
    itemList.append(option);
  }
  const open = matches.length > 0;
  itemList.hidden = !open;
  search.setAttribute("aria-expanded", open ? "true" : "false");
}

function chooseItem(itemId: string): void {
  if (!supported.has(itemId)) return;
  itemList.hidden = true;
  search.setAttribute("aria-expanded", "false");
  selection = { itemId, mk: selectedMk(), recipes: { ...selection.recipes } };
  persist();
  syncForm();
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
    lines.push(`count:${stage.machines} ${plural(buildingName(recipe.buildingId), stage.machines)} · Floor ${index + 1}`);
  }
  if (plan.limitNote) lines.push(plan.limitNote);
  for (const stage of plan.stages) {
    if (stage.manifoldNote) lines.push(stage.manifoldNote);
    if (stage.underfedNote) lines.push(stage.underfedNote);
  }
  lines.push(`Mk${plan.beltMk} belt · ${plan.beltPerMin} items/min on every line`);
  for (const stage of plan.stages) lines.push(...stageLines(stage));
  for (const stage of plan.stages) {
    const recipe = RECIPES[stage.recipeId];
    const item = itemName(recipe.outputs[0]?.itemId ?? "");
    if (stage.surplusPerMin > SURPLUS_EPSILON && stage.drawnPerMin <= 0) {
      const kept = stage.outputPerMin - stage.surplusPerMin;
      lines.push(
        `Overflow ${trim(stage.surplusPerMin)} ${item} / min on floor ${plan.stages.indexOf(stage) + 1}. The belt keeps ${trim(kept)}. A smart splitter sends the rest out to the sink.`,
      );
      continue;
    }
    if (stage.drawnPerMin <= 0) continue;
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
  lines.push(
    plant.floors.some((floor) => floor.storyKind === "manufacturer")
      ? "Machines pack on a 1 m stride. Foundations stay 8×8. Production floors are 3 wall-heights (12 m) apart. A Manufacturer floor is 4 (16 m)."
      : "Machines pack on a 1 m stride. Foundations stay 8×8. Floors are 3 wall-heights (12 m) apart.",
  );
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

function buildingName(buildingId: string): string {
  if (!isBuildingId(buildingId)) throw new Error(`${buildingId} is not laid out.`);
  return BUILDINGS[buildingId].name;
}

function stageLines(stage: StagePlan): string[] {
  const recipe = RECIPES[stage.recipeId];
  const output = recipe.outputs[0];
  const lines = [`${stage.machines} ${plural(buildingName(recipe.buildingId), stage.machines)} · ${recipe.name} · 100%`];
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
    const item = targets.find((entry) => entry.name === name || `${entry.name} — not in this phase` === name);
    if (item?.selectable) {
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
    selection = { ...selection, mk: selectedMk() };
    persist();
  });
}

for (const input of document.querySelectorAll<HTMLInputElement>('input[name="alt-mode"]')) {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    altMode = input.value === "save" ? "save" : "all";
    renderAlts();
  });
}

altSearch.addEventListener("input", () => renderAlts());
altItemOnly.addEventListener("change", () => renderAlts());

saveFile.addEventListener("change", () => {
  const file = saveFile.files?.[0];
  if (!file) return;
  void file.arrayBuffer().then(async (bytes) => {
    try {
      unlockedClasses = await unlockedRecipeClasses(bytes);
      altMode = "save";
      const mode = document.querySelector<HTMLInputElement>('input[name="alt-mode"][value="save"]');
      if (mode) mode.checked = true;
      saveNote.textContent = `Save read in the browser. ${unlockedClasses.size} unlocked recipes. Nothing was uploaded.`;
      renderAlts();
    } catch (error) {
      saveNote.textContent = error instanceof Error ? error.message : "That save could not be read.";
    }
  });
});

generateButton.addEventListener("click", () => showItem(selection));

syncForm();
showItem(selection);
