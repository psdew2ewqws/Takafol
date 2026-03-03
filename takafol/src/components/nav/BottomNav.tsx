'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/offer/charities', label: 'Charities', icon: Building2 },
  { href: '/dashboard', label: 'Impact', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Board', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="max-w-lg mx-auto px-3 pb-2">
        <div className="bg-white/92 backdrop-blur-2xl rounded-2xl shadow-nav border border-white/60 px-2 py-1">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-300',
                    isActive
                      ? 'text-takafol-blue-deep'
                      : 'text-takafol-text-muted active:scale-95'
                  )}
                >
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-takafol-blue rounded-full" />
                  )}
                  <div
                    className={cn(
                      'p-1.5 rounded-xl transition-all duration-300',
                      isActive ? 'bg-takafol-blue-pale shadow-sm' : 'hover:bg-takafol-blue-pale/40'
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 1.6} />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] leading-none',
                      isActive ? 'font-bold' : 'font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
