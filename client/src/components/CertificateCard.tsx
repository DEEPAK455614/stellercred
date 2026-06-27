"use client";

import Link from "next/link";
import type { Certificate } from "@/lib/types";
import VerificationBadge from "./VerificationBadge";
import CopyButton from "./CopyButton";

interface CertificateCardProps {
  certificate: Certificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const isRevoked = certificate.status === "revoked";

  return (
    <Link
      href={`/certificate/${certificate.certificate_id}`}
      className={`glass-card block rounded-xl p-5 transition-all hover:scale-[1.02] ${
        isRevoked ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              {certificate.title}
            </h3>
            <VerificationBadge status={isRevoked ? "revoked" : "verified"} />
          </div>
          <p className="mt-1 text-sm text-gray-400">
            {certificate.student_name}
          </p>
          <p className="text-xs text-gray-500">{certificate.event_name}</p>
        </div>
        <CopyButton value={certificate.certificate_id} label="ID" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Issuer</span>
          <p className="font-mono text-gray-300">{certificate.issuer_name}</p>
        </div>
        <div>
          <span className="text-gray-500">Issued</span>
          <p className="text-gray-300">
            {new Date(certificate.issued_at).toLocaleDateString()}
          </p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Certificate ID</span>
          <p className="font-mono text-gray-300">
            {certificate.certificate_id}
          </p>
        </div>
      </div>

      {certificate.transaction_hash && (
        <div className="mt-3 border-t border-white/5 pt-3 text-[10px] text-gray-600">
          Tx: {certificate.transaction_hash.slice(0, 20)}...
        </div>
      )}
    </Link>
  );
}
