import { createElement } from "react";
import { iconComponent } from "@/lib/category-icons";

export function IconOrb({
  icon,
  color,
  size = 28,
}: {
  icon: string | null | undefined;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `${color}26`,
        color,
      }}
    >
      {createElement(iconComponent(icon), {
        size: Math.round(size * 0.55),
        strokeWidth: 2.25,
      })}
    </span>
  );
}
