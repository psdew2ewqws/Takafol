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
      <div className="flex items-center gap-2 text-sm text-takafol-text-muted px-4 py-2.5 bg-takafol-blue-pale/40 rounded-xl border border-takafol-blue-light/15">
        <Shield size={13} className="text-takafol-blue animate-pulse-soft" />
        <span className="text-xs">Blockchain verification pending...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Shield size={13} className="text-takafol-accent" />
        <span className="text-[11px] font-bold text-takafol-accent uppercase tracking-widest">
          Blockchain Proof
        </span>
      </div>
      <div className="proof-chain relative space-y-3 pl-6">
        {validSteps.map((step, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-takafol-blue to-takafol-accent flex items-center justify-center z-10 shadow-sm">
              <CheckCircle2 size={13} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-takafol-text">{step.label}</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${step.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-takafol-accent hover:underline font-mono mt-0.5"
              >
                {truncateHash(step.txHash!)}
                <ExternalLink size={9} />
              </a>
              {step.timestamp && (
                <p className="text-[10px] text-takafol-text-muted mt-0.5">{step.timestamp}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
