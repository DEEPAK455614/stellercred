// ============================================================
// POST /api/certificates — Create certificate metadata
// GET  /api/certificates — List all certificates
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getCertificates,
  addCertificate,
  findCertificate,
} from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      certificate_id,
      student_wallet,
      student_name,
      title,
      issuer_name,
      event_name,
      description,
      metadata_json,
      metadata_hash,
      transaction_hash,
    } = body;

    if (!certificate_id || !student_wallet || !student_name || !title || !issuer_name || !metadata_hash) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (findCertificate(certificate_id)) {
      return NextResponse.json(
        { success: false, error: "Certificate ID already exists" },
        { status: 409 }
      );
    }

    const certificate = {
      id: crypto.randomUUID(),
      certificate_id,
      student_wallet,
      student_name,
      title,
      issuer_name,
      event_name: event_name || null,
      description: description || null,
      metadata_json: metadata_json || "{}",
      metadata_hash,
      transaction_hash: transaction_hash || null,
      contract_id: process.env.NEXT_PUBLIC_CONTRACT_ID || null,
      status: "issued",
      issued_at: new Date().toISOString(),
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addCertificate(certificate);

    return NextResponse.json({ success: true, data: certificate }, { status: 201 });
  } catch (error) {
    console.error("POST /api/certificates error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: getCertificates() });
}
