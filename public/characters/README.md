# Character images

Drop a single image file per theme here and the app will use it as the mascot
for that theme. If a file is missing or fails to load, the app silently falls
back to the hand-drawn SVG mascot defined in `src/components/Mascot.tsx`.

## Expected filenames

The paths are wired in `src/lib/themes.ts` via the `imageSrc` field. By
default they map to:

| Theme       | Drop file at                  |
| ----------- | ----------------------------- |
| Hello Kitty | `public/characters/kitty.png` |
| My Melody   | `public/characters/melody.png` |
| Kuromi      | `public/characters/kuromi.png` |
| Cinnamoroll | `public/characters/cinnamon.png` |
| Pompompurin | `public/characters/pompom.png` |
| Keroppi     | `public/characters/keroppi.png` |

To use a different filename or format (SVG, WebP, etc.), update the
`imageSrc` value of the corresponding theme in `src/lib/themes.ts`.

## Image guidelines

- **Aspect ratio:** square (the app renders into a square box and uses
  `object-fit: contain`, so non-square also works but leaves padding).
- **Recommended size:** 256×256 to 512×512 pixels.
- **Background:** transparent (PNG, WebP, or SVG) looks best — it blends with
  the themed gradient halo behind each card.
- **Source:** you supply the files. The app does not ship any character art
  beyond the original SVG fallbacks.

## How it works

`src/components/MascotImage.tsx` renders `<img src={imageSrc}>` and uses
`onError` to switch to the SVG fallback if the request 404s. This means you
can drop or remove files at any time without touching code, and the picker
preview and in-app mascot will both update on the next page load.
