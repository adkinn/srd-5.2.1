import { searchMonsters, LICENSE } from "../data.js";
import { z } from "zod";

const searchMonstersInputSchema = z.object({
  cr: z.string().optional().describe(
    "Challenge rating string, e.g. '0', '1/8', '1/4', '1/2', '1' through '30'"
  ),
  type: z.string().optional().describe(
    "Monster type: aberration, beast, celestial, construct, dragon, elemental, fey, fiend, giant, humanoid, monstrosity, ooze, plant, undead"
  ),
  size: z.string().optional().describe(
    "Monster size: Tiny, Small, Medium, Large, Huge, Gargantuan"
  ),
});

export const searchMonstersTool = {
  name: "search_monsters",
  description:
    "Filter SRD 5.2.1 monsters by challenge rating, type, and/or size. All filters are optional. Returns monster summaries (no full stat blocks — use lookup_monster for the full record).",
  inputSchema: searchMonstersInputSchema,
};

export function handleSearchMonsters(args: {
  cr?: string;
  type?: string;
  size?: string;
}) {
  const results = searchMonsters(args);
  const summaries = results.map((m) => ({
    id: m.id,
    name: m.name,
    cr: m.cr,
    type: m.type,
    size: m.size,
    hp_max: m.hp_max,
    armor_class: m.armor_class,
  }));
  return { _license: LICENSE, count: summaries.length, monsters: summaries };
}
