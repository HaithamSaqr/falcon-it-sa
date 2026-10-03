import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { SectionHead, tx } from "./parts";
import Steps from "./steps";

/** "From first call to a live ERP, one team.": the implementation phases on a rail. */
export default function ProcessBlock({ content: c, ctx, place }: BlockProps<"process">) {
  const steps = c.steps
    .map((s) => ({ title: tx(ctx, s.title), description: tx(ctx, s.description), duration: tx(ctx, s.duration) }))
    .filter((s) => s.title !== "");
  return (
    <Section tone={place.tone} {...rootProps("process", place)}>
      <Container className="flex flex-col gap-10 lg:gap-14">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tx(ctx, c.heading)} intro={tx(ctx, c.intro)} />
        <Steps steps={steps} tone={place.tone} />
      </Container>
    </Section>
  );
}
