export interface NavItem {
  key: string;
  href: string;
  children?: NavItem[];
}

export interface Product {
  key: string;
  href: string;
  icon: string;
  price: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface IndustrySolution {
  key: string;
  href: string;
  image: string;
}

export interface Stat {
  value: number;
  suffix: string;
  key: string;
}

export interface ComplianceBadge {
  key: string;
  href: string;
  image: string;
}

export interface PainPoint {
  key: string;
  icon: string;
}

export interface Feature {
  key: string;
  image: string;
  imagePosition: "left" | "right";
}
