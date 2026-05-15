"use client";

import Link from "next/link";
import { Loader2, Plus, Trash2, UserCog, Mail, ShieldCheck } from "lucide-react";
import { useCurrentUser } from "@/packages/query/src/hooks/useCurrentUser";
import { useUsers } from "@/packages/query/src/hooks/useUsers";
import { useDeleteUser } from "@/packages/query/src/hooks/userDeleteUser";
import { AdminOnly } from "../components/AdminOnly";


export default function UsersPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: users = [], isLoading } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete this user?");

    if (!confirmed) return;

    deleteUserMutation.mutate(userId);
  };

  return (
    <AdminOnly>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">
              ইউজার ম্যানেজমেন্ট
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              অ্যাডমিন এবং কাস্টমার অ্যাকাউন্ট দেখুন ও ম্যানেজ করুন।
            </p>
          </div>

          <Link href="/admin/users/new">
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#207b95] px-5 text-sm font-bold text-white shadow-lg shadow-[#207b95]/20 transition hover:bg-[#17687f]">
              <Plus className="h-4 w-4" />
              নতুন ইউজার
            </button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="text-sm font-black text-slate-900">
              মোট {users.length} জন ইউজার
            </h2>
          </div>

          {isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#207b95]" />
            </div>
          ) : users.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <UserCog className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                No users found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#207b95]/10 text-[#207b95]">
                        <UserCog className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-black text-slate-950">
                            {user.name}
                          </h3>

                          {isSelf && (
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                              You
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              user.role === "admin"
                                ? "bg-[#207b95]/10 text-[#207b95]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      {user.role === "admin" && (
                        <div className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 sm:flex">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Admin
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        disabled={isSelf || deleteUserMutation.isPending}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminOnly>
  );
}