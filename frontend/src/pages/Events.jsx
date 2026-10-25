import React, { useEffect, useState } from 'react';
import { Clock3, History } from 'lucide-react';
import client, { normalizeError } from '../api/client.js';
import SectionIntro from '../components/SectionIntro.jsx';
import EventCard from '../features/events/EventCard.jsx';
import { EventCardSkeleton } from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Events() {
  const [scope, setScope] = useState('upcoming');
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
    <div>
      <section className="border-b border-[#ded2c1] bg-[#f7f2e9]">
        <div className="editorial-container py-14 md:py-20">
          <SectionIntro
            eyebrow="Agenda Himar"
            title="Kegiatan kecil yang membuat kedai terasa ramai."
            description="Simpan jadwal yang ingin kamu datangi, lalu ajak teman untuk bertemu di Himar."
          />
        </div>
      </section>

      <section className="section-space">
        <div className="editorial-container">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-[#ded2c1]" role="tablist" aria-label="Filter jadwal event">
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'upcoming'}
              onClick={() => setScope('upcoming')}
              className={`relative inline-flex min-h-12 items-center gap-2 text-sm ${scope === 'upcoming' ? 'font-semibold text-[#b5532c]' : 'text-[#6b625b]'}`}
            >
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Mendatang
              {scope === 'upcoming' && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#b5532c]" aria-hidden="true" />}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'past'}
              onClick={() => setScope('past')}
              className={`relative inline-flex min-h-12 items-center gap-2 text-sm ${scope === 'past' ? 'font-semibold text-[#b5532c]' : 'text-[#6b625b]'}`}
            >
              <History className="h-4 w-4" aria-hidden="true" />
              Sudah berlalu
              {scope === 'past' && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#b5532c]" aria-hidden="true" />}
            </button>
          </div>

          <div className="mt-12">
            {error ? (
              <ErrorMessage message={error} onRetry={fetchEvents} />
            ) : loading ? (
              <div className="grid gap-5 md:grid-cols-3">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                title={scope === 'upcoming' ? 'Belum ada event mendatang' : 'Belum ada arsip event'}
                description={scope === 'upcoming' ? 'Jadwal baru akan muncul setelah dipublikasikan dari panel admin.' : 'Riwayat kegiatan yang sudah selesai akan muncul di sini.'}
              />
            ) : (
              <div className="grid gap-10">
                <EventCard event={events[0]} featured />
                {events.length > 1 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    {events.slice(1).map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
