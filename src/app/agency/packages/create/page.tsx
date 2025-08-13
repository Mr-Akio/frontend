'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err ?? 'Unknown error'));
}

export default function CreatePackagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [available, setAvailable] = useState(true);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    
    fd.set('available', String(available));

    
    const imagesInput = formEl.elements.namedItem('images') as HTMLInputElement | null;
    if (imagesInput?.files?.length) {
      
      fd.delete('images');
      Array.from(imagesInput.files).forEach((f) => fd.append('images', f));
    }

    

    try {
      await api.post<unknown>('/api/users/agency/packages/create/', fd);
      router.push('/agency/packages');
    } catch (err: unknown) {
      setMsg(asError(err).message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-orange-600">Create Package</h1>
      {msg && <p className="mb-4 text-red-600">{msg}</p>}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-6">
        {/* toggle available */}
        <div className="flex items-center justify-between rounded-xl bg-orange-50 p-3">
          <div className="space-y-0.5">
            <div className="font-semibold text-orange-700">Visibility</div>
            <div className="text-sm text-orange-700/80">
              {available ? 'Available' : 'Unavailable'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAvailable((v) => !v)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              available ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                available ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <input name="title" placeholder="Title" className="w-full rounded-xl border p-3" required />
        <textarea name="description" placeholder="Description" className="w-full rounded-xl border p-3" required />
        <input name="price" type="number" step="0.01" placeholder="Price (THB)" className="w-full rounded-xl border p-3" required />
        <input name="location" placeholder="Location (City, Country)" className="w-full rounded-xl border p-3" required />

        <div className="grid grid-cols-2 gap-4">
          <input name="start_date" type="date" className="w-full rounded-xl border p-3" required />
          <input name="end_date" type="date" className="w-full rounded-xl border p-3" required />
        </div>

        <input name="slots" type="number" min={1} placeholder="Slots (e.g. 20)" className="w-full rounded-xl border p-3" required />

        <textarea name="activities" placeholder="Activities (one per line, optional)" className="w-full rounded-xl border p-3" />
        <textarea name="includes" placeholder="Includes (one per line, optional)" className="w-full rounded-xl border p-3" />
        <textarea name="excludes" placeholder="Excludes (one per line, optional)" className="w-full rounded-xl border p-3" />
        <input name="duration_detail" placeholder="Duration detail (e.g. 2 days 1 night)" className="w-full rounded-xl border p-3" />
        <input name="group_size" placeholder="Group size (e.g. up to 8 people)" className="w-full rounded-xl border p-3" />
        <input name="languages" placeholder="Languages (e.g. EN, TH, JP)" className="w-full rounded-xl border p-3" />
        <input name="meeting_point" placeholder="Meeting point (address, GPS, etc.)" className="w-full rounded-xl border p-3" />

        
        <div>
          <label className="mb-1 block text-sm text-gray-700">Cover image (single)</label>
          <input name="image" type="file" accept="image/*" className="w-full rounded-xl border p-3" />
          <p className="mt-1 text-xs text-gray-500">Accepted: JPG/PNG/WEBP</p>
        </div>

        
        <div>
          <label className="mb-1 block text-sm text-gray-700">Map image (single)</label>
          <input name="map_image" type="file" accept="image/*" className="w-full rounded-xl border p-3" />
          <p className="mt-1 text-xs text-gray-500">Accepted: JPG/PNG/WEBP — show on package page (Map card)</p>
        </div>

       
        <div>
          <label className="mb-1 block text-sm text-gray-700">Gallery images (multiple)</label>
          <input name="images" type="file" accept="image/*" multiple className="w-full rounded-xl border p-3" />
          <p className="mt-1 text-xs text-gray-500">You can select multiple files</p>
        </div>

        <div className="flex justify-end">
          <button
            disabled={saving}
            className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
