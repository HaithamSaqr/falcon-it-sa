import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { SectionHead, tx } from "./parts";
import Steps from "./steps";

/** "Four steps, no surprises.": the sector plan with typical durations. */
export default function PlanBlock({ content: c, ctx, place }: BlockProps<"plan">) {
  const steps = c.steps
    .map((s) => ({ title: tx(ctx, s.title), description: tx(ctx, s.description), duration: tx(ctx, s.duration) }))
    .filter((s) => s.title !== "");
  return (
    <Section tone={place.tone} {...rootProps("plan", place)}>
      <Container className="flex flex-col gap-10 lg:gap-[52px]">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tx(ctx, c.heading)} intro={tx(ctx, c.intro)} />
        <Steps steps={steps} tone={place.tone} gap="lg:gap-8" />
      </Container>
    </Section>
  );
}
