export const COMPANY = {
  name: { en: "Falcon Smart Solutions", ar: "فالكون للحلول الذكية" },
  website: "falcon-it.sa",
  email: "info@falcon-v.com",
  phone: { ksa: "00966568406006", egypt: "+201000000000" },
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966568406006",
  branches: [
    {
      id: "ksa",
      name: { en: "Saudi Arabia Office", ar: "مكتب السعودية" },
      address: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
      phone: "00966568406006",
    },
    {
      id: "egypt",
      name: { en: "Egypt Office", ar: "مكتب مصر" },
      address: { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
      phone: "+201000000000",
    },
  ],
  social: {
    linkedin: "https://linkedin.com/company/falcon-smart-solutions",
    twitter: "https://twitter.com/falconsmart",
    facebook: "https://facebook.com/falconsmartsolutions",
    instagram: "https://instagram.com/falconsmart",
    youtube: "https://www.youtube.com/@Falcon_Valley",
  },
  demo: "https://erp.falcon-v.com",
} as const;

export const NAV_ITEMS = [
  { key: "home", href: "/" },
  {
    key: "products",
    href: "/products",
    children: [
      { key: "falconDesktop", href: "/products/falcon-erp-desktop" },
      { key: "falconCloud", href: "/products/falcon-cloud" },
      { key: "odooServices", href: "/products/odoo-services" },
    ],
  },
  { key: "demo", href: "/demo" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export const INDUSTRIES = [
  "retail",
  "manufacturing",
  "construction",
  "logistics",
  "healthcare",
  "hospitality",
] as const;

export const STATS = [
  { value: 500, suffix: "+", key: "clients" },
  { value: 5000, suffix: "+", key: "users" },
  { value: 1000000, suffix: "+", key: "transactions" },
] as const;
