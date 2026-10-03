/** Orbit form controls, ported from "Orbit Design System/components/forms" onto native inputs. */
"use client";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cx } from "./core";

const CONTROL =
  "w-full rounded-sm border border-line-2 bg-card text-fg-1 type-body outline-none transition-shadow duration-[var(--dur-fast)] placeholder:text-fg-3 focus:border-[var(--border-focus)] focus:shadow-[var(--ring-focus)] disabled:bg-sand-50";

export function Field({ label, hint, error, htmlFor, children }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && <label htmlFor={htmlFor} className="type-label text-fg-1">{label}</label>}
      {children}
      {(error || hint) && <span className={cx("type-caption", error ? "text-danger-ink" : "text-fg-3")}>{error || hint}</span>}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & { label?: ReactNode; hint?: ReactNode; error?: ReactNode; icon?: LucideIcon; size?: "sm" | "md" | "lg" };

export function Input({ label, hint, error, icon: I, size = "md", className, id, ...rest }: InputProps) {
  const auto = useId();
  const h = { sm: "h-7", md: "h-9", lg: "h-11" }[size];
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id ?? auto}>
      <span className="relative flex items-center">
        {I && <I size={16} className="pointer-events-none absolute left-2.5 text-fg-3" aria-hidden />}
        <input id={id ?? auto} className={cx(CONTROL, h, I ? "pl-8" : "pl-2.5", "pr-2.5", Boolean(error) && "border-[var(--red-500)]", className)} {...rest} />
      </span>
    </Field>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode; hint?: ReactNode; error?: ReactNode; mono?: boolean };

export function Textarea({ label, hint, error, mono, className, id, rows = 3, ...rest }: TextareaProps) {
  const auto = useId();
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id ?? auto}>
      <textarea id={id ?? auto} rows={rows} className={cx(CONTROL, "resize-y px-2.5 py-2", mono && "type-rule", className)} {...rest} />
    </Field>
  );
}

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & { label?: ReactNode; hint?: ReactNode; options: (string | { value: string; label: string })[]; size?: "sm" | "md" };

export function Select({ label, hint, options, size = "md", className, id, ...rest }: SelectProps) {
  const auto = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id ?? auto}>
      <span className="relative flex">
        <select id={id ?? auto} className={cx(CONTROL, size === "sm" ? "h-7" : "h-9", "cursor-pointer appearance-none pr-8 pl-2.5", className)} {...rest}>
          {options.map((o) => (typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-2.5 -mt-2 text-fg-3" aria-hidden />
      </span>
    </Field>
  );
}

type ChoiceProps = { label?: ReactNode; description?: ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; name?: string; ariaLabel?: string };

export function Checkbox({ label, description, checked, onChange, disabled, ariaLabel }: ChoiceProps) {
  return (
    <label className={cx("flex items-start gap-2.5", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
      <span className="relative mt-px grid size-[18px] flex-none place-items-center">
        <input type="checkbox" aria-label={ariaLabel} className="peer size-[18px] cursor-[inherit] appearance-none rounded-xs border-[1.5px] border-sand-400 bg-card transition-colors checked:border-accent checked:bg-accent focus-visible:shadow-[var(--ring-focus)]" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <Check size={13} strokeWidth={3} className="pointer-events-none absolute hidden text-white peer-checked:block" aria-hidden />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && <span className="text-sm text-fg-1">{label}</span>}
          {description && <span className="type-caption text-fg-3">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function Radio({ label, description, checked, onChange, disabled, name }: ChoiceProps) {
  return (
    <label className={cx("flex items-start gap-2.5", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
      <span className="relative mt-px grid size-[18px] flex-none place-items-center">
        <input type="radio" name={name} className="peer size-[18px] cursor-[inherit] appearance-none rounded-full border-[1.5px] border-sand-400 bg-card checked:border-accent focus-visible:shadow-[var(--ring-focus)]" checked={checked} disabled={disabled} onChange={(e) => e.target.checked && onChange(true)} />
        <span className="pointer-events-none absolute hidden size-2 rounded-full bg-accent peer-checked:block" />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && <span className="text-sm text-fg-1">{label}</span>}
          {description && <span className="type-caption text-fg-3">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function Switch({ checked, onChange, label, disabled, size = "md", ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; disabled?: boolean; size?: "sm" | "md"; ariaLabel?: string }) {
  const w = size === "sm" ? 28 : 36;
  const h = size === "sm" ? 16 : 20;
  const k = h - 4;
  return (
    <label className={cx("inline-flex items-center gap-2", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative flex-none rounded-full transition-colors duration-[var(--dur-base)] ease-[var(--ease-orbit)]"
        style={{ width: w, height: h, background: checked ? "var(--accent)" : "var(--sand-300)" }}
      >
        <span className="absolute top-0.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)] transition-[left] duration-[var(--dur-base)] ease-[var(--ease-orbit)]" style={{ left: checked ? w - k - 2 : 2, width: k, height: k }} />
      </button>
      {label && <span className="type-body text-fg-1">{label}</span>}
    </label>
  );
}
