import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { handleLookupMonster } from "../tools/lookup_monster.js";
import { handleLookupCondition } from "../tools/lookup_condition.js";
import { handleSearchMonsters } from "../tools/search_monsters.js";
import { handleLicense } from "../tools/license.js";
import { createSrdServer } from "../server.js";
import { loadSrdData } from "../data-node.js";

// The dataset size is asserted from two angles (direct call and over the
// protocol). Regenerating the data should fail one obvious place, not two
// tests that appear to be about different things.
const MONSTER_COUNT = 322;

// The dataset is injected now rather than imported by the tools. Loading it once
// here is also the test that the shipped JSON still parses into the shape the
// query layer expects.
const data = loadSrdData();

async function withProtocolClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createSrdServer("test", data);
  const client = new Client({ name: "srd-test", version: "1.0.0" });

  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    return await run(client);
  } finally {
    await client.close();
    await server.close();
  }
}

function textContent(result: Awaited<ReturnType<Client["callTool"]>>): string {
  assert.ok(Array.isArray(result.content), "tool result has content blocks");
  const first = result.content[0] as { type?: unknown; text?: unknown } | undefined;
  assert.equal(first?.type, "text");
  assert.equal(typeof first?.text, "string");
  if (!first || typeof first.text !== "string") {
    throw new Error("Expected text tool content");
  }
  return first.text;
}

test("lookup_monster returns goblin", () => {
  const result = handleLookupMonster(data, { name: "goblin" });
  assert.ok(result._license, "has _license field");
  assert.ok(result.monster !== null, "goblin found");
  assert.equal(result.monster!.name, "Goblin");
  assert.equal(result.monster!.type, "humanoid");
  assert.equal(result.monster!.cr, "1/4");
});

test("lookup_monster is case-insensitive", () => {
  const lower = handleLookupMonster(data, { name: "adult red dragon" });
  const mixed = handleLookupMonster(data, { name: "Adult Red Dragon" });
  assert.deepEqual(lower.monster?.name, mixed.monster?.name);
});

test("lookup_monster returns null for unknown", () => {
  const result = handleLookupMonster(data, { name: "not-a-real-monster-xyz" });
  assert.ok(result._license, "has _license field even on miss");
  assert.equal(result.monster, null);
});

test("lookup_condition returns charmed", () => {
  const result = handleLookupCondition(data, { name: "charmed" });
  assert.ok(result._license, "has _license field");
  assert.ok(result.condition !== null, "charmed found");
  assert.equal(result.condition!.name, "Charmed");
});

test("lookup_condition returns null for unknown", () => {
  const result = handleLookupCondition(data, { name: "not-a-condition-xyz" });
  assert.equal(result.condition, null);
});

test("search_monsters filters by cr and type", () => {
  const result = handleSearchMonsters(data, { cr: "1/4", type: "humanoid" });
  assert.ok(result._license, "has _license field");
  assert.ok(result.count > 0, "found at least one CR 1/4 humanoid");
  for (const m of result.monsters) {
    assert.equal(m.cr, "1/4");
    assert.equal(m.type, "humanoid");
    assert.ok(!("stat_block_json" in m), "summaries have no stat_block_json");
  }
});

test("search_monsters with no filters returns all monsters", () => {
  const result = handleSearchMonsters(data, {});
  assert.equal(result.count, MONSTER_COUNT);
});

test("license tool returns attribution", () => {
  const result = handleLicense(data);
  assert.ok(result._license, "has _license field");
  assert.ok(result.attribution.includes("Wizards of the Coast"), "WotC credited");
  assert.ok(result.attribution.includes("Open5e"), "Open5e credited");
});

test("search_monsters accepts an omitted arguments object", async () => {
  await withProtocolClient(async (client) => {
    const listed = await client.listTools();
    const searchTool = listed.tools.find((tool) => tool.name === "search_monsters");
    assert.ok(searchTool, "search_monsters is advertised");
    assert.deepEqual(Object.keys(searchTool.inputSchema.properties ?? {}).sort(), [
      "cr",
      "size",
      "type",
    ]);
    // The advertised schema must not be stricter than the handler. Converting
    // in the default output mode reintroduces `additionalProperties: false`.
    assert.equal(
      (searchTool.inputSchema as { additionalProperties?: unknown }).additionalProperties,
      undefined,
      "advertised schema does not forbid undeclared keys the server accepts"
    );

    const result = await client.callTool({ name: "search_monsters" });
    assert.notEqual(result.isError, true);
    const payload = JSON.parse(textContent(result)) as { count: number };
    assert.equal(payload.count, MONSTER_COUNT);
  });
});

test("search_monsters ignores arguments it does not declare", async () => {
  // The schemas are deliberately not `.strict()`. Callers are language models,
  // which invent plausible-looking parameters — `limit`, `page`, `count` — on a
  // tool that advertises none of them. Undeclared keys get stripped and the
  // call succeeds; declared keys are still validated, which is what keeps a
  // non-string `cr` from reaching the filter code.
  await withProtocolClient(async (client) => {
    const result = await client.callTool({
      name: "search_monsters",
      arguments: { type: "dragon", limit: 5 },
    });
    assert.notEqual(result.isError, true);
    const payload = JSON.parse(textContent(result)) as {
      count: number;
      monsters: { type: string }[];
    };
    assert.ok(payload.count > 0, "dragons are returned");
    assert.ok(
      payload.monsters.every((m) => m.type.toLowerCase() === "dragon"),
      "the declared filter still applies"
    );
  });
});

test("lookup_monster rejects malformed arguments as a tool error", async () => {
  await withProtocolClient(async (client) => {
    const result = await client.callTool({ name: "lookup_monster", arguments: {} });
    assert.equal(result.isError, true);
    assert.match(textContent(result), /invalid arguments/i);
    assert.doesNotMatch(textContent(result), /toLowerCase|Cannot read properties/);
  });
});
