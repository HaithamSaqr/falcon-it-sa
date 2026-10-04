import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { RoleView } from "@/components/v2/islands/role-provider";
import RoleSwitcher from "@/components/v2/islands/role-switcher";
import type { RolePainsContent } from "@/lib/blocks/schemas/role_pains";
import { rootProps, type BlockProps, type RenderContext } from "./context";
import { tn, tx } from "./parts";

function PainList({ ctx, entry }: { ctx: RenderContext; entry: RolePainsContent["pains"][string] }) {
  const items = entry.items.filter((it) => tx(ctx, it.pain) !== "");
  return (
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
            {tn(ctx, it.pain)}
          </span>
          {tx(ctx, it.fix) && <span className="v2-copy text-[15px] text-body lg:text-[17px]">{tn(ctx, it.fix)}</span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * "Sound familiar?": the active role's headline beside its pains. On a sector
 * page (role switcher in the hero) a role without an entry hides the band.
 * When this block carries its own role switcher the band always stays, so the
 * switcher never disappears: a role without an entry shows the block heading only.
 */
export default function RolePainsBlock({ content: c, ctx, place }: BlockProps<"role_pains">) {
  const heading = tx(ctx, c.heading);
  const roles = c.roles.filter((r) => tx(ctx, r.label) !== "").map((r) => ({ id: r.id, label: tn(ctx, r.label) }));
  const H = place.first ? "h1" : "h2";
  const intro = tx(ctx, c.intro) ? <p className="v2-copy text-[17px] text-body">{tn(ctx, c.intro)}</p> : null;
  const headlineClass = "v2-h2 rtl:xl:text-[46px] rtl:xl:leading-[1.35]";
  const headlineOf = (id: string): ReactNode => {
    const entry = c.pains[id];
    return entry && tx(ctx, entry.headline) ? tn(ctx, entry.headline) : tn(ctx, c.heading);
  };

  const band = (left: ReactNode, right: ReactNode) => (
    <Section tone={place.tone} aria-label={heading} {...rootProps("role_pains", place)}>
      <Container className="grid items-start gap-5 lg:grid-cols-2 lg:gap-16 xl:gap-24">
        <div className="flex min-w-0 flex-col gap-4">{left}</div>
        {right}
      </Container>
    </Section>
  );

  if (place.ownRoleSwitcher) {
    return band(
      <>
        {c.roles.map((r) => (
          <RoleView key={r.id} ids={[r.id]}>
            <H className={headlineClass}>{headlineOf(r.id)}</H>
          </RoleView>
        ))}
        {intro}
        <RoleSwitcher label={ctx.labels.yourRole} roles={roles} className="mt-2" />
      </>,
      <div className="min-w-0">
        {c.roles.map((r) =>
          c.pains[r.id] ? (
            <RoleView key={r.id} ids={[r.id]}>
              <PainList ctx={ctx} entry={c.pains[r.id]} />
            </RoleView>
          ) : null,
        )}
      </div>,
    );
  }

  return (
    <>
      {c.roles.map((r) => {
        const entry = c.pains[r.id];
        if (!entry) return null;
        return (
          <RoleView key={r.id} ids={[r.id]}>
            {band(
              <>
                <H className={headlineClass}>{headlineOf(r.id)}</H>
                {intro}
              </>,
              <PainList ctx={ctx} entry={entry} />,
            )}
          </RoleView>
        );
      })}
    </>
  );
}
