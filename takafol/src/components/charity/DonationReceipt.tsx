'use client';

import { CheckCircle2, Download, Share2, ExternalLink, Shield, Sparkles } from 'lucide-react';
import { formatCurrency, truncateHash } from '@/lib/utils';

type ReceiptData = {
  receiptNumber: string;
  charityName: string;
  amount: number;
  currency: string;
  date: string;
  txHash: string | null;
  explorerUrl: string | null;
};

export function DonationReceipt({ receipt }: { receipt: ReceiptData }) {
  return (
    <div className="animate-slide-up space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-takafol-success-light mx-auto flex items-center justify-center mb-4 animate-float shadow-md">
          <CheckCircle2 size={40} className="text-takafol-success" />
        </div>
        <h3 className="text-2xl font-display font-bold text-takafol-text">
          Jazak Allahu Khairan!
        </h3>
        <p className="text-sm text-takafol-text-light mt-1">
          Your Zakat has been recorded successfully
        </p>
      </div>

      {/* Receipt card */}
      <div className="bg-white rounded-2xl border border-takafol-blue-light/20 shadow-card overflow-hidden">
        {/* Header stripe */}
        <div className="bg-gradient-to-r from-takafol-blue-pale via-takafol-blue-light/40 to-takafol-blue-pale px-6 py-3.5 flex items-center gap-2">
          <Sparkles size={13} className="text-takafol-blue-deep" />
          <p className="text-xs font-bold text-takafol-blue-deep uppercase tracking-widest">
            Donation Receipt
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Receipt #</span>
            <span className="text-sm font-mono font-semibold text-takafol-text bg-takafol-blue-pale/40 px-2 py-0.5 rounded">
              {receipt.receiptNumber}
            </span>
          </div>

          <div className="h-px bg-takafol-blue-pale/60" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Charity</span>
            <span className="text-sm font-semibold text-takafol-text">{receipt.charityName}</span>
          </div>

          <div className="h-px bg-takafol-blue-pale/60" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Amount</span>
            <span className="text-xl font-display font-bold text-takafol-blue-deep">
              {formatCurrency(receipt.amount, receipt.currency)}
            </span>
          </div>

          <div className="h-px bg-takafol-blue-pale/60" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Date</span>
            <span className="text-sm text-takafol-text">
              {new Date(receipt.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </div>

          <div className="h-px bg-takafol-blue-pale/60" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-takafol-success bg-takafol-success-light px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-takafol-success animate-pulse-soft" />
              Confirmed
            </span>
          </div>

          {/* Blockchain proof */}
          {receipt.txHash && (
            <div className="pt-4 border-t border-takafol-blue-pale">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-takafol-accent" />
                <span className="text-xs font-bold text-takafol-accent uppercase tracking-widest">
                  Blockchain Verified
                </span>
              </div>
              <a
                href={receipt.explorerUrl || `https://sepolia.etherscan.io/tx/${receipt.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-takafol-blue-pale/60 to-takafol-blue-pale/30 rounded-xl hover:from-takafol-blue-pale hover:to-takafol-blue-pale/50 transition-all group"
              >
                <span className="text-xs font-mono text-takafol-text-light">
                  {truncateHash(receipt.txHash)}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-takafol-accent group-hover:underline">
                  Etherscan
                  <ExternalLink size={11} />
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Points awarded */}
        <div className="bg-gradient-to-r from-takafol-gold-light to-amber-50 px-6 py-3.5 flex items-center justify-center gap-2 border-t border-amber-100/60">
          <Sparkles size={12} className="text-takafol-gold" />
          <span className="text-xs text-takafol-text-light">You earned</span>
          <span className="text-sm font-bold text-amber-600">+10 Impact Points</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-3.5 px-4 rounded-xl border border-takafol-blue-light/30 text-takafol-text-light font-medium hover:bg-takafol-blue-pale/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
          <Download size={16} />
          Save
        </button>
        <button className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-takafol-blue to-takafol-accent text-white font-semibold shadow-button hover:shadow-button-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Share2 size={16} />
          Share Impact
        </button>
      </div>
    </div>
  );
}
