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

  if (loading) {
    return (
      <div className="min-h-screen bg-takafol-off-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-takafol-blue-light border-t-takafol-blue animate-spin" />
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-takafol-off-white">
      {/* Header */}
      <div className="bg-takafol-hero">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
          <div className="flex items-center gap-2">
            <Trophy size={24} className="text-takafol-gold" />
            <h1 className="text-2xl font-display font-bold text-takafol-text">
              Leaderboard
            </h1>
          </div>
          <p className="text-sm text-takafol-text-light mt-1">
            Top volunteers making the biggest impact
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 pb-8">
        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-takafol-blue-light/20 p-8 text-center">
            <Star size={32} className="text-takafol-blue-light mx-auto mb-3" />
            <p className="text-sm text-takafol-text-light">
              No volunteers yet. Be the first to make an impact!
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-3 mb-6">
                {/* 2nd place */}
                {top3[1] && (
                  <div className="flex-1 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto mb-2 flex items-center justify-center border-2 border-slate-300">
                      <span className="text-lg font-bold text-slate-500">
                        {top3[1].userName.charAt(0)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-takafol-text truncate">{top3[1].userName}</p>
                    <p className="text-sm font-display font-bold text-slate-500">{top3[1].impactScore}</p>
                    <div className="bg-slate-100 rounded-t-xl h-16 mt-2 flex items-center justify-center">
                      <Medal size={20} className="text-slate-400" />
                    </div>
                  </div>
                )}

                {/* 1st place */}
                {top3[0] && (
                  <div className="flex-1 text-center animate-slide-up">
                    <div className="w-18 h-18 rounded-full bg-amber-50 mx-auto mb-2 flex items-center justify-center border-2 border-amber-400 w-[72px] h-[72px]">
                      <span className="text-xl font-bold text-amber-600">
                        {top3[0].userName.charAt(0)}
                      </span>
                    </div>
                    <Crown size={16} className="text-amber-500 mx-auto mb-0.5" />
                    <p className="text-sm font-semibold text-takafol-text truncate">{top3[0].userName}</p>
                    <p className="text-lg font-display font-bold text-amber-600">{top3[0].impactScore}</p>
                    <div className="bg-amber-50 rounded-t-xl h-24 mt-2 flex items-center justify-center border border-amber-200">
                      <Trophy size={24} className="text-amber-500" />
                    </div>
                  </div>
                )}

                {/* 3rd place */}
                {top3[2] && (
                  <div className="flex-1 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-14 h-14 rounded-full bg-orange-50 mx-auto mb-2 flex items-center justify-center border-2 border-orange-300">
                      <span className="text-lg font-bold text-orange-500">
                        {top3[2].userName.charAt(0)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-takafol-text truncate">{top3[2].userName}</p>
                    <p className="text-sm font-display font-bold text-orange-500">{top3[2].impactScore}</p>
                    <div className="bg-orange-50 rounded-t-xl h-12 mt-2 flex items-center justify-center">
                      <Medal size={18} className="text-orange-400" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rest of list */}
            <div className="space-y-2">
              {rest.map((entry, i) => (
                <div
                  key={entry.id}
                  className={cn(
                    'bg-white rounded-xl border border-takafol-blue-light/15 px-4 py-3 flex items-center gap-3 animate-slide-up',
                    entry.userId === 'demo-user-001' && 'border-takafol-blue bg-takafol-blue-pale/20'
                  )}
                  style={{ animationDelay: `${(i + 3) * 0.05}s` }}
                >
                  <span className="w-8 text-center text-sm font-bold text-takafol-text-light">
                    {i + 4}
                  </span>

                  <div className="w-10 h-10 rounded-full bg-takafol-blue-pale flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-takafol-blue-deep">
                      {entry.userName.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-takafol-text truncate">
                      {entry.userName}
                      {entry.userId === 'demo-user-001' && (
                        <span className="text-[10px] text-takafol-accent ml-1.5">(You)</span>
                      )}
                    </p>
                    <p className="text-[10px] text-takafol-text-light">
                      {entry.tasksCompleted} tasks
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-takafol-blue-deep">
                      {entry.impactScore}
                    </p>
                    <p className="text-[10px] text-takafol-text-light">points</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
