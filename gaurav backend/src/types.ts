export interface HeaderConfig {
  logoUrl: string;
  name: string;
}

export interface HeroConfig {
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  imageUrl: string;
  highlightTitle: string;
  highlightSubtitle: string;
  bullets: string[];
}

export interface PainPoint {
  icon: string;
  text: string;
}

export interface ProblemConfig {
  title: string;
  painPoints: PainPoint[];
  highlightTitle: string;
  highlightText1: string;
  highlightText2: string;
}

export interface BentoItem {
  imageUrl: string;
  badge: string;
  description: string;
}

export interface BentoConfig {
  title: string;
  description: string;
  items: BentoItem[];
}

export interface IncludedCard {
  icon: string;
  title: string;
  description: string;
}

export interface IncludedConfig {
  title: string;
  description: string;
  cards: IncludedCard[];
}

export interface BonusItem {
  label: string;
  title: string;
  value: string;
}

export interface BonusesConfig {
  title: string;
  description: string;
  items: BonusItem[];
}

export interface Testimonial {
  stars: number;
  comment: string;
  name: string;
  details: string;
}

export interface ResultsConfig {
  title: string;
  description: string;
  testimonials: Testimonial[];
}

export interface PricingConfig {
  valueBadge: string;
  header: string;
  price: string;
  ctaText: string;
  badges: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQConfig {
  title: string;
  description: string;
  items: FAQItem[];
}

export interface FooterConfig {
  logoUrl: string;
  copyright: string;
}

export interface LandingPageData {
  header: HeaderConfig;
  hero: HeroConfig;
  problem: ProblemConfig;
  bento: BentoConfig;
  included: IncludedConfig;
  bonuses: BonusesConfig;
  results: ResultsConfig;
  pricing: PricingConfig;
  faq: FAQConfig;
  footer: FooterConfig;
}
