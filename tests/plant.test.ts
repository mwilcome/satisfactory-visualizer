import { describe, expect, it } from "vitest";
import { BUILDINGS, FOUNDATION_HEIGHTS_LATER_M, storyAirM, storyClearanceM } from "../src/data/catalog";
import { CHAINS, standardChain, type ChainId } from "../src/data/chains";
import {
  AWESOME_SINK_PARTS,
  BUFFER_PARTS,
  CONSTRUCTOR_PARTS,
  MERGER_PARTS,
  SMART_SPLITTER_PARTS,
  SMELTER_PARTS,
  SPLITTER_PARTS,
  STORAGE_CONTAINER_PARTS,
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
    expect(footprintErrors(SMART_SPLITTER_PARTS, { x: 4, y: 1, z: 4 })).toEqual([]);
    expect(footprintErrors(STORAGE_CONTAINER_PARTS, { x: 5, y: 4, z: 11 })).toEqual([]);
    expect(footprintErrors(AWESOME_SINK_PARTS, { x: 16, y: 24, z: 13 })).toEqual([]);
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

  it("puts Any to the industrial bank and Overflow straight to the sink at the feed end", () => {
    const screws = buildDemoPlant(3);
    const sink = screws.solids.find((solid) => solid.kind === "sink");
    const bank = screws.solids.find((solid) => solid.kind === "bank");
    const smart = screws.solids.find((solid) => solid.kind === "smartSplitter");
    expect(smart?.size).toEqual({ x: 4, y: 1, z: 4 });
    expect(sink?.size).toEqual({ x: 16, y: 24, z: 13 });
    expect(bank?.size).toEqual({ x: 11, y: 8, z: 5 });
    expect(smart && smart.base.x < screws.feedEndX).toBe(true);
    expect(sink && sink.base.x < screws.feedEndX).toBe(true);
    expect(bank && bank.base.x < screws.feedEndX).toBe(true);
    expect(sink && smart && Math.abs(sink.base.x - smart.base.x) < 1e-6 && sink.base.z > smart.base.z).toBe(true);
    const overflow = screws.belts.find((belt) => belt.id.endsWith("overflow-to-sink"));
    expect(overflow && sink && Math.max(overflow.from.z, overflow.to.z) <= sink.base.z - sink.size.z / 2 + 1e-6).toBe(true);
    expect(screws.labels.some((label) => label.text === "Any")).toBe(true);
    expect(screws.labels.some((label) => label.text === "Overflow")).toBe(true);
    expect(screws.labels.some((label) => label.text === "Bank")).toBe(true);

    const plate = buildChainPlant(solveChain("iron-plate", 3));
    expect(plate.solids.some((solid) => solid.kind === "sink" || solid.kind === "smartSplitter")).toBe(false);
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

  it("keeps Mk1 Cable from Iron Wire and says the cable stage is underfed", () => {
    const plan = solveChain("cable-iron", 1);
    expect(plan.blockedReason).toBeNull();
    expect(plan.stages.map((stage) => stage.machines)).toEqual([1, 2, 1]);
    expect(plan.stages[2]?.underfedNote).toMatch(/60/);
    expect(plan.stages[2]?.underfedNote).toMatch(/45/);
    const plant = buildChainPlant(plan);
    expect(layoutIssues(plant)).toEqual([]);
    expect(plant.labels.some((label) => label.id === "cable-underfed")).toBe(true);
    expect(plant.belts.some((belt) => belt.rowId === "cable" && belt.role === "input-port")).toBe(true);
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
