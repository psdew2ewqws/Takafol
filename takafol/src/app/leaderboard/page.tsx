'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

type LeaderboardEntry = {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  impactScore: number;
  tasksCompleted: number;
  totalDonated: number;
};

const PODIUM = [
  { rank: 2, size: 'w-14 h-14', bar: 'h-16', gradient: 'from-slate-300 to-slate-400', ring: 'ring-slate-300', icon: Medal, iconSize: 18 },
  { rank: 1, size: 'w-[72px] h-[72px]', bar: 'h-24', gradient: 'from-amber-400 to-amber-500', ring: 'ring-amber-400', icon: Crown, iconSize: 14 },
  { rank: 3, size: 'w-14 h-14', bar: 'h-12', gradient: 'from-orange-300 to-orange-400', ring: 'ring-orange-300', icon: Medal, iconSize: 16 },
];

const PODIUM_ORDER = [1, 0, 2]; // 2nd, 1st, 3rd

function LeaderSkeleton() {
  return (
    <div className="min-h-screen bg-takafol-off-white">
      <div className="bg-takafol-hero">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-14">
          <div className="h-7 w-32 shimmer rounded-lg mb-2" />
          <div className="h-4 w-48 shimmer rounded-lg" />
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 -mt-6 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 shimmer rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/leaderboard');
      if (res.ok) setEntries(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LeaderSkeleton />;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-takafol-off-white">
      {/* Header */}
      <div className="bg-takafol-hero relative overflow-hidden">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-14 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <Trophy size={16} className="text-takafol-gold" />
            </div>
            <span className="text-xs font-semibold text-takafol-blue-deep/70 uppercase tracking-widest">
              Rankings
            </span>
          </div>
          <h1 className="text-[26px] font-display font-bold text-takafol-text mt-3 leading-tight">
            Leaderboard
          </h1>
          <p className="text-sm text-takafol-text-light mt-1">
            Top volunteers making the biggest impact
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-8 pb-8 relative z-10">
        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-takafol-blue-light/15 p-10 text-center shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-takafol-blue-pale mx-auto flex items-center justify-center mb-4">
              <Star size={24} className="text-takafol-blue" />
            </div>
            <p className="text-sm font-medium text-takafol-text">No volunteers yet</p>
            <p className="text-xs text-takafol-text-muted mt-1">Be the first to make an impact!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-3 mb-6 animate-fade-in">
                {PODIUM_ORDER.map((orderIdx) => {
                  const p = PODIUM[orderIdx];
                  const entry = top3[orderIdx];
                  if (!entry) return <div key={orderIdx} className="flex-1" />;
                  const Icon = p.icon;

                  return (
                    <div
                      key={entry.id}
                      className="flex-1 text-center animate-slide-up"
                      style={{ animationDelay: `${orderIdx * 0.1}s` }}
                    >
                      <div className={cn(
                        'rounded-full mx-auto mb-2 flex items-center justify-center ring-2 bg-gradient-to-br shadow-md',
                        p.size, p.gradient, p.ring
                      )}>
                        <span className={cn(
                          'font-display font-bold text-white',
                          p.rank === 1 ? 'text-2xl' : 'text-lg'
                        )}>
                          {entry.userName.charAt(0)}
                        </span>
                      </div>
                      {p.rank === 1 && (
                        <Icon size={p.iconSize} className="text-amber-500 mx-auto mb-0.5" />
                      )}
                      <p className={cn(
                        'font-semibold text-takafol-text truncate px-1',
                        p.rank === 1 ? 'text-sm' : 'text-xs'
                      )}>
                        {entry.userName}
                      </p>
                      <p className={cn(
                        'font-display font-bold',
                        p.rank === 1 ? 'text-lg text-amber-600' : 'text-sm text-takafol-text-light'
                      )}>
                        {entry.impactScore}
                      </p>
                      <div className={cn(
                        'rounded-t-xl mt-2 flex items-center justify-center glass-strong',
                        p.bar
                      )}>
                        {p.rank !== 1 && <Icon size={p.iconSize} className="text-takafol-text-muted" />}
                        {p.rank === 1 && <Trophy size={22} className="text-amber-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of list */}
            <div className="space-y-2">
              {rest.map((entry, i) => {
                const isMe = entry.userId === 'demo-user-001';
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'bg-white rounded-2xl border px-4 py-3.5 flex items-center gap-3 shadow-card animate-slide-up',
                      isMe
                        ? 'border-takafol-blue bg-takafol-blue-pale/20 shadow-card-hover'
                        : 'border-takafol-blue-light/15'
                    )}
                    style={{ animationDelay: `${(i + 3) * 0.05}s` }}
                  >
                    <span className="w-8 text-center text-sm font-display font-bold text-takafol-text-muted">
                      {i + 4}
                    </span>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-takafol-blue-pale to-takafol-blue-light flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-takafol-blue-deep">
                        {entry.userName.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-takafol-text truncate">
                        {entry.userName}
                        {isMe && (
                          <span className="text-[10px] font-bold text-takafol-accent ml-1.5 bg-takafol-blue-pale px-1.5 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-takafol-text-muted">
                        {entry.tasksCompleted} tasks completed
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-display font-bold text-takafol-blue-deep">
                        {entry.impactScore}
                      </p>
                      <p className="text-[10px] text-takafol-text-muted">points</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
