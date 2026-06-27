// ============================================================
// StellarCred — SHA-256 Hashing Utility
// ============================================================

/**
 * Compute SHA-256 hash of a string.
 * Returns hex-encoded hash string.
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
