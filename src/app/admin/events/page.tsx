'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminGuard from '@/components/admin/AdminGuard';
import { supabase } from '@/lib/supabaseBrowser';
import Link from 'next/link';
import {
  HackEvent,
  doEventsOverlap,
  compareByStartThenEnd,
  getEventStatus,
} from '@/lib/eventUtils';

type Draft = Omit<HackEvent, 'id'> & { id?: string };

function OverlapWarnings({ events }: { events: HackEvent[] }) {
  const overlaps = useMemo(() => {
    const list: [HackEvent, HackEvent][] = [];
    const sorted = [...events].sort(compareByStartThenEnd);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].category !== sorted[j].category) continue; // allow different categories to overlap
        if (doEventsOverlap(sorted[i], sorted[j]))
          list.push([sorted[i], sorted[j]]);
      }
    }
    return list;
  }, [events]);
  if (overlaps.length === 0) return null;
  return (
    <div className='mb-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm'>
      <div className='font-semibold mb-1'>Overlap warnings</div>
      <ul className='list-disc list-inside space-y-1'>
        {overlaps.map(([a, b], idx) => (
          <li key={idx}>
            {a.name} ({a.category}) overlaps with {b.name} ({b.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<HackEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({
    id: undefined,
    name: '',
    description: '',
    category: 'innovation',
    type: 'registration',
    start_at: new Date().toISOString(),
    end_at: new Date(Date.now() + 3600_000).toISOString(),
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetch('/api/events', { cache: 'no-store' }).then(
        r => r.json()
      );
      setEvents((data || []) as HackEvent[]);
    } catch (e) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const method = draft.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/events', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      setDraft({
        id: undefined,
        name: '',
        description: '',
        category: 'innovation',
        type: 'registration',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600_000).toISOString(),
      });
      await fetchEvents();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (e: HackEvent) => {
    setDraft({ ...e });
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch(
        `/api/admin/events?id=${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to delete');
      await fetchEvents();
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort(compareByStartThenEnd);
  }, [events]);

  return (
    <AdminGuard>
      <div className='min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-6'>
        <div className='max-w-6xl mx-auto space-y-6'>
          <h1 className='text-2xl font-bold'>Events Management</h1>

          {/* Navigation Tabs to match other admin pages */}
          <div className='flex flex-col sm:flex-row sm:space-x-1 border-b border-gray-700 overflow-x-auto'>
            <Link href='/admin/overview'>
              <button className='px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5'>
                Overview
              </button>
            </Link>
            <Link href='/admin/submissions'>
              <button className='px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5'>
                Submissions
              </button>
            </Link>
            <Link href='/admin/round2'>
              <button className='px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5'>
                Round 2
              </button>
            </Link>
            <Link href='/admin/results'>
              <button className='px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5'>
                Results
              </button>
            </Link>
            <Link href='/admin/events'>
              <button className='px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-300 whitespace-nowrap bg-blue-500/20 text-blue-300 border-b-3 border-blue-400 shadow-sm'>
                Events
              </button>
            </Link>
            <Link href='/admin/settings'>
              <button className='px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5'>
                Settings
              </button>
            </Link>
          </div>

          {error && (
            <div className='rounded border border-red-400/40 bg-red-500/10 p-3 text-sm'>
              {error}
            </div>
          )}

          <Card className='bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'>
            <CardContent className='p-4 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={draft.name}
                    onChange={e =>
                      setDraft(d => ({ ...d, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className='w-full bg-gray-900 border border-gray-700 rounded-md p-2'
                    value={draft.category}
                    onChange={e =>
                      setDraft(d => ({ ...d, category: e.target.value as any }))
                    }
                  >
                    <option value='innovation'>Innovation</option>
                    <option value='rebrand'>ReBrand</option>
                  </select>
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className='w-full bg-gray-900 border border-gray-700 rounded-md p-2'
                    value={draft.type}
                    onChange={e =>
                      setDraft(d => ({ ...d, type: e.target.value as any }))
                    }
                  >
                    <option value='registration'>registration</option>
                    <option value='proposal'>proposal</option>
                    <option value='wireframe'>wireframe</option>
                    <option value='final'>final</option>
                    <option value='judging'>judging</option>
                    <option value='ceremony'>ceremony</option>
                    <option value='workshop'>workshop</option>
                    <option value='awareness'>awareness</option>
                    <option value='announcement'>announcement</option>
                    <option value='meeting'>meeting</option>
                    <option value='other'>other</option>
                  </select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={draft.description || ''}
                    onChange={e =>
                      setDraft(d => ({ ...d, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Start</Label>
                  <Input
                    type='datetime-local'
                    value={(function () {
                      if (!draft.start_at) return '';
                      const d = new Date(draft.start_at);
                      return isNaN(d.getTime())
                        ? ''
                        : new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16);
                    })()}
                    onChange={e =>
                      setDraft(d => ({
                        ...d,
                        start_at: (function () {
                          const v = e.target.value;
                          if (!v) return '' as any;
                          const parsed = new Date(v);
                          if (isNaN(parsed.getTime())) return d.start_at;
                          return new Date(parsed).toISOString();
                        })(),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>End</Label>
                  <Input
                    type='datetime-local'
                    value={(function () {
                      if (!draft.end_at) return '';
                      const d = new Date(draft.end_at);
                      return isNaN(d.getTime())
                        ? ''
                        : new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16);
                    })()}
                    onChange={e =>
                      setDraft(d => ({
                        ...d,
                        end_at: (function () {
                          const v = e.target.value;
                          if (!v) return '' as any;
                          const parsed = new Date(v);
                          if (isNaN(parsed.getTime())) return d.end_at;
                          return new Date(parsed).toISOString();
                        })(),
                      }))
                    }
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Button onClick={save} disabled={loading}>
                  {draft.id ? 'Update Event' : 'Create Event'}
                </Button>
                {draft.id && (
                  <Button
                    variant='outline'
                    onClick={() =>
                      setDraft({
                        id: undefined,
                        name: '',
                        description: '',
                        category: 'innovation',
                        type: 'registration',
                        start_at: new Date().toISOString(),
                        end_at: new Date(Date.now() + 3600_000).toISOString(),
                      })
                    }
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
              <OverlapWarnings events={events} />
            </CardContent>
          </Card>

          <Card className='bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-gray-700 text-left'>
                    <tr>
                      <th className='px-4 py-2'>Name</th>
                      <th className='px-4 py-2'>Category</th>
                      <th className='px-4 py-2'>Type</th>
                      <th className='px-4 py-2'>Start</th>
                      <th className='px-4 py-2'>End</th>
                      <th className='px-4 py-2'>Status</th>
                      <th className='px-4 py-2'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEvents.map(e => {
                      const status = getEventStatus(new Date(), e);
                      return (
                        <tr key={e.id} className='border-t border-gray-700'>
                          <td className='px-4 py-2'>{e.name}</td>
                          <td className='px-4 py-2 capitalize'>{e.category}</td>
                          <td className='px-4 py-2'>{e.type}</td>
                          <td className='px-4 py-2'>
                            {new Date(e.start_at).toLocaleString()}
                          </td>
                          <td className='px-4 py-2'>
                            {new Date(e.end_at).toLocaleString()}
                          </td>
                          <td className='px-4 py-2 capitalize'>{status}</td>
                          <td className='px-4 py-2'>
                            <div className='flex gap-2'>
                              <Button size='sm' onClick={() => onEdit(e)}>
                                Edit
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => onDelete(e.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
