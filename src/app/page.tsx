'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/providers/CurrencyProvider';

// -------- Types --------
type PackageImage = { id: number; image: string };
type TourPackage = {
  id: number;
  title: string;
  description: string;
  price: string;                 
  location: string;
  image: string | null;         
  images?: PackageImage[];      
};

// -------- ENV bases --------
const API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
  return raw.endsWith('/') ? raw : raw + '/';
})();

const IMG_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_IMG_BASE || 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();

// -------- Helpers --------
function buildImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${IMG_BASE}${p}`;
}

function getCoverPath(pkg: TourPackage): string | null {
  return pkg.image ?? pkg.images?.[0]?.image ?? null;
}

export default function HomePage() {
  const [packages, setPackages] = useState<TourPackage[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { format } = useCurrency();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}users/packages/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TourPackage[] = await res.json();
        setPackages(data);
      } catch (err) {
        console.error('❌ Failed to load packages', err);
        setPackages([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const list = packages ?? [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [packages, searchTerm]);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section
        className="relative h-[500px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/pexels-fabianwiktor-994605.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-6 text-4xl md:text-5xl font-bold leading-snug text-orange-100 drop-shadow-lg">
            Let&apos;s make your dream trip come true
            <br /> wherever you want to go.
          </h1>
          <div className="flex flex-wrap justify-center gap-2">
            <input
              type="text"
              placeholder="Where to?"
              className="rounded-md bg-white px-6 py-3 text-lg text-black focus:ring-2 focus:ring-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="rounded-md bg-white px-6 py-3 text-lg text-black">
              <option>Travel Type</option>
            </select>
            <button className="rounded-md bg-orange-500 px-8 py-3 text-lg font-semibold text-white hover:bg-orange-600">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-800">
          <span className="text-orange-500">Today</span> Recommended for you
          <br /> Tour Packages
        </h2>

        {!packages ? (
          <p className="text-center text-gray-500">Loading packages...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">No tour packages found</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((pkg) => {
              const priceTHB = Number(pkg.price) || 0;
              const coverUrl = buildImageUrl(getCoverPath(pkg));

              return (
                <div
                  key={pkg.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition hover:shadow-xl"
                >
                  <div className="relative h-48 w-full">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={pkg.title}
                        fill
                        className="object-cover rounded-t-2xl"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center rounded-t-2xl bg-gray-100 text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 rounded-t-2xl" />
                  </div>

                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold leading-snug text-gray-900 line-clamp-2">
                        {pkg.title}
                      </h3>
                      <span className="text-base font-medium text-orange-500">
                        {pkg.location}
                      </span>
                    </div>

                    <p className="text-base text-gray-600 line-clamp-2 mb-4">
                      {pkg.description}
                    </p>

                    <p className="text-2xl font-bold text-gray-800 mb-5">
                      {format(priceTHB)}
                    </p>

                    <Link href={`/packages/${pkg.id}`} className="block">
                      <button className="w-full rounded-lg bg-orange-500 py-3 text-lg font-semibold text-white transition hover:bg-orange-600">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
