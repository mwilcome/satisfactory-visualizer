import {
  type BeltMk,
  RECIPES,
  beltByMk,
  machinesPerBelt,
} from "../data/catalog";

export interface ScrewPlan {
  beltMk: BeltMk;
  beltPerMin: number;
  constructors: number;
  smelters: number;
  screwsPerMin: number;
  ingotsConsumedPerMin: number;
  ingotsProducedPerMin: number;
  ingotSurplusPerMin: number;
  orePerMin: number;
}

/**
 * Cast Screws from iron ore.
 * The goal line is capped by the selected belt mark (screws out are the
 * tight constraint). Smelters are whole machines at 100%. Surplus ingots
 * back up into the stage buffer — clocks are not lowered to soak it up.
 */
export function solveScrewsFromIron(beltMk: BeltMk): ScrewPlan {
  const belt = beltByMk(beltMk);
  const screws = RECIPES["cast-screw"];
  const ingots = RECIPES["iron-ingot"];
  const screwOut = screws.outputs[0].perMin;
  const screwIn = screws.inputs[0].perMin;
  const ingotOut = ingots.outputs[0].perMin;

  const constructors = machinesPerBelt(screws, belt.perMin);
  if (constructors < 1) {
    throw new Error(`Mk${beltMk} cannot feed a single Cast Screws constructor.`);
  }

  const ingotsConsumedPerMin = constructors * screwIn;
  const smelters = Math.ceil(ingotsConsumedPerMin / ingotOut - 1e-9);
  const smelterCap = machinesPerBelt(ingots, belt.perMin);
  if (smelters > smelterCap) {
    throw new Error(
      `Mk${beltMk} cannot carry ${smelters} smelters at 100% (cap ${smelterCap}).`,
    );
  }

  const ingotsProducedPerMin = smelters * ingotOut;
  return {
    beltMk,
    beltPerMin: belt.perMin,
    constructors,
    smelters,
    screwsPerMin: constructors * screwOut,
    ingotsConsumedPerMin,
    ingotsProducedPerMin,
    ingotSurplusPerMin: ingotsProducedPerMin - ingotsConsumedPerMin,
    orePerMin: smelters * ingots.inputs[0].perMin,
  };
}

/** Readable default. Mk3 fits five constructors — a real manifold, still small. */
export const DEMO_BELT_MK: BeltMk = 3;
