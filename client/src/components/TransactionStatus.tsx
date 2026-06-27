"use client";

interface TransactionStatusProps {
  status: "pending" | "success" | "failed" | "idle";
  message?: string;
}

export default function TransactionStatus({ status, message }: TransactionStatusProps) {
  if (status === "idle") return null;

  const config = {
    pending: {
      bg: "bg-yellow-500/10 border-yellow-500/20",
      text: "text-yellow-400",
      icon: (
        <span className="spinner !h-4 !w-4 !border-yellow-400/30 !border-t-yellow-400" />
      ),
    },
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-400",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    failed: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-400",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const c = config[status];

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${c.bg} ${c.text}`}>
      {c.icon}
      <span>{message || status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
}
