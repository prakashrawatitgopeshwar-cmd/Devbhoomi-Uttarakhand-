"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Mountain, LayoutDashboard, PanelsTopLeft, Map, MapPin, Hotel, Package, Image as ImageIcon,
  CalendarCheck, Users, MessageSquare, Settings, ClipboardList, ShieldCheck, Car, Route, LifeBuoy, Tags, Menu, UserCog,
} from "lucide-react";

const nav = [
  ["Overview", "/admin", LayoutDashboard],
  ["Team & Employees", "/admin/team", UserCog],
  ["Homepage Builder", "/admin/site-builder", PanelsTopLeft],
  ["Districts", "/admin/districts", Map],
  ["Destinations", "/admin/destinations", MapPin],
  ["Partner Applications", "/admin/hotel-applications", ShieldCheck],
  ["Stays", "/admin/stays", Hotel],
  ["Tour Packages", "/admin/packages", Package],
  ["Bookings", "/admin/bookings", CalendarCheck],
  ["Customers", "/admin/customers", Users],
  ["Reviews", "/admin/moderation", MessageSquare],
  ["Enquiries", "/admin/enquiries", MessageSquare],
  ["Route Readiness", "/admin/route-readiness", Route],
  ["Cab Fleet", "/admin/fleet", Car],
  ["Fare Rules", "/admin/fare-rules", Tags],
  ["Support & Incidents", "/admin/support", LifeBuoy],
  ["Branding & Profile", "/admin/branding", ImageIcon],
  ["Settings", "/admin/settings", Settings],
  ["Audit Logs", "/admin/audit-logs", ClipboardList],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [branding, setBranding] = useState({ site_logo_url: "", admin_profile_url: "" });
  useEffect(() => { if (pathname === "/admin/login") return; const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; if (!url || !key) return; const db = createBrowserClient(url, key); let active = true; db.from("site_settings").select("setting_key,value_text").in("setting_key", ["site_logo_url","admin_profile_url"]).then(({data}) => { if (active && data) { const next = {site_logo_url:"",admin_profile_url:""}; for (const row of data) { if (row.setting_key === "site_logo_url") next.site_logo_url = row.value_text ?? ""; if (row.setting_key === "admin_profile_url") next.admin_profile_url = row.value_text ?? ""; } setBranding(next); } }); return () => { active = false; }; }, [pathname]);
  if (pathname === "/admin/login") return <>{children}</>;
  return <div className="min-h-screen bg-[#f5f7f5] md:flex">
    <aside className="w-full shrink-0 bg-[#173e35] p-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto md:p-5">
      <Link href="/admin" className="mb-6 flex items-center gap-3 px-2 py-2"><span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/10 p-1">{branding.site_logo_url ? <img src={branding.site_logo_url} alt="Site logo" className="h-full w-full object-contain"/> : <Mountain size={23}/>}</span><span><b className="block">DevBhoomi</b><small className="text-emerald-100">Himalayan Horizons</small></span></Link>
      <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[.2em] text-emerald-100">Administration</p>
      <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">{nav.map(([label, href, Icon]) => {const active=pathname===href;return <Link key={href} href={href} className={"flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs transition "+(active?"bg-white font-semibold text-[#173e35]":"text-emerald-50 hover:bg-white/10")}><Icon size={15}/>{label}</Link>})}</nav>
      <form action="/admin/logout" method="post" className="mt-5"><button className="w-full rounded-xl border border-white/20 px-3 py-2.5 text-sm hover:bg-white/10">Sign out securely</button></form>
    </aside>
    <section className="min-w-0 flex-1"><header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-5 py-4 backdrop-blur md:px-8"><div><p className="text-xs text-slate-500">DevBhoomi / Operations</p><p className="text-sm font-semibold text-slate-800">{nav.find((item)=>item[1]===pathname)?.[0] ?? "Admin workspace"}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-sm font-semibold text-slate-800">Prakash Rawat</p><p className="text-xs text-slate-500">Founder · Admin session</p></div>{branding.admin_profile_url ? <img src={branding.admin_profile_url} alt="Prakash Rawat profile" className="h-10 w-10 rounded-full object-cover border"/> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900">PR</span>}</div></header><main className="p-4 md:p-8">{children}</main></section>
  </div>;
}
