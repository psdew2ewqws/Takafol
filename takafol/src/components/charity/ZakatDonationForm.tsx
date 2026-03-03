'use client';

import { useState } from 'react';
import { Heart, Loader2, ArrowRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

type Props = {
  charityId: string;
  charityName: string;
  onComplete: (receipt: Record<string, unknown>) => void;
};

export function ZakatDonationForm({ charityId, charityName, onComplete }: Props) {
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing'>('amount');

  const selectedAmount = typeof amount === 'number' ? amount : parseFloat(customAmount) || 0;

  async function handleConfirm() {
    if (selectedAmount <= 0) return;
    setStep('processing');

    try {
      const res = await fetch('/api/donations/zakat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: 'demo-user-001',
          donorName: 'Demo User',
          charityId,
          amount: selectedAmount,
          currency: 'JOD',
        }),
      });

      const data = await res.json();
      onComplete(data.receipt);
    } catch (err) {
      console.error('Donation failed:', err);
      setStep('amount');
    }
  }

  if (step === 'confirm') {
    return (
      <div className="animate-scale-in space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-takafol-blue-pale mx-auto flex items-center justify-center mb-4">
            <Heart size={28} className="text-takafol-blue-deep" />
          </div>
          <h3 className="text-xl font-display font-bold text-takafol-text">
            Confirm Your Zakat
          </h3>
          <p className="text-sm text-takafol-text-light mt-1">
            Logged on the blockchain for full transparency
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-takafol-blue-light/20 shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Amount</span>
            <span className="text-2xl font-display font-bold text-takafol-text">
              {selectedAmount.toFixed(2)} <span className="text-sm text-takafol-text-muted">JOD</span>
            </span>
          </div>
          <div className="h-px bg-takafol-blue-pale" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Charity</span>
            <span className="text-sm font-semibold text-takafol-text">{charityName}</span>
          </div>
          <div className="h-px bg-takafol-blue-pale" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-takafol-text-muted">Verification</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-takafol-accent">
              <Shield size={11} /> Blockchain verified
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('amount')}
            className="flex-1 py-3.5 px-4 rounded-xl border border-takafol-blue-light/40 text-takafol-text-light font-medium hover:bg-takafol-blue-pale/30 transition-all active:scale-[0.98]"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-takafol-blue to-takafol-accent text-white font-semibold shadow-button hover:shadow-button-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Confirm
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-16 space-y-5">
        <div className="w-20 h-20 rounded-2xl bg-takafol-blue-pale flex items-center justify-center animate-glow">
          <Loader2 size={32} className="text-takafol-blue-deep animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-display font-bold text-takafol-text">
            Processing Donation...
          </h3>
          <p className="text-sm text-takafol-text-light mt-1.5 max-w-xs">
            Recording your Zakat on the blockchain
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-takafol-blue animate-pulse-soft"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h3 className="text-lg font-display font-bold text-takafol-text mb-1">
          Zakat Donation
        </h3>
        <p className="text-sm text-takafol-text-light">
          Donating to <span className="font-semibold text-takafol-blue-deep">{charityName}</span>
        </p>
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-5 gap-2">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            onClick={() => { setAmount(preset); setCustomAmount(''); }}
            className={cn(
              'py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95',
              amount === preset
                ? 'bg-gradient-to-br from-takafol-blue to-takafol-accent text-white shadow-button scale-[1.03]'
                : 'bg-white border border-takafol-blue-light/30 text-takafol-text hover:border-takafol-blue hover:bg-takafol-blue-pale/20 shadow-sm'
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="relative">
        <input
          type="number"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
          className="w-full py-3.5 px-4 pr-16 rounded-xl border border-takafol-blue-light/30 bg-white text-takafol-text placeholder:text-takafol-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-takafol-blue/20 focus:border-takafol-blue transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-takafol-text-muted">
          JOD
        </span>
      </div>

      {/* Submit */}
      <button
        onClick={() => selectedAmount > 0 && setStep('confirm')}
        disabled={selectedAmount <= 0}
        className={cn(
          'w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2',
          selectedAmount > 0
            ? 'bg-gradient-to-r from-takafol-blue to-takafol-accent text-white shadow-button hover:shadow-button-hover hover:scale-[1.01] active:scale-[0.99]'
            : 'bg-gray-100 text-takafol-text-muted cursor-not-allowed'
        )}
      >
        <Heart size={18} />
        {selectedAmount > 0 ? `Donate ${selectedAmount.toFixed(2)} JOD` : 'Enter amount to donate'}
      </button>
    </div>
  );
}
