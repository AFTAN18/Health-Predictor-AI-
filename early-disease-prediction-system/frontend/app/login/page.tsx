"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY.");
      return;
    }

    setIsLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-md px-4 py-14">
        <div className="surface-card w-full p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-500">Access your prediction dashboard and history.</p>

          <form className="mt-6 space-y-4" onSubmit={signIn}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-200"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-200"
                placeholder="********"
                required
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-xl py-3 text-sm font-semibold text-white ${
                isLoading ? "cursor-not-allowed bg-brand-400" : "bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
