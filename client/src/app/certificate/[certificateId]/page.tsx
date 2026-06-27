"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CertificatePreview from "@/components/CertificatePreview";
import VerificationBadge from "@/components/VerificationBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import CopyButton from "@/components/CopyButton";
import { apiFetch } from "@/lib/supabase";
import { verifyCertificateOnChain } from "@/lib/contract";
import type { Certificate } from "@/lib/types";

export default function CertificateDetailPage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const [cert, setCert] = useState<Certificate | null>(null);
  const [onChainValid, setOnChainValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!certificateId) return;

    const fetchData = async () => {
      try {
        // Get off-chain data
        const offChainRes = await apiFetch<{ success: boolean; data: Certificate }>(
          `/api/certificates/${certificateId}`
        );

        if (!offChainRes.success || !offChainRes.data) {
          setError("Certificate not found");
          setLoading(false);
          return;
        }

        setCert(offChainRes.data);

        // Verify on-chain
        try {
          const valid = await verifyCertificateOnChain(certificateId);
          setOnChainValid(valid);
        } catch {
          // If on-chain verification fails (e.g., contract not deployed), show off-chain status
          setOnChainValid(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [certificateId]);

  const getVerificationStatus = () => {
    if (!cert) return "not_found" as const;
    if (cert.status === "revoked") return "revoked" as const;
    if (onChainValid === false) return "revoked" as const;
    if (onChainValid === true) return "verified" as const;
    // Off-chain says issued but can't verify on-chain
    return "pending" as const;
  };

  const verificationStatus = getVerificationStatus();

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {loading && <LoadingSpinner label="Loading certificate..." />}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <ErrorAlert message={error} />
            </div>
          )}

          {cert && (
            <div className="animate-fade-in space-y-6">
              {/* Verification Result Banner */}
              <div
                className={`rounded-xl border px-6 py-4 ${
                  verificationStatus === "verified"
                    ? "border-emerald-500/20 bg-emerald-500/10"
                    : verificationStatus === "revoked"
                    ? "border-red-500/20 bg-red-500/10"
                    : "border-yellow-500/20 bg-yellow-500/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {verificationStatus === "verified" ? (
                    <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ) : verificationStatus === "revoked" ? (
                    <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {verificationStatus === "verified"
                        ? "Certificate Verified ✓"
                        : verificationStatus === "revoked"
                        ? "Certificate Revoked"
                        : "Verification Pending"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {verificationStatus === "verified"
                        ? "This certificate is valid and recognized by the Stellar blockchain."
                        : verificationStatus === "revoked"
                        ? "This certificate has been revoked by the issuer and is no longer valid."
                        : "On-chain verification could not be completed. Showing off-chain status."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Preview */}
              <CertificatePreview certificate={cert} showFull={true} />

              {/* Quick Links */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <VerificationBadge status={verificationStatus} size="lg" />
                <CopyButton value={cert.certificate_id} label="Cert ID" />
                {cert.transaction_hash && (
                  <CopyButton value={cert.transaction_hash} label="Tx Hash" />
                )}
                <CopyButton value={cert.metadata_hash} label="Hash" />
              </div>

              {/* Share Link */}
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <p className="text-xs text-gray-500">Share Certificate Link</p>
                <p className="mt-1 text-sm text-gray-300">
                  {typeof window !== "undefined" &&
                    `${window.location.origin}/certificate/${cert.certificate_id}`}
                </p>
                <div className="mt-2 flex justify-center">
                  <CopyButton
                    value={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/certificate/${cert.certificate_id}`
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
