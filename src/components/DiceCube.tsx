const DICE_DOTS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const FACE_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: -180 },
};

export function DiceCube({
  value,
  rolling,
  popping = false,
}: {
  value: number | null;
  rolling: boolean;
  popping?: boolean;
}) {
  const v = value ?? 1;
  const rot = FACE_ROTATION[v];
  const settled = `rotateX(${-18 + rot.x}deg) rotateY(${-22 + rot.y}deg)`;
  return (
    <div
      className={`dice-scene ${rolling ? "is-rolling" : ""} ${
        popping ? "is-pop" : ""
      }`}
      aria-label={value ? `Dadu menunjukkan ${value}` : "Dadu belum dilempar"}
    >
      <div
        className={`dice3d ${rolling ? "is-rolling" : ""}`}
        style={{ transform: settled }}
      >
        <DiceFace3D face="front" value={1} active={rolling || v === 1} />
        <DiceFace3D face="back" value={6} active={rolling || v === 6} />
        <DiceFace3D face="right" value={3} active={rolling || v === 3} />
        <DiceFace3D face="left" value={4} active={rolling || v === 4} />
        <DiceFace3D face="top" value={2} active={rolling || v === 2} />
        <DiceFace3D face="bottom" value={5} active={rolling || v === 5} />
      </div>
    </div>
  );
}

function DiceFace3D({
  face,
  value,
  active,
}: {
  face: string;
  value: number;
  active: boolean;
}) {
  const dots = DICE_DOTS[value] ?? [5];
  return (
    <div className={`dice3d-face dice3d-face--${face}`}>
      {active &&
        Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className={`dice3d-pip ${dots.includes(index + 1) ? "" : "is-off"}`}
          />
        ))}
    </div>
  );
}

export function DiceStatement({ dice }: { dice: number }) {
  const words = [`${dice}`, "langkah"];
  return (
    <p
      role="status"
      aria-live="polite"
      className="text-left text-4xl font-extrabold leading-snug text-emerald-800"
    >
      {words.map((word, index) => (
        <span
          key={`${index}-${word}`}
          className="dice-word"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
