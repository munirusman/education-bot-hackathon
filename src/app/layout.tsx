import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Classroom Harness", description: "A private AI tutor for every student, with the teacher in the loop." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <Link href="/" className="font-semibold text-indigo-700">Classroom Harness</Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/teacher" className="hover:text-indigo-700">Teacher</Link>
            <Link href="/student" className="hover:text-indigo-700">Student</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
