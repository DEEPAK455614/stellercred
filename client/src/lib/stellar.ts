// ============================================================
// StellarCred — Stellar SDK Utilities
// ============================================================

import {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
  Address,
  Account,
} from "@stellar/stellar-sdk";
import { RPC_URL, NETWORK_PASSPHRASE } from "./constants";
import { signFreighterTransaction } from "./freighter";

const server = new rpc.Server(RPC_URL);

/**
 * Get the RPC server instance.
 */
export function getServer(): rpc.Server {
  return server;
}

/**
 * Read a contract value (view function that doesn't require signing).
 */
export async function readContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourceAddress?: string
): Promise<any> {
  try {
    const contract = new Contract(contractId);
    const source = new Account(
      sourceAddress || "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    );
    const tx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const result = await server.simulateTransaction(tx);
    if ("error" in result) {
      throw new Error(`Simulation error: ${(result as any).error}`);
    }

    const resultVal = (result as any).result?.retval;
    if (resultVal) {
      return scValToNative(resultVal);
    }
    return null;
  } catch (error) {
    console.error(`Read contract error (${method}):`, error);
    throw error;
  }
}

/**
 * Submit a contract transaction (state-changing function).
 */
export async function submitContractTransaction(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourceAddress: string
): Promise<{ hash: string; status: string }> {
  try {
    const contract = new Contract(contractId);

    // Get account sequence number
    const account = await server.getAccount(sourceAddress);

    // Build the transaction
    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    // Simulate first
    const simResult = await server.simulateTransaction(tx);
    if ("error" in simResult) {
      throw new Error(`Simulation error: ${(simResult as any).error}`);
    }

    // Assemble with auth entries and build
    const assembledTx = rpc.assembleTransaction(tx, simResult).build();

    // Sign with Freighter
    const signedXdr = await signFreighterTransaction(assembledTx.toEnvelope().toXDR("base64"));
    if (!signedXdr) {
      throw new Error("User rejected signing");
    }

    // Convert signed XDR back to Transaction object
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

    // Submit
    const sendResult = await server.sendTransaction(signedTx as any);
    if (sendResult.status === "PENDING" || sendResult.status === "DUPLICATE") {
      // Wait for confirmation
      const hash = sendResult.hash;
      let status = sendResult.status;

      // Poll for completion
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const txResult = await server.getTransaction(hash);
        if (txResult.status === "SUCCESS") {
          return { hash, status: "success" };
        }
        if (txResult.status === "FAILED") {
          return { hash, status: "failed" };
        }
      }
      return { hash, status: "pending" };
    }

    throw new Error(`Transaction failed: ${sendResult.status}`);
  } catch (error) {
    console.error(`Submit contract error (${method}):`, error);
    throw error;
  }
}

// -----------------------------------------------------------
// ScVal Conversion Helpers
// -----------------------------------------------------------

export function toScValString(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "string" });
}

export function toScValAddress(value: string): xdr.ScVal {
  return new Address(value).toScVal();
}

export function toScValU32(value: number): xdr.ScVal {
  return nativeToScVal(value, { type: "u32" });
}

export function toScValI128(value: bigint | number | string): xdr.ScVal {
  return nativeToScVal(value, { type: "i128" });
}

export function toScValBool(value: boolean): xdr.ScVal {
  return nativeToScVal(value);
}

export function toScValU64(value: bigint | number): xdr.ScVal {
  return nativeToScVal(value, { type: "u64" });
}

export function toScValI64(value: bigint | number): xdr.ScVal {
  return nativeToScVal(value, { type: "i64" });
}

export function toScValSymbol(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "symbol" });
}
