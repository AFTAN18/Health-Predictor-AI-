"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthenticated(false);
      return;
    }

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(data.session));
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (!isSupabaseConfigured) {
      router.push("/login");
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
  };

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
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/predict" className={linkClass("/predict")}>
                Predict
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
