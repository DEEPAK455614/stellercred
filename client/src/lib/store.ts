// ============================================================
// StellarCred — Shared In-Memory Store (Demo)
// In production, replace with Supabase database calls.
// ============================================================

export interface StoredCertificate {
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
  status: string;
  issued_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoredTxLog {
  id: string;
  transaction_hash: string | null;
  wallet_address: string;
  action_type: string;
  certificate_id: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

function getStore() {
  if (typeof globalThis === "undefined") {
    // Fallback for edge cases
    return { certificates: [] as StoredCertificate[], txLogs: [] as StoredTxLog[] };
  }
  (globalThis as any).__stellarcred_store = (globalThis as any).__stellarcred_store || {
    certificates: [] as StoredCertificate[],
    txLogs: [] as StoredTxLog[],
  };
  return (globalThis as any).__stellarcred_store as {
    certificates: StoredCertificate[];
    txLogs: StoredTxLog[];
  };
}

export function getCertificates(): StoredCertificate[] {
  return getStore().certificates;
}

export function getTxLogs(): StoredTxLog[] {
  return getStore().txLogs;
}

export function addCertificate(cert: StoredCertificate): void {
  getStore().certificates.push(cert);
}

export function addTxLog(log: StoredTxLog): void {
  getStore().txLogs.push(log);
}

export function findCertificate(certificateId: string): StoredCertificate | undefined {
  return getStore().certificates.find((c) => c.certificate_id === certificateId);
}

export function findByWallet(walletAddress: string): StoredCertificate[] {
  return getStore().certificates.filter((c) => c.student_wallet === walletAddress);
}

export function findCertificateIndex(certificateId: string): number {
  return getStore().certificates.findIndex((c) => c.certificate_id === certificateId);
}

export function updateCertificate(index: number, updates: Partial<StoredCertificate>): StoredCertificate {
  const store = getStore();
  store.certificates[index] = { ...store.certificates[index], ...updates };
  return store.certificates[index];
}

export function getTxLogsSorted(): StoredTxLog[] {
  return getStore().txLogs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
