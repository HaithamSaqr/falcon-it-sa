import { getProduct } from "@/lib/data-store";
import { getLocale } from "next-intl/server";
import Container from "@/components/ui/container";

/**
 * Custom HTML block rendered embedded directly inside a product page.
 * Managed per-product from /admin/products. Renders nothing when empty.
 */
export default async function ProductEmbed({ slug }: { slug: string }) {
  const p = await getProduct(slug);
  if (!p) return null;
  const isAr = (await getLocale()) === "ar";
  const html = isAr ? p.embedHtml?.ar : p.embedHtml?.en;
  if (!html || !html.trim()) return null;

  return (
    <section className="py-16 lg:py-20">
      <Container>
        <div
          className="product-embed prose prose-lg w-full max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary-600 prose-img:rounded-xl"
          dir={isAr ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Container>
    </section>
  );
}
