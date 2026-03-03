"use client";

import { Shield, ExternalLink } from "lucide-react";
import { truncateHash } from "@/lib/format-utils";

interface BlockchainBadgeProps {
  txHash: string | null | undefined;
  size?: "sm" | "md";
}

export function BlockchainBadge({ txHash, size = "sm" }: BlockchainBadgeProps) {
  if (!txHash) return null;

  const isSm = size === "sm";

  return (
    <a
      href={`https://sepolia.etherscan.io/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 transition-colors hover:bg-emerald-100 ${
        isSm ? "px-2 py-0.5" : "px-2.5 py-1"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <Shield size={isSm ? 10 : 12} className="text-emerald-600" />
      <span className={`font-mono text-emerald-700 ${isSm ? "text-[9px]" : "text-[11px]"}`}>
        {truncateHash(txHash, isSm ? 4 : 6)}
      </span>
      <ExternalLink size={isSm ? 7 : 9} className="text-emerald-500" />
    </a>
  );
}
