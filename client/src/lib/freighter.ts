// ============================================================
// StellarCred — Freighter Wallet Integration
// ============================================================

import {
  isConnected,
  isAllowed,
  requestAccess,
  setAllowed,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import { NETWORKS, NETWORK_PASSPHRASE, STELLAR_NETWORK } from "./constants";

export interface FreighterState {
  isInstalled: boolean;
  isAllowed: boolean;
  address: string | null;
}

/**
 * Check if Freighter is installed.
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const { isConnected: connected } = await isConnected();
    return connected;
  } catch {
    return false;
  }
}

/**
 * Check if Freighter has been granted access.
 */
export async function checkFreighterAllowed(): Promise<boolean> {
  try {
    const { isAllowed: allowed } = await isAllowed();
    return allowed;
  } catch {
    return false;
  }
}

/**
 * Request access to Freighter (connect wallet).
 */
export async function connectWallet(): Promise<string | null> {
  try {
    const { address } = await requestAccess();
    return address || null;
  } catch (error) {
    console.error("Freighter connection error:", error);
    return null;
  }
}

/**
 * Get the currently connected wallet address.
 */
export async function getWalletAddress(): Promise<string | null> {
  try {
    const { address } = await getAddress();
    return address || null;
  } catch {
    return null;
  }
}

/**
 * Sign a transaction XDR with Freighter.
 */
export async function signFreighterTransaction(
  xdr: string
): Promise<string | null> {
  try {
    const { signedTxXdr } = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    return signedTxXdr || null;
  } catch (error) {
    console.error("Freighter signing error:", error);
    return null;
  }
}

/**
 * Get the full Freighter state.
 */
export async function getFreighterState(): Promise<FreighterState> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    return { isInstalled: false, isAllowed: false, address: null };
  }
  const allowed = await checkFreighterAllowed();
  if (!allowed) {
    return { isInstalled: true, isAllowed: false, address: null };
  }
  const address = await getWalletAddress();
  return { isInstalled: true, isAllowed: true, address };
}

/**
 * Check if Freighter is on the correct network (Testnet).
 */
export async function checkNetwork(): Promise<{
  isCorrect: boolean;
  network: string;
}> {
  try {
    // Freighter doesn't expose network detection directly via API.
    // We rely on the network passphrase passed during signing.
    // For now, assume testnet if configured.
    return {
      isCorrect: STELLAR_NETWORK === "testnet",
      network: STELLAR_NETWORK,
    };
  } catch {
    return { isCorrect: false, network: "unknown" };
  }
}
