import type { SrdData } from "../data.js";
import { z } from "zod";

const lookupMonsterInputSchema = z.object({
  name: z.string().min(1).describe("Monster name, e.g. 'goblin' or 'Adult Red Dragon'"),
});

export const lookupMonsterTool = {
  name: "lookup_monster",
  description:
    "Look up a monster by name from the SRD 5.2.1 dataset. Returns the full stat block or null if not found.",
  inputSchema: lookupMonsterInputSchema,
};

export function handleLookupMonster(data: SrdData, args: { name: string }) {
  const monster = data.findMonster(args.name);
  if (!monster) {
    return { _license: data.license, monster: null };
  }
  return { _license: data.license, monster };
}
