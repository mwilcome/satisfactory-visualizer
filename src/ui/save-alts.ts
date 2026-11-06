import { SCHEMATIC_RECIPES } from "../data/catalog";

/**
 * Read unlocked schematic names from a save in the browser.
 * The file is not uploaded. Only schematic managers are scanned.
 */
export async function unlockedRecipeClasses(bytes: ArrayBuffer): Promise<Set<string>> {
  const { Parser } = await import("@etothepii/satisfactory-file-parser");
  const save = Parser.ParseSave("upload.sav", bytes, { throwErrors: false });
  const schematics = new Set<string>();
  for (const level of Object.values(save.levels)) {
    for (const object of level.objects) {
      const typePath = "typePath" in object ? object.typePath : "";
      if (!/SchematicManager|UnlockSubsystem|ResearchManager/i.test(typePath)) continue;
      collectSchematics(object, schematics);
    }
  }
  const recipes = new Set<string>();
  for (const schematic of schematics) {
    const unlocked = SCHEMATIC_RECIPES[schematic];
    if (!unlocked) continue;
    for (const className of unlocked) recipes.add(className);
  }
  return recipes;
}

function collectSchematics(value: unknown, out: Set<string>, depth = 0): void {
  if (depth > 12 || value == null) return;
  if (typeof value === "string") {
    const matches = value.match(/Schematic_[A-Za-z0-9_]+|Research_[A-Za-z0-9_]+/g);
    if (matches) for (const match of matches) out.add(match);
    return;
  }
  if (typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const entry of value) collectSchematics(entry, out, depth + 1);
    return;
  }
  for (const entry of Object.values(value)) collectSchematics(entry, out, depth + 1);
}
