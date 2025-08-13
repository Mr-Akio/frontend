'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ====== ENV / URL ======
const API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
  return raw.endsWith('/') ? raw : raw + '/';
})();
const IMG_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_IMG_BASE || 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();


const PROFILE_GET_URL = `${API_BASE}users/profile/`;         
const PROFILE_UPDATE_URL = `${API_BASE}users/profile/update/`; 

// ====== Upload rules ======
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_MB = 3;

function buildImageUrl(path?: string | null) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${IMG_BASE}${p}`;
}

export default function UserProfile() {
  const [form, setForm] = useState({
    name: '',
    dob: '',
    gender: '',
    phone: '',
    passport_no: '',
    nationality: '',
    address: '',
    email: '',
    profile_picture: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : ''), [avatarFile]);

  // ====== Auth helpers ======
  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return null;
    const res = await fetch(`${API_BASE}token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access', data.access);
      return data.access as string;
    }
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login';
    return null;
  };

  // ----- GET profile -----
  const fetchProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch(PROFILE_GET_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        const newToken = await refreshToken();
        if (newToken) return fetchProfile(newToken);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setForm({
        name: data?.username || '',
        dob: data?.birth_date || '',
        gender: data?.gender || '',
        phone: data?.phone || '',
        passport_no: data?.passport_no || '',
        nationality: data?.nationality || '',
        address: data?.address || '',
        email: data?.email || '',
        profile_picture: data?.profile_picture || '',
      });
      setMessage('');
    } catch {
      setMessage('❌ Failed to load profile.');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) fetchProfile(token);
  }, [fetchProfile]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onClickChangeAvatar = () => fileInputRef.current?.click();

  const handleAvatarSelect = (file: File | null) => {
    setMessage('');
    if (!file) return setAvatarFile(null);
    if (!ALLOWED_MIME.includes(file.type)) {
      setMessage('❌ Allowed file types: JPG, PNG, WEBP');
      return setAvatarFile(null);
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setMessage(`❌ Max file size: ${MAX_FILE_MB} MB`);
      return setAvatarFile(null);
    }
    setAvatarFile(file);
  };

  
  const updateProfile = async (token: string, fd: FormData) => {
    return fetch(PROFILE_UPDATE_URL, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    if (!token) return;

    setSaving(true);
    setMessage('');

    try {
    
      const fd = new FormData();
      if (form.name) fd.append('name', form.name);
      if (form.dob) fd.append('dob', form.dob); 
      if (form.gender) fd.append('gender', form.gender);
      if (form.phone) fd.append('phone', form.phone);
      if (form.passport_no) fd.append('passport_no', form.passport_no);
      if (form.nationality) fd.append('nationality', form.nationality);
      if (form.address) fd.append('address', form.address);
      if (form.email) fd.append('email', form.email);
      if (avatarFile) fd.append('profile_picture', avatarFile);

      let res = await updateProfile(token, fd);

      if (res.status === 401) {
        const newToken = await refreshToken();
        if (newToken) res = await updateProfile(newToken, fd);
      }

      if (!res.ok) {
        const text = await res.text();
        console.warn('Update failed:', text);
        setMessage('❌ Failed to save profile.');
        setSaving(false);
        return;
      }

      setMessage('✅ Profile saved successfully.');
      setSaving(false);
      setAvatarFile(null);
      fetchProfile(localStorage.getItem('access') || '');
    } catch {
      setSaving(false);
      setMessage('❌ Error while saving.');
    }
  };

  const avatarDisplay = previewUrl || buildImageUrl(form.profile_picture) || '/images/profile.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6 pt-24">
      <div className="max-w-5xl mx-auto mt-6">
        {message && (
          <p
            className={`text-sm mb-4 text-center font-medium rounded py-2 px-3 ${
              message.startsWith('✅')
                ? 'text-green-700 bg-green-50 border border-green-200'
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}
          >
            {message}
          </p>
        )}

        <div className="bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-4 overflow-hidden border border-orange-100">
          {/* Sidebar */}
          <aside className="bg-gradient-to-b from-orange-50 to-white border-r border-orange-100 p-8 flex flex-col items-center">
            <div className="relative w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-orange-200 shadow">
              <Image src={avatarDisplay} alt="Profile" fill className="object-cover" />
            </div>

            <button
              onClick={onClickChangeAvatar}
              className="bg-orange-500 px-3 py-1.5 rounded-full text-white text-xs shadow hover:bg-orange-600 transition"
              type="button"
            >
              Change photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_MIME.join(',')}
              className="hidden"
              onChange={(e) => handleAvatarSelect(e.target.files?.[0] || null)}
            />

            <h2 className="text-center font-semibold text-orange-700 text-lg mt-4">
              {form.name || 'Your name'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">🎂 {form.dob || '-'}</p>
          </aside>

          {/* Form */}
          <div className="md:col-span-3 p-8 bg-white">
            <h3 className="font-semibold text-orange-700 mb-6 text-lg">Personal Information</h3>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-700 font-medium">Full Name</label>
                <input
                  name="name"
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-orange-400 outline-none transition"
                >
                  <option value="">— Select gender —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">Phone</label>
                <input
                  name="phone"
                  placeholder="e.g. +66 8x xxxx xxx"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">Passport / ID No.</label>
                <input
                  name="passport_no"
                  placeholder="e.g. AA1234567"
                  value={form.passport_no}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">Nationality</label>
                <select
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-orange-400 outline-none transition"
                >
                  <option value="">— Select nationality —</option>
                  <option value="Thai">Thai</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Chinese">Chinese</option>
                  <option value="American">American</option>
                  <option value="British">British</option>
                  <option value="Australian">Australian</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-700 font-medium">Address</label>
                <input
                  name="address"
                  placeholder="House No., Street, City, Country"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-400 outline-none transition"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-orange-500 text-white px-6 py-2 rounded-lg mt-4 font-semibold shadow hover:bg-orange-600 transition ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>

            {/* Security */}
            <h3 className="font-semibold text-orange-700 my-6 text-lg">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-700 font-medium">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2.5 mt-1 border border-orange-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-400 outline-none transition"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="button" className="bg-orange-500 text-white px-6 py-2 rounded-lg mt-4 font-semibold shadow hover:bg-orange-600 transition">
                  Update Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
