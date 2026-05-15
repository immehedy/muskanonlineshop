"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useLogin } from "@/packages/query/src/hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push("/admin/dashboard");
          router.refresh();
        },
        onError: (error: any) => {
          setError(error?.message || "লগইন করা যায়নি");
        },
      }
    );
  };

  const loading = loginMutation.isPending;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black">মুসকান অনলাইন শপ বিডি</div>
              <div className="text-sm text-slate-400">
                অ্যাডমিন ম্যানেজমেন্ট প্যানেল
              </div>
            </div>
          </div>

          <div>
            <h1 className="max-w-xl text-4xl font-black leading-tight">
              অর্ডার, সেলস এবং ড্যাশবোর্ড ম্যানেজ করুন সহজভাবে।
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              নিরাপদ অ্যাডমিন অ্যাক্সেসের মাধ্যমে আপনার ব্যবসার গুরুত্বপূর্ণ
              তথ্য দেখুন এবং ম্যানেজ করুন।
            </p>
          </div>

          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Admin Panel
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-2xl font-black text-slate-950">
                মুসকান অনলাইন শপ বিডি
              </h1>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  লগইন করুন
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে আপনার তথ্য দিন।
                </p>
              </div>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    ইমেইল
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="admin@example.com"
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    পাসওয়ার্ড
                  </label>

                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="আপনার পাসওয়ার্ড"
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "লগইন হচ্ছে..." : "লগইন"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}