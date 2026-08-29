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
npm test              # builds, then runs unit + in-memory MCP protocol tests
bash scripts/smoke.sh # end-to-end over stdio
```

Requires Node 20 or newer.

## Schema changes

Schema files in `data/schema/` are hand-written. If the parser adds new fields,
update the schema and add a test case to `mcp/src/test/tools.test.ts`. Schema
changes require a minor version bump.

## Releasing (maintainer)

Publishing is automated. Pushing a `vX.Y.Z` tag runs
`.github/workflows/release.yml`, which re-runs the whole gate and publishes to
npm with a signed provenance statement. Do not `npm publish` by hand — the
manual path produces an unsigned tarball and skips the checks.

1. Regenerate `data/` with the parser and review the diff.
2. Bump the version in `CHANGELOG.md` and `mcp/package.json`. The MCP server
   reads its reported version from `package.json`, so there is no third place.
3. `cd mcp && npm run prepare && npm test`
4. Commit and push `main`, then tag `vX.Y.Z` and push the tag.

The tag is the trigger, so push it only when `main` is where you want it. The
workflow refuses to run if the tag and `mcp/package.json` disagree on the
version, validates `data/` against the schemas, packs the tarball and asserts
the real contents (every `dist/` entry point plus the full 322-monster /
14-condition dataset), and skips the publish if that version is already on npm
— so re-tagging or re-running the job is safe.

### npm credentials — there aren't any

The workflow authenticates with **OIDC trusted publishing**: GitHub mints a
short-lived, workflow-scoped credential at publish time. There is no npm token
in this repo, no repository secret, and nothing to rotate. Provenance is
generated automatically as a result — which is why the publish command carries
no `--provenance` flag.

The one-time setup lives on npm, at
<https://www.npmjs.com/package/@adkinn/fifth-edition-srd-mcp/access> →
**Trusted publisher**: organization `adkinn`, repository `srd-5.2.1`, workflow
filename `release.yml` (filename only, extension included, case-sensitive),
environment empty, allowed action `npm publish`.
