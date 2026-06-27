"use client";

import { truncateAddress } from "@/lib/validation";

interface WalletStatusCardProps {
  address: string | null;
  isTestnet?: boolean;
  isAdmin?: boolean;
}

export default function WalletStatusCard({ address, isTestnet = true, isAdmin = false }: WalletStatusCardProps) {
  if (!address) {
    return (
      <div className="glass-card rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">Wallet not connected</p>
        <p className="mt-1 text-xs text-gray-600">Connect Freighter to get started</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Connected Wallet</p>
          <p className="mt-1 font-mono text-sm text-white">{truncateAddress(address, 8)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ${
              isTestnet
                ? "bg-yellow-500/15 text-yellow-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {isTestnet ? "Testnet" : "Unknown"}
          </span>
          {isAdmin && (
            <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-medium text-purple-400">
              Admin
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
