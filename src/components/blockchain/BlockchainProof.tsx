"use client";

import { ExternalLink, Shield, CheckCircle2 } from "lucide-react";
import { truncateHash } from "@/lib/format-utils";

type ProofStep = {
  label: string;
  txHash: string | null;
  timestamp?: string;
};

export function BlockchainProof({ steps }: { steps: ProofStep[] }) {
  const validSteps = steps.filter((s) => s.txHash);

  if (validSteps.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
        <Shield size={11} className="text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Verification pending...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Shield size={11} className="text-emerald-600" />
        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
          Blockchain Proof
        </span>
      </div>
      <div className="relative space-y-2.5 ps-6">
        {validSteps.map((step, i) => (
          <div key={i} className="relative flex items-start gap-2">
            <div className="absolute -start-6 top-0.5 w-[22px] h-[22px] rounded-full bg-emerald-50 flex items-center justify-center z-10 ring-2 ring-white">
              <CheckCircle2 size={11} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">{step.label}</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${step.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-mono mt-0.5"
              >
                {truncateHash(step.txHash!)}
                <ExternalLink size={8} />
              </a>
              {step.timestamp && (
                <p className="text-[10px] text-gray-400 mt-0.5">{step.timestamp}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
