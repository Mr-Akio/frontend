'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AgencyProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
  
}

export default function AgencyProfilePage() {
  const [profile, setProfile] = useState<AgencyProfile>({});
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<AgencyProfile>('/api/users/profile/')
      .then(setProfile)
      .catch((e) => setMsg(e.message || 'Load failed'));
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const fd = new FormData(e.currentTarget);
    try {
      await api.put<unknown>('/api/users/profile/update/', fd);
      setMsg('Saved');
    } catch (e: unknown) {
      const err = e as Error;
      setMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agency Profile</h1>
      {msg && <p className="mb-4">{msg}</p>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="first_name" defaultValue={profile.first_name} className="border p-2 w-full" placeholder="First name" />
        <input name="last_name"  defaultValue={profile.last_name}  className="border p-2 w-full" placeholder="Last name" />
        <input name="phone"      defaultValue={profile.phone}      className="border p-2 w-full" placeholder="Phone" />
        <button disabled={saving} className="bg-orange-500 text-white px-4 py-2 rounded">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
