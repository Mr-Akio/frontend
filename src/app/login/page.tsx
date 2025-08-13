'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { toast, Toaster } from 'react-hot-toast';
import { API_BASE, api, setToken } from '@/lib/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.detail || 'Invalid credentials');
        return;
      }

      setToken(data.access);
     
      if (remember) localStorage.setItem('refresh', data.refresh);

      const me = await api.get<{ is_agency: boolean }>('/api/users/profile/');
      toast.success('🎉 Login successful!', { duration: 1200 });
      router.replace(me.is_agency ? '/agency' : '/');
    } catch {
      toast.error('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-300">
      <Toaster position="top-center" />
      <div className="flex w-[90%] max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left: form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center bg-white">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-2">Welcome Back 👋</h2>
          <p className="text-lg text-gray-500 mb-8 text-center">Sign in to continue</p>

          <div className="flex flex-col space-y-4 mb-6 w-full max-w-sm">
            <button className="flex items-center justify-center border px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-all text-lg">
              <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 mr-3 text-red-500" />
              Sign in with Google
            </button>
            <button className="flex items-center justify-center border px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-all text-lg">
              <FontAwesomeIcon icon={faFacebook} className="w-5 h-5 mr-3 text-blue-600" />
              Sign in with Facebook
            </button>
          </div>

          <div className="relative my-6 w-full text-center flex items-center">
            <span className="flex-1 border-t" />
            <span className="px-4 text-gray-500 text-lg">Or continue with</span>
            <span className="flex-1 border-t" />
          </div>

          <form className="w-full space-y-6 max-w-sm" onSubmit={handleLogin}>
            <label className="block text-lg">
              <span className="text-gray-700 font-semibold">Email</span>
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-lg mt-2 text-lg text-black focus:ring-2 focus:ring-orange-400"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>

            <label className="block text-lg">
              <span className="text-gray-700 font-semibold">Password</span>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-4 border border-gray-300 rounded-lg mt-2 text-lg text-black focus:ring-2 focus:ring-orange-400"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>

            <div className="flex items-center justify-between -mt-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              
              <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-500 text-white text-lg font-bold rounded-lg hover:bg-orange-600 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-base text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right: image */}
        <div
          className="hidden md:block w-1/2 h-auto min-h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ian-dooley-hpTH5b6mo2s-unsplash.jpg')" }}
        />
      </div>
    </div>
  );
}
