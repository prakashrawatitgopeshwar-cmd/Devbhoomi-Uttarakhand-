import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured.");

  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: Record<string, unknown>) {
        try { cookieStore.set({ name, value, ...(options as object) }); } catch {}
      },
      remove(name: string, options: Record<string, unknown>) {
        try { cookieStore.set({ name, value: "", ...(options as object), maxAge: 0 }); } catch {}
      },
    },
  });
}

export function isAllowedAdmin(email: string | undefined | null) {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}
