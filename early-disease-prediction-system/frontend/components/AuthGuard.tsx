"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsCheckingAuth(false);
      return;
    }

    const validateSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setIsCheckingAuth(false);
    };

    validateSession();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_KEY`. Configure environment variables to use this page.
      </div>
    );
  }

  return <>{children}</>;
}
