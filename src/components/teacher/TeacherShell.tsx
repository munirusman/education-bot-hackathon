import type { ReactNode } from "react";
import { ToastProvider } from "../orbit/feedback";
import { Sidebar } from "./Sidebar";

export function TeacherShell({ teacher, classes, activeClassId, children }: { teacher: string; classes: { id: string; name: string }[]; activeClassId?: string; children: ReactNode }) {
  return (
    <ToastProvider offsetLeft="calc(var(--sidebar-w) + 24px)">
      <div className="flex h-screen bg-app">
        <Sidebar teacher={teacher} classes={classes} activeClassId={activeClassId} />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </ToastProvider>
  );
}

export function TopBar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex h-[var(--topbar-h)] flex-none items-center gap-3.5 border-b border-line bg-page px-7">
      <h1 className="type-h1 m-0 text-[26px]">{title}</h1>
      {children}
    </header>
  );
}
