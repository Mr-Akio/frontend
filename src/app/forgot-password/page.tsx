'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/users/reset-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success('📩 Password reset link has been sent to your email');
    } else {
      toast.error(data.detail || '❌ Email not found in the system');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white bg-gradient-to-r from-orange-100 to-orange-300">
      <Toaster />
      <div className="w-full max-w-md p-8 rounded-2xl shadow-md border border-orange-200 text-center bg-white">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 flex items-center justify-center rounded-full text-xl">
            🔐
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot password?</h1>
        <p className="text-gray-500 mb-6">No worries, we’ll send you reset instructions.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 text-black bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-semibold transition-all disabled:opacity-50"
            disabled={!email}
          >
            Reset password
          </button>
        </form>

        <button
          onClick={() => router.push('/login')}
          className="text-sm text-orange-500 mt-6 hover:underline flex items-center justify-center"
        >
          ← Back to log in
        </button>
      </div>
    </div>
  );
}
