import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { RichLine, tn, tx, withLang } from "./parts";

/** Long-form text (legal pages): a heading and paragraphs, `**bold**` allowed, in a reading column. */
export default function RichTextBlock({ content: c, ctx, place }: BlockProps<"rich_text">) {
  const heading = tx(ctx, c.heading);
  const paragraphs = c.paragraphs.filter((p) => tx(ctx, p).trim() !== "");
  if (!heading && paragraphs.length === 0) return null;
  const H = place.first ? "h1" : "h2";

  return (
    <Section
      tone={place.tone}
      className={place.first ? "pt-10 md:pt-14 lg:pt-[72px]" : undefined}
      aria-label={heading ? undefined : tx(ctx, paragraphs[0]).slice(0, 80)}
      {...rootProps("rich_text", place)}
    >
      <Container>
        <div className="flex max-w-[760px] flex-col gap-5">
          {heading && <H className="v2-h2 mb-3">{tn(ctx, c.heading)}</H>}
          {paragraphs.map((p, i) => (
            // A paragraph shown in the other language carries its own lang and dir.
            <p key={i} className="v2-copy text-base text-body lg:text-[17px] lg:leading-[1.7] rtl:lg:leading-[1.9]">
              {withLang(ctx, p, <RichLine text={tx(ctx, p)} />)}
            </p>
          ))}
        </div>
      </Container>
    </Section>
  );
}
