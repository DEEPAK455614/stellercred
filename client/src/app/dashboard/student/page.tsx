"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import WalletStatusCard from "@/components/WalletStatusCard";
import CertificateCard from "@/components/CertificateCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import Link from "next/link";
import { getFreighterState } from "@/lib/freighter";
import { apiFetch } from "@/lib/supabase";
import type { Certificate as CertType } from "@/lib/types";

export default function StudentDashboardPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [certs, setCerts] = useState<CertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFreighterState().then(async (state) => {
      if (!state.address) {
        setLoading(false);
        return;
      }
      setAddress(state.address);
      try {
        const res = await apiFetch<{ success: boolean; data: CertType[] }>(
          `/api/certificates/wallet/${state.address}`
        );
        if (res.success) setCerts(res.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load certificates");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (!address) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <EmptyState
            title="Wallet Not Connected"
            description="Connect your Freighter wallet to view your certificates."
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

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <PageHeader
            title="Student Dashboard"
            description="View and manage your blockchain-verified certificates."
          />

          <div className="mb-6">
            <WalletStatusCard address={address} isTestnet={true} />
          </div>

          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          {loading ? (
            <LoadingSpinner label="Loading certificates..." />
          ) : certs.length === 0 ? (
            <EmptyState
              title="No Certificates Yet"
              description="Certificates issued to your wallet will appear here."
              action={
                <p className="text-xs text-gray-600">
                  Ask an admin to issue a certificate to{" "}
                  <span className="font-mono text-gray-500">{address.slice(0, 8)}...</span>
                </p>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {certs.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
