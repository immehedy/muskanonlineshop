"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, LockKeyhole, User, ShieldCheck } from "lucide-react";
import { useRegister } from "@/packages/query/src/hooks/auth/useRegister";
import { AdminOnly } from "../../components/AdminOnly";

export default function AddUserPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "moderator" as "admin" | "moderator",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    registerMutation.mutate(formData, {
      onSuccess: () => {
        setSuccess("নতুন ইউজার সফলভাবে তৈরি হয়েছে।");
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "moderator",
        });
      },
      onError: (err: any) => {
        setError(err?.message || "ইউজার তৈরি করা যায়নি।");
      },
    });
  };

  const loading = registerMutation.isPending;

  return (
    <AdminOnly>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-950">
            নতুন ইউজার যোগ করুন
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            অ্যাডমিন বা কাস্টমার অ্যাকাউন্ট তৈরি করুন।
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                নাম
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                ইমেইল
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                পাসওয়ার্ড
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                রোল
              </label>

              <div className="grid grid-cols-2 gap-3">
                {(["moderator", "admin"] as const).map((role) => {
                  const selected = formData.role === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleChange("role", role)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#207b95] bg-[#207b95]/10 ring-2 ring-[#207b95]/10"
                          : "border-slate-200 bg-slate-50 hover:bg-white"
                      }`}>
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={`h-5 w-5 ${
                            selected ? "text-[#207b95]" : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm font-black capitalize text-slate-900">
                          {role}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {role === "admin"
                          ? "Admin dashboard access"
                          : "Customer/user account"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                ফিরে যান
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#207b95] px-6 text-sm font-black text-white shadow-lg shadow-[#207b95]/20 transition hover:bg-[#17687f] disabled:cursor-not-allowed disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "তৈরি হচ্ছে..." : "ইউজার তৈরি করুন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminOnly>
  );
}
