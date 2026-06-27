"use client";

import { useState, useEffect } from "react";
import { connectWallet, getFreighterState, checkFreighterInstalled } from "@/lib/freighter";
import { truncateAddress } from "@/lib/validation";

interface WalletConnectButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnectButton({ onConnect, onDisconnect }: WalletConnectButtonProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    checkFreighterInstalled().then(setInstalled);
    getFreighterState().then((state) => {
      if (state.address) setAddress(state.address);
    });
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const addr = await connectWallet();
      if (addr) {
        setAddress(addr);
        onConnect?.(addr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    onDisconnect?.();
  };

  if (!installed) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-medium text-yellow-400 transition hover:bg-yellow-500/20"
      >
        Install Freighter
      </a>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-mono text-emerald-400 sm:block">
          {truncateAddress(address)}
        </div>
        <button
          onClick={handleDisconnect}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition hover:border-red-500/30 hover:text-red-400"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="spinner !h-4 !w-4" />
          Connecting...
        </span>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
}
