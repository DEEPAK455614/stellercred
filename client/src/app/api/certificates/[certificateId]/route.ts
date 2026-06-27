// ============================================================
// GET /api/certificates/[certificateId] — Fetch certificate by ID
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { findCertificate } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const cert = findCertificate(certificateId);

    if (!cert) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: cert });
  } catch (error) {
    console.error("GET /api/certificates/[certificateId] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
