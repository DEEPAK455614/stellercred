// ============================================================
// StellarCred — Input Validation Utilities
// ============================================================

/**
 * Check if a string is a valid Stellar public key (G...).
 */
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address);
}

/**
 * Check if certificate ID format is valid (e.g., CERT-001, CERT-ABC).
 */
export function isValidCertificateId(id: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(id);
}

/**
 * Check if a string is a valid hex hash (64 chars for SHA-256).
 */
export function isValidHexHash(hash: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hash);
}

/**
 * Validate required form fields.
 * Returns array of error messages (empty if valid).
 */
export function validateIssueForm(values: Record<string, string>): string[] {
  const errors: string[] = [];

  if (!values.studentName?.trim()) {
    errors.push("Student name is required");
  }
  if (!values.studentWallet?.trim()) {
    errors.push("Student wallet address is required");
  } else if (!isValidStellarAddress(values.studentWallet.trim())) {
    errors.push("Invalid Stellar wallet address format (must start with G and be 56 chars)");
  }
  if (!values.title?.trim()) {
    errors.push("Certificate title is required");
  }
  if (!values.issuerName?.trim()) {
    errors.push("Issuer name is required");
  }
  if (!values.eventName?.trim()) {
    errors.push("Event/course name is required");
  }
  if (!values.certificateId?.trim()) {
    errors.push("Certificate ID is required");
  } else if (!isValidCertificateId(values.certificateId.trim())) {
    errors.push("Certificate ID must be 3-64 alphanumeric characters");
  }

  return errors;
}

/**
 * Truncate a Stellar address for display.
 */
export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
