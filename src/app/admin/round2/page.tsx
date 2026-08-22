'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseBrowser';

function StatusBadge({
  variant,
  children,
}: {
  variant: string;
  children: React.ReactNode;
}) {
  const color =
    variant === 'qualified'
      ? 'bg-green-500/10 text-green-300 border-green-700'
      : variant === 'rejected'
        ? 'bg-red-500/10 text-red-300 border-red-700'
        : variant === 'reviewed'
          ? 'bg-blue-500/10 text-blue-300 border-blue-700'
          : 'bg-yellow-500/10 text-yellow-300 border-yellow-700';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md text-xs font-semibold tracking-wide px-3 h-7 min-w-[96px] border ${color} transition-all duration-300 hover:brightness-110 hover:scale-105 transform-gpu`}
    >
      {children}
    </span>
  );
}

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative group ${className}`}>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-3 pr-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 outline-none hover:border-gray-600 text-left text-sm lg:text-base ${
          isOpen ? 'ring-2 ring-blue-500/40 border-blue-500/40' : ''
        }`}
      >
        <span className='flex-1 truncate mr-2'>
          <span className={selectedOption ? 'text-gray-100' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <span className='shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 border border-gray-700'>
          <svg
            className={`h-3.5 w-3.5 text-gray-400 group-hover:text-gray-300 transform transition-all duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.04 1.082l-4.24 3.83a.75.75 0 01-1.04 0l-4.24-3.83a.75.75 0 01.02-1.06z'
              clipRule='evenodd'
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className='absolute z-[9999] w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-2xl'>
          <div className='max-h-48 overflow-y-auto py-1'>
            {options.map(option => (
              <button
                key={option.value}
                type='button'
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-700 ${
                  value === option.value
                    ? 'bg-blue-500/20 text-blue-300 font-medium'
                    : 'text-gray-200 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Round2Entry {
  team_id: string;
  team_name: string;
  competition_category: string | null;
  round2_eligible: boolean;
  submitted: boolean;
  submission_id: string | null;
  status: string | null;
  submission_link: string | null;
  submitted_at: string | null;
}

function AdminRound2Content() {
  const [entries, setEntries] = useState<Round2Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    submission: 'all',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch('/api/admin/round2', { headers });
      if (!res.ok) throw new Error('Failed to fetch Round 2 data');
      const json = await res.json();
      setEntries(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filters.submission === 'submitted' && !entry.submitted) return false;
    if (filters.submission === 'not_submitted' && entry.submitted) return false;
    if (
      filters.search &&
      !entry.team_name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !entry.team_id.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const submittedCount = entries.filter(e => e.submitted).length;

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 text-gray-100 p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
            <p className='mt-4 text-gray-300'>Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-900 text-gray-100 p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-8'>
            <div className='text-red-400 mb-4'>❌ Error: {error}</div>
            <Button onClick={fetchData} className='bg-blue-600 hover:bg-blue-700'>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 gap-4'>
          <div className='flex items-center gap-3'>
            <Image
              src='/assests/dhack logo.png'
              alt='D-Hack Logo'
              width={48}
              height={48}
              className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain'
              priority
            />
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold text-white'>
              Admin Dashboard - Round 2
            </h1>
          </div>
          <Button
            onClick={fetchData}
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 lg:px-6 transition-all duration-300 hover:scale-105 transform-gpu shadow-lg hover:shadow-xl'
          >
            Refresh Data
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className='flex flex-col sm:flex-row sm:space-x-1 mb-6 lg:mb-8 border-b border-gray-700 overflow-x-auto'>
          <Link href='/admin/overview'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Overview
            </button>
          </Link>
          <Link href='/admin/submissions'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Submissions
            </button>
          </Link>
          <Link href='/admin/round2'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap bg-blue-500/20 text-blue-300 border-b-3 border-blue-400 shadow-sm'>
              Round 2 ({entries.length})
            </button>
          </Link>
          <Link href='/admin/results'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Results
            </button>
          </Link>
          <Link href='/admin/events'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Events
            </button>
          </Link>
          <Link href='/admin/settings'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Settings
            </button>
          </Link>
        </div>

        <div className='space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'>
              <CardContent className='p-4'>
                <p className='text-sm text-gray-400'>Eligible Teams</p>
                <p className='text-2xl font-bold text-white'>{entries.length}</p>
              </CardContent>
            </Card>
            <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'>
              <CardContent className='p-4'>
                <p className='text-sm text-gray-400'>Submitted</p>
                <p className='text-2xl font-bold text-green-400'>{submittedCount}</p>
              </CardContent>
            </Card>
            <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'>
              <CardContent className='p-4'>
                <p className='text-sm text-gray-400'>Not Submitted</p>
                <p className='text-2xl font-bold text-yellow-400'>
                  {entries.length - submittedCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'>
            <CardContent className='p-4 lg:p-6'>
              <h3 className='text-lg font-semibold mb-4 text-white'>Filters</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2 text-gray-300'>
                    Submission
                  </label>
                  <CustomDropdown
                    value={filters.submission}
                    onChange={value =>
                      setFilters(prev => ({ ...prev, submission: value }))
                    }
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'submitted', label: 'Submitted' },
                      { value: 'not_submitted', label: 'Not Submitted' },
                    ]}
                    placeholder='Select status'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2 text-gray-300'>
                    Search
                  </label>
                  <input
                    type='text'
                    placeholder='Search team name or ID...'
                    value={filters.search}
                    onChange={e =>
                      setFilters(prev => ({ ...prev, search: e.target.value }))
                    }
                    className='w-full p-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 outline-none hover:border-gray-600'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl'>
            <CardContent className='p-4 lg:p-6'>
              <h2 className='text-lg lg:text-xl font-semibold mb-4 text-white'>
                Round 2 Eligible Teams ({filteredEntries.length})
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm min-w-[800px]'>
                  <thead>
                    <tr className='border-b border-gray-700 bg-gray-800/40'>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Team ID
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Team Name
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Submission
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Status
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Drive Link
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry, index) => (
                      <tr
                        key={entry.team_id}
                        className='border-b border-gray-800 hover:bg-gray-800/40 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2'
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className='py-3 px-2 font-medium text-gray-200'>
                          {entry.team_id}
                        </td>
                        <td className='py-3 px-2 text-gray-300'>
                          {entry.team_name}
                        </td>
                        <td className='py-3 px-2'>
                          <span
                            className={`inline-flex items-center justify-center rounded-md text-xs font-semibold tracking-wide px-3 h-7 min-w-[100px] border ${
                              entry.submitted
                                ? 'bg-green-500/10 text-green-300 border-green-700'
                                : 'bg-gray-500/10 text-gray-400 border-gray-700'
                            }`}
                          >
                            {entry.submitted ? 'Submitted' : 'Not Submitted'}
                          </span>
                        </td>
                        <td className='py-3 px-2'>
                          {entry.status ? (
                            <StatusBadge variant={entry.status}>
                              {entry.status}
                            </StatusBadge>
                          ) : (
                            <span className='text-gray-500'>—</span>
                          )}
                        </td>
                        <td className='py-3 px-2'>
                          {entry.submission_link ? (
                            <a
                              href={entry.submission_link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-400 hover:text-blue-300 underline transition-colors duration-300'
                            >
                              View
                            </a>
                          ) : (
                            <span className='text-gray-500'>—</span>
                          )}
                        </td>
                        <td className='py-3 px-2 text-gray-400'>
                          {entry.submitted_at
                            ? new Date(entry.submitted_at).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminRound2() {
  return <AdminRound2Content />;
}
