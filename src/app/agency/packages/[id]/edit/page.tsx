'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, mediaUrl } from '@/lib/api';
import type { TourPackage } from '@/types';
import AgencyShell from '@/components/agency/Shell';

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err ?? 'Unknown error'));
}

function dateForInput(d?: string | null) {
  if (!d) return '';
  
  return d.slice(0, 10);
}

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<TourPackage | null>(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  
  const [available, setAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await api.get<TourPackage>(`/api/users/agency/packages/${id}/`);
        setItem(data);
        
        setAvailable(Boolean((data as any).available));
      } catch (err: unknown) {
        setMsg(asError(err).message || 'Load failed');
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setMsg('');

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

   
    fd.set('available', String(available));

   
    const imageInput = formEl.elements.namedItem('image') as HTMLInputElement | null;
    if (!imageInput?.files?.length) fd.delete('image');

    const mapInput = formEl.elements.namedItem('map_image') as HTMLInputElement | null;
    if (!mapInput?.files?.length) fd.delete('map_image');

    
    const galleryInput = formEl.elements.namedItem('images') as HTMLInputElement | null;
    if (galleryInput?.files?.length) {
      fd.delete('images');
      Array.from(galleryInput.files).forEach((f) => fd.append('images', f));
    } else {
    
      fd.delete('images');
    }

    try {
      
      await api.patch<unknown>(`/api/users/agency/packages/${id}/`, fd);
      router.push('/agency/packages');
    } catch (err: unknown) {
      setMsg(asError(err).message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AgencyShell>
      {!item ? (
        <div className="rounded-2xl border bg-white p-8">{msg || 'Loading…'}</div>
      ) : (
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-extrabold text-orange-600">Edit Package</h1>
          {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
           
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

           
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="title"
                defaultValue={item.title}
                placeholder="Title"
                className="w-full rounded-xl border p-3"
                required
              />
              <input
                name="location"
                defaultValue={item.location}
                placeholder="Location (City, Country)"
                className="w-full rounded-xl border p-3"
                required
              />
              <textarea
                name="description"
                defaultValue={item.description}
                placeholder="Description"
                className="md:col-span-2 w-full rounded-xl border p-3"
                required
              />
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={String(item.price ?? '')}
                placeholder="Price (THB)"
                className="w-full rounded-xl border p-3"
                required
              />
              <input
                name="slots"
                type="number"
                min={1}
                defaultValue={String(item.slots ?? 1)}
                placeholder="Slots (e.g. 20)"
                className="w-full rounded-xl border p-3"
                required
              />
              <input
                name="start_date"
                type="date"
                defaultValue={dateForInput(item.start_date)}
                className="w-full rounded-xl border p-3"
                required
              />
              <input
                name="end_date"
                type="date"
                defaultValue={dateForInput(item.end_date)}
                className="w-full rounded-xl border p-3"
                required
              />
              <textarea
                name="activities"
                defaultValue={(item as any)?.activities?.join?.('\n') ?? ''}
                placeholder="Activities (one per line)"
                className="md:col-span-2 w-full rounded-xl border p-3"
              />
              <textarea
                name="includes"
                defaultValue={(item as any)?.includes?.join?.('\n') ?? ''}
                placeholder="Includes (one per line)"
                className="md:col-span-2 w-full rounded-xl border p-3"
              />
              <textarea
                name="excludes"
                defaultValue={(item as any)?.excludes?.join?.('\n') ?? ''}
                placeholder="Excludes (one per line)"
                className="md:col-span-2 w-full rounded-xl border p-3"
              />
              <input
                name="duration_detail"
                defaultValue={(item as any)?.duration_detail ?? ''}
                placeholder="Duration detail (e.g. 2 days 1 night)"
                className="w-full rounded-xl border p-3"
              />
              <input
                name="group_size"
                defaultValue={(item as any)?.group_size ?? ''}
                placeholder="Group size (e.g. up to 8 people)"
                className="w-full rounded-xl border p-3"
              />
              <input
                name="languages"
                defaultValue={(item as any)?.languages ?? ''}
                placeholder="Languages (e.g. EN, TH, JP)"
                className="w-full rounded-xl border p-3"
              />
              <input
                name="meeting_point"
                defaultValue={(item as any)?.meeting_point ?? ''}
                placeholder="Meeting point (address, GPS, etc.)"
                className="w-full rounded-xl border p-3"
              />
            </div>

           
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Cover image (single)
                </label>
                {item.image && (
                  <div className="mb-2">
                    <img
                      src={mediaUrl(item.image)}
                      alt="current cover"
                      className="h-28 w-44 rounded-lg object-cover"
                    />
                    <p className="mt-1 text-xs text-gray-500">Current cover</p>
                  </div>
                )}
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border p-3"
                />
                <p className="mt-1 text-xs text-gray-500">Accepted: JPG/PNG/WEBP</p>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Map image (single)
                </label>
                {(item as any)?.map_image && (
                  <div className="mb-2">
                    <img
                      src={mediaUrl((item as any).map_image)}
                      alt="current map"
                      className="h-28 w-44 rounded-lg object-cover"
                    />
                    <p className="mt-1 text-xs text-gray-500">Current map image</p>
                  </div>
                )}
                <input
                  name="map_image"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border p-3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Accepted: JPG/PNG/WEBP — show on package page (Map card)
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">
                Gallery images (multiple)
              </label>
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="w-full rounded-xl border p-3"
              />
              
            </div>

            <div className="flex justify-end">
              <button
                disabled={saving}
                className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AgencyShell>
  );
}
