// ============================================================
// StellarCred — TypeScript Types
// ============================================================

export type UserRole = "student" | "admin" | "issuer";

export interface User {
  id: string;
  wallet_address: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type CertificateStatus = "issued" | "revoked";

export interface Certificate {
  id: string;
  certificate_id: string;
  student_wallet: string;
  student_name: string;
  title: string;
  issuer_name: string;
  event_name: string | null;
  description: string | null;
  metadata_json: string;
  metadata_hash: string;
  transaction_hash: string | null;
  contract_id: string | null;
  status: CertificateStatus;
  issued_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateMetadata {
  student_name: string;
  student_wallet: string;
  title: string;
  issuer_name: string;
  event_name: string;
  description: string;
  issued_at: string;
  expires_at: string | null;
  certificate_id: string;
  schema_version: string;
}

export interface Reward {
  id: string;
  student_wallet: string;
  reward_type: string;
  points: number;
  reason: string | null;
  certificate_id: string | null;
  created_at: string;
}

export type TransactionAction = "issue" | "revoke" | "verify";
export type TransactionStatus = "pending" | "success" | "failed";

export interface TransactionLog {
  id: string;
  transaction_hash: string | null;
  wallet_address: string;
  action_type: TransactionAction;
  certificate_id: string | null;
  status: TransactionStatus;
  error_message: string | null;
  created_at: string;
}

export interface AdminStats {
  total_certificates: number;
  issued_certificates: number;
  revoked_certificates: number;
  total_students: number;
  recent_transactions: TransactionLog[];
}

export interface VerificationResult {
  certificate: Certificate | null;
  onChainValid: boolean;
  hashMatch: boolean;
  revoked: boolean;
  found: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Soroban contract on-chain certificate (returned by get_certificate)
export interface OnChainCertificate {
  student_wallet: string;
  metadata_hash: string;
  is_revoked: boolean;
  issued_at: number;
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  network: string | null;
  isTestnet: boolean;
}
