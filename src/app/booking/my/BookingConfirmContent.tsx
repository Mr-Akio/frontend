'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSyncAlt,
} from 'react-icons/fa';
import { useCurrency } from '@/providers/CurrencyProvider';

type BookingStatusRaw = 'pending' | 'confirmed' | 'canceled' | 'cancelled' | string;

interface Booking {
  id: number;
  travel_date: string;
  number_of_people: number;
  status: BookingStatusRaw;
  package: {
    id: number;
    title: string;
    price: string;   
    location: string;
  };
}


const API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
  return raw.endsWith('/') ? raw : raw + '/';
})();

export default function BookingConfirmContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'canceled'>('pending'); 
  const { format } = useCurrency();

  
  const normStatus = (s: BookingStatusRaw) =>
    (s || '').toLowerCase() === 'cancelled' ? 'canceled' : (s || '').toLowerCase();

  const badge = (s: BookingStatusRaw) => {
    const n = normStatus(s);
    if (n === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">
          <FaCheckCircle /> Paid
        </span>
      );
    }
    if (n === 'canceled') {
      return (
        <span className="inline-flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold">
          <FaTimesCircle /> Canceled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full text-xs font-semibold">
        <FaClock /> Pending
      </span>
    );
  };

  const fetchMyBookings = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      setMessage('⚠️ Please log in first');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}users/bookings/my/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unable to load data');
      const data = (await res.json()) as Booking[];
      setBookings(data);
      setMessage('');
    } catch {
      setMessage('❌ An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
   
    const id = setInterval(fetchMyBookings, 15000); 
    return () => clearInterval(id);
   
  }, []);

  const filtered = useMemo(() => {
    const target = filter;
    return bookings.filter((b) => normStatus(b.status) === target);
  }, [bookings, filter]);

  const handleDownloadPDF = async (bookingId: number) => {
    const token = localStorage.getItem('access');
    if (!token) {
      alert('⚠️ Please login to download your booking receipt');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}users/bookings/${bookingId}/pdf/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('PDF download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('❌ Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧾 My Bookings</h1>
        <button
          onClick={fetchMyBookings}
          className="inline-flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg"
        >
          <FaSyncAlt className="animate-spin-slow [animation-duration:2s]" />
          Refresh
        </button>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-8">
        {([
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'canceled', label: 'Canceled' },
        ] as const).map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={
                `px-4 py-2 rounded-full text-sm font-medium border ` +
                (active
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {message && <p className="text-red-600 mb-4 text-center">{message}</p>}

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No bookings found</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((b) => {
            const totalTHB = Number(b.package.price || 0) * b.number_of_people;
            return (
              <div
                key={b.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {b.package.title}
                  </h2>
                  <Link href={`/packages/${b.package.id}`}>
                    <span className="text-blue-600 hover:underline text-sm">View package →</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm mt-3">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-500" />
                    <span>
                      Travel date: {new Date(b.travel_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-orange-500" />
                    <span>People: {b.number_of_people}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-orange-500" />
                    <span>
                      Total: {format(totalTHB)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {badge(b.status)}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleDownloadPDF(b.id)}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                  >
                    📄 Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
