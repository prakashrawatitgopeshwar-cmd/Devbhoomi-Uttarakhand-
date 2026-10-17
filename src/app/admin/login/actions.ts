"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=missing");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) redirect("/admin/login?error=setup");

  let issue: string | null = null;
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      issue = "invalid";
    } else {
      const { data: membership, error: membershipError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (membershipError) {
        await supabase.auth.signOut();
        issue = "database";
      } else if (membership?.role !== "admin") {
        await supabase.auth.signOut();
        issue = "unauthorized";
      }
    }
  } catch {
    issue = "setup";
  }

  if (issue) redirect("/admin/login?error=" + issue);
  redirect("/admin");
}

export async function signOutAdmin() {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  } finally {
    redirect("/admin/login");
  }
}
