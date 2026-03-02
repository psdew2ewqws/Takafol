'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Shield, Users, Heart, ChevronRight, Search } from 'lucide-react';
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
        <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
          <h1 className="text-2xl font-display font-bold text-takafol-text">
            Charity Platforms
          </h1>
          <p className="text-sm text-takafol-text-light mt-1">
            Select a verified charity to donate or volunteer
          </p>

          {/* Search */}
          <div className="relative mt-5">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-takafol-text-light"
            />
            <input
              type="text"
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-takafol-blue-light/30 text-sm text-takafol-text placeholder:text-takafol-text-light/60 focus:outline-none focus:border-takafol-blue focus:ring-2 focus:ring-takafol-blue/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Charity Cards */}
      <div className="max-w-lg mx-auto px-4 -mt-6 pb-8">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-takafol-blue-light/20 p-8 text-center animate-fade-in">
            <Building2 size={32} className="text-takafol-blue-light mx-auto mb-3" />
            <p className="text-sm text-takafol-text-light">
              {search ? 'No charities match your search' : 'No charities available yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((charity, i) => (
              <Link
                key={charity.id}
                href={`/offer/charities/${charity.id}`}
                className={cn(
                  'block bg-white rounded-2xl border border-takafol-blue-light/20 p-5',
                  'hover:shadow-lg hover:border-takafol-blue-light/50 hover:-translate-y-0.5',
                  'transition-all duration-200 group animate-slide-up'
                )}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl bg-takafol-blue-pale flex items-center justify-center flex-shrink-0 group-hover:bg-takafol-blue-light/50 transition-colors">
                    {charity.logoUrl ? (
                      <img
                        src={charity.logoUrl}
                        alt={charity.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 size={24} className="text-takafol-blue-deep" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-takafol-text group-hover:text-takafol-blue-deep transition-colors truncate">
                        {charity.name}
                      </h3>
                      {charity.isVerified && (
                        <Shield size={14} className="text-takafol-accent flex-shrink-0" />
                      )}
                    </div>

                    {charity.nameAr && (
                      <p className="text-xs text-takafol-text-light mt-0.5" dir="rtl">
                        {charity.nameAr}
                      </p>
                    )}

                    {charity.description && (
                      <p className="text-xs text-takafol-text-light mt-1.5 line-clamp-2 leading-relaxed">
                        {charity.description}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-takafol-text-light">
                        <Heart size={12} className="text-takafol-danger" />
                        {charity._count.donations} donations
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-takafol-text-light">
                        <Users size={12} className="text-takafol-blue-deep" />
                        {charity._count.programs} programs
                      </span>
                      {charity.isVerified && (
                        <span className="text-[10px] font-semibold text-takafol-success bg-green-50 px-1.5 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={18}
                    className="text-takafol-blue-light group-hover:text-takafol-blue-deep group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
