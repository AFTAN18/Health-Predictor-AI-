"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Navbar from "@/components/Navbar";
import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const signUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured) {
      setError("Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    setMessage("Account created. You can now log in.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-md px-4 py-14">
        <div className="surface-card w-full p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Start predicting and tracking disease risk securely.</p>

          <form className="mt-6 space-y-4" onSubmit={signUp}>
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
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-200"
                placeholder="********"
                minLength={6}
                required
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-xl py-3 text-sm font-semibold text-white ${
                isLoading ? "cursor-not-allowed bg-brand-400" : "bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
