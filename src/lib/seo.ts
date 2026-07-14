import type { Metadata } from "next";
import { strings } from "@/lib/strings";

export const SITE_URL = "https://belajarngaji.my.id";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title,
      description,
      url: path,
    },
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: strings.siteTitle,
        description: strings.siteDescription,
        inLanguage: "id",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: strings.siteTitle,
        url: SITE_URL,
        description: strings.siteDescription,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
        },
        inLanguage: "id",
      },
    ],
  };
}
