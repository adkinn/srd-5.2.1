import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf-8"));
const lockRoot = lock.packages[""];

assert.equal(lock.name, pkg.name, "package-lock name must match package.json");
assert.equal(lock.version, pkg.version, "package-lock version must match package.json");
assert.equal(lockRoot.name, pkg.name, "package-lock root name must match package.json");
assert.equal(lockRoot.version, pkg.version, "package-lock root version must match package.json");
// Read through `?.` on both sides: a lock or manifest missing its `engines`
// block should fail with the assertion message below, not a TypeError raised
// while gathering the values to compare.
assert.ok(pkg.engines?.node, "package.json must declare engines.node");
assert.equal(
  lockRoot.engines?.node,
  pkg.engines.node,
  "package-lock Node engine must match package.json"
);
// The entry map and the legacy field must agree. `main` is what an old
// resolver loads and `exports["."]` is what a modern one loads; a package where
// they disagree serves two different modules under one specifier.
assert.equal(pkg.exports?.["."], pkg.main, 'exports["."] must match main');

// Every declared subpath has to resolve to a file that actually ships. A
// subpath without a file is ERR_MODULE_NOT_FOUND at the consumer's import, and
// a file outside `files` is present in the tree but absent from the tarball —
// neither shows up in a build or a test run here. This lint runs after `build`
// for that reason: the dist targets have to exist to be checked.
for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
  const targets = typeof target === "string" ? [target] : Object.values(target);
  for (const file of targets) {
    assert.ok(existsSync(file), `exports "${subpath}" points at missing ${file}`);
    assert.ok(
      file === "./package.json" ||
        pkg.files.some((entry) => file.startsWith(`./${entry}/`)),
      `exports "${subpath}" target ${file} is not covered by "files"`
    );
  }
}

assert.ok(existsSync("LICENSE"), "npm package must ship its code license");
assert.ok(existsSync("README.md"), "npm package must ship its README");
assert.equal(pkg.scripts.prepack, undefined, "prepack must not duplicate prepare");

console.log("Package metadata lint passed");
