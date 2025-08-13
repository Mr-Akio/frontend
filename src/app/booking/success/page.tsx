'use client';

import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <div className="max-w-xl mx-auto text-center py-16 px-4">
      <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Booking Successful!</h1>
      <p className="text-gray-700 mb-6">
        We have received your payment information. Please wait while our staff verifies your slip.
      </p>
      <Link
        href="/booking/my"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
      >
        View My Bookings
      </Link>
    </div>
  );
}
