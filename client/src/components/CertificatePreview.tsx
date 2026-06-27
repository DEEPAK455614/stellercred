"use client";

import type { Certificate } from "@/lib/types";
import VerificationBadge from "./VerificationBadge";
import CopyButton from "./CopyButton";

interface CertificatePreviewProps {
  certificate: Certificate;
  showFull?: boolean;
}

export default function CertificatePreview({ certificate, showFull = false }: CertificatePreviewProps) {
  const isRevoked = certificate.status === "revoked";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        isRevoked
          ? "border-red-500/20 bg-red-500/5"
          : "border-emerald-500/20 bg-emerald-500/5"
      } p-8`}
    >
      {/* Background decoration */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl ${
          isRevoked ? "bg-red-500/10" : "bg-emerald-500/10"
        }`}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Certificate of Achievement
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {certificate.title}
          </h2>
        </div>
        <VerificationBadge
          status={isRevoked ? "revoked" : "verified"}
          size="lg"
        />
      </div>

      {/* Divider */}
      <div className="relative my-6 border-t border-white/10" />

      {/* Content */}
      <div className="relative space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Presented to</p>
          <p className="mt-1 text-xl font-semibold text-white">
            {certificate.student_name}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">For successfully completing</p>
          <p className="mt-1 text-lg font-medium text-emerald-400">
            {certificate.event_name || certificate.title}
          </p>
        </div>

        {certificate.description && (
          <p className="text-center text-sm text-gray-400">
            {certificate.description}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="relative mt-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Issuer</p>
          <p className="mt-0.5 text-white">{certificate.issuer_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Issue Date</p>
          <p className="mt-0.5 text-white">
            {new Date(certificate.issued_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {certificate.expires_at && (
          <div>
            <p className="text-xs text-gray-500">Expires</p>
            <p className="mt-0.5 text-white">
              {new Date(certificate.expires_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Certificate ID */}
      <div className="relative mt-6 flex items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-3">
        <span className="text-xs text-gray-500">ID:</span>
        <span className="font-mono text-sm text-gray-300">
          {certificate.certificate_id}
        </span>
        <CopyButton value={certificate.certificate_id} />
      </div>

      {/* Transaction & Hash info */}
      {showFull && (
        <div className="relative mt-4 space-y-2 rounded-lg bg-white/5 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Metadata Hash</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-gray-300">
                {certificate.metadata_hash.slice(0, 16)}...
              </span>
              <CopyButton value={certificate.metadata_hash} />
            </div>
          </div>
          {certificate.transaction_hash && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Transaction Hash</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-gray-300">
                  {certificate.transaction_hash.slice(0, 16)}...
                </span>
                <CopyButton value={certificate.transaction_hash} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Student Wallet</span>
            <span className="font-mono text-gray-300">
              {certificate.student_wallet.slice(0, 8)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
