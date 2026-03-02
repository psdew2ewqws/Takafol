'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Heart, HandHeart, Building2 } from 'lucide-react';
import { ZakatDonationForm } from '@/components/charity/ZakatDonationForm';
import { DonationReceipt } from '@/components/charity/DonationReceipt';
import { ProgramCard } from '@/components/charity/ProgramCard';
import { cn } from '@/lib/utils';

type Charity = {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  logoUrl?: string | null;
  isVerified: boolean;
  programs: Program[];
  _count: { donations: number; programs: number };
};

type Program = {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  location?: string | null;
  district?: string | null;
  maxVolunteers?: number | null;
  currentVolunteers: number;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
};

export default function CharityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'zakat' | 'programs'>('zakat');
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/charities/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCharity(data);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-takafol-off-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-takafol-blue-light border-t-takafol-blue animate-spin" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-takafol-off-white flex items-center justify-center">
        <p className="text-takafol-text-light">Charity not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-takafol-off-white">
      {/* Header */}
      <div className="bg-takafol-hero">
        <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-takafol-text-light hover:text-takafol-text mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              {charity.logoUrl ? (
                <img src={charity.logoUrl} alt={charity.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <Building2 size={28} className="text-takafol-blue" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-takafol-text">
                {charity.name}
              </h1>
              {charity.nameAr && (
                <p className="text-sm text-takafol-text-light">{charity.nameAr}</p>
              )}
              {charity.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-takafol-blue-deep bg-takafol-blue-pale px-2 py-0.5 rounded-full mt-1.5">
                  <Shield size={10} /> Verified NGO
                </span>
              )}
            </div>
          </div>

          {charity.description && (
            <p className="text-sm text-takafol-text-light mt-4 leading-relaxed">
              {charity.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-4 mt-5">
            <div className="bg-white/60 rounded-xl px-4 py-2.5 flex-1 text-center">
              <p className="text-lg font-display font-bold text-takafol-text">
                {charity._count.donations}
              </p>
              <p className="text-[10px] text-takafol-text-light uppercase tracking-wider">Donations</p>
            </div>
            <div className="bg-white/60 rounded-xl px-4 py-2.5 flex-1 text-center">
              <p className="text-lg font-display font-bold text-takafol-text">
                {charity._count.programs}
              </p>
              <p className="text-[10px] text-takafol-text-light uppercase tracking-wider">Programs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 -mt-3">
        <div className="bg-white rounded-2xl p-1 flex shadow-sm border border-takafol-blue-light/20">
          <button
            onClick={() => { setActiveTab('zakat'); setReceipt(null); }}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              activeTab === 'zakat'
                ? 'bg-takafol-blue text-white shadow-md'
                : 'text-takafol-text-light hover:text-takafol-text'
            )}
          >
            <Heart size={16} /> Zakat Donation
          </button>
          <button
            onClick={() => { setActiveTab('programs'); setReceipt(null); }}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              activeTab === 'programs'
                ? 'bg-takafol-blue text-white shadow-md'
                : 'text-takafol-text-light hover:text-takafol-text'
            )}
          >
            <HandHeart size={16} /> Volunteering
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'zakat' && !receipt && (
          <ZakatDonationForm
            charityId={charity.id}
            charityName={charity.name}
            onComplete={(r) => setReceipt(r)}
          />
        )}

        {activeTab === 'zakat' && receipt && (
          <DonationReceipt receipt={receipt as never} />
        )}

        {activeTab === 'programs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-takafol-text">
              Volunteer Programs
            </h3>
            {charity.programs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-takafol-blue-light/20">
                <HandHeart size={32} className="text-takafol-blue-light mx-auto mb-3" />
                <p className="text-sm text-takafol-text-light">No open programs right now</p>
              </div>
            ) : (
              charity.programs.map((program) => (
                <ProgramCard key={program.id} program={program} charityId={charity.id} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
