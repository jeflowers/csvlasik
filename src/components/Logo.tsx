// Logo.tsx — Atelier (Marquise)
// Drop into a Bolt React/Vite project (src/components/Logo.tsx) and use <Logo />.
// Requires Cormorant Garamond + Inter loaded (see README).

type LogoProps = {
  variant?: "horizontal" | "stacked" | "mark";
  mode?: "dark" | "light";        // dark = for charcoal nav, light = for white bg
  height?: number;                // mark height in px (default 40)
  tagline?: boolean;              // show "Revolutionary Vision Care"
};

const GOLD = "#D4AF37";
const CHAMPAGNE = "#C9A96E";
const INK = "#1A1A1A";
const CREAM = "#FBF7EF";

function Mark({ size = 40, mode = "dark" }: { size?: number; mode?: "dark" | "light" }) {
  // outline follows the surface it sits on; gold table stone + pupil stay constant
  const line = mode === "dark" ? CREAM : INK;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size * 0.62} role="img" aria-label="Atelier">
      <path d="M12 50 Q50 24 88 50 Q50 76 12 50 Z" fill="none" stroke={line} strokeWidth="2" />
      <path d="M12 50 L88 50 M50 37 L50 63 M12 50 L50 43 M12 50 L50 57 M88 50 L50 43 M88 50 L50 57" fill="none" stroke={line} strokeWidth="1" />
      <path d="M38 50 L50 43 L62 50 L50 57 Z" fill={GOLD} />
      <circle cx="50" cy="50" r="2.2" fill={mode === "dark" ? INK : INK} />
    </svg>
  );
}

export default function Logo({
  variant = "horizontal",
  mode = "dark",
  height = 40,
  tagline = true,
}: LogoProps) {
  const wordColor = mode === "dark" ? CREAM : INK;
  const wordBlock = (size: number, ls = "0.24em") => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 600,
          fontSize: size,
          letterSpacing: ls,
          paddingLeft: ls,
          color: wordColor,
          lineHeight: 1,
        }}
      >
        ATELIER
      </span>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 300,
          fontSize: size * 0.52,
          letterSpacing: "0.38em",
          paddingLeft: "0.38em",
          color: CHAMPAGNE,
          lineHeight: 1,
          marginTop: size * 0.12,
        }}
      >
        LASIK
      </span>
    </div>
  );
  const tag = (size: number) => (
    <span
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: size,
        letterSpacing: "0.46em",
        paddingLeft: "0.46em",
        color: CHAMPAGNE,
      }}
    >
      REVOLUTIONARY VISION CARE
    </span>
  );

  // marquise mark is wide; scale its box from the requested height
  const markH = height;

  if (variant === "mark") return <Mark size={markH * 1.6} mode={mode} />;

  if (variant === "stacked") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: height * 0.4 }}>
        <Mark size={markH * 2.6} mode={mode} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: height * 0.18 }}>
          {wordBlock(height * 0.62)}
          {tagline && tag(Math.max(7, height * 0.18))}
        </div>
      </div>
    );
  }

  // horizontal
  return (
    <div style={{ display: "flex", alignItems: "center", gap: height * 0.34 }}>
      <Mark size={markH * 1.9} mode={mode} />
      <div style={{ display: "flex", flexDirection: "column", gap: height * 0.16 }}>
        {wordBlock(height * 0.66)}
        {tagline && tag(Math.max(7, height * 0.18))}
      </div>
    </div>
  );
}
