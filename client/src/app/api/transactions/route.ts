// ============================================================
// POST /api/transactions — Log a transaction
// GET  /api/transactions — List all transaction logs
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { addTxLog, getTxLogsSorted } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transaction_hash,
      wallet_address,
      action_type,
      certificate_id,
      status,
      error_message,
    } = body;

    if (!wallet_address || !action_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const log = {
      id: crypto.randomUUID(),
      transaction_hash: transaction_hash || null,
      wallet_address,
      action_type,
      certificate_id: certificate_id || null,
      status: status || "pending",
      error_message: error_message || null,
      created_at: new Date().toISOString(),
    };

    addTxLog(log);

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: getTxLogsSorted() });
}
