# Changelog

## v1.2.0 — 2026-08-26

Renamed and re-homed. No change to the dataset, the tool names, the arguments,
or the response envelopes.

**Package renamed to `@adkinn/fifth-edition-srd-mcp`.** The old
`@cocoajamworld/fifth-edition-srd-mcp` is deprecated on npm and gets no further
releases; installs of 1.1.0 keep working. The repo moved to
`github.com/adkinn/srd-5.2.1` (the old path redirects).

**Fixes:**
- The `license` tool and the LICENSE file pointed attribution at
  `cocoajam.world`, which no longer resolves. Attribution now names Adam Kinney
  and links somewhere that answers. WotC and Open5e credits are unchanged — they
  were always the load-bearing part of the CC BY 4.0 attribution.
- The server reported `version: "1.0.0"` in the MCP `initialize` handshake all
  through the 1.1.0 release. It now reads the version from `package.json`, so it
  can't drift again.
- The exported `Monster` type still declared `user_id`, which v1.1.0 removed
  from the data. Dropped from the interface.
- JSON Schema `$id` URLs updated to the new repo path.

**Maintenance:**
- `@modelcontextprotocol/sdk` 1.9 → 1.30, TypeScript 5.8 → 7.0, `@types/node`
  22 → 24. `npm audit` clean (the SDK's transitive `hono`/`fast-uri`/
  `body-parser` advisories are resolved).
- Minimum Node raised to 20 (18 is end-of-life). CI now runs 20/22/24.

## v1.1.0 — 2026-05-15

Dataset cleanup pass: smaller payload, less internal-schema leakage.

**Data:**
- Dropped the internal-only `user_id` field (always `null` for SRD records) from every monster record.
- Empty arrays, empty strings, and `null` values are now omitted entirely rather than serialized. `monsters.json` shrunk ~7% (899KB → 835KB).
- JSON Schema relaxed: `StatBlock` arrays like `damage_immunities`, `condition_immunities`, `languages`, `traits`, `actions`, `reactions`, `senses`, `saving_throws`, `skills` are now optional (they're absent rather than `[]` / `{}` when empty).

**Compatibility note:** Consumers that iterated fields like `monster.stat_block_json.languages` should now defensively check for absence (treat missing as empty). The MCP server itself returns records as-is — no API surface change to tool names, arguments, or response envelopes.

**MCP server:**
- `@cocoajamworld/fifth-edition-srd-mcp` v1.1.0 — same tools, smaller payloads.

## v1.0.0 — 2026-05-14

Initial publication of SRD 5.2.1 monsters and conditions as structured JSON + stdio MCP server.

**Data:**
- 322 monsters with full stat blocks (`data/monsters.json`)
- 14 conditions with markdown-formatted rules text (`data/conditions.json`)
- JSON Schema (draft-07) for both datasets

**Source lineage:** Data fetched from the Open5e API (`document__slug=wotc-srd`), which
re-publishes the WotC SRD 5.2.1 under CC BY 4.0. Cross-referenced against Open5e raw to
catch transformation regressions. Known discrepancies documented in `data/expected-mismatches.md`.

**MCP server:**
- `@cocoajamworld/fifth-edition-srd-mcp` v1.0.0
- Tools: `lookup_monster`, `lookup_condition`, `search_monsters`, `license`
- Installable via `npx @cocoajamworld/fifth-edition-srd-mcp`
