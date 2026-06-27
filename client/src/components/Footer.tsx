export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0a0f1e]/50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-emerald-400 to-purple-600 text-[10px] font-bold text-white">
              SC
            </div>
            <span className="text-sm font-medium text-gray-400">StellarCred</span>
          </div>
          <p className="text-xs text-gray-500">
            Built on Stellar Testnet · Blockchain Certificate Verification Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
