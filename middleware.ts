import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (!url || !key) {
    if (isLogin) return response;
    return NextResponse.redirect(new URL("/admin/login?error=setup", request.url));
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    let isAdmin = false;
    let roleLookupFailed = false;

    if (user && !authError) {
      const { data: membership, error: membershipError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      roleLookupFailed = Boolean(membershipError);
      isAdmin = !membershipError && membership?.role === "admin";
    }

    if (isLogin && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (!isLogin && !isAdmin) {
      const destination = new URL("/admin/login", request.url);
      destination.searchParams.set("error", roleLookupFailed ? "database" : user ? "unauthorized" : "auth");
      return NextResponse.redirect(destination);
    }

    return response;
  } catch {
    if (isLogin) return response;
    return NextResponse.redirect(new URL("/admin/login?error=setup", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
