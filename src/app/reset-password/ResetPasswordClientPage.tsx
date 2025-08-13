'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error('❗ Passwords do not match');
      return;
    }

    const res = await fetch('http://localhost:8000/api/users/reset-password-confirm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, new_password: password }),
    });

    if (res.ok) {
      toast.success('🎉 Password reset successful!');
      router.push('/login');
    } else {
      toast.error('❌ Invalid or expired link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-300 px-4">
      <Toaster />
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-500 rounded-full mx-auto mb-4 text-2xl">
          🔐
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-6">
          Set a new password to access your account again.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-gray-700 font-medium mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-all"
          >
            Reset Password
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <a href="/login" className="text-orange-500 hover:underline font-semibold">
            Go back to login
          </a>
        </p>
      </div>
    </div>
  );
}
