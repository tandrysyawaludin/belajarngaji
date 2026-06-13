import { notFound } from "next/navigation";
import { IqraWorkbookPage } from "@/components/IqraWorkbookPage";
import {
  getIqraJilidOnePage,
  IQRA_JILID_1_PAGES,
} from "@/lib/iqra";
import { strings } from "@/lib/strings";

export function generateStaticParams() {
  return IQRA_JILID_1_PAGES.map((page) => ({
    slug: `halaman-${page.page}`,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageNumber = Number.parseInt(slug.replace("halaman-", ""), 10);
  const page = getIqraJilidOnePage(pageNumber);
  if (!page) return { title: strings.siteTitle };

  return {
    title: `${strings.iqraJilid} ${page.jilid} ${strings.iqraPage} ${page.page} — ${strings.siteTitle}`,
  };
}

export default async function IqraJilidOneDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageNumber = Number.parseInt(slug.replace("halaman-", ""), 10);
  const page = getIqraJilidOnePage(pageNumber);
  if (!page) notFound();

  return <IqraWorkbookPage page={page} />;
}
