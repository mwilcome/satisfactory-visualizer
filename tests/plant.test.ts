import { describe, expect, it } from "vitest";
import { BUILDINGS, FOUNDATION_HEIGHTS_LATER_M, storyAirM, storyClearanceM } from "../src/data/catalog";
import {
  BUFFER_PARTS,
  CONSTRUCTOR_PARTS,
  MERGER_PARTS,
  SMELTER_PARTS,
  SPLITTER_PARTS,
  footprintErrors,
} from "../src/data/parts";
import { layoutIssues } from "../src/layout/invariants";
import { buildDemoPlant } from "../src/layout/plant";
import { solveScrewsFromIron } from "../src/solve/screws";

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
    });
  }
});
