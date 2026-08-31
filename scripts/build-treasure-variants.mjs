import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TREASURE_SOURCE = new URL("../public/animations/treasure.lottie", import.meta.url);
const DIAMOND_SOURCE = new URL("./assets/diamond-source.lottie", import.meta.url);
const OUT_DIR = new URL("../public/animations/", import.meta.url);

function keys(frames) {
  return frames.map((frame, index) => {
    const item = { t: frame.t, s: frame.s };
    if (index < frames.length - 1) {
      item.i = { x: [0.67], y: [1] };
      item.o = { x: [0.33], y: [0] };
    }
    return item;
  });
}

function keysVec(frames) {
  return frames.map((frame, index) => {
    const item = { t: frame.t, s: frame.s };
    if (index < frames.length - 1) {
      const dim = frame.s.length;
      item.i = { x: Array(dim).fill(0.67), y: Array(dim).fill(1) };
      item.o = { x: Array(dim).fill(0.33), y: Array(dim).fill(0) };
    }
    return item;
  });
}

function readLottieJson(fileUrl) {
  const dir = mkdtempSync(join(tmpdir(), "lottie-src-"));
  execFileSync("unzip", ["-o", "-q", fileUrl.pathname, "-d", dir]);
  const animation = JSON.parse(
    readFileSync(join(dir, "animations/12345.json"), "utf8"),
  );
  rmSync(dir, { recursive: true, force: true });
  return animation;
}

function remapAssetId(id) {
  return `gem_${id}`;
}

function remapLayers(layers) {
  return structuredClone(layers).map((layer) => {
    if (layer.refId) layer.refId = remapAssetId(layer.refId);
    return layer;
  });
}

function diamondAssets(diamond) {
  return diamond.assets.map((asset) => ({
    ...structuredClone(asset),
    id: remapAssetId(asset.id),
    w: asset.w ?? diamond.w,
    h: asset.h ?? diamond.h,
    layers: remapLayers(asset.layers),
  }));
}

function luckyDiamondLayer() {
  return {
    ddd: 0,
    ind: 6,
    ty: 0,
    nm: "Lucky diamond",
    parent: 2,
    refId: "gem_comp_1",
    sr: 1,
    w: 512,
    h: 512,
    ks: {
      o: {
        a: 1,
        k: keys([
          { t: 46, s: [0] },
          { t: 54, s: [100] },
        ]),
      },
      r: {
        a: 1,
        k: keys([
          { t: 46, s: [-12] },
          { t: 78, s: [0] },
        ]),
      },
      p: {
        a: 1,
        k: keysVec([
          { t: 46, s: [220, 86, 0] },
          { t: 74, s: [220, -78, 0] },
          { t: 86, s: [220, -64, 0] },
        ]),
      },
      a: { a: 0, k: [252, 288, 0] },
      s: {
        a: 1,
        k: keysVec([
          { t: 46, s: [8, 8, 100] },
          { t: 70, s: [48, 48, 100] },
          { t: 82, s: [42, 42, 100] },
        ]),
      },
    },
    ip: 46,
    op: 180,
    st: 46,
    bm: 0,
  };
}

function sparkleLayer(ind, position, rotation, start) {
  return {
    ddd: 0,
    ind,
    ty: 0,
    nm: "Sparkle",
    parent: 2,
    refId: "gem_comp_0",
    sr: 1,
    w: 512,
    h: 512,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: rotation },
      p: { a: 0, k: [...position, 0] },
      a: { a: 0, k: [100, 56, 0] },
      s: { a: 0, k: [38, 38, 100] },
    },
    ip: start,
    op: start + 24,
    st: start,
    bm: 0,
  };
}

function cloneAnimation(source, name, op, extraLayers = [], extraAssets = []) {
  const animation = structuredClone(source);
  animation.nm = name;
  animation.op = op;
  animation.assets = [...animation.assets, ...extraAssets];
  animation.layers = [...extraLayers, ...animation.layers];
  return animation;
}

function writeLottie(filename, animation) {
  const dir = mkdtempSync(join(tmpdir(), "treasure-variant-"));
  const animationsDir = join(dir, "animations");
  execFileSync("mkdir", ["-p", animationsDir]);
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({
      animations: [{ id: "12345", mode: "normal", direction: 1 }],
      author: "Belajar Ngaji",
      description: animation.nm,
      generator: "belajarngaji-treasure-variants",
      keywords: "",
      version: "1.0",
    }),
  );
  writeFileSync(join(animationsDir, "12345.json"), JSON.stringify(animation));
  const out = new URL(filename, OUT_DIR);
  execFileSync("zip", ["-q", "-r", "-X", out.pathname, "manifest.json", "animations"], {
    cwd: dir,
  });
  rmSync(dir, { recursive: true, force: true });
}

const treasure = readLottieJson(TREASURE_SOURCE);
const diamond = readLottieJson(DIAMOND_SOURCE);

const empty = cloneAnimation(treasure, "Open empty", 120);
const lucky = cloneAnimation(
  treasure,
  "Open lucky",
  160,
  [
    sparkleLayer(9, [150, -110], -40, 72),
    sparkleLayer(8, [292, -88], 35, 80),
    sparkleLayer(7, [186, -28], 12, 76),
    luckyDiamondLayer(),
  ],
  diamondAssets(diamond),
);

writeLottie("treasure-empty.lottie", empty);
writeLottie("treasure-lucky.lottie", lucky);
console.log("wrote treasure-empty.lottie and treasure-lucky.lottie");
