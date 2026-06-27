// ============================================================
// GET /api/certificates/wallet/[walletAddress] — List by student wallet
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { findByWallet } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;
    const certs = findByWallet(walletAddress);
    return NextResponse.json({ success: true, data: certs });
  } catch (error) {
    console.error("GET /api/certificates/wallet error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
