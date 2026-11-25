interface CloudPuppyProps {
  size?: number;
  className?: string;
}

/**
 * Awan — an original fluffy white cloud-puppy mascot.
 * Smooth inline SVG only: long droopy ears, a sky-blue bow,
 * pink cheeks and a tiny swirl tail. No third-party characters.
 */
export function CloudPuppy({ size = 120, className = "" }: CloudPuppyProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Awan, anak anjing awan yang ceria"
      className={className}
    >
      {/* tail swirl */}
      <path d="M168 148c14-2 20-12 14-22-5-8-16-7-18 1-1 6 4 9 8 7" fill="none" stroke="#EAF6FF" strokeWidth="10" strokeLinecap="round" />
      <path d="M168 148c14-2 20-12 14-22-5-8-16-7-18 1-1 6 4 9 8 7" fill="none" stroke="#BFE6FF" strokeWidth="3" strokeLinecap="round" />
      {/* long droopy ears */}
      <ellipse cx="38" cy="104" rx="22" ry="48" fill="#FFFFFF" stroke="#D6F0FF" strokeWidth="4" transform="rotate(14 38 104)" />
      <ellipse cx="162" cy="104" rx="22" ry="48" fill="#FFFFFF" stroke="#D6F0FF" strokeWidth="4" transform="rotate(-14 162 104)" />
      <ellipse cx="40" cy="112" rx="10" ry="30" fill="#FFE3F0" transform="rotate(14 40 112)" />
      <ellipse cx="160" cy="112" rx="10" ry="30" fill="#FFE3F0" transform="rotate(-14 160 112)" />
      {/* fluffy cloud body / head */}
      <g fill="#FFFFFF" stroke="#D6F0FF" strokeWidth="4">
        <circle cx="100" cy="108" r="58" />
        <circle cx="58" cy="76" r="28" stroke="none" />
        <circle cx="100" cy="58" r="32" stroke="none" />
        <circle cx="142" cy="76" r="28" stroke="none" />
        <circle cx="66" cy="146" r="24" stroke="none" />
        <circle cx="134" cy="146" r="24" stroke="none" />
      </g>
      {/* little feet */}
      <ellipse cx="72" cy="168" rx="16" ry="9" fill="#FFFFFF" stroke="#D6F0FF" strokeWidth="3" />
      <ellipse cx="128" cy="168" rx="16" ry="9" fill="#FFFFFF" stroke="#D6F0FF" strokeWidth="3" />
      {/* sky-blue bow */}
      <g>
        <path d="M100 44 L74 30 Q66 44 74 56 Z" fill="#7EC8F7" stroke="#5EB2F2" strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 44 L126 30 Q134 44 126 56 Z" fill="#7EC8F7" stroke="#5EB2F2" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="100" cy="44" r="8" fill="#5EB2F2" />
        <circle cx="100" cy="44" r="3.5" fill="#AEE3FF" />
      </g>
      {/* pink cheeks */}
      <ellipse cx="62" cy="122" rx="11" ry="7" fill="#FFB7D5" opacity="0.9" />
      <ellipse cx="138" cy="122" rx="11" ry="7" fill="#FFB7D5" opacity="0.9" />
      {/* happy face */}
      <path d="M76 104 q7 -8 14 0" fill="none" stroke="#23405E" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 104 q7 -8 14 0" fill="none" stroke="#23405E" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="100" cy="116" rx="6" ry="4.5" fill="#23405E" />
      <path d="M92 126 q8 7 16 0" fill="none" stroke="#23405E" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M100 130 q0 6 -6 6 M100 130 q0 6 6 6" fill="none" stroke="#FF8FBF" strokeWidth="3" strokeLinecap="round" />
      {/* sparkles */}
      <path d="M28 42 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#FFD66E" />
      <path d="M172 36 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 Z" fill="#FFB7D5" />
    </svg>
  );
}
