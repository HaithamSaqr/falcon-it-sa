import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { PrimaryCta, tn } from "./parts";

/**
 * The committed brand-blue band (once per page): the promise on one side, a
 * white card with the note and the "Book a demo" link on the other. On sector
 * pages the link carries `?sector=&role=`.
 */
export default function BookingBlock({ content: c, ctx, place }: BlockProps<"booking">) {
  const body = tn(ctx, c.body);
  const noteTitle = tn(ctx, c.noteTitle);
  const note = tn(ctx, c.note);
  const H = place.first ? "h1" : "h2";

  return (
    <Section tone="brand" className="pb-28 md:pb-24 lg:pb-28" {...rootProps("booking", place)}>
      <Container className="grid items-start gap-8 lg:items-center lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_540px] xl:gap-24">
        <div className="flex min-w-0 flex-col gap-[18px] lg:gap-6">
          <H className="v2-h2-xl">{tn(ctx, c.heading)}</H>
          {body && (
            <p className="v2-copy max-w-[540px] text-base text-[#E3EFFB] lg:text-xl rtl:lg:leading-[1.9]">{body}</p>
          )}
        </div>
        <div className="rounded-[26px] bg-white/12 p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] sm:rounded-[32px] sm:p-2">
          <div className="flex flex-col gap-[18px] rounded-[20px] bg-surface p-5 text-ink sm:rounded-[25px] sm:p-[34px]">
            {(noteTitle || note) && (
              <div className="flex flex-col gap-2">
                {noteTitle && (
                  <h3 className="text-xl font-extrabold leading-tight tracking-[-0.01em] [overflow-wrap:anywhere] lg:text-[22px] rtl:font-bold rtl:leading-snug rtl:tracking-normal">
                    {noteTitle}
                  </h3>
                )}
                {note && <p className="v2-copy text-[15px] text-body lg:text-base lg:leading-[1.6]">{note}</p>}
              </div>
            )}
            <PrimaryCta
              ctx={ctx}
              label={tn(ctx, c.cta.label)}
              href={c.cta.href}
              className="mt-1 w-full justify-between"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
