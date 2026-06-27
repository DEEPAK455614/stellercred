// ============================================================
// PATCH /api/certificates/[certificateId]/revoke — Revoke certificate
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { findCertificateIndex, updateCertificate } from "@/lib/store";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const index = findCertificateIndex(certificateId);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    const updated = updateCertificate(index, {
      status: "revoked",
      updated_at: new Date().toISOString(),
    });

    if (updated.status !== "revoked") {
      return NextResponse.json(
        { success: false, error: "Certificate already revoked" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/certificates/revoke error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
