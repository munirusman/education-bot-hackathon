/** Orbit Tabs, Dialog and Toast, ported from "Orbit Design System/components". */
"use client";
import { CircleCheck, Info, StickyNote, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cx, IconButton } from "./core";

export function Tabs<T extends string>({ items, value, onChange }: { items: { id: T; label: ReactNode; count?: number }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" className="flex gap-5 border-b border-line">
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={cx("-mb-px inline-flex h-10 cursor-pointer items-center gap-1.5 border-b-2 bg-transparent p-0 type-label text-sm", active ? "border-accent text-fg-1" : "border-transparent text-fg-2 hover:text-fg-1")}
          >
            {it.label}
            {it.count != null && (
              <span className={cx("inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-[5px] text-[11px] font-medium leading-none", active ? "bg-plum-100 text-plum-700" : "bg-sand-100 text-fg-2")}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Dialog({ open, title, description, children, actions, onClose, width = 440 }: { open: boolean; title: ReactNode; description?: ReactNode; children?: ReactNode; actions?: ReactNode; onClose: () => void; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-[100] grid place-items-center bg-[var(--overlay-scrim)] p-6">
      <div role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined} className="flex max-w-full flex-col rounded-lg border border-line bg-card shadow-lg [animation:orbit-fade-up_var(--dur-slow)_var(--ease-orbit)]" style={{ width }}>
        <div className="flex gap-3 px-5 pt-5">
          <div className="flex-1">
            <div className="type-h2 text-lg text-fg-1">{title}</div>
            {description && <div className="type-body mt-1.5 text-fg-2">{description}</div>}
          </div>
          <IconButton icon={X} label="Close" size="sm" onClick={onClose} />
        </div>
        {children && <div className="px-5 pt-4">{children}</div>}
        {actions && <div className="flex justify-end gap-2 p-5">{actions}</div>}
      </div>
    </div>
  );
}

type ToastTone = "info" | "success" | "warning" | "teacher";
const TOAST_ICON = { info: [Info, "var(--plum-300)"], success: [CircleCheck, "#7cc49f"], warning: [TriangleAlert, "var(--sun-300)"], teacher: [StickyNote, "var(--sun-300)"] } as const;

export function Toast({ tone = "info", title, message, onClose }: { tone?: ToastTone; title: ReactNode; message?: ReactNode; onClose?: () => void }) {
  const [I, color] = TOAST_ICON[tone];
  return (
    <div role="status" className="flex w-[360px] max-w-full items-start gap-3 rounded-md bg-inverse px-3.5 py-3 text-[var(--fg-inverse)] shadow-lg animate-fade-up">
      <I size={18} color={color} className="mt-px flex-none" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="type-label text-sm">{title}</div>
        {message && <div className="type-body mt-0.5 text-[13px] text-plum-200">{message}</div>}
      </div>
      {onClose && (
        <button aria-label="Dismiss" onClick={onClose} className="grid cursor-pointer border-0 bg-transparent p-0.5 text-plum-300">
          <X size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}

const ToastCtx = createContext<(title: string, tone?: ToastTone) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children, offsetLeft = 24 }: { children: ReactNode; offsetLeft?: number | string }) {
  const [toast, setToast] = useState<{ title: string; tone: ToastTone; key: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((title: string, tone: ToastTone = "success") => {
    setToast({ title, tone, key: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div className="fixed bottom-6 z-[200]" style={{ left: offsetLeft }}>
          <Toast key={toast.key} tone={toast.tone} title={toast.title} onClose={() => setToast(null)} />
        </div>
      )}
    </ToastCtx.Provider>
  );
}
