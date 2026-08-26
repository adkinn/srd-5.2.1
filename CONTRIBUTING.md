# Contributing

## Reporting data issues

This is the most useful thing you can do here. If a monster or condition value
looks wrong, open an issue with:

- The monster/condition name
- The field that looks incorrect
- What the SRD says vs. what we have
- Whether [Open5e](https://api.open5e.com/) also has the wrong value

Known discrepancies are already documented in
[data/expected-mismatches.md](data/expected-mismatches.md) — check there first.

## Updating the dataset

The JSON files in `data/` are generated — **do not edit them by hand**, and PRs
that do will be closed. The parser that produces them is not public, so dataset
corrections have to go through an issue and a regenerated release.

Code changes to the MCP server (`mcp/`) are a different story and are welcome as
normal pull requests.

## Working on the MCP server

```bash
cd mcp
npm ci
npm run build
npm test              # unit tests against dist/
bash scripts/smoke.sh # end-to-end over stdio
```

Requires Node 20 or newer.

## Schema changes

Schema files in `data/schema/` are hand-written. If the parser adds new fields,
update the schema and add a test case to `mcp/src/test/tools.test.ts`. Schema
changes require a minor version bump.

## Releasing (maintainer)

1. Regenerate `data/` with the parser and review the diff.
2. Bump the version in `CHANGELOG.md` and `mcp/package.json`. The MCP server
   reads its reported version from `package.json`, so there is no third place.
3. `cd mcp && npm run prepare && npm test`
4. Commit, tag `vX.Y.Z`, push with `--tags`, then `npm publish` from `mcp/`.
