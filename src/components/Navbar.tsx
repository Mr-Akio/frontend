'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa';
import { useCurrency } from '@/providers/CurrencyProvider';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const token = localStorage.getItem('access');
    setIsLoggedIn(!!token);

    if (token) {
      fetch('http://localhost:8000/api/users/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then((data) => setUserInfo({ username: data.username || '', email: data.email || '' }))
        .catch(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <nav className="absolute top-0 left-0 w-full px-8 py-5 z-50 bg-black/30 backdrop-blur-md text-white">
      <div className="relative flex items-center">

        <div className="text-2xl font-bold absolute left-0">🌍 Booking & Travel</div>

        <ul className="flex-1 flex justify-center space-x-8 uppercase text-lg font-semibold">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/packagesList">Packages</Link></li>
          <li><Link href="/blog">BLOG</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>

        <div className="absolute right-0 flex items-center gap-3">
         
          <div className="flex items-center rounded-full bg-white/15 px-1 py-1">
            <button
              onClick={() => setCurrency('THB')}
              className={`px-3 py-1 rounded-full text-sm ${currency === 'THB' ? 'bg-white text-black' : 'text-white/80'}`}
              aria-pressed={currency === 'THB'}
            >
              THB
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-full text-sm ${currency === 'USD' ? 'bg-white text-black' : 'text-white/80'}`}
              aria-pressed={currency === 'USD'}
            >
              USD
            </button>
          </div>

          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center w-10 h-10 rounded-full">
                <FaUserCircle size={40} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-gray-800 text-white rounded-xl shadow-xl z-50 text-base">
                  <div className="p-4 border-b border-gray-700">
                    <p className="font-bold text-lg">{userInfo.username || 'User'}</p>
                    <p className="text-sm text-gray-400">{userInfo.email || 'email@example.com'}</p>
                  </div>
                  <ul className="p-2 space-y-2">
                    <li>
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-700 rounded-md">
                        Edit Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/booking/my" className="block px-4 py-2 hover:bg-gray-700 rounded-md">
                        My Bookings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md"
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-full font-semibold text-white text-lg"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
