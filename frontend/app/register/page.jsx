"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    userId: "",
    password: "",
    role: "ROLE_STUDENT",
    title: "Mr.",
    gender: "Son",
    linkedStudentId: "",
  });

  const [childRegistered, setChildRegistered] = useState(null);
  const [studentVerified, setStudentVerified] = useState(false);
  const [verifiedStudentName, setVerifiedStudentName] = useState("");
  const [verifiedStudentGender, setVerifiedStudentGender] = useState("Son");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestedId(formData.role);
  }, [formData.role]);

  const fetchSuggestedId = async (role) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/next-id/${role}`);
      const text = await res.text();
      let data = {};
      try { if (text) data = JSON.parse(text); } catch (e) {}
      if (res.ok && data.suggestedId) {
        setFormData((prev) => ({ ...prev, userId: data.suggestedId }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = (newRole) => {
    setFormData({ ...formData, role: newRole, linkedStudentId: "", title: "Mr.", gender: "Son" });
    setChildRegistered(null);
    setStudentVerified(false);
    setVerifiedStudentName("");
    setVerifyError("");
  };

  const handleVerifyStudent = async () => {
    const studentId = formData.linkedStudentId.trim().toUpperCase();
    if (!studentId) {
      setVerifyError("Please enter your child's student ID.");
      return;
    }
    if (!studentId.startsWith("S-")) {
      setVerifyError("Invalid ID format. Student ID must start with 'S-' (e.g., S-1001).");
      return;
    }

    setVerifying(true);
    setVerifyError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-student/${studentId}`);
      const text = await res.text();
      let data = {};
      try { if(text) data = JSON.parse(text); } catch(e){}

      if (res.ok && data.exists) {
        setStudentVerified(true);
        setVerifiedStudentName(data.studentName);
        setVerifiedStudentGender(data.gender || "Son");
      } else {
        setStudentVerified(false);
        setVerifyError(data.message || "Student registration ID not found.");
      }
    } catch (err) {
      setVerifyError("Verification service unavailable.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const id = formData.userId.trim().toUpperCase();
    if (formData.role === "ROLE_STUDENT" && !id.startsWith("S-")) {
      setError("Invalid ID. Must contain 'S-' for Students.");
      return;
    }
    if (formData.role === "ROLE_TEACHER" && !id.startsWith("T-")) {
      setError("Invalid ID. Must contain 'T-' for Teachers.");
      return;
    }
    if (formData.role === "ROLE_PARENT") {
      if (!id.startsWith("P-")) {
        setError("Invalid ID. Must contain 'P-' for Parents.");
        return;
      }
      if (!studentVerified) {
        setError("You must verify your child's Student ID (S-XXXX) before registering.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: id, linkedStudentId: formData.linkedStudentId.trim().toUpperCase() }),
      });

      const text = await res.text();
      let data = {};
      try { if(text) data = JSON.parse(text); } catch(e){}

      if (!res.ok) throw new Error(data.message || "Registration failed.");

      setSuccess(`Account registered successfully with ID: ${id}! Redirecting...`);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-blue-50/40 p-8 shadow-xl backdrop-blur-sm">
        <h2 className="text-center text-3xl font-bold tracking-tight text-blue-900">Create Account</h2>
        <p className="mb-6 text-center text-xs text-blue-700">Institutional Role-Based Registry</p>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Select Role</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="ROLE_STUDENT">Student (ID Prefix: S-)</option>
              <option value="ROLE_TEACHER">Teacher (ID Prefix: T-)</option>
              <option value="ROLE_PARENT">Parent (ID Prefix: P-)</option>
            </select>
          </div>

          {formData.role === "ROLE_STUDENT" && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 space-y-2">
              <label className="block text-xs font-semibold text-indigo-800">
                Are you a Son or Daughter? *
              </label>
              <div className="flex gap-6">
                {["Son", "Daughter"].map((option) => (
                  <label key={option} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="studentGender"
                      checked={formData.gender === option}
                      onChange={() => setFormData({ ...formData, gender: option })}
                      className="accent-indigo-600"
                    />
                    <span className="font-semibold text-slate-800">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(formData.role === "ROLE_PARENT" || formData.role === "ROLE_TEACHER") && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 space-y-2">
              <label className="block text-xs font-semibold text-indigo-800">
                Select Salutation / Title *
              </label>
              <div className="flex flex-wrap gap-4">
                {["Mr.", "Mrs.", "Ms.", "Dr."].map((titleOption) => (
                  <label key={titleOption} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="userTitle"
                      checked={formData.title === titleOption}
                      onChange={() => setFormData({ ...formData, title: titleOption })}
                      className="accent-indigo-600"
                    />
                    <span className="font-semibold text-slate-800">{titleOption}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.role === "ROLE_PARENT" && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
              <label className="block text-xs font-semibold text-indigo-800">
                Has your child registered on this platform? *
              </label>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-800">
                  <input
                    type="radio"
                    name="childRegistered"
                    checked={childRegistered === true}
                    onChange={() => setChildRegistered(true)}
                    className="accent-indigo-600"
                  />
                  <span>Yes, my child has an S- ID</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-800">
                  <input
                    type="radio"
                    name="childRegistered"
                    checked={childRegistered === false}
                    onChange={() => setChildRegistered(false)}
                    className="accent-indigo-600"
                  />
                  <span>No, not yet</span>
                </label>
              </div>

              {childRegistered === false && (
                <div className="rounded-lg bg-amber-100 border border-amber-300 p-3 text-xs text-amber-800 space-y-2">
                  <p className="font-semibold">⚠️ Student ID Required First</p>
                  <p className="text-[11px]">
                    Parents must be linked to a registered student ID starting with 'S-'. Please have your child register as a student first.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("ROLE_STUDENT")}
                    className="rounded bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition"
                  >
                    Switch to Student Registration
                  </button>
                </div>
              )}

              {childRegistered === true && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-indigo-700">
                    Enter Child's Student ID (e.g., S-1001) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 font-mono"
                      value={formData.linkedStudentId}
                      onChange={(e) => {
                        setFormData({ ...formData, linkedStudentId: e.target.value.toUpperCase() });
                        setStudentVerified(false);
                        setVerifiedStudentName("");
                      }}
                      placeholder="S-1001"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyStudent}
                      disabled={verifying}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {verifying ? "Checking..." : "Verify ID"}
                    </button>
                  </div>

                  {studentVerified && (
                    <div className="rounded bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-700">
                      ✓ Verified {verifiedStudentGender}: <strong>{verifiedStudentName}</strong> ({formData.linkedStudentId})
                    </div>
                  )}

                  {verifyError && (
                    <div className="rounded bg-rose-50 border border-rose-200 p-2 text-xs text-rose-700">
                      ✕ {verifyError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Full Name</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Assigned User ID ({formData.role === "ROLE_STUDENT" ? "Must start with S-" : formData.role === "ROLE_TEACHER" ? "Must start with T-" : "Must start with P-"})
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (formData.role === "ROLE_PARENT" && !studentVerified)}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Registering..." : (formData.role === "ROLE_PARENT" && !studentVerified ? "Verify S- Child ID to Register" : "Complete Registration")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
