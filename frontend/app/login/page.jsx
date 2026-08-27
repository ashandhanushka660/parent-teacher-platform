"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanId = userId.trim().toUpperCase();
    if (!cleanId.startsWith("S-") && !cleanId.startsWith("T-") && !cleanId.startsWith("P-")) {
      setError("Invalid ID format: Must start with 'S-' for Student, 'T-' for Teacher, or 'P-' for Parent.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: cleanId, password }),
      });

      const text = await res.text();
      let data = {};
      try { if (text) data = JSON.parse(text); } catch (e) {}

      if (!res.ok) {
        throw new Error(data.message || `Authentication service returned HTTP ${res.status}. Check the forwarded API port.`);
      }

      localStorage.setItem("user", JSON.stringify(data));
      setSuccess(`Welcome ${data.fullName}! Loading secure portal...`);

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">Portal Login</h2>
        <p className="mb-6 text-center text-xs text-slate-500">Zero-Trust Secured Community</p>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 border border-emerald-200">
            <span>✓ {success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
            <span>⚠ {error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              User ID (S-XXXX, T-XXXX, P-XXXX)
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value.toUpperCase())}
              placeholder="e.g., S-1001, T-1001, P-1001"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
