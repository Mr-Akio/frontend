
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      const msg = "Passwords don't match";
      setError(msg);
      toast.error(msg, {
        style: { fontSize: '1.125rem' },
        className: 'text-center font-semibold',
      });
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        toast.success('🎉 Registration successful! Please verify your email before logging in.', {
          duration: 5000,
          className: 'text-center font-bold bg-blue-500 text-white py-4 rounded-lg shadow-lg',
        });
        setTimeout(() => router.push('/login'), 3000);
      } else {
        
        const errorMsg =
          data?.detail ||
          Object.values(data).flat().join(' ') ||
          'Registration failed';

        setError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          style: { fontSize: '1.125rem' },
          className: 'text-center font-semibold bg-red-500 text-white py-4 rounded-lg shadow-lg',
        });
      }
    } catch  {
      toast.error('Cannot connect to the server.', {
        style: { fontSize: '1.125rem' },
        className: 'text-center font-semibold bg-yellow-500 text-white py-4 rounded-lg shadow-lg',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-300">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex w-3/4 bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="w-1/2 p-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Get Started 🚀</h2>
          <p className="text-gray-500 mb-6 text-center">Create your account</p>

          <div className="flex flex-col space-y-3 mb-6 w-full max-w-sm">
            <button className="flex items-center justify-center border px-5 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-all w-full">
              <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 mr-2 text-red-500" /> Sign up with Google
            </button>
            <button className="flex items-center justify-center border px-5 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-all w-full">
              <FontAwesomeIcon icon={faFacebook} className="w-5 h-5 mr-2 text-blue-600" /> Sign up with Facebook
            </button>
          </div>

          <div className="relative my-6 w-full text-center flex items-center">
            <span className="flex-1 border-t"></span>
            <span className="px-3 text-gray-500">Or sign up with</span>
            <span className="flex-1 border-t"></span>
          </div>

          <form className="w-full space-y-4 max-w-sm" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-gray-700 font-medium">Username</span>
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full p-3 border text-black border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-orange-400"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Email</span>
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full p-3 border text-black border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-orange-400"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full p-3 border text-black border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-orange-400"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Confirm Password</span>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full p-3 border text-black border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-orange-400"
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </label>

            {error && <p className="text-red-500 text-sm mt-1">❗ {error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg mt-4 hover:bg-orange-600 transition-all shadow-md"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
          </p>
        </div>

        <div
          className="w-1/2 h-auto min-h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/ian-dooley-hpTH5b6mo2s-unsplash.jpg')" }}
        ></div>
      </div>
    </div>
  );
}
