import { findMonster, LICENSE } from "../data.js";
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

export function handleLookupMonster(args: { name: string }) {
  const monster = findMonster(args.name);
  if (!monster) {
    return { _license: LICENSE, monster: null };
  }
  return { _license: LICENSE, monster };
}
