import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { RoleView } from "@/components/v2/islands/role-provider";
import RoleSwitcher from "@/components/v2/islands/role-switcher";
import { rootProps, type BlockProps } from "./context";
import { Highlighted, PrimaryCta, SecondaryCta, tn, tx } from "./parts";

/** Product screenshot on the floating card (design element, not content). */
const APPS_SHOT = "/images/v2/shot-apps-top.jpg";

/**
 * Sector hero: breadcrumb, "Your role" pills, the role's promise as the H1,
 * CTAs and the sector photo with the apps card. Every role's promise is
 * rendered; the role switcher picks the one that shows.
 */
export default function SectorHeroBlock({ content: c, ctx, place }: BlockProps<"sector_hero">) {
  const roles = c.roles.filter((r) => tx(ctx, r.label) !== "").map((r) => ({ id: r.id, label: tn(ctx, r.label) }));
  const sectorName = ctx.sector ? tn(ctx, ctx.sector.name) : null;
  // Every role must show an H1: a role without its own promise borrows the
  // first non-empty one, then the sector name.
  const hasTitle = (id: string) => tx(ctx, c.promise[id]?.title) !== "";
  const firstPromise = c.roles.map((r) => c.promise[r.id]).find((p) => p && tx(ctx, p.title) !== "");
  const fallbackTitle = firstPromise?.title ?? ctx.sector?.name ?? { en: ctx.labels.sectors, ar: ctx.labels.sectors };

  return (
    <Section tone="page" className="pt-7 pb-12 md:pt-12 md:pb-20 lg:pt-[60px] lg:pb-[88px]" {...rootProps("sector_hero", place)}>
      <Container className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_560px]">
        <div className="flex min-w-0 flex-col gap-[18px] lg:gap-[26px]">
          {sectorName && (
            <nav aria-label={ctx.labels.breadcrumb} className="animate-rise text-[13px] text-muted lg:text-sm">
              <Link href="/sectors" className="text-muted no-underline hover:text-brand">
                {ctx.labels.sectors}
              </Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page" className="font-semibold text-ink lg:font-medium">
                {sectorName}
              </span>
            </nav>
          )}
          <RoleSwitcher
            label={tn(ctx, c.rolePrompt)}
            fallbackLabel={ctx.labels.yourRole}
            roles={roles}
            className="animate-rise rise-d1"
          />
          {c.roles.map((r) => {
            const own = hasTitle(r.id) ? c.promise[r.id] : undefined;
            const title = own?.title ?? fallbackTitle;
            const subtitle = tn(ctx, (own ?? firstPromise)?.subtitle);
            return (
              <RoleView key={r.id} ids={[r.id]} className="flex flex-col gap-3.5 lg:gap-[22px]" enterClassName="animate-rise rise-d2">
                <h1 className="v2-display xl:text-[56px] rtl:xl:text-[54px]">
                  <Highlighted ctx={ctx} value={title} />
                </h1>
                {subtitle && (
                  <p className="v2-copy max-w-[540px] text-[17px] text-body lg:text-xl rtl:lg:leading-[1.9]">{subtitle}</p>
                )}
              </RoleView>
            );
          })}
          <div className="animate-rise rise-d3 flex flex-wrap items-center gap-x-[26px] gap-y-4 lg:mt-1">
            <PrimaryCta
              ctx={ctx}
              label={tn(ctx, c.primaryCta.label)}
              href={c.primaryCta.href}
              className="max-sm:w-full max-sm:justify-between"
            />
            <SecondaryCta
              label={tn(ctx, c.secondaryCta.label)}
              href={c.secondaryCta.href}
              className="max-sm:hidden"
            />
          </div>
          {tx(ctx, c.trustLine) && <p className="text-sm text-muted">{tn(ctx, c.trustLine)}</p>}
        </div>

        {c.photo && (
          <div className="animate-rise rise-d4 relative lg:h-[500px] xl:h-[540px]">
            <div className="rounded-[26px] bg-ink/[0.035] p-1.5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)] sm:rounded-[32px] sm:p-2 lg:absolute lg:end-0 lg:top-0 lg:w-[86%]">
              <div className="overflow-hidden rounded-[20px] bg-[#0A5CC4] shadow-[0_40px_80px_-40px_rgba(12,60,120,0.45)] sm:rounded-[25px]">
                <Image
                  src={c.photo}
                  alt={tx(ctx, c.photoAlt)}
                  width={960}
                  height={880}
                  preload
                  className="block h-[230px] w-full object-cover object-[35%_50%] sm:h-[340px] lg:h-[410px] xl:h-[440px]"
                />
              </div>
            </div>
            <div className="absolute start-0 bottom-0 hidden w-[300px] rounded-[26px] bg-white/72 p-[7px] backdrop-blur-[12px] shadow-[inset_0_0_0_1px_rgba(11,26,51,0.07),0_30px_60px_-30px_rgba(12,60,120,0.5)] lg:block xl:w-[340px]">
              <div className="overflow-hidden rounded-[20px] bg-[#16151F]">
                <Image src={APPS_SHOT} alt={ctx.labels.appsAlt} width={1100} height={390} className="block h-auto w-full" />
              </div>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
