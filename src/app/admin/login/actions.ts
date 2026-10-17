"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAllowedAdmin } from "@/lib/supabase-server";

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=missing");

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user || !isAllowedAdmin(data.user.email)) {
      await supabase.auth.signOut();
      redirect("/admin/login?error=invalid");
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("NEXT_REDIRECT")) throw error;
    redirect("/admin/login?error=setup");
  }

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
