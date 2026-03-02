'use client';

import { useState } from 'react';
import { MapPin, Calendar, Users, Loader2, CheckCircle2 } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-takafol-blue-light/20 p-5 hover:shadow-md hover:border-takafol-blue-light/50 transition-all group">
      <h4 className="font-display font-bold text-takafol-text group-hover:text-takafol-blue-deep transition-colors">
        {program.title}
      </h4>

      {program.description && (
        <p className="text-sm text-takafol-text-light mt-1.5 line-clamp-2">
          {program.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        {program.location && (
          <span className="inline-flex items-center gap-1 text-xs text-takafol-text-light">
            <MapPin size={12} /> {program.location}
          </span>
        )}
        {program.startDate && (
          <span className="inline-flex items-center gap-1 text-xs text-takafol-text-light">
            <Calendar size={12} />
            {new Date(program.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {spotsLeft !== null && (
          <span className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            spotsLeft <= 3 ? 'text-takafol-warning' : 'text-takafol-text-light'
          )}>
            <Users size={12} />
            {isFull ? 'Full' : `${spotsLeft} spots left`}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {program.maxVolunteers && (
        <div className="mt-3">
          <div className="h-1.5 bg-takafol-blue-pale rounded-full overflow-hidden">
            <div
              className="h-full bg-takafol-blue rounded-full transition-all"
              style={{ width: `${(program.currentVolunteers / program.maxVolunteers) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-takafol-text-light mt-1">
            {program.currentVolunteers}/{program.maxVolunteers} volunteers
          </p>
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={isFull || applying || applied}
        className={cn(
          'w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
          applied
            ? 'bg-green-50 text-takafol-success border border-green-200'
            : isFull
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-takafol-blue-pale text-takafol-blue-deep hover:bg-takafol-blue hover:text-white'
        )}
      >
        {applied ? (
          <>
            <CheckCircle2 size={16} /> Applied!
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
