"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, LayoutGrid, ScrollText } from "lucide-react";
import { Avatar, cx, Eyebrow, Logo } from "../orbit/core";

export function Sidebar({ teacher, school, classes, activeClassId }: { teacher: string; school?: string; classes: { id: string; name: string }[]; activeClassId?: string }) {
  const path = usePathname();
  const router = useRouter();
  const nav = activeClassId
    ? [
        { href: `/teacher/${activeClassId}`, icon: LayoutGrid, label: "Live classroom", active: path === `/teacher/${activeClassId}` || path.startsWith(`/teacher/${activeClassId}/students`) },
        { href: `/teacher/${activeClassId}/policy`, icon: ScrollText, label: "Tutor rules", active: path.startsWith(`/teacher/${activeClassId}/policy`) },
      ]
    : [];
  return (
    <aside className="flex w-[var(--sidebar-w)] flex-none flex-col gap-[18px] border-r border-line bg-page px-3 py-[18px]">
      <Link href="/" className="px-2.5" aria-label="Orbit home"><Logo size={26} /></Link>
      <div className="px-2.5">
        <Eyebrow className="mb-1.5">Class</Eyebrow>
        <span className="relative flex">
          <select
            aria-label="Switch class"
            value={activeClassId ?? ""}
            onChange={(e) => router.push(e.target.value ? `/teacher/${e.target.value}` : "/teacher")}
            className="h-9 w-full cursor-pointer appearance-none truncate rounded-sm border border-line-2 bg-card pr-8 pl-2.5 type-label text-fg-1 outline-none focus:shadow-[var(--ring-focus)]"
          >
            {!activeClassId && <option value="">Choose a class</option>}
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            {activeClassId && <option value="">All classes…</option>}
          </select>
          <ChevronsUpDown size={14} className="pointer-events-none absolute top-1/2 right-2.5 -mt-[7px] text-fg-3" aria-hidden />
        </span>
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="Class">
        {nav.map(({ href, icon: I, label, active }) => (
          <Link key={href} href={href} className={cx("flex h-[34px] items-center gap-2.5 rounded-sm px-2.5 type-label text-sm no-underline", active ? "bg-plum-50 text-plum-700" : "text-fg-2 hover:bg-sand-100 hover:text-fg-1")}>
            <I size={16} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2.5 px-2.5 py-2">
        <Avatar name={teacher} teacher size={28} />
        <div>
          <div className="type-label">{teacher}</div>
          <div className="type-caption text-fg-3">{school ?? "Teacher · demo account"}</div>
        </div>
      </div>
    </aside>
  );
}
