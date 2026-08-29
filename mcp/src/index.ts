#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import { createSrdServer } from "./server.js";

// Read the version off package.json rather than restating it here — the
// hardcoded "1.0.0" was still being reported in the 1.1.0 release.
const { version } = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../package.json"),
    "utf-8"
  )
) as { version: string };

const server = createSrdServer(version);
await server.connect(new StdioServerTransport());
