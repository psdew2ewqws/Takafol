'use client';

import { CheckCircle2, Download, Share2, ExternalLink, Shield } from 'lucide-react';
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
        <div className="w-20 h-20 rounded-full bg-green-50 mx-auto flex items-center justify-center mb-4 animate-float">
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
      <div className="bg-white rounded-2xl border border-takafol-blue-light/30 shadow-sm overflow-hidden">
        {/* Header stripe */}
        <div className="bg-takafol-gradient px-6 py-3">
          <p className="text-xs font-semibold text-takafol-blue-deep uppercase tracking-wider">
            Donation Receipt
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-light">Receipt #</span>
            <span className="text-sm font-mono font-semibold text-takafol-text">
              {receipt.receiptNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-light">Charity</span>
            <span className="text-sm font-semibold text-takafol-text">{receipt.charityName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-light">Amount</span>
            <span className="text-xl font-display font-bold text-takafol-blue-deep">
              {formatCurrency(receipt.amount, receipt.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-light">Date</span>
            <span className="text-sm text-takafol-text">
              {new Date(receipt.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-light">Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-takafol-success bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-takafol-success" />
              Confirmed
            </span>
          </div>

          {/* Blockchain proof */}
          {receipt.txHash && (
            <div className="pt-3 border-t border-takafol-blue-pale">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-takafol-blue-deep" />
                <span className="text-xs font-semibold text-takafol-blue-deep uppercase tracking-wider">
                  Blockchain Verified
                </span>
              </div>
              <a
                href={receipt.explorerUrl || `https://sepolia.etherscan.io/tx/${receipt.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-takafol-blue-pale/50 rounded-xl hover:bg-takafol-blue-pale transition-colors group"
              >
                <span className="text-xs font-mono text-takafol-text-light">
                  {truncateHash(receipt.txHash)}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-takafol-accent group-hover:underline">
                  View on Etherscan
                  <ExternalLink size={12} />
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Points awarded */}
        <div className="bg-takafol-blue-pale/30 px-6 py-3 flex items-center justify-center gap-2">
          <span className="text-xs text-takafol-text-light">You earned</span>
          <span className="text-sm font-bold text-takafol-gold">+10 Impact Points</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 px-4 rounded-xl border border-takafol-blue-light text-takafol-text-light font-medium hover:bg-takafol-blue-pale/50 transition-colors flex items-center justify-center gap-2">
          <Download size={16} />
          Save Receipt
        </button>
        <button className="flex-1 py-3 px-4 rounded-xl bg-takafol-blue text-white font-semibold hover:bg-takafol-blue-deep transition-colors flex items-center justify-center gap-2">
          <Share2 size={16} />
          Share Impact
        </button>
      </div>
    </div>
  );
}
