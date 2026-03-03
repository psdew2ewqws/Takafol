'use client';

import { useEffect, useState } from 'react';
import { Trophy, Heart, HandHeart, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { BlockchainProof } from '@/components/blockchain/BlockchainProof';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Donation = {
  id: string;
  amount: number;
  currency: string;
  txHash: string | null;
  explorerUrl: string | null;
  createdAt: string;
  charity: { name: string; isVerified: boolean };
};

type Impact = {
  impactScore: number;
  tasksCompleted: number;
  totalDonated: number;
};

function DashSkeleton() {
  return (
    <div className="min-h-screen bg-takafol-off-white">
      <div className="bg-takafol-hero">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-12">
          <div className="h-7 w-32 shimmer rounded-lg mb-2" />
          <div className="h-4 w-48 shimmer rounded-lg" />
          <div className="grid grid-cols-3 gap-3 mt-7">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 shimmer rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STAT_CARDS = [
  { key: 'score', icon: Trophy, color: 'text-takafol-gold', bg: 'bg-takafol-gold-light', label: 'IMPACT' },
  { key: 'donated', icon: Heart, color: 'text-takafol-danger', bg: 'bg-red-50', label: 'DONATED' },
  { key: 'tasks', icon: HandHeart, color: 'text-takafol-blue-deep', bg: 'bg-takafol-blue-pale', label: 'TASKS' },
] as const;

export default function DashboardPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impact, setImpact] = useState<Impact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [donRes, lbRes] = await Promise.all([
        fetch('/api/donations/zakat?userId=demo-user-001'),
        fetch('/api/leaderboard'),
      ]);

      if (donRes.ok) setDonations(await donRes.json());
      if (lbRes.ok) {
        const lb = await lbRes.json();
        const me = lb.find((u: Record<string, string>) => u.userId === 'demo-user-001');
        if (me) setImpact(me);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <DashSkeleton />;

  const statValues = {
    score: impact?.impactScore || 0,
    donated: impact?.totalDonated || 0,
    tasks: impact?.tasksCompleted || 0,
  };

  return (
    <div className="min-h-screen bg-takafol-off-white">
      {/* Header */}
      <div className="bg-takafol-hero relative overflow-hidden">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-12 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={16} className="text-takafol-blue-deep" />
            </div>
            <span className="text-xs font-semibold text-takafol-blue-deep/70 uppercase tracking-widest">
              Your Dashboard
            </span>
          </div>
          <h1 className="text-[26px] font-display font-bold text-takafol-text mt-3 leading-tight">
            Your Impact
          </h1>
          <p className="text-sm text-takafol-text-light mt-1">
            Every contribution tracked & verified
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 mt-7">
            {STAT_CARDS.map((card, i) => {
              const Icon = card.icon;
              const value = card.key === 'donated'
                ? formatCurrency(statValues[card.key])
                : statValues[card.key];
              return (
                <div
                  key={card.key}
                  className="glass-strong rounded-2xl p-4 text-center animate-slide-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={cn('w-9 h-9 rounded-xl mx-auto flex items-center justify-center mb-2', card.bg)}>
                    <Icon size={18} className={card.color} />
                  </div>
                  <p className="text-xl font-display font-bold text-takafol-text stat-value" style={{ animationDelay: `${i * 0.15}s` }}>
                    {value}
                  </p>
                  <p className="text-[9px] text-takafol-text-muted uppercase tracking-widest mt-1">
                    {card.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Donation history */}
      <div className="max-w-lg mx-auto px-5 -mt-4 pb-8 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-takafol-blue-pale flex items-center justify-center">
            <TrendingUp size={14} className="text-takafol-blue-deep" />
          </div>
          <h2 className="text-lg font-display font-bold text-takafol-text">
            Donation History
          </h2>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-takafol-blue-light/15 p-10 text-center shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-takafol-blue-pale mx-auto flex items-center justify-center mb-4">
              <Heart size={24} className="text-takafol-blue" />
            </div>
            <p className="text-sm font-medium text-takafol-text">No donations yet</p>
            <p className="text-xs text-takafol-text-muted mt-1">Start making an impact!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation, i) => (
              <div
                key={donation.id}
                className="bg-white rounded-2xl border border-takafol-blue-light/15 p-5 shadow-card animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-takafol-text text-sm">
                      Zakat to {donation.charity.name}
                    </h4>
                    <p className="text-xs text-takafol-text-muted mt-0.5">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>
                  <span className="text-lg font-display font-bold text-takafol-blue-deep">
                    {formatCurrency(donation.amount, donation.currency)}
                  </span>
                </div>

                {donation.charity.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-takafol-success bg-takafol-success-light px-2.5 py-1 rounded-full mb-3">
                    <Shield size={9} /> Verified NGO
                  </span>
                )}

                <BlockchainProof
                  steps={[
                    {
                      label: 'Donation Recorded',
                      txHash: donation.txHash,
                      timestamp: formatDate(donation.createdAt),
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
