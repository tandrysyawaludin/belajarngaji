import { fetchSurahWithTranslation } from "@/lib/quran";
import { getSurah } from "@/data/surahs";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const chapter = Number.parseInt(id, 10);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    return Response.json({ error: "invalid chapter" }, { status: 400 });
  }
  const meta = getSurah(chapter);
  if (!meta) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  try {
    const verses = await fetchSurahWithTranslation(chapter);
    return Response.json(
      { meta, verses },
      {
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
