"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import AdminSidebar from "@/components/AdminSidebar";
import WalletStatusCard from "@/components/WalletStatusCard";
import TransactionStatus from "@/components/TransactionStatus";
import ErrorAlert from "@/components/ErrorAlert";
import { getFreighterState } from "@/lib/freighter";
import { ADMIN_WALLETS } from "@/lib/constants";
import { sha256 } from "@/lib/hash";
import { validateIssueForm } from "@/lib/validation";
import { apiFetch } from "@/lib/supabase";
import { issueCertificateOnChain } from "@/lib/contract";

export default function IssueCertificatePage() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [txMessage, setTxMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    studentName: "",
    studentWallet: "",
    title: "",
    issuerName: "",
    eventName: "",
    certificateId: "",
    description: "",
  });

  useEffect(() => {
    getFreighterState().then((state) => {
      if (!state.address) {
        router.push("/wallet");
        return;
      }
      setAddress(state.address);
      const admin = ADMIN_WALLETS.length === 0 || ADMIN_WALLETS.includes(state.address);
      setIsAdmin(admin);
      if (admin) {
        setForm((f) => ({ ...f, issuerName: "StellarCred Admin" }));
      }
    });
  }, [router]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateCertificateId = useCallback(() => {
    const prefix = "CERT";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setTxStatus("idle");

    // Validate
    const validationErrors = validateIssueForm(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!address || !isAdmin) {
      setErrors(["You are not authorized to issue certificates"]);
      return;
    }

    setSubmitting(true);
    setTxStatus("pending");
    setTxMessage("Generating certificate metadata hash...");

    try {
      const certId = form.certificateId || generateCertificateId();

      // Build metadata
      const metadata = {
        student_name: form.studentName,
        student_wallet: form.studentWallet,
        title: form.title,
        issuer_name: form.issuerName,
        event_name: form.eventName,
        description: form.description,
        issued_at: new Date().toISOString(),
        expires_at: null,
        certificate_id: certId,
        schema_version: "1.0.0",
      };

      const metadataJson = JSON.stringify(metadata, null, 2);
      setTxMessage("Computing SHA-256 hash...");

      // Generate hash
      const metadataHash = await sha256(metadataJson);

      setTxMessage("Submitting to Soroban smart contract...");

      // Issue on chain
      const txResult = await issueCertificateOnChain(
        address,
        form.studentWallet,
        certId,
        metadataHash
      );

      if (txResult.status === "failed") {
        throw new Error("Transaction failed on-chain");
      }

      setTxMessage("Saving certificate metadata...");

      // Save to backend
      const certResponse = await apiFetch<any>(
        "/api/certificates",
        {
          method: "POST",
          body: JSON.stringify({
            certificate_id: certId,
            student_wallet: form.studentWallet,
            student_name: form.studentName,
            title: form.title,
            issuer_name: form.issuerName,
            event_name: form.eventName,
            description: form.description,
            metadata_json: metadataJson,
            metadata_hash: metadataHash,
            transaction_hash: txResult.hash,
          }),
        }
      );

      if (!certResponse.success) {
        throw new Error(certResponse.error || "Failed to save certificate");
      }

      // Log transaction
      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          transaction_hash: txResult.hash,
          wallet_address: address,
          action_type: "issue",
          certificate_id: certId,
          status: "success",
        }),
      });

      setTxStatus("success");
      setTxMessage(
        `Certificate issued successfully! Tx: ${txResult.hash.slice(0, 16)}...`
      );

      // Redirect after delay
      setTimeout(() => {
        router.push(`/certificate/${certId}`);
      }, 2000);
    } catch (error) {
      console.error("Issue error:", error);
      setTxStatus("failed");
      setTxMessage(
        error instanceof Error ? error.message : "Failed to issue certificate"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!address || !isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <p className="text-gray-400">Checking authorization...</p>
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
                title="Issue Certificate"
                description="Create a new blockchain-verified certificate."
              />

              <div className="mb-6">
                <WalletStatusCard address={address} isTestnet={true} isAdmin={true} />
              </div>

              {errors.length > 0 && (
                <div className="mb-6 space-y-2">
                  {errors.map((err, i) => (
                    <ErrorAlert key={i} message={err} onDismiss={() => setErrors([])} />
                  ))}
                </div>
              )}

              {txStatus !== "idle" && (
                <div className="mb-6">
                  <TransactionStatus status={txStatus} message={txMessage} />
                </div>
              )}

              <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Student Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={form.studentName}
                      onChange={(e) => updateField("studentName", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder="e.g. Alice Johnson"
                    />
                  </div>

                  {/* Student Wallet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Student Wallet Address *
                    </label>
                    <input
                      type="text"
                      value={form.studentWallet}
                      onChange={(e) => updateField("studentWallet", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder="G... (56 chars)"
                    />
                  </div>

                  {/* Certificate Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Certificate Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder="e.g. Advanced Blockchain Development"
                    />
                  </div>

                  {/* Issuer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Issuer Name *
                    </label>
                    <input
                      type="text"
                      value={form.issuerName}
                      onChange={(e) => updateField("issuerName", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder="e.g. Stellar University"
                    />
                  </div>

                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Event / Course Name *
                    </label>
                    <input
                      type="text"
                      value={form.eventName}
                      onChange={(e) => updateField("eventName", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder="e.g. Web3 Bootcamp 2025"
                    />
                  </div>

                  {/* Certificate ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Certificate ID *
                    </label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        type="text"
                        value={form.certificateId}
                        onChange={(e) => updateField("certificateId", e.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                        placeholder="e.g. CERT-001"
                      />
                      <button
                        type="button"
                        onClick={() => updateField("certificateId", generateCertificateId())}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-gray-400 hover:bg-white/10 hover:text-white"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={3}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder="Additional details about this certificate..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/admin")}
                    className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner !h-4 !w-4" />
                        Issuing...
                      </span>
                    ) : (
                      "Issue Certificate"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
