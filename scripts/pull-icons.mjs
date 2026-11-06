/**
 * Copy item icons from the pinned SatisfactoryTools snapshot into public/icons.
 * The game install keeps these textures inside pak files. This snapshot already
 * extracted the 64px UI icons and names them with the same ids as the catalog.
 *
 * Source: greeny/SatisfactoryTools @ 2bd164690a29136365fcfda6f9adcaaf2d6de214
 * Run: node scripts/pull-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = fs.readFileSync(path.join(root, "src/data/generated-catalog.ts"), "utf8");
const section = catalog.slice(catalog.indexOf("export const ITEM_LIST"), catalog.indexOf("export const RECIPE_LIST"));
const ids = [...section.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);
const commits = [
  "2bd164690a29136365fcfda6f9adcaaf2d6de214",
  "2192bd155f9a138e80a07a5caac6ba2773d6980a",
];
const outDir = path.join(root, "public/icons");
fs.mkdirSync(outDir, { recursive: true });

const missing = [];
let saved = 0;
const queue = [...ids];

async function pull(id) {
  const dest = path.join(outDir, `${id}.png`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 8) {
    saved += 1;
    return;
  }
  let response = null;
  for (const commit of commits) {
    const url = `https://raw.githubusercontent.com/greeny/SatisfactoryTools/${commit}/www/assets/images/items/${id}_64.png`;
    response = await fetch(url);
    if (response.ok) break;
  }
  if (!response?.ok) {
    missing.push(`${id} ${response?.status ?? "no response"}`);
    return;
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 8) {
    missing.push(`${id} empty`);
    return;
  }
  fs.writeFileSync(path.join(outDir, `${id}.png`), bytes);
  saved += 1;
}

const workers = Array.from({ length: 8 }, async () => {
  while (queue.length > 0) {
    const id = queue.shift();
    if (id) await pull(id);
  }
});
await Promise.all(workers);
console.log(`saved ${saved} of ${ids.length} into public/icons`);
if (missing.length > 0) {
  console.log("missing:");
  for (const line of missing) console.log(line);
}
