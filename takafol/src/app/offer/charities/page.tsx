'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Shield, Users, Heart, ChevronRight, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Charity = {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  isVerified: boolean;
  _count: { donations: number; programs: number };
};

function CharitySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-takafol-blue-light/15 p-5">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-5 w-3/4 shimmer rounded-lg" />
          <div className="h-3 w-1/2 shimmer rounded-lg" />
          <div className="h-3 w-full shimmer rounded-lg" />
          <div className="flex gap-4 mt-3">
            <div className="h-4 w-20 shimmer rounded-full" />
            <div className="h-4 w-20 shimmer rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

const INITIALS_COLORS = [
  'from-takafol-blue to-takafol-accent',
  'from-takafol-blue-deep to-takafol-blue',
  'from-takafol-accent to-takafol-blue-deep',
];

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/charities');
      if (res.ok) setCharities(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  const filtered = charities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameAr?.includes(search) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-takafol-off-white">
      {/* Hero header */}
      <div className="bg-takafol-hero relative overflow-hidden">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-14 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={16} className="text-takafol-blue-deep" />
            </div>
            <span className="text-xs font-semibold text-takafol-blue-deep/70 uppercase tracking-widest">
              Takafol
            </span>
          </div>
          <h1 className="text-[26px] font-display font-bold text-takafol-text mt-3 leading-tight">
            Charity Platforms
          </h1>
          <p className="text-sm text-takafol-text-light mt-1.5 leading-relaxed">
            Select a verified charity to donate or volunteer
          </p>

          {/* Search */}
          <div className="relative mt-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-takafol-text-muted"
            />
            <input
              type="text"
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/75 backdrop-blur-md rounded-2xl border border-white/60 shadow-card text-sm text-takafol-text placeholder:text-takafol-text-muted focus:outline-none focus:border-takafol-blue focus:ring-2 focus:ring-takafol-blue/15 focus:bg-white/90 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-lg mx-auto px-5 -mt-6 pb-8">
        {loading ? (
          <div className="space-y-3">
            <CharitySkeleton />
            <CharitySkeleton />
            <CharitySkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-takafol-blue-light/15 p-10 text-center shadow-card animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-takafol-blue-pale mx-auto flex items-center justify-center mb-4">
              <Building2 size={24} className="text-takafol-blue" />
            </div>
            <p className="text-sm font-medium text-takafol-text">
              {search ? 'No charities match your search' : 'No charities available yet'}
            </p>
            <p className="text-xs text-takafol-text-muted mt-1">
              {search ? 'Try a different search term' : 'Check back soon'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((charity, i) => (
              <Link
                key={charity.id}
                href={`/offer/charities/${charity.id}`}
                className={cn(
                  'block bg-white rounded-2xl border border-takafol-blue-light/15 p-5',
                  'shadow-card card-glow group animate-slide-up'
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm',
                    INITIALS_COLORS[i % INITIALS_COLORS.length]
                  )}>
                    {charity.logoUrl ? (
                      <img
                        src={charity.logoUrl}
                        alt={charity.name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-lg font-display font-bold text-white">
                        {charity.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-takafol-text group-hover:text-takafol-blue-deep transition-colors truncate">
                        {charity.name}
                      </h3>
                      {charity.isVerified && (
                        <div className="w-5 h-5 rounded-full bg-takafol-accent/10 flex items-center justify-center flex-shrink-0">
                          <Shield size={11} className="text-takafol-accent" />
                        </div>
                      )}
                    </div>

                    {charity.nameAr && (
                      <p className="text-xs text-takafol-text-muted mt-0.5 font-light" dir="rtl">
                        {charity.nameAr}
                      </p>
                    )}

                    {charity.description && (
                      <p className="text-[13px] text-takafol-text-light mt-2 line-clamp-2 leading-relaxed">
                        {charity.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-takafol-text-muted bg-takafol-blue-pale/60 px-2.5 py-1 rounded-full">
                        <Heart size={10} className="text-takafol-danger" />
                        {charity._count.donations}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-takafol-text-muted bg-takafol-blue-pale/60 px-2.5 py-1 rounded-full">
                        <Users size={10} className="text-takafol-blue-deep" />
                        {charity._count.programs}
                      </span>
                      {charity.isVerified && (
                        <span className="text-[10px] font-bold text-takafol-success bg-takafol-success-light px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="w-8 h-8 rounded-full bg-takafol-blue-pale/50 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-takafol-blue group-hover:shadow-button transition-all">
                    <ChevronRight
                      size={16}
                      className="text-takafol-blue-deep group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
