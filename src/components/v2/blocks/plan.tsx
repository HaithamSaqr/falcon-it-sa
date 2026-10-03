import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { SectionHead, tn, tx } from "./parts";
import Steps from "./steps";

/** "Four steps, no surprises.": the sector plan with typical durations. */
export default function PlanBlock({ content: c, ctx, place }: BlockProps<"plan">) {
  const steps = c.steps
    .filter((s) => tx(ctx, s.title) !== "")
    .map((s) => ({ title: tn(ctx, s.title), description: tn(ctx, s.description), duration: tn(ctx, s.duration) }));
  return (
    <Section tone={place.tone} {...rootProps("plan", place)}>
      <Container className="flex flex-col gap-10 lg:gap-[52px]">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tn(ctx, c.heading)} intro={tn(ctx, c.intro)} />
        <Steps steps={steps} tone={place.tone} gap="lg:gap-8" />
      </Container>
    </Section>
  );
}
