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
assert.ok(existsSync("LICENSE"), "npm package must ship its code license");
assert.ok(existsSync("README.md"), "npm package must ship its README");
assert.equal(pkg.scripts.prepack, undefined, "prepack must not duplicate prepare");

console.log("Package metadata lint passed");
