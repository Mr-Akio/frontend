'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaCheckCircle,
  FaClock,
  FaMobileAlt,
  FaShieldAlt,
  FaHeart,
  FaShareAlt,
} from 'react-icons/fa';
import { useCurrency } from '@/providers/CurrencyProvider';

type ImageType = { id: number; image: string };

interface TourPackage {
  id: number;
  title: string;
  description: string;
  price: string;              
  location: string;
  start_date: string;
  end_date: string;
  image: string | null;       
  slots: number;
  images: ImageType[];
  activities?: string;
  includes?: string;
  excludes?: string;
  duration_detail?: string;
  group_size?: string;
  languages?: string;
  meeting_point?: string;

  agency_name?: string;
  owner_username?: string;

  map_image?: string | null;
  map_url?: string | null;
}

// ---------- ENV ----------
const API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
  return raw.endsWith('/') ? raw : raw + '/';
})();
const IMG_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_IMG_BASE || 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();

// ---------- Helpers ----------
function buildImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${IMG_BASE}${p}`;
}
function pickCoverPath(pkg: TourPackage): string | null {
  return pkg.image ?? pkg.images?.[0]?.image ?? null;
}

// ---------- Wishlist helpers (localStorage) ----------
function readWishlist(): number[] {
  try {
    const raw = localStorage.getItem('wishlist') || '[]';
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeWishlist(ids: number[]) {
  localStorage.setItem('wishlist', JSON.stringify(Array.from(new Set(ids))));
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const pkgId = id ? Number(id) : undefined;

  const [tour, setTour] = useState<TourPackage | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [people, setPeople] = useState(1);
  const [message, setMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { format } = useCurrency();

  
  useEffect(() => {
    if (!pkgId) return;
    const list = readWishlist();
    setIsWishlisted(list.includes(pkgId));
  }, [pkgId]);

  
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}users/packages/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error('Package not found');
        return res.json();
      })
      .then((data: TourPackage) => {
        setTour(data);
        setSelectedPath(pickCoverPath(data));
      })
      .catch(() => setMessage('❌ Failed to fetch package'));
  }, [id]);

  const heroUrl = useMemo(() => buildImageUrl(tour ? pickCoverPath(tour) : null), [tour]);
  const galleryUrl = buildImageUrl(selectedPath);

  const thumbs: string[] = useMemo(() => {
    if (!tour) return [];
    return [tour.image || '', ...(tour.images || []).map((i) => i.image || '')]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [tour]);

  const outOfSeats = useMemo(() => {
    if (!tour) return false;
    return people > tour.slots || tour.slots <= 0;
  }, [people, tour]);

 
  const handleBooking = async () => {
    if (!tour) return;
    const token = localStorage.getItem('access');
    if (!token) {
      setMessage('❌ Please log in before booking');
      return;
    }
    if (outOfSeats) {
      setMessage('❌ Not enough seats available');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}users/bookings/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_id: tour.id,
          travel_date: tour.start_date,
          number_of_people: people,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTour((prev) => (prev ? { ...prev, slots: prev.slots - people } : prev));
        router.push(`/booking/confirm?booking_id=${data.id}`);
      } else {
        setMessage(`❌ ${data.detail || 'Booking failed'}`);
      }
    } catch {
      setMessage('❌ Could not connect to server');
    }
  };

  // กดหัวใจ -> toggle ใน localStorage
  const toggleWishlist = () => {
    if (!pkgId) return;
    const list = readWishlist();
    const exists = list.includes(pkgId);
    const next = exists ? list.filter((x) => x !== pkgId) : [...list, pkgId];
    writeWishlist(next);
    setIsWishlisted(!exists);
    setMessage(exists ? '💔 Removed from wishlist' : '❤️ Added to wishlist');
    setTimeout(() => setMessage(''), 1200);
  };

  if (!tour) return <p className="p-6 text-gray-700 text-lg">{message || 'Loading...'}</p>;

  const agencyLabel = tour.agency_name ?? tour.owner_username ?? '—';
  const mapImageUrl = buildImageUrl(tour.map_image);
  const hasMapImage = !!mapImageUrl;
  const hasMapUrl = !!tour.map_url;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative w-full h-[400px]">
        {heroUrl ? (
          <Image src={heroUrl} alt={tour.title} fill className="object-cover" sizes="100vw" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gray-200 text-gray-500">No Image</div>
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative max-w-7xl mx-auto -mt-40 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-t-3xl shadow-xl p-8">
          <div className="mb-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{tour.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              by <span className="font-semibold">{agencyLabel}</span>
            </p>
          </div>

          <div className="grid gap-8 mt-6 items-stretch lg:[grid-template-columns:2fr_1fr]">
            {/* Gallery */}
            <div className="flex flex-col">
              <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                {galleryUrl ? (
                  <Image
                    src={galleryUrl}
                    alt={tour.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gray-100 text-gray-500">No Image</div>
                )}
              </div>

              {thumbs.length > 0 && (
                <div className="flex mt-3 gap-2 flex-wrap">
                  {thumbs.map((img, i) => {
                    const thumbUrl = buildImageUrl(img);
                    return thumbUrl ? (
                      <Image
                        key={`${img}-${i}`}
                        src={thumbUrl}
                        alt={`Thumb ${i + 1}`}
                        width={120}
                        height={80}
                        className={`h-20 w-28 rounded-lg object-cover border-2 cursor-pointer transition ${
                          selectedPath === img ? 'border-orange-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setSelectedPath(img)}
                        sizes="120px"
                      />
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Booking card */}
            <div className="h-full self-start">
              <div className="h-full bg-gray-50 border-l-2 border-gray-200 p-6 rounded-xl shadow-md flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Booking</h3>

                <div className="mb-3 text-black">
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="p-3 border rounded-lg bg-white shadow">
                    {tour.start_date} – {tour.end_date}
                  </div>
                </div>

                <label className="block mt-2">
                  <span className="text-base text-gray-700">Guests</span>
                  <input
                    type="number"
                    min={1}
                    value={people}
                    onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
                    className="w-full p-3 border text-black rounded-lg mt-1 shadow"
                  />
                </label>

                <div className="mt-2 text-sm text-gray-600">
                  Seats left:{' '}
                  <span className={`${tour.slots <= 3 ? 'text-red-600 font-semibold' : ''}`}>{tour.slots}</span>
                </div>

                <div className="text-3xl font-bold text-orange-500 mt-4">
                  {format(Number(tour.price || 0))}
                </div>

                <button
                  onClick={handleBooking}
                  disabled={outOfSeats}
                  className={`w-full text-white text-lg font-semibold py-3 mt-4 rounded-lg transition shadow ${
                    outOfSeats ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {outOfSeats ? 'Not enough seats' : 'Confirm Booking'}
                </button>

                {message && (
                  <p
                    className={`text-sm text-center mt-2 ${
                      message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {message}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={toggleWishlist}
                    className={`w-1/2 flex items-center justify-center border py-2 rounded-lg shadow transition ${
                      isWishlisted ? 'bg-pink-50 border-pink-300 text-pink-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={isWishlisted}
                    aria-label="Toggle wishlist"
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FaHeart className={`mr-2 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />{' '}
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>

                  <button className="w-1/2 flex items-center justify-center border py-2 rounded-lg text-gray-700 hover:bg-gray-200 shadow">
                    <FaShareAlt className="mr-2" /> Share
                  </button>
                </div>

                <div className="flex-1" />
              </div>
            </div>
          </div>

          {/* Details + Map */}
          <div className="mt-10 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <section className="text-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Details</h2>
                <div className="space-y-2 text-gray-700">
                  <div><strong>📍 Location:</strong> {tour.location}</div>
                  <div><strong>🕒 Duration:</strong> {tour.duration_detail || '2 hours'}</div>
                  <div><strong>👥 Group size:</strong> {tour.group_size || '4+ people'}</div>
                  <div><strong>🌐 Languages:</strong> {tour.languages || 'English'}</div>
                  {tour.meeting_point && <div><strong>📌 Meeting Point:</strong> {tour.meeting_point}</div>}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow text-gray-800 text-lg">
                <div className="flex items-center"><FaCheckCircle className="text-red-500 mr-2" /> Free Cancellation</div>
                <div className="flex items-center"><FaShieldAlt className="text-blue-500 mr-2" /> Health Precautions</div>
                <div className="flex items-center"><FaMobileAlt className="text-green-500 mr-2" /> Mobile Ticketing</div>
                <div className="flex items-center"><FaClock className="text-orange-500 mr-2" /> Duration: {tour.duration_detail || '2 hours'}</div>
              </section>

              <section className="text-lg">
                <h2 className="text-2xl font-semibold text-gray-800">Description</h2>
                <p className="text-gray-800 mt-2 whitespace-pre-line">{tour.description}</p>
              </section>

              {(tour.includes || tour.excludes) && (
                <section className="text-lg">
                  <h2 className="text-2xl font-semibold text-gray-800">What Is Included / Not Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    {tour.includes && (
                      <div>
                        <h3 className="font-semibold text-orange-500">Includes</h3>
                        <p className="text-gray-700 whitespace-pre-line">{tour.includes}</p>
                      </div>
                    )}
                    {tour.excludes && (
                      <div>
                        <h3 className="font-semibold text-red-500">Not Included</h3>
                        <p className="text-gray-700 whitespace-pre-line">{tour.excludes}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Map */}
            <aside className="lg:col-span-1">
              <div className="bg-gray-50 border-l-2 border-gray-200 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Map</h3>
                {mapImageUrl ? (
                  <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
                    <Image
                      src={mapImageUrl}
                      alt="Map"
                      fill
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 33vw"
                    />
                  </div>
                ) : hasMapUrl ? (
                  <div className="mt-0">
                    <iframe
                      className="w-full h-[220px] rounded-lg"
                      loading="lazy"
                      src={tour.map_url!}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
                    <Image
                      src="/images/map-placeholder.jpg"
                      alt="Map"
                      fill
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 33vw"
                    />
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="mt-10">
            <Link href="/packagesList" className="text-blue-600 hover:underline text-sm font-medium">
              ← Back to packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
