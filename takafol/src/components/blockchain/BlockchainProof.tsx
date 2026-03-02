'use client';

import { ExternalLink, Shield, CheckCircle2 } from 'lucide-react';
import { truncateHash } from '@/lib/utils';

type ProofStep = {
  label: string;
  txHash: string | null;
  timestamp?: string;
};

export function BlockchainProof({ steps }: { steps: ProofStep[] }) {
  const validSteps = steps.filter((s) => s.txHash);

  if (validSteps.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-takafol-text-light px-3 py-2 bg-takafol-blue-pale/50 rounded-lg">
        <Shield size={14} />
        <span>Blockchain verification pending...</span>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={14} className="text-takafol-blue-deep" />
        <span className="text-xs font-semibold text-takafol-blue-deep uppercase tracking-wider">
          Blockchain Proof
        </span>
      </div>
      <div className="proof-chain relative space-y-3 pl-6">
        {validSteps.map((step, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-takafol-blue flex items-center justify-center z-10">
              <CheckCircle2 size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-takafol-text">{step.label}</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${step.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-takafol-accent hover:underline font-mono"
              >
                {truncateHash(step.txHash!)}
                <ExternalLink size={10} />
              </a>
              {step.timestamp && (
                <p className="text-[10px] text-takafol-text-light mt-0.5">{step.timestamp}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
