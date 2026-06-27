"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import CertificatePreview from "@/components/CertificatePreview";
import VerificationBadge from "@/components/VerificationBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import CopyButton from "@/components/CopyButton";
import { apiFetch } from "@/lib/supabase";
import { verifyCertificateOnChain } from "@/lib/contract";
import { isValidCertificateId } from "@/lib/validation";
import type { Certificate } from "@/lib/types";

export default function VerifyPage() {
  const [certId, setCertId] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{
    cert: Certificate | null;
    onChainValid: boolean | null;
    found: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!certId.trim()) return;

    if (!isValidCertificateId(certId.trim())) {
      setError("Invalid certificate ID format. Use alphanumeric characters (3-64 chars).");
      return;
    }

    setSearching(true);
    setError(null);
    setResult(null);

    try {
      // Fetch off-chain
      const offChainRes = await fetch(`/api/certificates/${certId.trim()}`);
      const offChainData = await offChainRes.json();

      if (!offChainRes.ok || !offChainData.success) {
        setResult({ cert: null, onChainValid: null, found: false });
        setSearching(false);
        return;
      }

      const cert: Certificate = offChainData.data;

      // Verify on-chain
      let onChainValid: boolean | null = null;
      try {
        onChainValid = await verifyCertificateOnChain(certId.trim());
      } catch {
        onChainValid = null;
      }

      setResult({ cert, onChainValid, found: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
      setResult({ cert: null, onChainValid: null, found: false });
    } finally {
      setSearching(false);
    }
  };

  const getStatus = () => {
    if (!result || !result.found) return "not_found" as const;
    if (result.cert?.status === "revoked") return "revoked" as const;
    if (result.onChainValid === false) return "revoked" as const;
    if (result.onChainValid === true) return "verified" as const;
    if (result.cert) return "pending" as const;
    return "not_found" as const;
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title="Verify Certificate"
            description="Enter a certificate ID to verify its authenticity on the Stellar blockchain."
          />

          {/* Search Form */}
          <form onSubmit={handleVerify} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Enter certificate ID (e.g. CERT-001)"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={searching || !certId.trim()}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50"
              >
                {searching ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          {searching && <LoadingSpinner label="Checking blockchain..." />}

          {/* Results */}
          {result && !searching && (
            <div className="animate-fade-in space-y-6">
              {/* Status Banner */}
              <div
                className={`rounded-xl border px-6 py-4 ${
                  getStatus() === "verified"
                    ? "border-emerald-500/20 bg-emerald-500/10"
                    : getStatus() === "revoked"
                    ? "border-red-500/20 bg-red-500/10"
                    : getStatus() === "not_found"
                    ? "border-gray-500/20 bg-gray-500/10"
                    : "border-yellow-500/20 bg-yellow-500/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatus() === "verified" ? (
                    <svg className="h-8 w-8 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : getStatus() === "revoked" ? (
                    <svg className="h-8 w-8 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {getStatus() === "verified"
                        ? "✓ Certificate is VALID"
                        : getStatus() === "revoked"
                        ? "✗ Certificate has been REVOKED"
                        : getStatus() === "not_found"
                        ? "Certificate Not Found"
                        : "Verification Status Unknown"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {getStatus() === "verified"
                        ? "This certificate is authentic and registered on the Stellar blockchain."
                        : getStatus() === "revoked"
                        ? "This certificate was revoked by the issuer and is no longer valid."
                        : getStatus() === "not_found"
                        ? "No certificate found with this ID in our records."
                        : "On-chain verification could not be completed."}
                    </p>
                  </div>
                </div>

                {/* On-chain Indicator */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      result.onChainValid === true ? "bg-emerald-400" :
                      result.onChainValid === false ? "bg-red-400" : "bg-gray-500"
                    }`} />
                    On-chain: {result.onChainValid === true ? "Valid" :
                               result.onChainValid === false ? "Invalid/Revoked" : "Unavailable"}
                  </span>
                  <span className="flex items-center gap-1">
                    <VerificationBadge status={getStatus()} />
                  </span>
                </div>
              </div>

              {/* Certificate Display */}
              {result.cert && (
                <>
                  <CertificatePreview certificate={result.cert} showFull={true} />
                </>
              )}

              {!result.cert && (
                <EmptyState
                  title="No Certificate Found"
                  description={`Certificate "${certId}" does not exist in the system.`}
                />
              )}
            </div>
          )}

          {/* Empty State */}
          {!result && !searching && !error && (
            <EmptyState
              title="Enter a Certificate ID"
              description="Paste a certificate ID above to verify its authenticity on the Stellar blockchain."
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
