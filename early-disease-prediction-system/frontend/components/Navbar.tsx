"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-brand-100 text-brand-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-brand-700"
    }`;

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
          <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-700">
            MediPredict AI
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link href="/predict" className={linkClass("/predict")}>
            Predict
          </Link>
        </div>
      </div>
    </nav>
  );
}
