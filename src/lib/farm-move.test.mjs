import assert from "node:assert/strict";
import {
  getForwardReach,
  rollMoveRange,
  MOVE_RANGE_MAX,
  MOVE_RANGE_MIN,
} from "./farm-move.ts";

assert.deepEqual(getForwardReach(1, 3), [2, 3, 4]);
assert.deepEqual(getForwardReach(28, 4), [29, 30]);
assert.deepEqual(getForwardReach(30, 2), []);

const range = rollMoveRange(() => 0);
assert.ok(range >= MOVE_RANGE_MIN && range <= MOVE_RANGE_MAX);

console.log("farm-move ok");
