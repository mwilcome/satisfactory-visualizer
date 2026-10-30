import { BELT_MARKS, type BeltMk } from "./data/catalog";
import { layoutIssues } from "./layout/invariants";
import { buildDemoPlant } from "./layout/plant";
import type { Plant } from "./layout/types";
import { FactoryView } from "./render/view";
import { DEMO_BELT_MK } from "./solve/screws";

const viewportEl = document.querySelector<HTMLElement>("#viewport");
const summaryEl = document.querySelector<HTMLElement>("#summary");
const demoEl = document.querySelector<HTMLButtonElement>("#demo");

if (!viewportEl || !summaryEl || !demoEl) {
  throw new Error("App shell is missing.");
}

const viewport: HTMLElement = viewportEl;
const summary: HTMLElement = summaryEl;
const demo: HTMLButtonElement = demoEl;
const view = new FactoryView(viewport);

function isBeltMk(value: number): value is BeltMk {
  return BELT_MARKS.some((belt) => belt.mk === value);
}

function selectedMk(): BeltMk {
  const checked = document.querySelector<HTMLInputElement>('input[name="mk"]:checked');
  const value = Number(checked?.value);
  return isBeltMk(value) ? value : DEMO_BELT_MK;
}

function show(mk: BeltMk): void {
  const plant = buildDemoPlant(mk);
  const issues = layoutIssues(plant);
  if (issues.length > 0) {
    summary.textContent = issues.join(" ");
    return;
  }
  view.show(plant);
  renderSummary(summary, plant);
}

function renderSummary(host: HTMLElement, plant: Plant): void {
  const { plan } = plant;
  host.replaceChildren();
  const lines = [
    `${plan.screwsPerMin} screws / min`,
    `Mk${plan.beltMk} belt · ${plan.beltPerMin} items/min on every line`,
    `${plan.constructors} constructors · Cast Screws · 100%`,
    `${plan.smelters} smelters · iron ingots · 100%`,
    `Ore in ${trim(plan.orePerMin)} / min → ingots out ${trim(plan.ingotsProducedPerMin)} / min`,
    `Constructors draw ${trim(plan.ingotsConsumedPerMin)} ingots / min`,
    plan.ingotSurplusPerMin > 0.05
      ? `Surplus ${trim(plan.ingotSurplusPerMin)} ingots / min backs up in the buffer. Clocks stay at 100%.`
      : "Ingots balance the constructors. Clocks stay at 100%.",
    "Cast Screws: 5 iron ingots → 20 screws in 24 s (12.5 → 50 / min).",
    "Iron ingot: 1 iron ore → 1 ingot in 2 s (30 / min).",
    "1 m foundations, 8 m grid. Floors are 3 wall-heights (12 m) apart.",
    "Walk the gaps between machines. The ramp is at the feed end.",
  ];
  for (const [index, line] of lines.entries()) {
    const p = document.createElement("p");
    if (index === 0) p.className = "stat";
    p.textContent = line;
    host.append(p);
  }
}

function trim(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

demo.addEventListener("click", () => {
  const radio = document.querySelector<HTMLInputElement>(`input[name="mk"][value="${DEMO_BELT_MK}"]`);
  if (radio) radio.checked = true;
  show(DEMO_BELT_MK);
});

for (const input of document.querySelectorAll<HTMLInputElement>('input[name="mk"]')) {
  input.addEventListener("change", () => {
    if (input.checked) show(selectedMk());
  });
}

show(selectedMk());
