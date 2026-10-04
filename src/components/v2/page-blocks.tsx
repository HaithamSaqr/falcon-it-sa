import { getTranslations } from "next-intl/server";
import { breadcrumbLd, localizedPath } from "@/lib/seo";
import BlockRenderer, { type BlockRendererContext } from "@/components/v2/blocks";
import JsonLd from "@/components/v2/json-ld";
import type { Block } from "@/lib/blocks/types";

type Crumb = { name: string; path: string };

type Props = {
  blocks: Block[];
  locale: string;
  /** Trail after "Home" (path without locale prefix, name already in the page language). */
  crumbs: Crumb[];
  context?: BlockRendererContext;
};

/**
 * A v2 page body: the breadcrumb JSON-LD (Home, then `crumbs`) followed by
 * the page's blocks. Shared by the sector, ERP and product pages.
 */
export default async function PageBlocks({ blocks, locale, crumbs, context }: Props) {
  const lang = locale === "ar" ? "ar" : "en";
  const nav = await getTranslations({ locale: lang, namespace: "nav" });
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: nav("home"), url: localizedPath("/", lang) },
          ...crumbs.map((c) => ({ name: c.name, url: localizedPath(c.path, lang) })),
        ])}
      />
      <BlockRenderer blocks={blocks} locale={locale} context={context} />
    </>
  );
}
