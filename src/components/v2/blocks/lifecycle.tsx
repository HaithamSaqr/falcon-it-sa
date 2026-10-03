import type { CSSProperties } from "react";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { RoleStage, RoleView } from "@/components/v2/islands/role-provider";
import RoleSwitcher from "@/components/v2/islands/role-switcher";
import { rootProps, type BlockProps } from "./context";
import { Check, SectionHead, tn, tx } from "./parts";

/**
 * The sector lifecycle, the centrepiece of a sector page: numbered stages on a
 * rail, lit for the active role, then what that role gets. Stage styles live
 * in globals.css (`.v2-stage`), so the lit state is one data attribute.
 */
export default function LifecycleBlock({ content: c, ctx, place }: BlockProps<"lifecycle">) {
  const roles = c.roles.filter((r) => tx(ctx, r.label) !== "").map((r) => ({ id: r.id, label: tn(ctx, r.label) }));
  const badge = tn(ctx, c.yourRoleLabel);
  const perRow = Math.min(c.stages.length, 6);

  return (
    <Section tone={place.tone} {...rootProps("lifecycle", place)}>
      <Container className="flex flex-col gap-8 lg:gap-[52px]">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tn(ctx, c.heading)} intro={tn(ctx, c.intro)} className="max-w-[820px]">
          {place.ownRoleSwitcher && <RoleSwitcher label={ctx.labels.yourRole} roles={roles} className="mt-2" />}
        </SectionHead>

        <div className="relative">
          {c.stages.length <= 6 && (
            <span aria-hidden="true" className="absolute start-6 end-6 top-[21px] hidden h-0.5 bg-[#D3E3F3] lg:block" />
          )}
          <ol
            className="relative grid gap-2.5 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:gap-3 lg:gap-y-10"
            style={{ "--n": perRow } as CSSProperties}
          >
            {c.stages.map((s, i) => {
              const description = tn(ctx, s.description);
              const modules = tn(ctx, s.modules);
              return (
                <RoleStage key={i} index={i + 1} roles={s.roles} className="v2-stage">
                  <span className="v2-stage-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="v2-stage-card">
                    <div className="v2-stage-inner">
                      {badge && <span className="v2-stage-badge">{badge}</span>}
                      <h3 className="text-[17px] font-extrabold leading-snug [overflow-wrap:anywhere] lg:text-lg lg:leading-tight rtl:font-bold rtl:lg:leading-normal">
                        {tn(ctx, s.title)}
                      </h3>
                      {description && <p className="v2-stage-desc v2-copy text-sm rtl:leading-[1.8]">{description}</p>}
                      {modules && <p className="v2-stage-modules [overflow-wrap:anywhere]">{modules}</p>}
                    </div>
                  </div>
                </RoleStage>
              );
            })}
          </ol>
        </div>

        {c.roles.map((r) => {
          const summary = c.summary[r.id];
          if (!summary) return null;
          const points = summary.points.filter((p) => tx(ctx, p) !== "").map((p) => tn(ctx, p));
          return (
            <RoleView key={r.id} ids={[r.id]}>
              <div
                data-role-summary={r.id}
                className="grid items-start gap-6 rounded-[22px] bg-page p-6 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10 lg:rounded-[28px] lg:px-11 lg:py-10"
              >
                <h3 className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em] text-balance [overflow-wrap:anywhere] lg:text-[30px] lg:leading-[1.15] rtl:font-bold rtl:leading-[1.45] rtl:tracking-normal">
                  {tn(ctx, summary.headline)}
                </h3>
                {points.length > 0 && (
                  <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2 lg:gap-y-[18px]">
                    {points.map((p, i) => (
                      <li key={i} className="v2-copy flex gap-2.5 text-base lg:text-[17px] rtl:font-normal rtl:leading-[1.75]">
                        <Check size={20} className="mt-[3px] rtl:mt-[5px]" />
                        <span className="min-w-0">{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </RoleView>
          );
        })}
      </Container>
    </Section>
  );
}
