'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCurrency } from '@/providers/CurrencyProvider';

interface BookingData {
  id: number;
  travel_date: string;
  number_of_people: number;
  package: {
    title: string;
    price: string; 
  };
}


const API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
  return raw.endsWith('/') ? raw : raw + '/';
})();


const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_SLIP_SIZE_MB = 5;

function getExtension(name: string) {
  const m = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return m ? m[0] : '';
}

export default function PaymentClientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [method, setMethod] = useState<'qr' | 'slip'>('qr');
  const [message, setMessage] = useState('');
  const [slip, setSlip] = useState<File | null>(null);

  const { format } = useCurrency();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token || !bookingId) return;

    fetch(`${API_BASE}users/bookings/${bookingId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBooking(data))
      .catch(() => setMessage('❌ Booking not found'));
  }, [bookingId]);

  
  const notifyEmail = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token || !bookingId) return;
      await fetch(`${API_BASE}users/payments/notify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: Number(bookingId) }),
      });
    } catch {
      
    }
  };

  
  const handleSlipUpload = async () => {
    const token = localStorage.getItem('access');
    if (!token || !bookingId || !slip) {
      setMessage('❌ Please log in and attach a payment slip.');
      return;
    }

    
    const ext = getExtension(slip.name);
    if (!ALLOWED_MIME.includes(slip.type) || !ALLOWED_EXT.includes(ext)) {
      setMessage('❌ File type must be JPG/PNG/WEBP (extensions: .jpg, .jpeg, .png, .webp).');
      return;
    }
    if (slip.size > MAX_SLIP_SIZE_MB * 1024 * 1024) {
      setMessage(`❌ File too large. Max ${MAX_SLIP_SIZE_MB} MB.`);
      return;
    }

    const formData = new FormData();
    formData.append('booking_id', bookingId);
    formData.append('slip_image', slip);

    try {
      const res = await fetch(`${API_BASE}users/payments/upload/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Slip uploaded successfully. Sending email & redirecting...');
        
        notifyEmail();
        setTimeout(() => router.push(`/booking/success?booking_id=${bookingId}`), 1200);
      } else {
        setMessage(`❌ ${data.detail || 'Failed to upload slip.'}`);
      }
    } catch {
      setMessage('❌ Failed to connect to the server.');
    }
  };

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] text-gray-500">
        Loading booking details...
      </div>
    );
  }

  const totalTHB = Number(booking.package?.price || 0) * booking.number_of_people;

  // ใช้ภาพ QR แบบโลคัล
  const localQrSrc = '/images/ae08771f-baaa-4bdb-9502-ba26de426bfa.jpg';

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">💳 Payment</h1>

        {/* Booking Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">📦 Booking Details</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><strong>Package:</strong> {booking.package?.title}</li>
            <li><strong>Travel Date:</strong> {booking.travel_date}</li>
            <li><strong>Number of Guests:</strong> {booking.number_of_people}</li>
            <li className="text-orange-500 font-bold text-lg mt-2">
              Total: {format(totalTHB)}
            </li>
          </ul>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">🧾 Select Payment Method</label>
          <div className="space-y-2 text-sm text-gray-700">
            {(['qr', 'slip'] as const).map((m) => (
              <label key={m} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={method === m}
                  onChange={(e) => setMethod(e.target.value as 'qr' | 'slip')}
                  className="accent-orange-500"
                />
                {m === 'qr' ? 'QR Code (PromptPay)' : 'Upload Transfer Slip'}
              </label>
            ))}
          </div>
        </div>

        {/* QR or Slip */}
        {method === 'qr' && (
          <div className="text-center mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">📲 Scan to Pay</h3>
            <Image
              src={localQrSrc}
              alt="QR PromptPay"
              width={240}
              height={240}
              className="mx-auto border bg-white p-2 rounded-lg"
              priority
            />
            <p className="text-sm text-gray-500 mt-2">Please upload your slip after payment.</p>
          </div>
        )}

        {method === 'slip' && (
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              📤 Upload Payment Slip
            </label>
            <input
              type="file"
              
              accept={[...ALLOWED_EXT, ...ALLOWED_MIME].join(',')}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setMessage('');
                if (!f) return setSlip(null);
                const ext = getExtension(f.name);
                if (!ALLOWED_MIME.includes(f.type) || !ALLOWED_EXT.includes(ext)) {
                  setMessage('❌ File type must be JPG/PNG/WEBP (extensions: .jpg, .jpeg, .png, .webp).');
                  return setSlip(null);
                }
                if (f.size > MAX_SLIP_SIZE_MB * 1024 * 1024) {
                  setMessage(`❌ File too large. Max ${MAX_SLIP_SIZE_MB} MB.`);
                  return setSlip(null);
                }
                setSlip(f);
              }}
              className="block w-full border p-2 rounded text-sm"
            />
            {slip && (
              <p className="text-xs text-gray-500 mt-1">
                File: <span className="font-medium">{slip.name}</span>{' '}
                (<span className="uppercase">{getExtension(slip.name).replace('.', '')}</span>) •{' '}
                {(slip.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              Allowed: JPG/PNG/WEBP • Max {MAX_SLIP_SIZE_MB}MB
            </p>
          </div>
        )}

        {method === 'slip' && (
          <button
            onClick={handleSlipUpload}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            ✅ Confirm Slip Upload
          </button>
        )}

        {message && (
          <p className={`text-center mt-4 text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
