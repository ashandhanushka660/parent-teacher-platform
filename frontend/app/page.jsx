import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-900">
      <div className="max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
          Parent-Teacher <span className="text-indigo-600">Interactive Vault</span>
        </h1>
        <p className="text-slate-500 text-sm">
          A secure multi-tier communication and academic record system for Students, Teachers, and Parents.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-indigo-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-300 bg-slate-50 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          🕊️ Dedicated in memory of my school principal <span className="text-indigo-600 font-semibold">A.M. Karunarathne (RIS)</span>
        </div>
      </div>
    </main>
  );
}
