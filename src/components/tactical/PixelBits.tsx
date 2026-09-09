import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

/** Chunky pixel-style frame using layered box-shadows (no border-radius). */
export function PixelBox({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        boxShadow:
          "0 -4px 0 0 currentColor, 0 4px 0 0 currentColor, -4px 0 0 0 currentColor, 4px 0 0 0 currentColor",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PixelButton({
  label,
  color,
  active,
  onClick,
  className,
  iconSrc,
}: {
  label: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  iconSrc?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-10 select-none items-center justify-center gap-1.5 overflow-hidden rounded-sm px-2 py-1.5 text-[9px] leading-none tracking-wider transition-transform active:translate-y-[2px] sm:text-[10px]",
        className,
      )}
      style={{
        fontFamily: "var(--font-pixel)",
        background: active ? color : `color-mix(in oklab, ${color} 78%, #ffffff)`,
        color: "#0f172a",
        boxShadow: `inset 0 -4px 0 0 color-mix(in oklab, ${color} 55%, #C4DFED), 0 -3px 0 0 #0f172a, 0 3px 0 0 #0f172a, -3px 0 0 0 #0f172a, 3px 0 0 0 #0f172a`,
        opacity: active === false ? 0.75 : 1,
      }}
    >
      {iconSrc && (
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          className="h-7 w-8 shrink-0 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      )}
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

/** Original 9x9 pixel "beacon" glyph — not a copy of any reference art. */
export function BeaconGlyph({ color = "#10202f" }: { color?: string }) {
  const on = [
    [4, 0],
    [3, 1],
    [4, 1],
    [5, 1],
    [1, 2],
    [4, 2],
    [7, 2],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [6, 3],
    [0, 4],
    [2, 4],
    [6, 4],
    [8, 4],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
    [1, 6],
    [4, 6],
    [7, 6],
    [3, 7],
    [5, 7],
    [2, 8],
    [6, 8],
  ];
  return (
    <svg viewBox="0 0 9 9" className="h-full w-full" aria-hidden="true">
      {on.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  );
}
