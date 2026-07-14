import assert from "node:assert/strict";
import {
  GRID_CELLS,
  MOUSE_COUNT,
  applyAction,
  canDoAction,
  createFarm,
} from "./farm-grid.ts";

let roll = 0;
const farm = createFarm(() => (roll++ % GRID_CELLS) / GRID_CELLS);
const mice = farm.filter((c) => c.mouse).length;
const trees = farm.filter((c) => c.tree).length;
assert.equal(mice, MOUSE_COUNT);
assert.equal(trees, 1);

const soil = { mouse: false, tree: false, treePicked: false, crop: "none" };
assert.equal(canDoAction({ ...soil, mouse: true }, "kill"), true);
assert.equal(canDoAction({ ...soil, mouse: true }, "seed"), false);

let plot = { ...soil };
plot = applyAction(plot, "seed").cell;
assert.equal(plot.crop, "seeded");
plot = applyAction(plot, "water").cell;
assert.equal(plot.crop, "ready");
const harvested = applyAction(plot, "harvest");
assert.equal(harvested.carrot, true);
assert.equal(harvested.cell.crop, "none");

assert.equal(farm.length, GRID_CELLS);
console.log("farm-grid ok");
