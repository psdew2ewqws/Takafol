'use client';

import { useState } from 'react';
import { MapPin, Calendar, Users, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function ProgramCard({ program, charityId }: { program: Program; charityId: string }) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const spotsLeft = program.maxVolunteers
    ? program.maxVolunteers - program.currentVolunteers
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const fillPercent = program.maxVolunteers
    ? Math.min((program.currentVolunteers / program.maxVolunteers) * 100, 100)
    : 0;
  const isAlmostFull = spotsLeft !== null && spotsLeft <= 3 && !isFull;

  async function handleApply() {
    setApplying(true);
    try {
      await fetch(`/api/charities/${charityId}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          userId: 'demo-user-001',
          userName: 'Demo User',
        }),
      });
      setApplied(true);
    } catch (err) {
      console.error('Apply failed:', err);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-takafol-blue-light/15 p-5 shadow-card card-glow group">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display font-bold text-takafol-text group-hover:text-takafol-blue-deep transition-colors leading-snug">
          {program.title}
        </h4>
        {isAlmostFull && (
          <span className="flex-shrink-0 text-[10px] font-bold text-takafol-warning bg-takafol-warning-light px-2 py-0.5 rounded-full animate-pulse-soft">
            Almost full
          </span>
        )}
      </div>

      {program.description && (
        <p className="text-[13px] text-takafol-text-light mt-2 line-clamp-2 leading-relaxed">
          {program.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2.5 mt-4">
        {program.location && (
          <span className="inline-flex items-center gap-1.5 text-xs text-takafol-text-muted bg-takafol-blue-pale/50 px-2.5 py-1 rounded-full">
            <MapPin size={11} className="text-takafol-blue-deep" /> {program.location}
          </span>
        )}
        {program.startDate && (
          <span className="inline-flex items-center gap-1.5 text-xs text-takafol-text-muted bg-takafol-blue-pale/50 px-2.5 py-1 rounded-full">
            <Calendar size={11} className="text-takafol-blue-deep" />
            {new Date(program.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {spotsLeft !== null && (
          <span className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
            isFull
              ? 'text-takafol-danger bg-red-50'
              : isAlmostFull
              ? 'text-takafol-warning bg-takafol-warning-light'
              : 'text-takafol-text-muted bg-takafol-blue-pale/50'
          )}>
            <Users size={11} />
            {isFull ? 'Full' : `${spotsLeft} spots left`}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {program.maxVolunteers && (
        <div className="mt-4">
          <div className="h-2 bg-takafol-blue-pale rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                isFull
                  ? 'bg-takafol-text-muted'
                  : isAlmostFull
                  ? 'bg-gradient-to-r from-takafol-warning to-amber-400'
                  : 'bg-gradient-to-r from-takafol-blue to-takafol-accent'
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-takafol-text-muted mt-1.5 flex items-center gap-1">
            <Clock size={10} />
            {program.currentVolunteers}/{program.maxVolunteers} volunteers signed up
          </p>
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={isFull || applying || applied}
        className={cn(
          'w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
          applied
            ? 'bg-takafol-success-light text-takafol-success border border-green-200'
            : isFull
            ? 'bg-gray-50 text-takafol-text-muted cursor-not-allowed border border-gray-100'
            : 'bg-gradient-to-r from-takafol-blue to-takafol-accent text-white shadow-button hover:shadow-button-hover hover:scale-[1.01] active:scale-[0.99]'
        )}
      >
        {applied ? (
          <>
            <CheckCircle2 size={16} /> Applied Successfully!
          </>
        ) : applying ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isFull ? (
          'Program Full'
        ) : (
          'Apply to Volunteer'
        )}
      </button>
    </div>
  );
}
