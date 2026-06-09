interface MascotProps {
  size?: number;
  mood?: "happy" | "excited" | "sad" | "thinking";
  className?: string;
}

// A cute pastel kitty mascot drawn entirely in SVG. Original art — inspired by
// the kawaii pastel aesthetic, not the Sanrio brand. Eyes/mouth change with mood.
export function Mascot({ size = 96, mood = "happy", className = "" }: MascotProps) {
  const eye = (cx: number) => {
    if (mood === "sad") {
      return <path d={`M ${cx - 6} 56 Q ${cx} 64 ${cx + 6} 56`} stroke="#2c1a3f" strokeWidth="3" strokeLinecap="round" fill="none" />;
    }
    if (mood === "thinking") {
      return <circle cx={cx} cy={58} r="3" fill="#2c1a3f" />;
    }
    if (mood === "excited") {
      return (
        <g>
          <path d={`M ${cx - 5} 50 L ${cx + 5} 60 M ${cx + 5} 50 L ${cx - 5} 60`} stroke="#2c1a3f" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }
    return <ellipse cx={cx} cy={56} rx="3.5" ry="5" fill="#2c1a3f" />;
  };

  const mouth = () => {
    if (mood === "sad") {
      return <path d="M 56 74 Q 64 68 72 74" stroke="#2c1a3f" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
    }
    if (mood === "excited") {
      return <path d="M 56 70 Q 64 80 72 70 Z" fill="#ff5e9c" stroke="#2c1a3f" strokeWidth="2" />;
    }
    return <path d="M 60 70 q 4 4 8 0" stroke="#2c1a3f" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="kitty-body" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fff0f6" />
        </radialGradient>
        <radialGradient id="cheek-blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb1d2" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffb1d2" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ears */}
      <path d="M 22 38 L 38 22 L 46 46 Z" fill="url(#kitty-body)" stroke="#2c1a3f" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 106 38 L 90 22 L 82 46 Z" fill="url(#kitty-body)" stroke="#2c1a3f" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 28 36 L 36 28 L 40 40 Z" fill="#ffb1d2" />
      <path d="M 100 36 L 92 28 L 88 40 Z" fill="#ffb1d2" />
      {/* head */}
      <ellipse cx="64" cy="64" rx="42" ry="38" fill="url(#kitty-body)" stroke="#2c1a3f" strokeWidth="2.5" />
      {/* bow */}
      <g transform="translate(86 36)">
        <path d="M -10 0 L -14 -8 L -14 8 Z" fill="#ff5e9c" stroke="#2c1a3f" strokeWidth="1.5" />
        <path d="M 10 0 L 14 -8 L 14 8 Z" fill="#ff5e9c" stroke="#2c1a3f" strokeWidth="1.5" />
        <circle r="4" fill="#ff5e9c" stroke="#2c1a3f" strokeWidth="1.5" />
        <circle r="1.2" fill="#fff" cx="-1" cy="-1" />
      </g>
      {/* cheeks */}
      <circle cx="40" cy="72" r="7" fill="url(#cheek-blush)" />
      <circle cx="88" cy="72" r="7" fill="url(#cheek-blush)" />
      {/* eyes */}
      {eye(50)}
      {eye(78)}
      {/* nose */}
      <ellipse cx="64" cy="68" rx="3.5" ry="2.5" fill="#ffd166" stroke="#2c1a3f" strokeWidth="1.5" />
      {/* whiskers */}
      <path d="M 28 64 L 42 66 M 28 70 L 42 70 M 86 66 L 100 64 M 86 70 L 100 70" stroke="#2c1a3f" strokeWidth="1.5" strokeLinecap="round" />
      {/* mouth */}
      {mouth()}
    </svg>
  );
}
