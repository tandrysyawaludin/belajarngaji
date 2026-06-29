// Original pixel-art mascots, drawn as inline SVG on a 16x16 grid. No external
// image assets and no third-party characters — fully owned art, free to ship.
// Three headwear styles (Muslim hijab/peci, a round hat, a cowboy hat) across
// girl and boy = six distinct characters, all tinted from the theme palette.

export type Gender = "girl" | "boy";
export type HatKind = "muslim" | "hat" | "cowboy";

type Rect = [x: number, y: number, w: number, h: number];

const SKIN = "#ffd3a3";
const SKIN_SHADE = "#f0b483";
const EYE = "#3a2c3f";
const MOUTH = "#d6557f";
const BLUSH = "#ff9bb3";
const HAIR = "#4a3526";
const WHITE = "#ffffff";

function Pixels({ rects, fill }: { rects: Rect[]; fill: string }) {
  return (
    <>
      {rects.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </>
  );
}

export function PixelMascot({
  gender,
  hat,
  cover,
  coverDark,
  garment,
  size = 96,
  className = "",
}: {
  gender: Gender;
  hat: HatKind;
  cover: string;
  coverDark: string;
  garment: string;
  size?: number;
  className?: string;
}) {
  const hijabGirl = gender === "girl" && hat === "muslim";
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-hidden="true"
    >
      {hijabGirl ? (
        <HijabGirl cover={cover} coverDark={coverDark} garment={garment} />
      ) : (
        <Character
          gender={gender}
          hat={hat}
          cover={cover}
          coverDark={coverDark}
          garment={garment}
        />
      )}
    </svg>
  );
}

function HijabGirl({
  cover,
  coverDark,
  garment,
}: {
  cover: string;
  coverDark: string;
  garment: string;
}) {
  return (
    <>
      <Pixels
        fill={cover}
        rects={[
          [4, 0, 8, 1],
          [3, 1, 10, 1],
          [2, 2, 12, 10],
          [0, 11, 16, 5],
        ]}
      />
      <Pixels
        fill={coverDark}
        rects={[
          [3, 2, 10, 1],
          [2, 11, 12, 1],
          [7, 0, 2, 1],
        ]}
      />
      <Pixels fill={SKIN} rects={[[4, 3, 8, 7]]} />
      <Pixels fill={SKIN_SHADE} rects={[[4, 9, 8, 1]]} />
      <Pixels fill={EYE} rects={[[6, 6, 1, 2], [9, 6, 1, 2]]} />
      <Pixels fill={BLUSH} rects={[[5, 7, 1, 1], [10, 7, 1, 1]]} />
      <Pixels fill={MOUTH} rects={[[7, 8, 2, 1]]} />
      <Pixels fill={garment} rects={[[6, 12, 4, 4], [5, 13, 6, 3]]} />
    </>
  );
}

function Character({
  gender,
  hat,
  cover,
  coverDark,
  garment,
}: {
  gender: Gender;
  hat: HatKind;
  cover: string;
  coverDark: string;
  garment: string;
}) {
  const isGirl = gender === "girl";
  return (
    <>
      {/* Hair — long sides for girls, short for boys */}
      <Pixels
        fill={HAIR}
        rects={
          isGirl
            ? [[3, 3, 10, 1], [2, 4, 2, 8], [12, 4, 2, 8]]
            : [[3, 3, 10, 1], [3, 4, 1, 3], [12, 4, 1, 3]]
        }
      />
      {/* Face */}
      <Pixels fill={SKIN} rects={[[4, 4, 8, 7]]} />
      {!isGirl && <Pixels fill={SKIN} rects={[[3, 7, 1, 2], [12, 7, 1, 2]]} />}
      <Pixels fill={SKIN_SHADE} rects={[[4, 10, 8, 1]]} />
      {/* Eyes, blush, mouth */}
      <Pixels fill={EYE} rects={[[6, 6, 1, 2], [9, 6, 1, 2]]} />
      <Pixels fill={BLUSH} rects={[[5, 8, 1, 1], [10, 8, 1, 1]]} />
      <Pixels fill={MOUTH} rects={[[7, 9, 2, 1]]} />
      {/* Shirt + collar */}
      <Pixels fill={garment} rects={[[2, 11, 12, 5]]} />
      <Pixels fill={WHITE} rects={[[6, 11, 4, 1], [7, 12, 2, 1]]} />
      {/* Headwear on top */}
      <Headwear hat={hat} cover={cover} coverDark={coverDark} />
    </>
  );
}

function Headwear({
  hat,
  cover,
  coverDark,
}: {
  hat: HatKind;
  cover: string;
  coverDark: string;
}) {
  if (hat === "muslim") {
    // Peci / songkok cap
    return (
      <>
        <Pixels fill={cover} rects={[[4, 0, 8, 1], [3, 1, 10, 3]]} />
        <Pixels fill={coverDark} rects={[[3, 3, 10, 1], [7, 0, 2, 1]]} />
      </>
    );
  }
  if (hat === "cowboy") {
    // Wide brim + upturned ends + crown
    return (
      <>
        <Pixels fill={cover} rects={[[5, 0, 6, 3], [1, 3, 14, 1]]} />
        <Pixels
          fill={coverDark}
          rects={[[5, 2, 6, 1], [1, 2, 2, 1], [13, 2, 2, 1]]}
        />
      </>
    );
  }
  // Round / bucket hat
  return (
    <>
      <Pixels fill={cover} rects={[[4, 0, 8, 3], [2, 3, 12, 1]]} />
      <Pixels fill={coverDark} rects={[[4, 2, 8, 1]]} />
    </>
  );
}
