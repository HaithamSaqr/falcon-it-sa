import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/page-editor";
import { decodePageKey } from "@/lib/admin/page-keys";

type Props = { params: Promise<{ page: string }> };

/** Block editor and page SEO for one page key (e.g. /admin/pages/sector%3Areal-estate). */
export default async function AdminPageEditor({ params }: Props) {
  const page = decodePageKey((await params).page);
  if (!page) notFound();
  return <PageEditor key={page} page={page} />;
}
