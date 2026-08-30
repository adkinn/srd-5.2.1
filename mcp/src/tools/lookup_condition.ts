import type { SrdData } from "../data.js";
import { z } from "zod";

const lookupConditionInputSchema = z.object({
  name: z.string().min(1).describe("Condition name, e.g. 'charmed' or 'Blinded'"),
});

export const lookupConditionTool = {
  name: "lookup_condition",
  description:
    "Look up a condition by name from the SRD 5.2.1 dataset. Returns the condition rules or null if not found.",
  inputSchema: lookupConditionInputSchema,
};

export function handleLookupCondition(data: SrdData, args: { name: string }) {
  const condition = data.findCondition(args.name);
  if (!condition) {
    return { _license: data.license, condition: null };
  }
  return { _license: data.license, condition };
}
