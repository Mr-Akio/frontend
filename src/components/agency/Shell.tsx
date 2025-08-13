'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

const nav = [
  { href: '/agency', label: 'Dashboard', icon: '🏠' },
  { href: '/agency/packages', label: 'Packages', icon: '📦' },
  { href: '/agency/bookings', label: 'Bookings', icon: '📅' },
  { href: '/agency/profile', label: 'Profile', icon: '🏢' },
];

function cx(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

export default function AgencyShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white">✈️</div>
            <span className="font-extrabold text-lg text-orange-600">Travelie Agency</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 md:inline">Agency Panel</span>
            <div className="h-8 w-8 rounded-full bg-orange-200" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-[72px] h-max rounded-2xl border bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + '/');
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cx(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                    active
                      ? 'bg-orange-50 text-orange-600 border border-orange-100'
                      : 'hover:bg-gray-50 text-gray-700'
                  )}
                >
                  <span className="text-lg">{n.icon}</span>
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-orange-100 to-white p-4 text-sm">
            <div className="font-semibold text-orange-700">Enhance your Experience!</div>
            <div className="mt-1 text-gray-600">
              Manage packages & bookings faster with the new panel.
            </div>
          </div>
        </aside>

        {/* Main */}
        <main>{children}</main>
      </div>
    </div>
  );
}
