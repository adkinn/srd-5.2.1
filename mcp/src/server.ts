import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z, type ZodType } from "zod";

import type { SrdData } from "./data.js";
import { licenseTool, handleLicense } from "./tools/license.js";
import { lookupConditionTool, handleLookupCondition } from "./tools/lookup_condition.js";
import { lookupMonsterTool, handleLookupMonster } from "./tools/lookup_monster.js";
import { searchMonstersTool, handleSearchMonsters } from "./tools/search_monsters.js";

// This module is the package's programmatic entry (`@adkinn/fifth-edition-srd-mcp/server`).
// It re-exports the dataset layer so an embedder has one subpath to import from;
// the Node filesystem loader is deliberately not among them, since the reason
// this entry exists is to run where there is no filesystem.
export { createSrdData } from "./data.js";
export type {
  Condition,
  ConditionsFile,
  Monster,
  MonstersFile,
  SrdData,
} from "./data.js";

const tools = [lookupMonsterTool, lookupConditionTool, searchMonstersTool, licenseTool];

function listedTool(tool: (typeof tools)[number]): Tool {
  return {
    name: tool.name,
    description: tool.description,
    // `io: "input"` is what makes this an *input* schema. The default output
    // mode describes the parsed result, where unknown keys have already been
    // stripped — so it emits `additionalProperties: false` and advertises a
    // contract stricter than the one the handler enforces. A client that
    // validates against the advertised schema would then refuse to send a call
    // the server would have accepted.
    inputSchema: z.toJSONSchema(tool.inputSchema, {
      target: "draft-7",
      io: "input",
    }) as Tool["inputSchema"],
  };
}

function textResult(result: unknown, isError = false) {
  const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
  return {
    content: [{ type: "text" as const, text }],
    ...(isError && { isError: true }),
  };
}

function parseArguments<T extends ZodType>(toolName: string, schema: T, args: unknown):
  | { success: true; data: z.output<T> }
  | { success: false; error: ReturnType<typeof textResult> } {
  const parsed = schema.safeParse(args);
  if (parsed.success) return { success: true, data: parsed.data };
  return {
    success: false,
    error: textResult(
      `Invalid arguments for ${toolName}: ${z.prettifyError(parsed.error)}`,
      true
    ),
  };
}

/**
 * Build a server bound to a dataset. The dataset is a parameter rather than a
 * module import so the same server runs on Node (dataset read from disk) and in
 * a Worker (dataset inlined at build time).
 */
export function createSrdServer(version: string, data: SrdData): Server {
  const server = new Server(
    { name: "srd-5.2.1", version },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(listedTool),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "lookup_monster": {
        const parsed = parseArguments(name, lookupMonsterTool.inputSchema, args);
        if (!parsed.success) return parsed.error;
        return textResult(handleLookupMonster(data, parsed.data));
      }
      case "lookup_condition": {
        const parsed = parseArguments(name, lookupConditionTool.inputSchema, args);
        if (!parsed.success) return parsed.error;
        return textResult(handleLookupCondition(data, parsed.data));
      }
      case "search_monsters": {
        const parsed = parseArguments(name, searchMonstersTool.inputSchema, args ?? {});
        if (!parsed.success) return parsed.error;
        return textResult(handleSearchMonsters(data, parsed.data));
      }
      case "license": {
        const parsed = parseArguments(name, licenseTool.inputSchema, args ?? {});
        if (!parsed.success) return parsed.error;
        return textResult(handleLicense(data));
      }
      default:
        return textResult(`Unknown tool: ${name}`, true);
    }
  });

  return server;
}
