import type { BeltMk } from "../data/catalog";
import { solveChain } from "./chain";

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
  const plan = solveChain("cast-screw", beltMk);
  if (plan.blockedReason) throw new Error(plan.blockedReason);
  const ingot = plan.stages[0];
  const screw = plan.stages[1];
  if (!ingot || !screw) throw new Error("Cast Screws chain is missing a stage.");
  return {
    beltMk,
    beltPerMin: plan.beltPerMin,
    constructors: screw.machines,
    smelters: ingot.machines,
    screwsPerMin: screw.outputPerMin,
    ingotsConsumedPerMin: screw.inputPerMin,
    ingotsProducedPerMin: ingot.outputPerMin,
    ingotSurplusPerMin: ingot.outputPerMin - screw.inputPerMin,
    orePerMin: ingot.inputPerMin,
  };
}

/** Readable default. Mk3 fits five constructors — a real manifold, still small. */
export const DEMO_BELT_MK: BeltMk = 3;
