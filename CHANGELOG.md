# Changelog

## v1.4.0 — 2026-08-29

Additive. The dataset, the tool names, the arguments, and the response
envelopes are unchanged, and the stdio bin behaves exactly as it did in 1.3.0.

- **Declare an `exports` map.** The package previously declared no supported
  import surface at all — `main` pointed at the stdio bin, so the only sanctioned
  way to consume it was as a spawned subprocess. It now exposes `.` (the bin,
  unchanged), `./server` (the server factory and the query layer), and the two
  raw dataset files at `./data/monsters.json` and `./data/conditions.json`.
- **Make the server runnable without a filesystem.** The query layer no longer
  reads its own data: `createSrdData(monstersFile, conditionsFile)` builds the
  dataset from parsed JSON, and `createSrdServer(version, data)` takes it as an
  argument. `node:fs` now lives only in the stdio bin and its loader, so
  `./server` imports cleanly in a Cloudflare Worker or any other
  browser-standard runtime with the JSON inlined at build time.
- Lint the `exports` map against what actually ships — every declared subpath
  must resolve to a real file covered by `files`, checked after the build.

`createSrdServer` now requires a dataset as its second argument. It was never
reachable through a declared entry point before this release, so no supported
usage changes.

## v1.3.0 — 2026-08-29

- Validate tool arguments with Zod. Each tool's schema is the single source for
  both the `inputSchema` advertised over `tools/list` (via `z.toJSONSchema`) and
  the check the `tools/call` handler runs before dispatch. Calls with malformed
  arguments now come back as tool errors naming the offending field, instead of
  surfacing an internal exception as a JSON-RPC failure, and `search_monsters`
  accepts an omitted arguments object. Arguments a tool does not declare are
  still ignored rather than rejected — no previously-working call changes
  behavior.
- Report the real package version over `initialize`. The server hardcoded
  `1.0.0` and was still reporting it as of the 1.1.0 release; it now reads the
  version from `package.json`.
- Remove the obsolete `user_id` property from the monster JSON Schema.
- Repair package-lock identity/version/engine metadata after the npm scope move.
- Ship package-root README and combined license guidance, align Node types with
  the Node 20 runtime floor, and stop compiling tests into the npm tarball.
- Remove the duplicate pack-time build and cleanly mirror data before packing.

## v1.2.1 — 2026-08-26

Contact address only. No change to the dataset, the tool names, the arguments,
or the response envelopes.

`package.json` now carries an `author` email — `npm@adamkinney.com`, a dedicated
address for open-source traffic. It previously listed a name and a URL but no
address, so npm showed no way to reach the maintainer.

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
