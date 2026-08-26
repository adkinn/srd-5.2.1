import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../data");

export interface Monster {
  id: string;
  name: string;
  size: string;
  type: string;
  cr: string;
  cr_numeric: number;
  hp_max: number;
  hp_formula: string;
  armor_class: number;
  initiative_modifier: number;
  source: string;
  attribution: string;
  stat_block_json: Record<string, unknown>;
}

export interface Condition {
  key: string;
  name: string;
  description: string;
  attribution: string;
}

interface MonstersFile {
  _license: string;
  monsters: Monster[];
}

interface ConditionsFile {
  _license: string;
  conditions: Condition[];
}

function loadJson<T>(filename: string): T {
  const raw = readFileSync(join(dataDir, filename), "utf-8");
  return JSON.parse(raw) as T;
}

const monstersFile = loadJson<MonstersFile>("monsters.json");
const conditionsFile = loadJson<ConditionsFile>("conditions.json");

export const LICENSE = monstersFile._license;

export const monsters: Monster[] = monstersFile.monsters;
export const conditions: Condition[] = conditionsFile.conditions;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
}

export const monstersByName = new Map<string, Monster>(
  monsters.map((m) => [slugify(m.name), m])
);

export const conditionsByKey = new Map<string, Condition>(
  conditions.map((c) => [c.key, c])
);

export function findMonster(name: string): Monster | null {
  return monstersByName.get(slugify(name)) ?? null;
}

export function findCondition(name: string): Condition | null {
  const slug = slugify(name);
  return conditionsByKey.get(slug) ?? null;
}

export function searchMonsters(filters: {
  cr?: string;
  type?: string;
  size?: string;
}): Monster[] {
  return monsters.filter((m) => {
    if (filters.cr !== undefined && m.cr !== filters.cr) return false;
    if (filters.type !== undefined && m.type !== filters.type) return false;
    if (filters.size !== undefined && m.size !== filters.size) return false;
    return true;
  });
}
