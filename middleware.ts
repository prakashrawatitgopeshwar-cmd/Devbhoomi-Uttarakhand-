import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isAllowedAdmin(email: string | undefined | null) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (!url || !key || !(process.env.ADMIN_EMAILS ?? "").trim()) {
    if (isLogin) return response;
    return NextResponse.redirect(new URL("/admin/login?error=setup", request.url));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const authorized = !!user && isAllowedAdmin(user.email);

  if (isLogin && authorized) return NextResponse.redirect(new URL("/admin", request.url));
  if (!isLogin && !authorized) {
    const destination = new URL("/admin/login", request.url);
    destination.searchParams.set("error", user ? "unauthorized" : "auth");
    return NextResponse.redirect(destination);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
