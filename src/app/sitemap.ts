import type { MetadataRoute } from "next";
import { SURAHS } from "@/data/surahs";
import {
  IQRA_JILID_1_PAGES,
  IQRA_JILID_2_PAGES,
  IQRA_JILID_3_PAGES,
  IQRA_JILID_4_PAGES,
  IQRA_JILID_5_PAGES,
  IQRA_JILID_6_PAGES,
} from "@/lib/iqra";

const siteUrl = "https://belajarngaji.my.id";

const STATIC_PATHS = [
  "",
  "/surah",
  "/iqra",
  "/games",
  "/kuis",
  "/cocokkan",
  "/tebak-ayat",
  "/sambung",
  "/ular-tangga",
  "/riwayat",
  "/iqra/jilid-1",
  "/iqra/jilid-2",
  "/iqra/jilid-3",
  "/iqra/jilid-4",
  "/iqra/jilid-5",
  "/iqra/jilid-6",
  "/iqra/jilid-1/halaman-1",
  "/iqra/jilid-1/halaman-2",
  "/iqra/jilid-1/halaman-3",
] as const;

const IQRA_PAGES = [
  [1, IQRA_JILID_1_PAGES],
  [2, IQRA_JILID_2_PAGES],
  [3, IQRA_JILID_3_PAGES],
  [4, IQRA_JILID_4_PAGES],
  [5, IQRA_JILID_5_PAGES],
  [6, IQRA_JILID_6_PAGES],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  for (const surah of SURAHS) {
    entries.push({
      url: `${siteUrl}/surah/${surah.number}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const [jilid, pages] of IQRA_PAGES) {
    for (const page of pages) {
      entries.push({
        url: `${siteUrl}/iqra/jilid-${jilid}/halaman-${page.page}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
