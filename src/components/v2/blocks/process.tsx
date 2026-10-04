import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { SectionHead, tn, tx } from "./parts";
import Steps from "./steps";

/** "From first call to a live ERP, one team.": the implementation phases on a rail. */
export default function ProcessBlock({ content: c, ctx, place }: BlockProps<"process">) {
  const steps = c.steps
    .filter((s) => tx(ctx, s.title) !== "")
    .map((s) => ({ title: tn(ctx, s.title), description: tn(ctx, s.description), duration: tn(ctx, s.duration) }));
  return (
    <Section tone={place.tone} {...rootProps("process", place)}>
      <Container className="flex flex-col gap-10 lg:gap-14">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tn(ctx, c.heading)} intro={tn(ctx, c.intro)} />
        <Steps steps={steps} tone={place.tone} />
      </Container>
    </Section>
  );
}
