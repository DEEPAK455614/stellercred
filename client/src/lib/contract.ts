// ============================================================
// StellarCred — Soroban Contract Interaction Layer
// ============================================================

import { CONTRACT_ID, DEMO_MODE } from "./constants";
import {
  readContract,
  submitContractTransaction,
  toScValString,
  toScValAddress,
} from "./stellar";
import type { OnChainCertificate } from "./types";

/**
 * Initialize the contract (set admin).
 */
export async function initializeContract(admin: string): Promise<{ hash: string; status: string }> {
  if (DEMO_MODE) {
    console.log("[DEMO] initializeContract", admin);
    return { hash: "0".repeat(64), status: "success" };
  }
  return submitContractTransaction(CONTRACT_ID, "initialize", [toScValAddress(admin)], admin);
}

/**
 * Issue a certificate on-chain.
 */
export async function issueCertificateOnChain(
  admin: string,
  studentWallet: string,
  certificateId: string,
  metadataHash: string
): Promise<{ hash: string; status: string }> {
  if (DEMO_MODE) {
    console.log("[DEMO] issueCertificateOnChain", { admin, studentWallet, certificateId, metadataHash });
    return { hash: "demo_" + Date.now().toString(16), status: "success" };
  }
  return submitContractTransaction(CONTRACT_ID, "issue_certificate", [
    toScValAddress(admin),
    toScValAddress(studentWallet),
    toScValString(certificateId),
    toScValString(metadataHash),
  ], admin);
}

/**
 * Verify a certificate on-chain (returns true if active, false if revoked or not found).
 */
export async function verifyCertificateOnChain(
  certificateId: string
): Promise<boolean> {
  if (DEMO_MODE) {
    console.log("[DEMO] verifyCertificateOnChain", certificateId);
    return true;
  }
  return readContract(CONTRACT_ID, "verify_certificate", [
    toScValString(certificateId),
  ]);
}

/**
 * Revoke a certificate on-chain.
 */
export async function revokeCertificateOnChain(
  admin: string,
  certificateId: string
): Promise<{ hash: string; status: string }> {
  if (DEMO_MODE) {
    console.log("[DEMO] revokeCertificateOnChain", { admin, certificateId });
    return { hash: "demo_" + Date.now().toString(16), status: "success" };
  }
  return submitContractTransaction(CONTRACT_ID, "revoke_certificate", [
    toScValAddress(admin),
    toScValString(certificateId),
  ], admin);
}

/**
 * Get full certificate data from the contract.
 */
export async function getCertificateOnChain(
  certificateId: string
): Promise<OnChainCertificate | null> {
  if (DEMO_MODE) {
    console.log("[DEMO] getCertificateOnChain", certificateId);
    return null;
  }
  try {
    const result = await readContract(CONTRACT_ID, "get_certificate", [
      toScValString(certificateId),
    ]);
    if (!result) return null;

    return {
      student_wallet: result.student_wallet?.toString() || "",
      metadata_hash: result.metadata_hash?.toString() || "",
      is_revoked: Boolean(result.is_revoked),
      issued_at: Number(result.issued_at) || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get the admin address from the contract.
 */
export async function getContractAdmin(): Promise<string | null> {
  if (DEMO_MODE) {
    return "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
  }
  try {
    return await readContract(CONTRACT_ID, "get_admin", []);
  } catch {
    return null;
  }
}

/**
 * Check if contract is initialized.
 */
export async function isContractInitialized(): Promise<boolean> {
  if (DEMO_MODE) {
    return true;
  }
  try {
    return await readContract(CONTRACT_ID, "is_initialized", []);
  } catch {
    return false;
  }
}
