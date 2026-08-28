import {
  ShoppingCart,
  Utensils,
  Car,
  Repeat,
  HeartPulse,
  Shield,
  Zap,
  Clapperboard,
  Briefcase,
  Tag,
  Plane,
  Gift,
  PawPrint,
  GraduationCap,
  Home,
  Dumbbell,
  Sparkles,
  Star,
  Bookmark,
  type LucideIcon,
} from "lucide-react";

export const ICON_COMPONENTS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  car: Car,
  repeat: Repeat,
  "heart-pulse": HeartPulse,
  shield: Shield,
  zap: Zap,
  clapperboard: Clapperboard,
  briefcase: Briefcase,
  tag: Tag,
  plane: Plane,
  gift: Gift,
  "paw-print": PawPrint,
  "graduation-cap": GraduationCap,
  home: Home,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  star: Star,
  bookmark: Bookmark,
};

export function iconComponent(icon: string | null | undefined): LucideIcon {
  return (icon && ICON_COMPONENTS[icon]) || Tag;
}

const KEYWORD_ICONS: [RegExp, string][] = [
  [/travel|trip|vacation|holiday/i, "plane"],
  [/gift/i, "gift"],
  [/pet/i, "paw-print"],
  [/education|school|tuition|course/i, "graduation-cap"],
  [/home|rent|mortgage/i, "home"],
  [/fitness|gym/i, "dumbbell"],
];

const FALLBACK_ROTATION = ["star", "bookmark", "sparkles", "tag"];

export function nextCategoryIcon(
  name: string,
  existing: { icon: string }[],
): string {
  const keywordMatch = KEYWORD_ICONS.find(([pattern]) => pattern.test(name));
  if (keywordMatch) return keywordMatch[1];

  const used = new Set(existing.map((c) => c.icon));
  return (
    FALLBACK_ROTATION.find((i) => !used.has(i)) ??
    FALLBACK_ROTATION[existing.length % FALLBACK_ROTATION.length]
  );
}
