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

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-takafol-off-white">
      <div className="bg-takafol-hero">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-10">
          <div className="h-4 w-12 shimmer rounded mb-8" />
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-3/4 shimmer rounded-lg" />
              <div className="h-4 w-1/2 shimmer rounded-lg" />
              <div className="h-5 w-20 shimmer rounded-full" />
            </div>
          </div>
          <div className="h-12 w-full shimmer rounded-xl mt-6" />
          <div className="flex gap-3 mt-5">
            <div className="h-16 flex-1 shimmer rounded-2xl" />
            <div className="h-16 flex-1 shimmer rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
      if (res.ok) setCharity(await res.json());
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <DetailSkeleton />;

  if (!charity) {
    return (
      <div className="min-h-screen bg-takafol-off-white flex flex-col items-center justify-center gap-4 px-5">
        <div className="w-16 h-16 rounded-2xl bg-takafol-blue-pale flex items-center justify-center">
          <Building2 size={28} className="text-takafol-blue" />
        </div>
        <p className="text-takafol-text font-medium">Charity not found</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-takafol-accent font-semibold hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const openPrograms = charity.programs.filter((p) => p.status === 'open');

  return (
    <div className="min-h-screen bg-takafol-off-white">
      {/* Header */}
      <div className="bg-takafol-hero relative overflow-hidden">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-10 relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-takafol-text-light hover:text-takafol-text mb-6 transition-colors active:scale-95"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-start gap-4 animate-fade-in">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-takafol-blue to-takafol-accent shadow-card flex items-center justify-center flex-shrink-0">
              {charity.logoUrl ? (
                <img src={charity.logoUrl} alt={charity.name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <span className="text-2xl font-display font-bold text-white">
                  {charity.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-takafol-text leading-tight">
                {charity.name}
              </h1>
              {charity.nameAr && (
                <p className="text-sm text-takafol-text-muted mt-0.5" dir="rtl">{charity.nameAr}</p>
              )}
              {charity.isVerified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-takafol-accent bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full mt-2 shadow-sm">
                  <Shield size={11} /> Verified NGO
                </span>
              )}
            </div>
          </div>

          {charity.description && (
            <p className="text-[13px] text-takafol-text-light mt-5 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {charity.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-3 mt-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="glass-strong rounded-2xl px-5 py-3 flex-1 text-center">
              <p className="text-xl font-display font-bold text-takafol-text stat-value">
                {charity._count.donations}
              </p>
              <p className="text-[10px] text-takafol-text-muted uppercase tracking-widest mt-0.5">
                Donations
              </p>
            </div>
            <div className="glass-strong rounded-2xl px-5 py-3 flex-1 text-center">
              <p className="text-xl font-display font-bold text-takafol-text stat-value" style={{ animationDelay: '0.1s' }}>
                {charity._count.programs}
              </p>
              <p className="text-[10px] text-takafol-text-muted uppercase tracking-widest mt-0.5">
                Programs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl p-1.5 flex shadow-card border border-takafol-blue-light/15">
          <button
            onClick={() => { setActiveTab('zakat'); setReceipt(null); }}
            className={cn(
              'flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
              activeTab === 'zakat'
                ? 'bg-gradient-to-r from-takafol-blue to-takafol-accent text-white shadow-button'
                : 'text-takafol-text-light hover:text-takafol-text hover:bg-takafol-blue-pale/30'
            )}
          >
            <Heart size={15} /> Zakat
          </button>
          <button
            onClick={() => { setActiveTab('programs'); setReceipt(null); }}
            className={cn(
              'flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
              activeTab === 'programs'
                ? 'bg-gradient-to-r from-takafol-blue to-takafol-accent text-white shadow-button'
                : 'text-takafol-text-light hover:text-takafol-text hover:bg-takafol-blue-pale/30'
            )}
          >
            <HandHeart size={15} /> Volunteer
            {openPrograms.length > 0 && activeTab !== 'programs' && (
              <span className="w-5 h-5 rounded-full bg-takafol-danger text-white text-[10px] font-bold flex items-center justify-center">
                {openPrograms.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-6">
        {activeTab === 'zakat' && !receipt && (
          <div className="animate-fade-in">
            <ZakatDonationForm
              charityId={charity.id}
              charityName={charity.name}
              onComplete={(r) => setReceipt(r)}
            />
          </div>
        )}

        {activeTab === 'zakat' && receipt && (
          <div className="animate-scale-in">
            <DonationReceipt receipt={receipt as never} />
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-takafol-text">
                Open Programs
              </h3>
              <span className="text-xs text-takafol-text-muted">
                {openPrograms.length} available
              </span>
            </div>
            {openPrograms.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-2xl border border-takafol-blue-light/15 shadow-card">
                <div className="w-14 h-14 rounded-2xl bg-takafol-blue-pale mx-auto flex items-center justify-center mb-4">
                  <HandHeart size={24} className="text-takafol-blue" />
                </div>
                <p className="text-sm font-medium text-takafol-text">No open programs</p>
                <p className="text-xs text-takafol-text-muted mt-1">Check back soon for new opportunities</p>
              </div>
            ) : (
              openPrograms.map((program, i) => (
                <div key={program.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <ProgramCard program={program} charityId={charity.id} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
