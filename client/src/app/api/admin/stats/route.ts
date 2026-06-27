// ============================================================
// GET /api/admin/stats — Admin dashboard summary
// ============================================================

import { NextResponse } from "next/server";
import { getCertificates, getTxLogsSorted } from "@/lib/store";

export async function GET() {
  try {
    const certificates = getCertificates();
    const total_certificates = certificates.length;
    const issued_certificates = certificates.filter((c) => c.status === "issued").length;
    const revoked_certificates = certificates.filter((c) => c.status === "revoked").length;
    const total_students = new Set(certificates.map((c) => c.student_wallet)).size;

    const recent_transactions = getTxLogsSorted().slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        total_certificates,
        issued_certificates,
        revoked_certificates,
        total_students,
        recent_transactions,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
