'use client';

import { User, Shield, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-takafol-off-white">
      <div className="bg-takafol-hero relative overflow-hidden">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-14 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <User size={16} className="text-takafol-blue-deep" />
            </div>
            <span className="text-xs font-semibold text-takafol-blue-deep/70 uppercase tracking-widest">
              Account
            </span>
          </div>
          <h1 className="text-[26px] font-display font-bold text-takafol-text mt-3">
            Profile
          </h1>
          <p className="text-sm text-takafol-text-light mt-1">Your account settings</p>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl border border-takafol-blue-light/15 p-8 text-center shadow-card">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-takafol-blue to-takafol-accent mx-auto flex items-center justify-center mb-4 shadow-md">
            <User size={32} className="text-white" />
          </div>
          <h2 className="text-lg font-display font-bold text-takafol-text">Demo User</h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-takafol-accent bg-takafol-blue-pale px-3 py-1 rounded-full mt-2">
            <Shield size={10} /> Verified Volunteer
          </span>
          <div className="h-px bg-takafol-blue-pale my-6" />
          <div className="flex items-center justify-center gap-2 text-sm text-takafol-text-muted">
            <Sparkles size={14} className="text-takafol-blue" />
            <p>Profile & settings managed by Dev 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
