'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type PackageImage = { id: number; image: string };
interface TourPackage {
  id: number;
  title: string;
  location: string;
  duration_detail?: string;
  start_date?: string;
  end_date?: string;
  price: string;
  image: string | null;        
  images?: PackageImage[];     
}

const API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
  return raw.endsWith('/') ? raw : raw + '/';
})();

const IMG_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_IMG_BASE || 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();


function buildImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const base = new URL(IMG_BASE);

  try {
    
    if (/^https?:\/\//i.test(path)) {
      const u = new URL(path);
     
      const joined = `${base.origin}${u.pathname}${u.search ?? ''}`.replace(/([^:]\/)\/+/g, '$1');
      return encodeURI(joined);
    }
  } catch {
    
  }

  
  let clean = path.startsWith('/') ? path : `/${path}`;
  if (!/^\/media\//i.test(clean)) clean = `/media/${clean.replace(/^\/+/, '')}`;

  const joined = `${base.origin}${clean}`.replace(/([^:]\/)\/+/g, '$1');
  return encodeURI(joined);
}


function getCoverPath(pkg: TourPackage): string | null {
  return pkg.image ?? pkg.images?.[0]?.image ?? null;
}


function hoursFromDuration(detail?: string): number | null {
  if (!detail) return null;
  const s = detail.toLowerCase().trim();
  const days = s.match(/(\d+(?:\.\d+)?)\s*day/);
  if (days) return Math.round(parseFloat(days[1]) * 24);
  const range = s.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*hour/);
  if (range) return Math.round((parseFloat(range[1]) + parseFloat(range[2])) / 2);
  const hrs = s.match(/(\d+(?:\.\d+)?)\s*hour/);
  if (hrs) return Math.round(parseFloat(hrs[1]));
  return null;
}

const THEME_OPTIONS = ['Water activities', 'Adrenaline', 'Nature', 'Hidden Gem'] as const;
type Theme = typeof THEME_OPTIONS[number];

const DURATION_OPTIONS = ['0–3 hours', '3–5 hours', 'Multi-day'] as const;
type DurationBucket = typeof DURATION_OPTIONS[number];

export default function PackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);

  
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [themes, setThemes] = useState<Set<Theme>>(new Set());
  const [durations, setDurations] = useState<Set<DurationBucket>>(new Set());
  const [wishlistOnly, setWishlistOnly] = useState(false);

  
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  
  useEffect(() => {
    fetch(`${API_BASE}users/packages/`)
      .then((r) => r.json())
      .then((data: TourPackage[]) => setPackages(data))
      .catch(() => setPackages([]));
  }, []);

  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wishlist_ids');
      if (raw) setWishlist(new Set<number>(JSON.parse(raw)));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('wishlist_ids', JSON.stringify(Array.from(wishlist)));
    } catch {}
  }, [wishlist]);

  const toggleTheme = (t: Theme) =>
    setThemes((prev) => { const s = new Set(prev); s.has(t) ? s.delete(t) : s.add(t); return s; });

  const toggleDuration = (d: DurationBucket) =>
    setDurations((prev) => { const s = new Set(prev); s.has(d) ? s.delete(d) : s.add(d); return s; });

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const hay = `${pkg.title} ${pkg.location}`.toLowerCase();
      const okQuery = !query || hay.includes(query.toLowerCase());

      let okDate = true;
      if (dateFrom && pkg.start_date) okDate = okDate && pkg.start_date >= dateFrom;
      if (dateTo && pkg.end_date) okDate = okDate && pkg.end_date <= dateTo;

      let okTheme = true;
      if (themes.size > 0) okTheme = Array.from(themes).some((t) => hay.includes(t.toLowerCase()));

      let okDuration = true;
      if (durations.size > 0) {
        const hrs = hoursFromDuration(pkg.duration_detail);
        okDuration = Array.from(durations).some((d) =>
          hrs != null && (
            (d === '0–3 hours' && hrs >= 0 && hrs <= 3) ||
            (d === '3–5 hours' && hrs >= 3 && hrs <= 5) ||
            (d === 'Multi-day' && hrs >= 24)
          )
        );
      }

      const okWishlist = !wishlistOnly || wishlist.has(pkg.id);
      return okQuery && okDate && okTheme && okDuration && okWishlist;
    });
  }, [packages, query, dateFrom, dateTo, themes, durations, wishlistOnly, wishlist]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero + Search */}
      <div
        className="relative bg-cover bg-center h-[350px]"
        style={{ backgroundImage: "url('/images/pexels-fabianwiktor-994605.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4">
          <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg mb-4">Find Your Perfect Trip</h1>
          <div className="flex items-center w-full max-w-xl rounded-full bg-white shadow px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or location..."
              className="flex-1 ml-2 outline-none text-black"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <aside className="space-y-6 bg-white p-6 rounded-xl border shadow-sm h-fit text-sm">
          <div>
            <h3 className="font-bold mb-2 text-gray-800">Filter</h3>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <div className="mt-4 flex items-center gap-2">
              <input
                id="wishlistOnly"
                type="checkbox"
                checked={wishlistOnly}
                onChange={(e) => setWishlistOnly(e.target.checked)}
              />
              <label htmlFor="wishlistOnly" className="text-gray-800">Wishlist only</label>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2 text-gray-800">Theme</h3>
            {THEME_OPTIONS.map((theme) => (
              <label key={theme} className="flex items-center gap-2 mb-1 text-gray-700">
                <input
                  type="checkbox"
                  checked={themes.has(theme)}
                  onChange={() => toggleTheme(theme)}
                />
                {theme}
              </label>
            ))}
            <button
              type="button"
              onClick={() => setThemes(new Set())}
              className="mt-2 text-xs text-gray-500 hover:underline"
            >
              Clear theme
            </button>
          </div>

          <div>
            <h3 className="font-bold mb-2 text-gray-800">Duration</h3>
            {DURATION_OPTIONS.map((d) => (
              <label key={d} className="flex items-center gap-2 mb-1 text-gray-700">
                <input
                  type="checkbox"
                  checked={durations.has(d)}
                  onChange={() => toggleDuration(d)}
                />
                {d}
              </label>
            ))}
            <button
              type="button"
              onClick={() => setDurations(new Set())}
              className="mt-2 text-xs text-gray-500 hover:underline"
            >
              Clear duration
            </button>
          </div>

          {(themes.size > 0 || durations.size > 0 || dateFrom || dateTo || query || wishlistOnly) && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDateFrom('');
                setDateTo('');
                setThemes(new Set());
                setDurations(new Set());
                setWishlistOnly(false);
              }}
              className="w-full mt-2 border border-gray-300 py-2 rounded text-gray-700 hover:bg-gray-50"
            >
              Reset all
            </button>
          )}
        </aside>

        {/* Package List */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center">No packages match your filters.</p>
          ) : (
            filtered.map((pkg) => {
              const coverUrl = buildImageUrl(getCoverPath(pkg)); 
              const wished = wishlist.has(pkg.id);

              return (
                <div
                  key={pkg.id}
                  className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md overflow-hidden transition flex flex-col md:flex-row"
                >
                  <div className="relative w-full md:w-1/3 h-52">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                        unoptimized        
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gray-100 text-gray-500">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-orange-500 text-xs font-bold uppercase">Adventure</span>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1 line-clamp-2">
                          {pkg.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          📍 {pkg.location} &nbsp;|&nbsp; 🕒 {pkg.duration_detail || '2 hours'}<br />
                          🗓 {pkg.start_date ?? '-'} - {pkg.end_date ?? '-'}
                        </p>
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={() => toggleWishlist(pkg.id)}
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium border transition
                          ${wished ? 'bg-pink-50 text-pink-600 border-pink-300' : 'text-gray-700 hover:bg-gray-100 border-gray-300'}`}
                        title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                        aria-pressed={wished}
                      >
                        {wished ? '♥ Saved' : '♡ Wishlist'}
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <p className="text-orange-500 font-bold text-xl">
                        {Number(pkg.price).toLocaleString()} ฿
                        <span className="text-xs font-normal ml-1 text-gray-400">per person</span>
                      </p>
                      <Link href={`/packages/${pkg.id}`}>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
