import { cpSync, rmSync } from "node:fs";

// Mirror the canonical generated dataset exactly. Removing the destination
// first prevents files deleted upstream from lingering in a later tarball.
rmSync("data", { recursive: true, force: true });
cpSync("../data", "data", { recursive: true });
