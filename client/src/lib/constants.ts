// ============================================================
// StellarCred — Constants & Configuration
// ============================================================

export const NETWORKS = {
  testnet: {
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
    name: "testnet",
  },
  mainnet: {
    rpcUrl: "https://soroban-rpc.stellar.org",
    horizonUrl: "https://horizon.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
    name: "mainnet",
  },
} as const;

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID || "CCJUX4PXTMOVEX33MC7BVOYFXO3WB5LOO7CHQLE7VMF3PJWQNKECGW7C";

export const ADMIN_WALLETS = (
  process.env.NEXT_PUBLIC_ADMIN_WALLETS || ""
)
  .split(",")
  .map((w) => w.trim())
  .filter(Boolean);

export const STELLAR_NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";

export const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL || NETWORKS.testnet.rpcUrl;

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || NETWORKS.testnet.horizonUrl;

export const NETWORK_PASSPHRASE =
  STELLAR_NETWORK === "mainnet"
    ? NETWORKS.mainnet.passphrase
    : NETWORKS.testnet.passphrase;

export const APP_NAME = "StellarCred";
export const APP_DESCRIPTION =
  "Blockchain Certificate Verification & Student Reward Platform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://stellarcred.vercel.app";

export const CERTIFICATE_ID_PREFIX = "CERT";

export const DEMO_MODE = true; // Set to false when using real contract + database
