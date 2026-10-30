import { describe, expect, it } from "vitest";
import { BUILDINGS, FOUNDATION_HEIGHTS_LATER_M, storyAirM, storyClearanceM } from "../src/data/catalog";
import { CHAINS, standardChain, type ChainId } from "../src/data/chains";
import {
  BUFFER_PARTS,
  CONSTRUCTOR_PARTS,
  MERGER_PARTS,
  SMELTER_PARTS,
  SPLITTER_PARTS,
  footprintErrors,
} from "../src/data/parts";
import { layoutIssues } from "../src/layout/invariants";
import { buildChainPlant, buildDemoPlant } from "../src/layout/plant";
import { solveChain } from "../src/solve/chain";
import { solveScrewsFromIron } from "../src/solve/screws";
import { parseSelection } from "../src/ui/selection";

describe("wiki footprints", () => {
  it("matches satisfactory.wiki.gg sizes", () => {
    expect(BUILDINGS.smelter).toMatchObject({ width: 5, length: 10, height: 8.5, className: "Desc_SmelterMk1_C" });
    expect(BUILDINGS.constructor).toMatchObject({
      width: 8,
      length: 10,
      height: 8.5,
      className: "Desc_ConstructorMk1_C",
    });
    expect(BUILDINGS.foundry).toMatchObject({ width: 10, length: 10, height: 9 });
    expect(BUILDINGS.splitter).toMatchObject({ width: 4, length: 4, height: 1 });
    expect(BUILDINGS.storageIndustrial).toMatchObject({ width: 5, length: 11, height: 8 });
  });

  it("keeps mesh parts inside the real footprint and touching every face", () => {
    expect(footprintErrors(SMELTER_PARTS, { x: 5, y: 8.5, z: 10 })).toEqual([]);
    expect(footprintErrors(CONSTRUCTOR_PARTS, { x: 8, y: 8.5, z: 10 })).toEqual([]);
    expect(footprintErrors(SPLITTER_PARTS, { x: 4, y: 1, z: 4 })).toEqual([]);
    expect(footprintErrors(MERGER_PARTS, { x: 4, y: 1, z: 4 })).toEqual([]);
    expect(footprintErrors(BUFFER_PARTS, { x: 11, y: 8, z: 5 })).toEqual([]);
  });

  it("encodes 1 m foundations and wall-height stories", () => {
    expect(storyClearanceM("logistics")).toBe(8);
    expect(storyClearanceM("production")).toBe(12);
    expect(storyClearanceM("manufacturer")).toBe(16);
    expect(storyAirM("production")).toBe(11);
    expect(FOUNDATION_HEIGHTS_LATER_M).toEqual([2, 4]);
  });
});

describe("cast screw plan", () => {
  it("uses the wiki rates and the selected belt as the limit", () => {
    expect(solveScrewsFromIron(1)).toMatchObject({
      constructors: 1,
      smelters: 1,
      screwsPerMin: 50,
      orePerMin: 30,
      ingotsConsumedPerMin: 12.5,
      ingotsProducedPerMin: 30,
    });
    expect(solveScrewsFromIron(2)).toMatchObject({ constructors: 2, smelters: 1, screwsPerMin: 100 });
    expect(solveScrewsFromIron(3)).toMatchObject({
      constructors: 5,
      smelters: 3,
      screwsPerMin: 250,
      ingotsConsumedPerMin: 62.5,
      ingotsProducedPerMin: 90,
      ingotSurplusPerMin: 27.5,
    });
    expect(solveScrewsFromIron(4)).toMatchObject({ constructors: 9, smelters: 4, screwsPerMin: 450 });
  });
});

describe("manifold layout", () => {
  for (const mk of [1, 2, 3, 4] as const) {
    it(`holds the schema invariants at Mk${mk}`, () => {
      const plant = buildDemoPlant(mk);
      expect(layoutIssues(plant)).toEqual([]);
      expect(plant.solids.some((solid) => solid.kind === "machine" && solid.buildingId === "smelter")).toBe(true);
      expect(plant.belts.every((belt) => belt.mk === mk)).toBe(true);
      expect(plant.solids.every((solid) => solid.kind !== "foundation" || solid.size.y === 1)).toBe(true);
      expect(plant.floors).toHaveLength(2);
      expect(plant.ramps).toHaveLength(6);
    });
  }

  it("puts a sink stub on the open end only where a stage has surplus", () => {
    const screws = buildDemoPlant(3);
    const stubs = screws.belts.filter((belt) => belt.role === "overflow-stub");
    expect(stubs.map((belt) => belt.rowId)).toEqual(["iron-ingot"]);
    expect(stubs[0]?.designPerMin).toBe(27.5);
    expect(screws.labels.some((label) => label.text === "Sink stub")).toBe(true);

    const plate = buildChainPlant(solveChain("iron-plate", 3));
    expect(plate.belts.some((belt) => belt.role === "overflow-stub")).toBe(false);
  });
});

describe("other chains", () => {
  const chains = Object.keys(CHAINS) as ChainId[];

  for (const chainId of chains) {
    for (const mk of [1, 2, 3, 4] as const) {
      it(`lays out ${chainId} at Mk${mk} or reports the belt block`, () => {
        const plan = solveChain(chainId, mk);
        if (plan.blockedReason) {
          expect(plan.stages).toEqual([]);
          expect(() => buildChainPlant(plan)).toThrow();
          return;
        }
        const plant = buildChainPlant(plan);
        expect(layoutIssues(plant)).toEqual([]);
        expect(plant.floors).toHaveLength(CHAINS[chainId].stages.length);
        expect(plant.belts.every((belt) => belt.mk === mk)).toBe(true);
        expect(plant.ramps.length).toBe((plant.floors.length - 1) * 6);
      });
    }
  }

  it("sizes iron plate, iron rod, rod screws, and both wire chains from the belt", () => {
    expect(solveChain("iron-plate", 3).stages.map((stage) => stage.machines)).toEqual([9, 9]);
    expect(solveChain("iron-rod", 1).stages.map((stage) => stage.outputPerMin)).toEqual([60, 60]);
    expect(solveChain("screw-rod", 3).stages.map((stage) => stage.machines)).toEqual([2, 4, 6]);
    expect(solveChain("wire-copper", 3).stages[1]?.outputPerMin).toBe(270);
    expect(solveChain("wire-iron", 2).stages.map((stage) => stage.machines)).toEqual([3, 5]);
    expect(solveChain("cable-copper", 4).stages.map((stage) => stage.machines)).toEqual([8, 16, 8]);
  });

  it("belt-limits Cable from Iron Wire and blocks Mk1", () => {
    const blocked = solveChain("cable-iron", 1);
    expect(blocked.blockedReason).toMatch(/60/);
    expect(blocked.blockedReason).toMatch(/45/);
    const mk2 = solveChain("cable-iron", 2);
    expect(mk2.stages.map((stage) => stage.machines)).toEqual([2, 3, 1]);
    expect(mk2.limitNote).toMatch(/belt-limited/);
    expect(solveChain("cable-iron", 4).stages.map((stage) => stage.machines)).toEqual([8, 19, 7]);
  });
});

describe("saved output", () => {
  it("opens Cable on the copper wire feed", () => {
    expect(standardChain("cable")).toBe("cable-copper");
    expect(standardChain("wire")).toBe("wire-copper");
  });

  it("opens on Cast Screws at Mk3 when nothing is stored", () => {
    expect(parseSelection(null)).toMatchObject({ chainId: "cast-screw", mk: 3 });
  });

  it("restores a known output and mark, and drops junk", () => {
    expect(parseSelection(JSON.stringify({ chainId: "iron-rod", mk: 4 }))).toMatchObject({
      chainId: "iron-rod",
      mk: 4,
    });
    expect(parseSelection("{")).toMatchObject({ chainId: "cast-screw", mk: 3 });
    expect(parseSelection(JSON.stringify({ chainId: "nope", mk: 3 }))).toMatchObject({
      chainId: "cast-screw",
      mk: 3,
    });
    expect(parseSelection(JSON.stringify({ chainId: "wire-iron", mk: 9 }))).toMatchObject({
      chainId: "cast-screw",
      mk: 3,
    });
  });
});
