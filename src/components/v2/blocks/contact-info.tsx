import type { ReactNode } from "react";
import { pickBi } from "@/lib/blocks/bi";
import { displayPhone, isHiddenPhone, isUnusableWhatsapp, telHref, type PublicSettings } from "@/lib/public-chrome";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import Icon from "@/components/v2/ui/icon";
import { rootProps, type BlockProps } from "./context";
import { SectionHead, SmartLink, tx } from "./parts";

const SOCIAL: { key: keyof PublicSettings["social"]; icon: string; network: string }[] = [
  { key: "linkedin", icon: "LinkedinLogo", network: "LinkedIn" },
  { key: "twitter", icon: "XLogo", network: "X" },
  { key: "instagram", icon: "InstagramLogo", network: "Instagram" },
  { key: "facebook", icon: "FacebookLogo", network: "Facebook" },
  { key: "youtube", icon: "YoutubeLogo", network: "YouTube" },
  { key: "tiktok", icon: "TiktokLogo", network: "TikTok" },
];

function Row({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4 py-5 shadow-[inset_0_-1px_0_rgba(11,26,51,0.08)]">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sky text-brand">
        <Icon name={icon} size={20} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-[17px] font-semibold text-ink [overflow-wrap:anywhere]">{children}</span>
      </span>
    </li>
  );
}

const LINK = "text-ink no-underline transition-colors duration-200 hover:text-brand";

/** Contact page details from site settings; the block chooses which ones show. */
export default function ContactInfoBlock({ content: c, ctx, place }: BlockProps<"contact_info">) {
  const s = ctx.settings;
  const { show } = c;
  const lang = ctx.locale;
  const phone = s && !isHiddenPhone(s.company.phone.ksa) ? s.company.phone.ksa : "";
  // Digits only for wa.me; Egyptian, placeholder and blank numbers are never shown.
  const whatsapp = s && !isUnusableWhatsapp(s.company.whatsapp) ? s.company.whatsapp.replace(/\D/g, "").replace(/^00/, "") : "";
  const branches = s?.company.branches ?? [];
  const socials = s ? SOCIAL.filter((x) => (s.social[x.key] ?? "").trim() !== "") : [];

  return (
    <Section tone={place.tone} className={place.first ? "pt-10 md:pt-14 lg:pt-[72px]" : undefined} {...rootProps("contact_info", place)}>
      <Container className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tx(ctx, c.heading)} intro={tx(ctx, c.intro)} />
        <ul className="flex min-w-0 flex-col">
          {show.phone && phone && (
            <Row icon="Phone" label={ctx.labels.phone}>
              <a href={telHref(phone)} dir="ltr" className={LINK}>
                {displayPhone(phone)}
              </a>
            </Row>
          )}
          {show.whatsapp && whatsapp && (
            <Row icon="WhatsappLogo" label={ctx.labels.whatsapp}>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" dir="ltr" className={LINK}>
                {displayPhone(whatsapp)}
              </a>
            </Row>
          )}
          {show.email && s?.company.email && (
            <Row icon="EnvelopeSimple" label={ctx.labels.email}>
              <a href={`mailto:${s.company.email}`} className={LINK}>
                {s.company.email}
              </a>
            </Row>
          )}
          {show.address && !show.branches && branches[0] && pickBi(branches[0].address, lang) && (
            <Row icon="MapPin" label={ctx.labels.address}>
              {pickBi(branches[0].address, lang)}
            </Row>
          )}
          {show.branches &&
            branches.map((b) => (
              <Row key={b.id} icon="MapPin" label={pickBi(b.name, lang) || ctx.labels.address}>
                <span className="block font-normal">{pickBi(b.address, lang)}</span>
                {!isHiddenPhone(b.phone) && (
                  <a href={telHref(b.phone)} dir="ltr" className={`${LINK} mt-1 inline-block text-[15px] font-semibold`}>
                    {displayPhone(b.phone)}
                  </a>
                )}
              </Row>
            ))}
          {show.social && socials.length > 0 && (
            <li className="flex flex-wrap items-center gap-3 py-5">
              <span className="text-sm text-muted">{ctx.labels.social}</span>
              {socials.map((x) => (
                <SmartLink
                  key={x.key}
                  href={s!.social[x.key]}
                  aria-label={x.network}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-surface text-ink shadow-[inset_0_0_0_1px_rgba(11,26,51,0.12)] hover:bg-sky"
                >
                  <Icon name={x.icon} size={18} />
                </SmartLink>
              ))}
            </li>
          )}
        </ul>
      </Container>
    </Section>
  );
}
