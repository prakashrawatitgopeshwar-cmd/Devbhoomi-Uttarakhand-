import { Mountain, ShieldCheck } from "lucide-react";
import { signInAdmin } from "./actions";

export default async function Login({ searchParams }: { searchParams: { error?: string } }) {
  const messages: Record<string, string> = {
    missing: "Email aur password dono enter karein.",
    invalid: "Sign-in details valid nahi hain ya account admin allowlist mein nahi hai.",
    setup: "Authentication setup incomplete hai. Admin configuration check karein.",
    unauthorized: "Is account ko admin access nahi diya gaya hai.",
    auth: "Please sign in to continue.",
  };
  const error = searchParams?.error;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#173e35] p-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3 text-[#173e35]">
          <Mountain size={32} />
          <div><h1 className="text-xl font-bold">DevBhoomi Admin</h1><p className="text-sm text-slate-500">Himalayan Horizons</p></div>
        </div>
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-600">Administrator sign-in</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{messages[error] ?? "Sign-in failed."}</p>}
        <form action={signInAdmin} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Email
            <input name="email" type="email" required autoComplete="username" placeholder="admin@example.com" className="mt-1 w-full rounded-xl border px-3 py-3" />
          </label>
          <label className="block text-sm font-medium">Password
            <input name="password" type="password" required autoComplete="current-password" placeholder="Enter password" className="mt-1 w-full rounded-xl border px-3 py-3" />
          </label>
          <button type="submit" className="w-full rounded-xl bg-[#173e35] px-4 py-3 font-semibold text-white hover:bg-[#245749]">Sign in securely</button>
        </form>
        <p className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <ShieldCheck size={18} className="shrink-0" />
          Access is restricted to administrator email addresses configured by the site owner.
        </p>
      </section>
    </main>
  );
}
