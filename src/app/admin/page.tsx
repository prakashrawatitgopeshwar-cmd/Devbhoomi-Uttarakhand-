import Link from "next/link";
import { requireAdmin } from "@/lib/admin-access";
import { adminModules } from "@/lib/admin-modules";
export const dynamic = "force-dynamic";

const cards = [
  { key: "destinations", label: "Destinations", table: "destinations", href: "/admin/destinations", tone: "bg-emerald-50 text-emerald-900" },
  { key: "stays", label: "Stay listings", table: "stays", href: "/admin/stays", tone: "bg-sky-50 text-sky-900" },
  { key: "packages", label: "Tour packages", table: "packages", href: "/admin/packages", tone: "bg-amber-50 text-amber-900" },
  { key: "bookings", label: "Booking requests", table: "bookings", href: "/admin/bookings", tone: "bg-violet-50 text-violet-900" },
  { key: "partners", label: "Partner applications", table: "partner_applications", href: "/admin/hotel-applications", tone: "bg-rose-50 text-rose-900" },
  { key: "support", label: "Open support cases", table: "support_cases", href: "/admin/support", tone: "bg-orange-50 text-orange-900" },
];

export default async function Dashboard() {
  const { supabase, user } = await requireAdmin();
  const counts = await Promise.all(cards.map(async (card) => {
    const { count, error } = await supabase.from(card.table).select("*", { count: "exact", head: true });
    return { ...card, count: error ? null : (count ?? 0), error: error?.message };
  }));
  const { data: recent } = await supabase.from("audit_logs").select("id,actor_email,action,resource,record_id,created_at").order("created_at", { ascending: false }).limit(6);
  const { count: districtCount } = await supabase.from("districts").select("*", { count: "exact", head: true });
  const { count: enquiryCount } = await supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new");

  return <div className="mx-auto max-w-7xl space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-800">DEVBHOOMI / ADMIN</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Operations overview</h1><p className="mt-2 text-sm text-slate-500">Manage destination content, partners and trip requests from one workspace.</p></div><div className="rounded-xl border bg-white px-4 py-3 text-sm"><span className="block text-xs text-slate-500">Signed in as</span><span className="font-semibold">{user.email}</span></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><article className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Districts</p><p className="mt-3 text-3xl font-bold">{districtCount ?? "—"}</p><Link className="mt-3 inline-block text-sm font-semibold text-emerald-800 hover:underline" href="/admin/districts">Manage districts →</Link></article><article className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">New enquiries</p><p className="mt-3 text-3xl font-bold">{enquiryCount ?? "—"}</p><Link className="mt-3 inline-block text-sm font-semibold text-emerald-800 hover:underline" href="/admin/enquiries">Open enquiry queue →</Link></article>{counts.slice(0,2).map((card)=><article className="rounded-2xl border bg-white p-5" key={card.key}><p className="text-sm text-slate-500">{card.label}</p><p className="mt-3 text-3xl font-bold">{card.count ?? "—"}</p><Link className="mt-3 inline-block text-sm font-semibold text-emerald-800 hover:underline" href={card.href}>Manage →</Link></article>)}</div>
    <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold">Operations</h2><p className="mt-1 text-sm text-slate-500">Live counts from the connected Supabase tables.</p></div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{counts.slice(2).map((card)=><Link href={card.href} key={card.key} className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{card.label}</p><p className="mt-1 text-xs text-slate-500">{card.error ? "Database error — check migration and RLS" : "Database connected"}</p></div><span className={"grid h-11 w-11 place-items-center rounded-xl text-lg font-bold "+card.tone}>{card.count ?? "!"}</span></div><p className="mt-4 text-sm font-semibold text-emerald-800 group-hover:underline">Open module →</p></Link>)}</div></section>
    <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><div className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Recent admin activity</h2><p className="mt-1 text-sm text-slate-500">Audit trail for record changes.</p>{recent?.length ? <div className="mt-4 divide-y">{recent.map((row:any)=><div key={row.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><div><p className="font-semibold">{row.action} · {row.resource}</p><p className="mt-1 text-xs text-slate-500">{row.actor_email ?? "Admin"} · {row.record_id ?? "—"}</p></div><time className="text-xs text-slate-500">{new Date(row.created_at).toLocaleString("en-IN")}</time></div>)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No activity recorded yet. New changes will appear here.</p>}</div>
    <div className="rounded-2xl bg-[#173e35] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-100">Launch readiness</p><h2 className="mt-3 text-xl font-bold">Keep bookings honest</h2><p className="mt-2 text-sm leading-6 text-emerald-50">This portal tracks operations; it does not process payments or claim live supplier availability. Confirm services only after provider price, inventory and reference are verified.</p><div className="mt-5 grid gap-2">{[["Homepage builder","/admin/site-builder"],["Route readiness","/admin/route-readiness"],["Cab fleet","/admin/fleet"],["Fare rules","/admin/fare-rules"],["Support & incidents","/admin/support"],["Audit logs","/admin/audit-logs"]].map(([label,href])=><Link key={href} href={href} className="flex items-center justify-between rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10">{label}<span>↗</span></Link>)}</div></div></section>
  </div>;
}
