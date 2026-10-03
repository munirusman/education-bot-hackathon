/**
 * Orbit core primitives, ported from "Orbit Design System/components/core" and
 * "brand/Logo". Same tokens and states; hover/press are CSS instead of JS.
 */
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// ---- Logo ----------------------------------------------------------------
const LOGO_TONES = {
  plum: ["var(--plum-700)", "var(--plum-600)", "var(--sun-500)"],
  white: ["#fff", "#fff", "var(--sun-300)"],
  ink: ["var(--sand-900)", "var(--sand-900)", "var(--sun-500)"],
} as const;

function Cap({ ink, sun }: { ink: string; sun: string }) {
  return (
    <svg viewBox="0 0 40 30" style={{ display: "block", width: "100%", overflow: "visible", transform: "rotate(-10deg)" }} aria-hidden="true">
      <path d="M20 4L38 11L20 18L2 11Z" fill={ink} />
      <path d="M20 11L32 14V21" fill="none" stroke={sun} strokeWidth="2" />
      <circle cx="32" cy="24" r="3.5" fill={sun} />
    </svg>
  );
}

export function Logo({ variant = "full", size = 26, tone = "plum" }: { variant?: "full" | "mark"; size?: number; tone?: keyof typeof LOGO_TONES }) {
  const [word, ink, sun] = LOGO_TONES[tone];
  if (variant === "mark") {
    const ring = size * 0.44;
    const bw = Math.max(2, size * 0.11);
    return (
      <span role="img" aria-label="Orbit" style={{ position: "relative", display: "inline-block", width: size, height: size, flex: "none" }}>
        <span style={{ position: "absolute", left: "50%", bottom: size * 0.08, width: ring, height: ring, marginLeft: -ring / 2, borderRadius: "50%", border: `${bw}px solid ${ink}`, boxSizing: "border-box" }} />
        <span style={{ position: "absolute", left: "50%", top: size * 0.06, width: size * 0.78, marginLeft: -size * 0.39 }}><Cap ink={ink} sun={sun} /></span>
      </span>
    );
  }
  return (
    <span role="img" aria-label="Orbit" style={{ display: "inline-flex", alignItems: "baseline", font: `700 ${size}px/1 var(--font-sans)`, letterSpacing: "-.045em", color: word, whiteSpace: "nowrap", paddingTop: size * 0.3 }}>
      <span aria-hidden="true" style={{ position: "relative", display: "inline-block", lineHeight: 1 }}>
        o
        <span style={{ position: "absolute", left: "50%", bottom: ".48em", width: ".66em", marginLeft: "-.33em" }}>
          <Cap ink={tone === "plum" ? ink : word} sun={sun} />
        </span>
      </span>
      <span aria-hidden="true">rbit</span>
    </span>
  );
}

// ---- Button --------------------------------------------------------------
const BUTTON_VARIANTS = {
  primary: "bg-accent text-white border-transparent hover:bg-accent-hover active:bg-accent-press",
  secondary: "bg-card text-fg-1 border-line-2 shadow-xs hover:bg-sand-50 active:bg-sand-100",
  ghost: "bg-transparent text-fg-1 border-transparent hover:bg-sand-100 active:bg-sand-200",
  teacher: "bg-sun-300 text-sand-900 border-transparent hover:bg-[#ecc35e] active:bg-sun-500",
  danger: "bg-[var(--red-500)] text-white border-transparent hover:bg-[var(--red-700)] active:bg-[var(--red-700)]",
} as const;
const BUTTON_SIZES = {
  sm: { box: "h-7 px-2.5 gap-1.5 text-[13px]", icon: 14 },
  md: { box: "h-9 px-3.5 gap-2 text-sm", icon: 16 },
  lg: { box: "h-11 px-[18px] gap-2 text-[15px]", icon: 18 },
} as const;

type ButtonProps = {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  full?: boolean;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export function Button({ variant = "primary", size = "md", icon: I, iconRight: IR, full, href, type = "button", disabled, onClick, className, children }: ButtonProps) {
  const s = BUTTON_SIZES[size];
  const cls = cx(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm border font-medium leading-none no-underline transition-[background,transform] duration-[var(--dur-fast)] ease-[var(--ease-orbit)]",
    s.box,
    full && "flex w-full",
    disabled ? "cursor-not-allowed border-transparent bg-sand-100 text-fg-3" : cx(BUTTON_VARIANTS[variant], "cursor-pointer active:translate-y-px"),
    className,
  );
  const inner = (
    <>
      {I && <I size={s.icon} strokeWidth={2} aria-hidden />}
      {children}
      {IR && <IR size={s.icon} strokeWidth={2} aria-hidden />}
    </>
  );
  if (href && !disabled) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type={type} disabled={disabled} onClick={onClick} className={cls}>{inner}</button>;
}

export function IconButton({ icon: I, label, variant = "ghost", size = "md", active, disabled, onClick, href }: { icon: LucideIcon; label: string; variant?: "ghost" | "primary" | "secondary"; size?: "sm" | "md" | "lg"; active?: boolean; disabled?: boolean; onClick?: () => void; href?: string }) {
  const d = { sm: "size-7", md: "size-9", lg: "size-11" }[size];
  const ic = { sm: 14, md: 16, lg: 18 }[size];
  const tone =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-hover"
      : variant === "secondary"
        ? "bg-card text-fg-2 border-line-2 hover:bg-sand-50"
        : active
          ? "bg-plum-50 text-plum-600"
          : "bg-transparent text-fg-2 hover:bg-sand-100 hover:text-fg-1";
  const cls = cx("inline-grid place-items-center rounded-sm border border-transparent p-0 transition-colors duration-[var(--dur-fast)]", d, tone, disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer active:translate-y-px");
  if (href) return <Link href={href} aria-label={label} title={label} className={cls}><I size={ic} aria-hidden /></Link>;
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={cls}>
      <I size={ic} aria-hidden />
    </button>
  );
}

// ---- Badge ---------------------------------------------------------------
export type Tone = "neutral" | "brand" | "working" | "stuck" | "approval" | "paused" | "danger" | "teacher";
const BADGE: Record<Tone, [string, string]> = {
  neutral: ["bg-sand-100 text-sand-700", "bg-sand-400"],
  brand: ["bg-plum-50 text-plum-700", "bg-plum-500"],
  working: ["bg-working-bg text-working-ink", "bg-working"],
  stuck: ["bg-stuck-bg text-stuck-ink", "bg-stuck"],
  approval: ["bg-approval-bg text-approval-ink", "bg-approval"],
  paused: ["bg-paused-bg text-paused-ink", "bg-paused"],
  danger: ["bg-danger-bg text-danger-ink", "bg-danger"],
  teacher: ["bg-sun-100 text-sun-700", "bg-sun-500"],
};

export function Badge({ tone = "neutral", dot, pulse, children }: { tone?: Tone; dot?: boolean; pulse?: boolean; children: ReactNode }) {
  const [box, dotc] = BADGE[tone];
  // Only "stuck" pulses by default: it is Orbit's single looping animation.
  const animate = pulse ?? tone === "stuck";
  return (
    <span className={cx("inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium leading-none", box)}>
      {dot && <span className={cx("size-[7px] rounded-full", dotc, animate && "animate-orbit-pulse")} />}
      {children}
    </span>
  );
}

export function Tag({ children, icon: I, mono }: { children: ReactNode; icon?: LucideIcon; mono?: boolean }) {
  return (
    <span className={cx("inline-flex h-6 items-center gap-[5px] whitespace-nowrap rounded-xs bg-sunken px-2 text-xs leading-none text-fg-1", mono ? "font-mono" : "font-medium")}>
      {I && <I size={13} className="text-fg-2" aria-hidden />}
      {children}
    </span>
  );
}

// ---- Avatar --------------------------------------------------------------
const AVATAR_PALETTE = [
  ["var(--plum-100)", "var(--plum-700)"],
  ["var(--green-100)", "var(--green-700)"],
  ["var(--blue-100)", "var(--blue-700)"],
  ["var(--amber-100)", "var(--amber-700)"],
  ["var(--sand-100)", "var(--sand-700)"],
] as const;
const AVATAR_STATUS = { working: "var(--state-working)", stuck: "var(--state-stuck)", approval: "var(--state-approval)", paused: "var(--state-paused)", offline: "var(--sand-300)" } as const;

export function Avatar({ name = "", size = 32, status, teacher }: { name?: string; size?: number; status?: keyof typeof AVATAR_STATUS; teacher?: boolean }) {
  const initials = name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  const [bg, fg] = teacher ? ["var(--sun-300)", "var(--sand-900)"] : AVATAR_PALETTE[n % AVATAR_PALETTE.length]!;
  const d = Math.max(8, Math.round(size * 0.3));
  const style: CSSProperties = { width: size, height: size, background: bg, color: fg, font: `var(--fw-semibold) ${Math.round(size * 0.38)}px/1 var(--font-sans)` };
  return (
    <span aria-hidden className="relative inline-grid flex-none place-items-center rounded-full" style={style}>
      {initials}
      {status && <span className="absolute -right-px -bottom-px rounded-full" style={{ width: d, height: d, background: AVATAR_STATUS[status], boxShadow: "0 0 0 2px var(--surface-card)" }} />}
    </span>
  );
}

// ---- Card ----------------------------------------------------------------
export function Card({ eyebrow, title, actions, interactive, selected, className, children, padding = "p-4" }: { eyebrow?: ReactNode; title?: ReactNode; actions?: ReactNode; interactive?: boolean; selected?: boolean; className?: string; children?: ReactNode; padding?: string }) {
  return (
    <div
      className={cx(
        "flex min-w-0 flex-col gap-3 rounded-md border bg-card transition-shadow duration-[var(--dur-base)] ease-[var(--ease-orbit)]",
        padding,
        selected ? "border-plum-500 shadow-[0_0_0_1px_var(--plum-500)]" : "border-line shadow-xs",
        interactive && !selected && "cursor-pointer hover:shadow-md",
        className,
      )}
    >
      {(eyebrow || title || actions) && (
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {eyebrow && <div className="type-eyebrow mb-1 text-fg-3">{eyebrow}</div>}
            {title && <div className="type-h3 text-fg-1">{title}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("type-eyebrow text-fg-3", className)}>{children}</div>;
}
