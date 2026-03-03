"use client";

import { Shield, ExternalLink, CheckCircle2 } from "lucide-react";
import { truncateHash } from "@/lib/format-utils";

type ProofDisplayProps = {
  proofHash: string;
  proofTxHash?: string | null;
  proofExplorerUrl?: string | null;
  proofPhotoBase64?: string | null;
  volunteerName?: string;
  completedAt?: string | null;
};

export function ProofDisplay({ proofHash, proofTxHash, proofExplorerUrl, proofPhotoBase64, volunteerName, completedAt }: ProofDisplayProps) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Shield size={15} className="text-emerald-600" fill="currentColor" fillOpacity={0.15} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Blockchain Verified</p>
          <p className="text-[10px] text-gray-500 font-medium">Proof recorded on Ethereum Sepolia</p>
        </div>
      </div>

      {proofPhotoBase64 && (
        <div className="rounded-lg overflow-hidden">
          <img src={proofPhotoBase64} alt="Task proof" className="w-full h-40 object-cover" />
        </div>
      )}

      <div className="space-y-2 bg-gray-50 rounded-lg p-3">
        {volunteerName && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Volunteer</span>
            <span className="text-xs font-bold text-gray-700">{volunteerName}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">Proof Hash</span>
          <span className="text-[10px] font-mono text-gray-600">{truncateHash(proofHash, 8)}</span>
        </div>
        {proofTxHash && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">TX Hash</span>
            <a
              href={proofExplorerUrl || `https://sepolia.etherscan.io/tx/${proofTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-mono text-emerald-600"
            >
              {truncateHash(proofTxHash, 6)}
              <ExternalLink size={8} />
            </a>
          </div>
        )}
        {completedAt && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Completed</span>
            <span className="text-xs font-medium text-gray-600">
              {new Date(completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
        <CheckCircle2 size={12} className="text-emerald-600" />
        <span className="text-xs font-bold text-emerald-700">Immutable proof — cannot be edited or deleted</span>
      </div>
    </div>
  );
}
