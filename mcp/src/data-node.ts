import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import {
  createSrdData,
  type ConditionsFile,
  type MonstersFile,
  type SrdData,
} from "./data.js";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "../data");

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8")) as T;
}

/**
 * Read the shipped dataset off disk. Node-only — the filesystem access lives
 * here so `data.ts` stays runnable anywhere.
 */
export function loadSrdData(): SrdData {
  return createSrdData(
    loadJson<MonstersFile>("monsters.json"),
    loadJson<ConditionsFile>("conditions.json")
  );
}
