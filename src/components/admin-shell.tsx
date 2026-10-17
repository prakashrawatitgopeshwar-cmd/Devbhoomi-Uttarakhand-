"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mountain, LayoutDashboard, PanelsTopLeft, Map, MapPin, Hotel, Package,
  CalendarCheck, Users, MessageSquare, Settings, ClipboardList, ShieldCheck,
} from "lucide-react";

const nav = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Homepage Builder", "/admin/site-builder", PanelsTopLeft],
  ["Districts", "/admin/districts", Map],
  ["Destinations & Temples", "/admin/destinations", MapPin],
  ["Hotel Applications", "/admin/hotel-applications", ShieldCheck],
  ["Stays", "/admin/stays", Hotel],
  ["Tour Packages", "/admin/packages", Package],
  ["Bookings", "/admin/bookings", CalendarCheck],
  ["Customers", "/admin/customers", Users],
  ["Reviews & Enquiries", "/admin/moderation", MessageSquare],
  ["Settings", "/admin/settings", Settings],
  ["Audit Logs", "/admin/audit-logs", ClipboardList],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The sign-in page is intentionally standalone: never render admin navigation
  // behind or beside the login form.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="w-full bg-[#173e35] p-5 text-white md:min-h-screen md:w-64">
        <Link href="/admin" className="mb-7 flex items-center gap-3">
          <span className="rounded-xl bg-white/10 p-2"><Mountain size={23} /></span>
          <span><b className="block">DevBhoomi</b><small>Himalayan Horizons</small></span>
        </Link>
        <p className="mb-3 text-xs uppercase tracking-widest text-emerald-100">Administration</p>
        <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10">
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 rounded-lg border border-white/20 p-3 text-xs">
          Starter mode: authentication setup pending.
        </p>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-4 text-sm text-slate-500">
          Admin workspace · Setup in progress
        </header>
        <main className="p-5 md:p-8">{children}</main>
      </section>
    </div>
  );
}
