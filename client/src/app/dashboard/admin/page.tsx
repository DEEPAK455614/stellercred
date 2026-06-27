"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import WalletStatusCard from "@/components/WalletStatusCard";
import StatCard from "@/components/StatCard";
import AdminSidebar from "@/components/AdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { getFreighterState } from "@/lib/freighter";
import { apiFetch } from "@/lib/supabase";
import { ADMIN_WALLETS } from "@/lib/constants";
import type { AdminStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFreighterState().then(async (state) => {
      if (!state.address) {
        setLoading(false);
        return;
      }
      setAddress(state.address);
      const admin = ADMIN_WALLETS.length === 0 || ADMIN_WALLETS.includes(state.address);
      setIsAdmin(admin);

      if (admin) {
        try {
          const res = await apiFetch<{ success: boolean; data: AdminStats }>(
            "/api/admin/stats"
          );
          if (res.success) setStats(res.data);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to load stats");
        }
      }
      setLoading(false);
    });
  }, []);

  if (!address) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <EmptyState
            title="Wallet Not Connected"
            description="Connect your Freighter wallet to access the admin panel."
            action={
              <Link
                href="/wallet"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-500"
              >
                Connect Wallet
              </Link>
            }
          />
        </main>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <EmptyState
            title="Unauthorized"
            description="Your wallet is not registered as an admin. Contact the platform administrator."
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-8">
            <AdminSidebar />
            <div className="min-w-0 flex-1">
              <PageHeader
                title="Admin Dashboard"
                description="Manage certificates and view platform statistics."
                action={
                  <Link
                    href="/issue"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-500"
                  >
                    Issue Certificate
                  </Link>
                }
              />

              <div className="mb-6">
                <WalletStatusCard address={address} isTestnet={true} isAdmin={true} />
              </div>

              {error && (
                <div className="mb-6">
                  <ErrorAlert message={error} onDismiss={() => setError(null)} />
                </div>
              )}

              {loading ? (
                <LoadingSpinner label="Loading stats..." />
              ) : stats ? (
                <>
                  {/* Stats Grid */}
                  <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      label="Total Certificates"
                      value={stats.total_certificates}
                    />
                    <StatCard
                      label="Issued"
                      value={stats.issued_certificates}
                      trend="up"
                    />
                    <StatCard
                      label="Revoked"
                      value={stats.revoked_certificates}
                      trend={stats.revoked_certificates > 0 ? "down" : "neutral"}
                    />
                    <StatCard
                      label="Total Students"
                      value={stats.total_students}
                    />
                  </div>

                  {/* Recent Transactions */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="mb-4 text-base font-semibold text-white">
                      Recent Transactions
                    </h3>
                    {stats.recent_transactions.length === 0 ? (
                      <p className="text-sm text-gray-500">No transactions yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/5 text-xs text-gray-500">
                              <th className="pb-3 pr-4 font-medium">Action</th>
                              <th className="pb-3 pr-4 font-medium">Certificate</th>
                              <th className="pb-3 pr-4 font-medium">Status</th>
                              <th className="pb-3 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.recent_transactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-white/5 text-gray-300">
                                <td className="py-3 pr-4 capitalize">{tx.action_type}</td>
                                <td className="py-3 pr-4 font-mono text-xs">
                                  {tx.certificate_id || "—"}
                                </td>
                                <td className="py-3 pr-4">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                      tx.status === "success"
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : tx.status === "failed"
                                        ? "bg-red-500/15 text-red-400"
                                        : "bg-yellow-500/15 text-yellow-400"
                                    }`}
                                  >
                                    <span className={`h-1 w-1 rounded-full ${
                                      tx.status === "success"
                                        ? "bg-emerald-400"
                                        : tx.status === "failed"
                                        ? "bg-red-400"
                                        : "bg-yellow-400"
                                    }`} />
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="py-3 text-xs text-gray-500">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
