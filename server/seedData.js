import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadSeedData() {
  const contentJson = JSON.parse(
    await readFile(path.join(__dirname, "../src/data/content.json"), "utf-8")
  );
  const productsJson = JSON.parse(
    await readFile(path.join(__dirname, "../src/data/products.json"), "utf-8")
  );
  return { contentJson, productsJson };
}
