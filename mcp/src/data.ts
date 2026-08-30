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

/** The on-disk shape of `data/monsters.json`. */
export interface MonstersFile {
  _license: string;
  monsters: Monster[];
}

/** The on-disk shape of `data/conditions.json`. */
export interface ConditionsFile {
  _license: string;
  conditions: Condition[];
}

/** The dataset plus the queries the tools run against it. */
export interface SrdData {
  license: string;
  monsters: Monster[];
  conditions: Condition[];
  findMonster(name: string): Monster | null;
  findCondition(name: string): Condition | null;
  searchMonsters(filters: { cr?: string; type?: string; size?: string }): Monster[];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
}

/**
 * Build the queryable dataset from the two JSON files.
 *
 * This module reads nothing. The parsed files come in as arguments so the same
 * code runs in a Worker — which has no filesystem and inlines the JSON at build
 * time — as on Node, where `loadSrdData()` in `data-node.ts` reads them from
 * disk for the stdio bin.
 */
export function createSrdData(
  monstersFile: MonstersFile,
  conditionsFile: ConditionsFile
): SrdData {
  const monsters = monstersFile.monsters;
  const conditions = conditionsFile.conditions;

  const monstersByName = new Map(monsters.map((m) => [slugify(m.name), m]));
  const conditionsByKey = new Map(conditions.map((c) => [c.key, c]));

  return {
    license: monstersFile._license,
    monsters,
    conditions,
    findMonster(name) {
      return monstersByName.get(slugify(name)) ?? null;
    },
    findCondition(name) {
      return conditionsByKey.get(slugify(name)) ?? null;
    },
    searchMonsters(filters) {
      return monsters.filter((m) => {
        if (filters.cr !== undefined && m.cr !== filters.cr) return false;
        if (filters.type !== undefined && m.type !== filters.type) return false;
        if (filters.size !== undefined && m.size !== filters.size) return false;
        return true;
      });
    },
  };
}
