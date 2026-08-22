'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToastProvider, useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseBrowser';

// Lightweight shared UI helpers for this page
function StatusBadge({
  variant,
  children,
}: {
  variant: string;
  children: React.ReactNode;
}) {
  const color =
    variant === 'passed' || variant === 'qualified'
      ? 'bg-green-500/10 text-green-300 border-green-700'
      : variant === 'failed' ||
          variant === 'disqualified' ||
          variant === 'rejected'
        ? 'bg-red-500/10 text-red-300 border-red-700'
        : variant === 'submitted' || variant === 'reviewed'
          ? 'bg-blue-500/10 text-blue-300 border-blue-700'
          : 'bg-yellow-500/10 text-yellow-300 border-yellow-700'; // pending or default

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md text-xs font-semibold tracking-wide px-3 h-7 min-w-[96px] border ${color} transition-all duration-300 hover:brightness-110 hover:scale-105 transform-gpu`}
    >
      {children}
    </span>
  );
}

// Custom dropdown component with enhanced design
function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative group ${className}`}>
      <button
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between pl-3 pr-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 outline-none hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-left text-sm lg:text-base ${
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
        <div className='absolute z-[9999] w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-2xl animate-in fade-in-0 slide-in-from-top-2 duration-200 backdrop-blur-sm'>
          {options.length > 5 && (
            <div className='p-2 border-b border-gray-600'>
              <input
                type='text'
                placeholder='Search...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full px-2 py-1 text-sm bg-gray-900 text-gray-100 border border-gray-700 rounded focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40 outline-none'
                autoFocus
              />
            </div>
          )}
          <div className='max-h-48 overflow-y-auto py-1'>
            {filteredOptions.length === 0 ? (
              <div className='px-3 py-2 text-sm text-gray-400'>
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-700 hover:scale-[1.02] transform-gpu ${
                    value === option.value
                      ? 'bg-blue-500/20 text-blue-300 font-medium'
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface Submission {
  id: string;
  submission_id: string;
  round_id: number;
  competition_category: string;
  google_drive_link: string;
  status: string;
  submitted_at: string;
  type: string;
  team_name: string;
  school_name?: string | null;
  university: string;
  registration_id: string;
  round2_eligible?: boolean;
}

function AdminSubmissionsContent() {
  const { addToast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    competition: 'all',
    round: 'all',
    status: 'all',
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

      const submissionsRes = await fetch('/api/admin/submissions', { headers });

      if (!submissionsRes.ok) throw new Error('Failed to fetch submissions');

      const submissionsData = await submissionsRes.json();

      setSubmissions(submissionsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (
      filters.competition !== 'all' &&
      submission.competition_category !== filters.competition
    )
      return false;
    if (
      filters.round !== 'all' &&
      submission.round_id.toString() !== filters.round
    )
      return false;
    if (filters.status !== 'all' && submission.status !== filters.status)
      return false;
    const searchableName = submission.school_name || submission.team_name || '';
    if (
      filters.search &&
      !searchableName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !submission.registration_id
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update status');
      addToast({
        type: 'success',
        title: 'Submission updated',
        message: `Marked as ${status}.`,
      });
      await fetchData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: err instanceof Error ? err.message : 'Try again later.',
      });
    }
  };

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
            <Button
              onClick={fetchData}
              className='bg-blue-600 hover:bg-blue-700'
            >
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
              Admin Dashboard - Submissions
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              onClick={fetchData}
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 lg:px-6 transition-all duration-300 hover:scale-105 transform-gpu shadow-lg hover:shadow-xl'
            >
              Refresh Data
            </Button>
            <Button
              onClick={() => {
                const rows = [
                  [
                    'type',
                    'competition_category',
                    'round_id',
                    'registration_id',
                    'team_name',
                    'school_name',
                    'university',
                    'round2_eligible',
                    'status',
                    'google_drive_link',
                    'submitted_at',
                  ],
                  ...filteredSubmissions.map(s => [
                    s.type,
                    s.competition_category,
                    s.round_id,
                    s.registration_id,
                    s.team_name,
                    s.school_name || '',
                    s.university,
                    s.round2_eligible ? 'yes' : 'no',
                    s.status,
                    s.google_drive_link,
                    new Date(s.submitted_at).toISOString(),
                  ]),
                ];
                const csv = rows
                  .map(r =>
                    r
                      .map(v => {
                        const str = String(v ?? '');
                        if (/[",\n]/.test(str)) {
                          return '"' + str.replace(/"/g, '""') + '"';
                        }
                        return str;
                      })
                      .join(',')
                  )
                  .join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `submissions_${new Date()
                  .toISOString()
                  .slice(0, 19)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 lg:px-6 transition-all duration-300 hover:scale-105 transform-gpu shadow-lg hover:shadow-xl'
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='flex flex-col sm:flex-row sm:space-x-1 mb-6 lg:mb-8 border-b border-gray-700 overflow-x-auto'>
          <Link href='/admin/overview'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Overview
            </button>
          </Link>
          <Link href='/admin/submissions'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap bg-blue-500/20 text-blue-300 border-b-3 border-blue-400 shadow-sm'>
              Submissions ({submissions.length})
            </button>
          </Link>
          <Link href='/admin/round2'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Round 2
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

        {/* Submissions Content */}
        <div className='space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500'>
          {/* Filters */}
          <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'>
            <CardContent className='p-4 lg:p-6'>
              <h3 className='text-lg font-semibold mb-4 text-white'>Filters</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2 text-gray-300'>
                    Competition
                  </label>
                  <CustomDropdown
                    value={filters.competition}
                    onChange={value =>
                      setFilters(prev => ({ ...prev, competition: value }))
                    }
                    options={[
                      { value: 'all', label: 'All Competitions' },
                      { value: 'inter_university', label: 'Inter-University' },
                      { value: 'inter_school', label: 'InterSchool' },
                      { value: 'rebrand', label: 'ReBrand' },
                    ]}
                    placeholder='Select competition'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2 text-gray-300'>
                    Round
                  </label>
                  <CustomDropdown
                    value={filters.round}
                    onChange={value =>
                      setFilters(prev => ({ ...prev, round: value }))
                    }
                    options={[
                      { value: 'all', label: 'All Rounds' },
                      { value: '1', label: 'Round 1' },
                      { value: '2', label: 'Round 2' },
                      { value: '3', label: 'Round 3' },
                    ]}
                    placeholder='Select round'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2 text-gray-300'>
                    Status
                  </label>
                  <CustomDropdown
                    value={filters.status}
                    onChange={value =>
                      setFilters(prev => ({ ...prev, status: value }))
                    }
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'reviewed', label: 'Reviewed' },
                      { value: 'qualified', label: 'Qualified' },
                      { value: 'rejected', label: 'Rejected' },
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
                    placeholder='Search team or school...'
                    value={filters.search}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className='w-full p-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 outline-none hover:border-gray-600'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl'>
            <CardContent className='p-4 lg:p-6'>
              <h2 className='text-lg lg:text-xl font-semibold mb-4 text-white'>
                Submissions ({filteredSubmissions.length})
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm min-w-[800px]'>
                  <thead>
                    <tr className='border-b border-gray-700 bg-gray-800/40'>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Team
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Competition
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Round
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Round 2 Eligible
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Status
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Submission
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Submitted
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission, index) => (
                      <tr
                        key={submission.submission_id}
                        className='border-b border-gray-800 hover:bg-gray-800/40 transition-all duration-300 hover:scale-[1.01] transform-gpu animate-in fade-in-0 slide-in-from-bottom-2'
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className='py-3 px-2'>
                          <div>
                            <div className='font-medium text-gray-200 text-sm'>
                              {submission.school_name || submission.team_name}
                            </div>
                            <div className='text-gray-400 text-xs'>
                              {submission.registration_id}
                            </div>
                          </div>
                        </td>
                        <td className='py-3 px-2'>
                          <span
                            className={`inline-flex items-center justify-center rounded-md text-xs font-semibold tracking-wide px-3 h-7 min-w-[80px] border ${
                              submission.competition_category === 'rebrand'
                                ? 'bg-green-500/10 text-green-300 border-green-700'
                                : submission.competition_category ===
                                    'inter_school'
                                  ? 'bg-yellow-500/10 text-yellow-300 border-yellow-700'
                                  : 'bg-blue-500/10 text-blue-300 border-blue-700'
                            } transition-all duration-300 hover:brightness-110 hover:scale-105 transform-gpu`}
                          >
                            {submission.competition_category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className='py-3 px-2 text-gray-300'>
                          Round {submission.round_id}
                        </td>
                        <td className='py-3 px-2'>
                          <span
                            className={`inline-flex items-center justify-center rounded-md text-xs font-semibold tracking-wide px-3 h-7 min-w-[60px] border ${
                              submission.round2_eligible
                                ? 'bg-green-500/10 text-green-300 border-green-700'
                                : 'bg-gray-500/10 text-gray-400 border-gray-700'
                            }`}
                          >
                            {submission.round2_eligible ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className='py-3 px-2'>
                          <StatusBadge variant={submission.status}>
                            {submission.status}
                          </StatusBadge>
                        </td>
                        <td className='py-3 px-2'>
                          <a
                            href={submission.google_drive_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-400 hover:text-blue-300 underline transition-colors duration-300 hover:scale-105 transform-gpu inline-block'
                          >
                            View
                          </a>
                        </td>
                        <td className='py-3 px-2 text-gray-400'>
                          {new Date(
                            submission.submitted_at
                          ).toLocaleDateString()}
                        </td>
                        <td className='py-3 px-2'>
                          <div className='flex flex-wrap gap-2'>
                            {[
                              ['reviewed', 'Reviewed'],
                              ['qualified', 'Qualified'],
                              ['rejected', 'Reject'],
                            ].map(([status, label]) => (
                              <Button
                                key={status}
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  updateStatus(submission.id, status)
                                }
                                disabled={submission.status === status}
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
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

export default function AdminSubmissions() {
  return (
    <ToastProvider>
      <AdminSubmissionsContent />
    </ToastProvider>
  );
}
