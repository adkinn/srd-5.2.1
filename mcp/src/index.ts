#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { lookupMonsterTool, handleLookupMonster } from "./tools/lookup_monster.js";
import { lookupConditionTool, handleLookupCondition } from "./tools/lookup_condition.js";
import { searchMonstersTool, handleSearchMonsters } from "./tools/search_monsters.js";
import { licenseTool, handleLicense } from "./tools/license.js";

// Read the version off package.json rather than restating it here — the
// hardcoded "1.0.0" was still being reported in the 1.1.0 release.
const { version } = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../package.json"),
    "utf-8"
  )
) as { version: string };

const server = new Server(
  { name: "srd-5.2.1", version },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [lookupMonsterTool, lookupConditionTool, searchMonstersTool, licenseTool],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let result: unknown;

  switch (name) {
    case "lookup_monster":
      result = handleLookupMonster(args as { name: string });
      break;
    case "lookup_condition":
      result = handleLookupCondition(args as { name: string });
      break;
    case "search_monsters":
      result = handleSearchMonsters(args as { cr?: string; type?: string; size?: string });
      break;
    case "license":
      result = handleLicense();
      break;
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
