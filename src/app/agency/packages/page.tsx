'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { api, mediaUrl } from '@/lib/api';
import type { TourPackage } from '@/types';
import AgencyShell from '@/components/agency/Shell';

type SortKey = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export default function AgencyPackagesPage() {
  const router = useRouter();

  const [items, setItems] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

 
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  /** -------- Fetch -------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<TourPackage[]>('/api/users/agency/packages/');
        setItems(data);
      } catch (err: unknown) {
        const e = err as Error;
        setMsg(e?.message || 'Load failed');
        if ((e?.message || '').includes('401')) router.replace('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  /** -------- Debounce -------- */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  /** -------- List: filter + sort -------- */
  const display = useMemo(() => {
    let list = items;

    if (debounced) {
      const q = debounced;
      list = list.filter((p) =>
        [p.title, p.location ?? '', p.description ?? ''].join(' ').toLowerCase().includes(q),
      );
    }

    const byDate = (a?: string, b?: string, dir: 1 | -1 = 1) =>
      ((b ? Date.parse(b) : 0) - (a ? Date.parse(a) : 0)) * dir;

    const byNumber = (a?: number, b?: number, dir: 1 | -1 = 1) =>
      ((a ?? 0) - (b ?? 0)) * dir;

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return byDate(a.start_date, b.start_date, 1);
        case 'oldest':
          return byDate(a.start_date, b.start_date, -1);
        case 'price_asc':
          return byNumber(Number(a.price as unknown as number), Number(b.price as unknown as number), 1);
        case 'price_desc':
          return byNumber(Number(a.price as unknown as number), Number(b.price as unknown as number), -1);
        default:
          return 0;
      }
    });

    return list;
  }, [items, debounced, sort]);

  
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this package?')) return;
    try {
      await api.del(`/api/users/agency/packages/${id}/`);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const e = err as Error;
      alert(e?.message || 'Delete failed');
    }
  };

  
  const handleToggleAvailable = async (pkgId: number, current: boolean) => {
    
    setUpdatingIds((prev) => new Set(prev).add(pkgId));

    
    setItems((prev) =>
      prev.map((p) => (p.id === pkgId ? ({ ...p, available: !current } as TourPackage) : p)),
    );

    try {
      const fd = new FormData();
      fd.append('available', String(!current)); 
      await api.patch(`/api/users/agency/packages/${pkgId}/`, fd); 
    } catch (err: unknown) {
      const e = err as Error;
      
      setItems((prev) =>
        prev.map((p) => (p.id === pkgId ? ({ ...p, available: current } as TourPackage) : p)),
      );
      alert(e?.message || 'Update availability failed');
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev);
        n.delete(pkgId);
        return n;
      });
    }
  };

  /** -------- Helpers -------- */
  const fmtDate = (d?: string) =>
    d ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(d)) : '-';

  /** -------- UI -------- */
  return (
    <AgencyShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                My Packages
              </span>
            </h1>
            <p className="text-sm text-gray-500">Create, edit, and manage your tours.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <input
                placeholder="Search title, location, description…"
                className="h-11 w-full rounded-xl border bg-white/60 pl-10 pr-3 text-sm outline-none ring-0 transition focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔎
              </span>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 rounded-xl border bg-white/60 px-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
            >
              <option value="newest">Newest dates</option>
              <option value="oldest">Oldest dates</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>

            <Link
              href="/agency/packages/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              <span className="text-lg">＋</span> Create
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonGrid />
        ) : msg ? (
          <div className="rounded-2xl border bg-white p-8 text-red-600">{msg}</div>
        ) : display.length === 0 ? (
          <EmptyState onCreateHref="/agency/packages/create" />
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {display.map((p) => {
              const available = (p as unknown as { available?: boolean }).available ?? false;
              const saving = updatingIds.has(p.id);

              return (
                <li
                  key={p.id}
                  className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative h-44 w-full">
                    {p.image ? (
                      <Image
                        src={mediaUrl(p.image)}
                        alt={p.title}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-gray-50 to-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}

                    {/* Availability badge */}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          available
                            ? 'bg-green-50 text-green-700 ring-green-200'
                            : 'bg-gray-100 text-gray-600 ring-gray-300'
                        }`}
                      >
                        {available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-4">
                    <div className="space-y-1">
                      <h3 className="line-clamp-1 text-base font-semibold">{p.title}</h3>
                      <p className="line-clamp-2 text-xs text-gray-500">{p.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="rounded-lg bg-gray-50 px-2 py-1">
                        📍 <span className="font-medium">{p.location || '-'}</span>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-2 py-1 text-right">
                        🧑‍🤝‍🧑 <span className="font-medium">{p.slots}</span> slots
                      </div>
                      <div className="col-span-2 rounded-lg bg-gray-50 px-2 py-1">
                        🗓 {fmtDate(p.start_date)} <span className="mx-1 text-gray-400">→</span> {fmtDate(p.end_date)}
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      {/* Toggle Available */}
                      <button
                        onClick={() => handleToggleAvailable(p.id, available)}
                        disabled={saving}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition
                          ${
                            available
                              ? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100'
                          }
                          disabled:opacity-60 disabled:cursor-not-allowed
                        `}
                        title="Toggle availability"
                        aria-pressed={available}
                      >
                        {saving ? 'Saving…' : available ? 'Set Unavailable' : 'Set Available'}
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/agency/packages/${p.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-100"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AgencyShell>
  );
}

/* ---------- UI Partials ---------- */

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="overflow-hidden rounded-2xl border bg-white">
          <div className="h-44 w-full animate-pulse bg-gray-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-7 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-7 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onCreateHref }: { onCreateHref: string }) {
  return (
    <div className="rounded-2xl border bg-white p-10 text-center">
      <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 text-3xl">
        🗂️
      </div>
      <div className="text-lg font-semibold">No packages found</div>
      <div className="mt-1 text-sm text-gray-500">Try creating your first tour package.</div>
      <Link
        href={onCreateHref}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
      >
        Create package
      </Link>
    </div>
  );
}
