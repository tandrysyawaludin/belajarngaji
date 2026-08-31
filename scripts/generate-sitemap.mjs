// ponytail: regex scrape of TS sources — upgrade to shared URL builder if sitemap drifts.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
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
  "/berkebun",
  "/tukang-burger",
  "/kotak-rahasia",
  "/tic-tac-toe",
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
];

const surahTs = readFileSync(resolve(root, "src/data/surahs.ts"), "utf8");
const iqraTs = readFileSync(resolve(root, "src/lib/iqra.ts"), "utf8");

const surahNumbers = [...surahTs.matchAll(/number:\s*(\d+)/g)].map((m) =>
  Number(m[1]),
);

function iqraPageNumbers(jilid) {
  const marker = `export const IQRA_JILID_${jilid}_PAGES`;
  const start = iqraTs.indexOf(marker);
  if (start < 0) return [];
  const next = iqraTs.indexOf("export const", start + marker.length);
  const block = iqraTs.slice(start, next > 0 ? next : undefined);
  const refs = [
    ...block.matchAll(new RegExp(`IQRA_JILID_${jilid}_PAGE_(\\d+)`, "g")),
  ].map((m) => Number(m[1]));
  if (refs.length > 0) return refs.sort((a, b) => a - b);
  return [...block.matchAll(/page:\s*(\d+)/g)].map((m) => Number(m[1]));
}

const urls = [];

for (const path of STATIC_PATHS) {
  urls.push({
    loc: `${siteUrl}${path}`,
    priority: path === "" ? "1.0" : "0.8",
    changefreq: "weekly",
  });
}

for (const n of surahNumbers) {
  urls.push({
    loc: `${siteUrl}/surah/${n}`,
    priority: "0.6",
    changefreq: "monthly",
  });
}

for (let jilid = 1; jilid <= 6; jilid++) {
  for (const page of iqraPageNumbers(jilid)) {
    urls.push({
      loc: `${siteUrl}/iqra/jilid-${jilid}/halaman-${page}`,
      priority: "0.5",
      changefreq: "monthly",
    });
  }
}

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-Agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(resolve(root, "public/sitemap.xml"), xml, "utf8");
writeFileSync(resolve(root, "public/robots.txt"), robots, "utf8");
console.log(`wrote ${urls.length} urls to public/sitemap.xml`);
