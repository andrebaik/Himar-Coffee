import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import client, { normalizeError } from '../api/client.js';
import EventCard from '../features/events/EventCard.jsx';
import { EventCardSkeleton } from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Events() {
  const [scope, setScope] = useState('upcoming'); // 'upcoming' | 'past'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get(`/events?scope=${scope}`);
      setEvents(res.data.data || []);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [scope]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider text-[#6F8F72] font-semibold block mb-1">
          Agenda & Komunitas
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2B1B12]">
          Jadwal Event & Workshop
        </h1>
        <p className="text-xs md:text-sm text-[#2B1B12]/70 mt-1 max-w-xl">
          Ikuti berbagai kegiatan seru di Himar Coffee: live music acoustic, kelas latte art, hingga temu komunitas kopi Garut.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7DCCB] gap-4">
        <button
          onClick={() => setScope('upcoming')}
          className={`pb-3 text-xs md:text-sm font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
            scope === 'upcoming'
              ? 'border-[#B5532C] text-[#B5532C]'
              : 'border-transparent text-[#2B1B12]/60 hover:text-[#2B1B12]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Event Mendatang
        </button>

        <button
          onClick={() => setScope('past')}
          className={`pb-3 text-xs md:text-sm font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
            scope === 'past'
              ? 'border-[#B5532C] text-[#B5532C]'
              : 'border-transparent text-[#2B1B12]/60 hover:text-[#2B1B12]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Sudah Berlalu
        </button>
      </div>

      {/* Events List */}
      {error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={scope === 'upcoming' ? 'Belum Ada Event Mendatang' : 'Belum Ada Arsip Event'}
          description={
            scope === 'upcoming'
              ? 'Saat ini belum ada jadwal event baru. Pantau terus akun Instagram kami untuk update terbaru.'
              : 'Belum ada catatan event yang telah selesai.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
}
