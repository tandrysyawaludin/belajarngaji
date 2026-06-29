import type { ThemeDef } from "@/lib/themes";
import { PixelMascot } from "./PixelMascot";

interface MascotImageProps {
  size?: number;
  /** Accepted for API compatibility; ignored — the pixel art has no moods. */
  mood?: "happy" | "excited" | "sad" | "thinking";
  className?: string;
  theme: ThemeDef;
}

/**
 * Renders a theme's original pixel-art mascot inside a soft palette circle.
 * The art is inline SVG (no image files), tinted from the theme palette.
 */
export function MascotImage({
  size = 96,
  className = "",
  theme,
}: MascotImageProps) {
  return (
    <div
      className={`relative inline-grid place-items-center overflow-hidden rounded-full ring-2 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: theme.palette.primarySoft,
        borderColor: theme.palette.primary,
      }}
    >
      <PixelMascot
        gender={theme.gender}
        hat={theme.hat}
        cover={theme.palette.primary}
        coverDark={theme.palette.primaryDeep}
        garment={theme.palette.accent}
        size={Math.round(size * 0.86)}
      />
    </div>
  );
}
