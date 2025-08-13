'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  passport: string;
  nationality: string;
  gender: string;
  dob: string;
  note: string;
  agencyRef: string; 
};

const NATIONALITIES = [
  'Thai',
  'Japanese',
  'Korean',
  'Chinese',
  'American',
  'British',
  'Australian',
  'French',
  'German',
  'Other',
];

export default function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    passport: '',
    nationality: '',
    gender: '',
    dob: '',
    note: '',
    agencyRef: '',
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) return;

    fetch('http://localhost:8000/api/users/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          fullName: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          passport: data.passport_no || '',
          nationality: data.nationality || '',
          gender: data.gender || '',
          dob: data.birth_date || '',
        }));
      })
      .catch(() => {
        console.error('❌ Error loading profile');
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('access');
    if (!token || !bookingId) {
      setMessage('❌ Please log in first.');
      return;
    }

    const fullNote = `
Name: ${form.fullName}
Email: ${form.email}
Phone: ${form.phone}
Passport: ${form.passport}
Gender: ${form.gender || '-'}
Nationality: ${form.nationality}
Date of Birth: ${form.dob}
Agency Referral No.: ${form.agencyRef || '-'}
Note: ${form.note || '-'}
    `.trim();

    try {
      const res = await fetch(
        `http://localhost:8000/api/users/bookings/update/${bookingId}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note: fullNote }),
        }
      );

      if (res.ok) {
        setMessage('✅ Saved successfully! Redirecting to payment...');
        setTimeout(() => {
          router.push(`/payment?booking_id=${bookingId}`);
        }, 1200);
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          setMessage(`❌ ${err.detail || 'Failed to save booking information.'}`);
        } catch {
          console.error('❌ Response is not JSON:', text);
          setMessage('❌ Server returned an invalid response.');
        }
      }
    } catch {
      setMessage('❌ Failed to connect to the server.');
      console.error('❌ Request failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            Confirm Booking Information
          </h1>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="e.g. Jane Doe"
              value={form.fullName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
            <input
              name="phone"
              type="text"
              placeholder="+66 8x xxxx xxx"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Passport */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Passport / ID Number
            </label>
            <input
              name="passport"
              type="text"
              placeholder="e.g. AA1234567"
              value={form.passport}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Gender (select) */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">— Select gender —</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {/* Nationality (select) */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Nationality</label>
            <select
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">— Select nationality —</option>
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* DOB */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              name="dob"
              type="date"
              placeholder="YYYY-MM-DD"
              value={form.dob}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Agency Referral */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Agency Referral No. (optional)
            </label>
            <input
              name="agencyRef"
              type="text"
              placeholder="e.g. AGC-2024-0001"
              value={form.agencyRef}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Additional Notes (Optional)
            </label>
            <textarea
              name="note"
              rows={4}
              placeholder="e.g. Vegetarian meal, allergic to peanuts, request for baby seat, etc."
              value={form.note}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
          >
            Proceed to Payment
          </button>

          {message && (
            <p
              className={`text-center mt-4 text-sm ${
                message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
