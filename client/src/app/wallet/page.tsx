"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WalletConnectButton from "@/components/WalletConnectButton";
import WalletStatusCard from "@/components/WalletStatusCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { checkFreighterInstalled, getFreighterState } from "@/lib/freighter";

export default function WalletPage() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFreighterInstalled().then((inst) => {
      setInstalled(inst);
      if (inst) {
        getFreighterState().then((state) => {
          if (state.address) setAddress(state.address);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleConnect = (addr: string) => {
    setAddress(addr);
    setTimeout(() => router.push("/dashboard/student"), 500);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <LoadingSpinner label="Checking wallet..." />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-purple-600">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-bold text-white">Connect Your Wallet</h1>
            <p className="mt-2 text-sm text-gray-400">
              Link your Freighter wallet to access your certificates and manage credentials.
            </p>

            {installed === false ? (
              <div className="mt-6 space-y-3">
                <ErrorAlert message="Freighter wallet not detected. Please install the Freighter browser extension." />
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-500"
                >
                  Install Freighter
                </a>
              </div>
            ) : address ? (
              <div className="mt-6 space-y-4">
                <WalletStatusCard address={address} isTestnet={true} />
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/dashboard/student")}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-emerald-500"
                  >
                    Student Dashboard
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/admin")}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                  >
                    Admin Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <WalletConnectButton onConnect={handleConnect} />
                <p className="mt-4 text-xs text-gray-600">
                  By connecting, you agree to use the Stellar Testnet for demonstration purposes.
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              Stellar Testnet
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
