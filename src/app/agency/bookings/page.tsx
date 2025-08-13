'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Booking, BookingStatus } from '@/types';
import AgencyShell from '@/components/agency/Shell';

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err ?? 'Unknown error'));
}

const StatusPill = ({ s }: { s: BookingStatus }) => {
  const map: Record<BookingStatus, string> = {
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    confirmed: 'bg-green-50 text-green-700 ring-green-200',
    cancelled: 'bg-red-50 text-red-700 ring-red-200',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ${map[s]}`}>{s}</span>;
};

export default function AgencyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Booking[]>('/api/users/agency/bookings/')
      .then((d) => setItems(d))
      .catch((err: unknown) => setMsg(asError(err).message || 'Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: BookingStatus) => {
    try {
      await api.patch<Booking>(`/api/users/agency/bookings/${id}/status/`, { status });
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err: unknown) {
      alert(asError(err).message || 'Update failed');
    }
  };

  return (
    <AgencyShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-orange-600">Bookings</h1>
          <p className="text-sm text-gray-500">Approve or cancel customer bookings.</p>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-8 text-orange-600">Loading…</div>
        ) : msg ? (
          <div className="rounded-2xl border bg-white p-8 text-red-600">{msg}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-white">
            <div className="grid grid-cols-12 gap-4 border-b bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-700">
              <div className="col-span-4">Package</div>
              <div className="col-span-2">Travel Date</div>
              <div className="col-span-2 text-center">People</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <ul className="divide-y">
              {items.map((b) => (
                <li key={b.id} className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm">
                  <div className="col-span-4">
                    <div className="font-medium">{b.package.title}</div>
                    <div className="text-xs text-gray-500">{b.package.location}</div>
                  </div>
                  <div className="col-span-2">{b.travel_date}</div>
                  <div className="col-span-2 text-center">{b.number_of_people}</div>
                  <div className="col-span-2">
                    <StatusPill s={b.status} />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => updateStatus(b.id, 'confirmed')}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200 hover:bg-green-100"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AgencyShell>
  );
}
