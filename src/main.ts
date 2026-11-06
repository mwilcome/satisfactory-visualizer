import { BUILDINGS, FOUNDATION_SIZE_M, ITEMS, RECIPES, isBeltMk, isBuildingId, type BeltMk, type ItemId } from "./data/catalog";
import { layoutIssues } from "./layout/invariants";
import { buildChainPlant } from "./layout/plant";
import type { Plant, Solid, Vec3 } from "./layout/types";
import { FactoryView, LABEL_LAYERS, isLabelLayer } from "./render/view";
import { SURPLUS_EPSILON, type StagePlan } from "./solve/chain";
import { altEntries, pickerItems, solveTarget, standardRecipe, supportedItemIds } from "./solve/target";
import { STORAGE_KEY, parseSelection, serializeSelection, type Selection } from "./ui/selection";
import { unlockedRecipeClasses } from "./ui/save-alts";

const viewportEl = document.querySelector<HTMLElement>("#viewport");
const floorsEl = document.querySelector<HTMLElement>("#floors");
const detailEl = document.querySelector<HTMLElement>("#detail");
const layersEl = document.querySelector<HTMLElement>("#layers");
const labelsToggleEl = document.querySelector<HTMLInputElement>("#labels-toggle");
const labelsMoreEl = document.querySelector<HTMLButtonElement>("#labels-more");
const labelGroupsEl = document.querySelector<HTMLElement>("#label-groups");
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

if (
  !viewportEl ||
  !floorsEl ||
  !detailEl ||
  !layersEl ||
  !labelsToggleEl ||
  !labelsMoreEl ||
  !labelGroupsEl ||
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
  !saveNoteEl
) {
  throw new Error("App shell is missing.");
}

const viewport: HTMLElement = viewportEl;
const floors: HTMLElement = floorsEl;
const detail: HTMLElement = detailEl;
const layers: HTMLElement = layersEl;
const labelsToggle: HTMLInputElement = labelsToggleEl;
const labelsMore: HTMLButtonElement = labelsMoreEl;
const labelGroups: HTMLElement = labelGroupsEl;
const summary: HTMLElement = summaryEl;
const title: HTMLElement = titleEl;
const titleNameEl = title.querySelector<HTMLElement>("#title-name");
const titleIconEl = title.querySelector<HTMLImageElement>("#title-icon");
if (!titleNameEl || !titleIconEl) throw new Error("App shell is missing.");
const titleName: HTMLElement = titleNameEl;
const titleIcon: HTMLImageElement = titleIconEl;
const lede: HTMLElement = ledeEl;
const search: HTMLInputElement = searchEl;
const itemList: HTMLUListElement = listEl;
const altsHost: HTMLElement = altsEl;
const altSearch: HTMLInputElement = altSearchEl;
const altItemOnly: HTMLInputElement = altItemOnlyEl;
const altItemOnlyLabel: HTMLElement = altItemOnlyLabelEl;
const saveFile: HTMLInputElement = saveFileEl;
const saveNote: HTMLElement = saveNoteEl;
const targets = pickerItems();
const supported = supportedItemIds();
const alts = altEntries();
const view = new FactoryView(viewport);
let shown: Plant | null = null;
let cardAnchor: Vec3 | null = null;
let cardDragged = false;
let openMachineId: string | null = null;
let floorsOn = true;
let cardOn = true;
let labelsOn = false;
let rebuildTimer = 0;
view.onPick = (solid) => renderDetail(solid);
view.onFrame = () => {
  if (!cardAnchor || cardDragged || detail.hidden) return;
  moveCardBeside(cardAnchor);
};

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

function showItem(next: Selection, reframe: boolean): void {
  const keepId = reframe ? null : openMachineId;
  const keepDragged = !reframe && cardDragged;
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
  view.show(plant, reframe);
  shown = plant;
  renderFloors(floors, plant);
  renderSummary(summary, plant);
  const again = keepId ? plant.solids.find((solid) => solid.kind === "machine" && solid.id === keepId) : undefined;
  renderDetail(again ?? null, keepDragged);
}

/** Item changes rebuild immediately and reframe. Belt and recipe changes wait, and keep the camera. */
function rebuildNow(): void {
  window.clearTimeout(rebuildTimer);
  showItem(selection, true);
}

function scheduleRebuild(): void {
  window.clearTimeout(rebuildTimer);
  rebuildTimer = window.setTimeout(() => showItem(selection, false), 150);
}

function renderDetail(solid: Solid | null, keepPlacement = false): void {
  const left = detail.style.left;
  const top = detail.style.top;
  const dragged = keepPlacement && cardDragged;
  if (!solid || solid.kind !== "machine" || !shown) {
    openMachineId = null;
    cardAnchor = null;
    cardDragged = false;
    detail.hidden = true;
    detail.style.visibility = "";
    view.focusMachine(null);
    return;
  }
  openMachineId = solid.id;
  const recipe = solid.recipeId ? RECIPES[solid.recipeId] : undefined;
  const stage = shown.plan.stages.find((item) => item.stageId === solid.rowId);
  const floor = stage ? shown.plan.stages.indexOf(stage) + 1 : 0;
  const output = recipe?.outputs[0];
  const outputName = output ? itemName(output.itemId) : "Output";
  detail.replaceChildren();
  const grip = document.createElement("header");
  grip.dataset.grip = "true";
  const heading = document.createElement("h2");
  heading.textContent = outputName;
  grip.append(heading);
  detail.append(grip);
  const where = document.createElement("p");
  const building = recipe ? buildingName(recipe.buildingId) : "Machine";
  where.textContent = floor > 0 ? `${building} · Floor ${floor}` : building;
  detail.append(where);
  if (recipe) {
    const made = document.createElement("p");
    made.textContent = `${recipe.name}. ${trim(output?.perMin ?? 0)} / min from this machine.`;
    detail.append(made);
    for (const [index, stack] of recipe.inputs.entries()) {
      const line = document.createElement("p");
      const stageRate = stage?.inputsPerMin[index];
      line.textContent =
        stageRate === undefined
          ? `${itemName(stack.itemId)} in · ${trim(stack.perMin)} / min`
          : `${itemName(stack.itemId)} in · ${trim(stack.perMin)} / min each · ${trim(stageRate)} / min on the floor`;
      detail.append(line);
    }
    if (stage) {
      const out = document.createElement("p");
      out.textContent = `${outputName} out · ${trim(stage.outputPerMin)} / min from ${stage.machines} ${plural(building, stage.machines)}`;
      detail.append(out);
    }
  }
  cardDragged = dragged;
  cardAnchor = view.focusMachine(solid);
  detail.hidden = !cardOn;
  detail.style.visibility = "";
  if (dragged) {
    detail.style.left = left;
    detail.style.top = top;
    return;
  }
  if (cardAnchor && cardOn) moveCardBeside(cardAnchor);
}

function moveCardBeside(anchor: Vec3): void {
  const projected = view.project(anchor);
  if (!projected.visible) {
    detail.style.visibility = "hidden";
    return;
  }
  detail.style.visibility = "visible";
  const width = detail.offsetWidth || 280;
  const height = detail.offsetHeight || 80;
  let left = projected.x + 18;
  let top = projected.y - 8;
  if (left + width > viewport.clientWidth - 8) left = projected.x - width - 18;
  placeCard(left, top, width, height);
}

function placeCard(left: number, top: number, width = detail.offsetWidth || 280, height = detail.offsetHeight || 80): void {
  const x = Math.max(8, Math.min(left, viewport.clientWidth - width - 8));
  const y = Math.max(8, Math.min(top, viewport.clientHeight - height - 8));
  detail.style.left = `${x}px`;
  detail.style.top = `${y}px`;
}

detail.addEventListener("pointerdown", (event) => {
  const target = event.target;
  if (!(target instanceof Element) || !target.closest("[data-grip]")) return;
  cardDragged = true;
  const host = viewport.getBoundingClientRect();
  const rect = detail.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  detail.setPointerCapture(event.pointerId);
  const move = (ev: PointerEvent) => {
    placeCard(ev.clientX - host.left - offsetX, ev.clientY - host.top - offsetY);
  };
  const up = (ev: PointerEvent) => {
    detail.removeEventListener("pointermove", move);
    detail.removeEventListener("pointerup", up);
    if (detail.hasPointerCapture(ev.pointerId)) detail.releasePointerCapture(ev.pointerId);
  };
  detail.addEventListener("pointermove", move);
  detail.addEventListener("pointerup", up);
});

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
  titleName.textContent = item?.name ?? selection.itemId;
  titleIcon.src = `/icons/${selection.itemId}.png`;
  titleIcon.alt = "";
  const inputs = goal?.inputs.map((stack) => itemName(stack.itemId)).join(" + ") ?? "";
  lede.textContent = goal ? `${goal.name}. ${inputs} in. The factory updates when the item, a recipe, or the belt changes.` : "Search for a part.";
  document.title = `${titleName.textContent} — Satisfactory visualizer`;
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
      heading.className = "recipe-item";
      const icon = document.createElement("img");
      icon.src = `/icons/${alt.itemId}.png`;
      icon.alt = "";
      icon.width = 32;
      icon.height = 32;
      heading.append(icon, document.createTextNode(alt.itemName));
      altsHost.append(heading);
    }
    const input = document.createElement("input");
    input.type = "checkbox";
    const active = selection.recipes[alt.itemId] ?? standardRecipe(alt.itemId)?.id;
    input.checked = active === alt.id;
    input.disabled = !alt.placeable;
    input.addEventListener("change", () => {
      const recipes = { ...selection.recipes };
      if (input.checked) recipes[alt.itemId] = alt.id;
      else if (recipes[alt.itemId] === alt.id) delete recipes[alt.itemId];
      selection = { ...selection, recipes };
      persist();
      renderAlts();
      refreshBeltMarks();
      scheduleRebuild();
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
          ? `No other recipes for ${itemLabel}.`
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
    const icon = document.createElement("img");
    icon.src = `/icons/${item.id}.png`;
    icon.alt = "";
    icon.width = 32;
    icon.height = 32;
    const name = document.createElement("span");
    name.textContent = item.selectable ? item.name : `${item.name} — not in this phase`;
    option.setAttribute("aria-disabled", item.selectable ? "false" : "true");
    option.append(icon, name);
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
  rebuildNow();
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
    else if (line.includes("is receiving")) p.className = "warn";
    p.textContent = line;
    host.append(p);
  }
}

function renderFloors(host: HTMLElement, plant: Plant): void {
  host.replaceChildren();
  const goal = plant.plan.stages[plant.plan.stages.length - 1];
  if (goal) {
    const rate = document.createElement("p");
    rate.className = "floors-rate";
    rate.textContent = `${trim(goal.outputPerMin)} ${itemName(plant.plan.goalItemId)} / min`;
    host.append(rate);
  }
  for (const [index, stage] of plant.plan.stages.entries()) {
    const recipe = RECIPES[stage.recipeId];
    const name = buildingName(recipe.buildingId);
    const counts = machinesPerRow(plant, stage.stageId);
    const total = counts.reduce((sum, count) => sum + count, 0) || stage.machines;
    const machines = counts.length > 1 ? `${counts.join(" + ")} ${plural(name, total)}` : `${total} ${plural(name, total)}`;
    const span = foundationSpan(plant, plant.floors[index]?.id ?? stage.stageId);
    const line = document.createElement("p");
    line.textContent = `Floor ${index + 1} · ${machines} · ${counts.length > 1 ? "two rows" : "one row"} · ${span.x} × ${span.z} foundations`;
    host.append(line);
  }
  const note = document.createElement("p");
  note.className = "floors-note";
  note.textContent = "The foundation size is the whole slab, including the feed apron.";
  host.append(note);
  host.hidden = !floorsOn;
}

function applyWorldLabels(): void {
  for (const layer of LABEL_LAYERS) {
    const input = labelGroups.querySelector<HTMLInputElement>(`input[data-layer="${layer}"]`);
    view.setLabelLayer(layer, labelsOn && input?.checked === true);
  }
}

labelsToggle.addEventListener("change", () => {
  labelsOn = labelsToggle.checked;
  applyWorldLabels();
});

labelsMore.addEventListener("click", () => {
  const open = labelsMore.getAttribute("aria-expanded") === "true";
  labelsMore.setAttribute("aria-expanded", open ? "false" : "true");
  labelsMore.textContent = open ? "▾" : "▴";
  labelGroups.hidden = open;
});

layers.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.dataset.layer) return;
  const layer = input.dataset.layer;
  if (layer === "floors") {
    floorsOn = input.checked;
    floors.hidden = !floorsOn || floors.childElementCount === 0;
    return;
  }
  if (layer === "card") {
    cardOn = input.checked;
    if (!cardOn || !cardAnchor) {
      detail.hidden = true;
      return;
    }
    detail.hidden = false;
    detail.style.visibility = "";
    moveCardBeside(cardAnchor);
    return;
  }
  if (isLabelLayer(layer)) applyWorldLabels();
});

function machinesPerRow(plant: Plant, stageId: string): number[] {
  let first = 0;
  let second = 0;
  for (const solid of plant.solids) {
    if (solid.kind !== "machine" || solid.rowId !== stageId) continue;
    if ((solid.rowIndex ?? 0) >= 100) second += 1;
    else first += 1;
  }
  if (second > 0) return [first, second];
  return [first];
}

function foundationSpan(plant: Plant, floorId: string): { x: number; z: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let count = 0;
  for (const solid of plant.solids) {
    if (solid.kind !== "foundation" || solid.floorId !== floorId) continue;
    count += 1;
    minX = Math.min(minX, solid.base.x);
    maxX = Math.max(maxX, solid.base.x);
    minZ = Math.min(minZ, solid.base.z);
    maxZ = Math.max(maxZ, solid.base.z);
  }
  if (count === 0) return { x: 0, z: 0 };
  return {
    x: Math.round((maxX - minX) / FOUNDATION_SIZE_M) + 1,
    z: Math.round((maxZ - minZ) / FOUNDATION_SIZE_M) + 1,
  };
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
    scheduleRebuild();
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

syncForm();
showItem(selection, true);
