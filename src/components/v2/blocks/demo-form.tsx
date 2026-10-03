import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { SectionHead, tx } from "./parts";

/**
 * Frames the demo booking form: heading, body and privacy note beside a white
 * card holding the form. The form itself (fields, calendar, API contract) is
 * passed in by the demo page through the renderer context.
 */
export default function DemoFormBlock({ content: c, ctx, place }: BlockProps<"demo_form">) {
  const note = tx(ctx, c.privacyNote);
  return (
    <Section tone={place.tone} className={place.first ? "pt-10 md:pt-14 lg:pt-[72px]" : undefined} {...rootProps("demo_form", place)}>
      <Container
        className={
          ctx.demoForm
            ? "grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-16 xl:gap-24"
            : "grid"
        }
      >
        <SectionHead as={place.first ? "h1" : "h2"} heading={tx(ctx, c.heading)} intro={tx(ctx, c.body)}>
          {note && <p className="v2-copy mt-2 max-w-[470px] text-sm text-muted">{note}</p>}
        </SectionHead>
        {ctx.demoForm && (
          <div className="rounded-[26px] bg-ink/[0.035] p-1.5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)] sm:rounded-[32px] sm:p-2">
            <div className="rounded-[20px] bg-surface p-5 sm:rounded-[25px] sm:p-[34px]">{ctx.demoForm}</div>
          </div>
        )}
      </Container>
    </Section>
  );
}
