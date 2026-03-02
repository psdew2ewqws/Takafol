'use client';

import { useEffect, useState } from 'react';
import { Trophy, Heart, HandHeart, TrendingUp, Shield } from 'lucide-react';
import { BlockchainProof } from '@/components/blockchain/BlockchainProof';
import { formatCurrency, formatDate } from '@/lib/utils';

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

      if (donRes.ok) {
        const data = await donRes.json();
        setDonations(data);
      }

      if (lbRes.ok) {
        const lb = await lbRes.json();
        const me = lb.find((u: Record<string, string>) => u.userId === 'demo-user-001');
        if (me) setImpact(me);
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-takafol-off-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-takafol-blue-light border-t-takafol-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-takafol-off-white">
      {/* Header */}
      <div className="bg-takafol-hero">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-10">
          <h1 className="text-2xl font-display font-bold text-takafol-text">
            Your Impact
          </h1>
          <p className="text-sm text-takafol-text-light mt-1">
            Every contribution tracked and verified
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/70 rounded-2xl p-4 text-center backdrop-blur-sm">
              <Trophy size={20} className="text-takafol-gold mx-auto mb-1.5" />
              <p className="text-xl font-display font-bold text-takafol-text">
                {impact?.impactScore || 0}
              </p>
              <p className="text-[10px] text-takafol-text-light uppercase tracking-wider mt-0.5">
                Impact Score
              </p>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 text-center backdrop-blur-sm">
              <Heart size={20} className="text-takafol-danger mx-auto mb-1.5" />
              <p className="text-xl font-display font-bold text-takafol-text">
                {formatCurrency(impact?.totalDonated || 0)}
              </p>
              <p className="text-[10px] text-takafol-text-light uppercase tracking-wider mt-0.5">
                Total Donated
              </p>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 text-center backdrop-blur-sm">
              <HandHeart size={20} className="text-takafol-blue-deep mx-auto mb-1.5" />
              <p className="text-xl font-display font-bold text-takafol-text">
                {impact?.tasksCompleted || 0}
              </p>
              <p className="text-[10px] text-takafol-text-light uppercase tracking-wider mt-0.5">
                Tasks Done
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Donation history */}
      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-takafol-blue-deep" />
          <h2 className="text-lg font-display font-bold text-takafol-text">
            Donation History
          </h2>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-takafol-blue-light/20 p-8 text-center">
            <Heart size={32} className="text-takafol-blue-light mx-auto mb-3" />
            <p className="text-sm text-takafol-text-light">
              No donations yet. Start making an impact!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation, i) => (
              <div
                key={donation.id}
                className="bg-white rounded-2xl border border-takafol-blue-light/20 p-5 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-takafol-text text-sm">
                      Zakat to {donation.charity.name}
                    </h4>
                    <p className="text-xs text-takafol-text-light mt-0.5">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>
                  <span className="text-lg font-display font-bold text-takafol-blue-deep">
                    {formatCurrency(donation.amount, donation.currency)}
                  </span>
                </div>

                {donation.charity.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-takafol-success bg-green-50 px-2 py-0.5 rounded-full mb-3">
                    <Shield size={8} /> Verified NGO
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
