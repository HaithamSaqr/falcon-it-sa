import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { RoleView } from "@/components/v2/islands/role-provider";
import RoleSwitcher from "@/components/v2/islands/role-switcher";
import { rootProps, type BlockProps } from "./context";
import { tx } from "./parts";

/**
 * "Sound familiar?": the active role's headline beside its pains. A role
 * without an entry shows nothing (the whole band disappears for it).
 */
export default function RolePainsBlock({ content: c, ctx, place }: BlockProps<"role_pains">) {
  const heading = tx(ctx, c.heading);
  const roles = c.roles.map((r) => ({ id: r.id, label: tx(ctx, r.label) })).filter((r) => r.label !== "");
  const H = place.first ? "h1" : "h2";

  return (
    <>
      {c.roles.map((r) => {
        const entry = c.pains[r.id];
        if (!entry) return null;
        const headline = tx(ctx, entry.headline) || heading;
        const items = entry.items
          .map((it) => ({ pain: tx(ctx, it.pain), fix: tx(ctx, it.fix) }))
          .filter((it) => it.pain !== "");
        return (
          <RoleView key={r.id} ids={[r.id]}>
            <Section tone={place.tone} aria-label={heading} {...rootProps("role_pains", place)}>
              <Container className="grid items-start gap-5 lg:grid-cols-2 lg:gap-16 xl:gap-24">
                <div className="flex min-w-0 flex-col gap-4">
                  <H className="v2-h2 rtl:xl:text-[46px] rtl:xl:leading-[1.35]">{headline}</H>
                  {tx(ctx, c.intro) && <p className="v2-copy text-[17px] text-body">{tx(ctx, c.intro)}</p>}
                  {place.ownRoleSwitcher && <RoleSwitcher label={ctx.labels.yourRole} roles={roles} className="mt-2" />}
                </div>
                <ul className="flex min-w-0 flex-col">
                  {items.map((it, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex flex-col gap-1 lg:gap-2",
                        i === 0 ? "pb-4 lg:pb-6" : "py-4 shadow-[inset_0_1px_0_rgba(11,26,51,0.08)] lg:py-6",
                        i === items.length - 1 && i !== 0 && "pb-0 lg:pb-0",
                      )}
                    >
                      <span className="text-[17px] font-bold leading-snug [overflow-wrap:anywhere] lg:text-xl rtl:font-semibold">
                        {it.pain}
                      </span>
                      {it.fix && <span className="v2-copy text-[15px] text-body lg:text-[17px]">{it.fix}</span>}
                    </li>
                  ))}
                </ul>
              </Container>
            </Section>
          </RoleView>
        );
      })}
    </>
  );
}
