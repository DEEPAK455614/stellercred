"use client";

interface VerificationBadgeProps {
  status: "verified" | "revoked" | "pending" | "not_found";
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  verified: {
    label: "Verified",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  revoked: {
    label: "Revoked",
    bg: "bg-red-500/15",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  pending: {
    label: "Pending",
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  not_found: {
    label: "Not Found",
    bg: "bg-gray-500/15",
    text: "text-gray-400",
    dot: "bg-gray-400",
  },
};

export default function VerificationBadge({ status, size = "sm" }: VerificationBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === "lg" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
