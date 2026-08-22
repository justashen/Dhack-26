'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToastProvider, useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { createPortal } from 'react-dom';
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
      : variant === 'failed' || variant === 'disqualified'
        ? 'bg-red-500/10 text-red-300 border-red-700'
        : variant === 'submitted'
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
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = React.useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative group ${className}`}>
      <button
        ref={buttonRef}
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

      {isOpen &&
        dropdownPosition &&
        createPortal(
          <div
            ref={dropdownMenuRef}
            className='fixed z-[10000] bg-gray-800 border border-gray-600 rounded-md shadow-2xl animate-in fade-in-0 slide-in-from-top-2 duration-200 backdrop-blur-sm transform-gpu pointer-events-auto'
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
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
          </div>,
          document.body
        )}
    </div>
  );
}

interface Result {
  result_id: string;
  team_id: string;
  round_id: number;
  status: string;
  updated_at: string;
  type?: 'regular' | 'bis';
}

function AdminResultsContent() {
  const { addToast } = useToast();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    teamType: 'all',
    round: 'all',
    status: 'all',
    search: '',
  });
  const [updatingResult, setUpdatingResult] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const updateResultStatus = async (
    teamId: string,
    roundId: number,
    newStatus: string,
    type: 'regular' | 'bis' = 'regular'
  ) => {
    const resultKey = `${teamId}-${roundId}`;
    setUpdatingResult(resultKey);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch('/api/admin/results/update', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          team_id: teamId,
          round_id: roundId,
          status: newStatus,
          type: type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update result');
      }

      // Update local state
      setResults(prev =>
        prev.map(result =>
          result.team_id === teamId && result.round_id === roundId
            ? {
                ...result,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : result
        )
      );

      // Show success message
      addToast({
        type: 'success',
        title: 'Result Updated Successfully',
        message: `Result updated to ${newStatus} for ${teamId} Round ${roundId}`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setUpdatingResult(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const resultsRes = await fetch('/api/admin/results', { headers });

      if (!resultsRes.ok) throw new Error('Failed to fetch results');

      const resultsData = await resultsRes.json();

      setResults(resultsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    if (filters.teamType !== 'all') {
      const isBis = result.type === 'bis' || result.team_id.startsWith('DHBIS');
      if (filters.teamType === 'regular' && isBis) return false;
      if (filters.teamType === 'bis' && !isBis) return false;
    }
    if (filters.round !== 'all' && result.round_id.toString() !== filters.round)
      return false;
    if (filters.status !== 'all' && result.status !== filters.status)
      return false;
    if (
      filters.search &&
      !result.team_id.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

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
              Admin Dashboard - Results
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
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
              Round 2
            </button>
          </Link>
          <Link href='/admin/results'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap bg-blue-500/20 text-blue-300 border-b-3 border-blue-400 shadow-sm'>
              Results ({results.length})
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

        {/* Results Content */}
        <div className='space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500'>
          {/* Filters */}
          <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'>
            <CardContent className='p-4 lg:p-6'>
              <h3 className='text-lg font-semibold mb-4 text-white'>Filters</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2 text-gray-300'>
                    Team Type
                  </label>
                  <CustomDropdown
                    value={filters.teamType}
                    onChange={value =>
                      setFilters(prev => ({ ...prev, teamType: value }))
                    }
                    options={[
                      { value: 'all', label: 'All Teams' },
                      { value: 'regular', label: 'Regular Teams' },
                      { value: 'bis', label: 'BIS Teams' },
                    ]}
                    placeholder='Select team type'
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
                      { value: '3', label: 'Round 3 (Innovation Only)' },
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
                      { value: 'passed', label: 'Passed' },
                      { value: 'failed', label: 'Failed' },
                      { value: 'pending', label: 'Pending' },
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
                    placeholder='Search team IDs...'
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

          {/* Results Table */}
          <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl'>
            <CardContent className='p-4 lg:p-6'>
              <h2 className='text-lg lg:text-xl font-semibold mb-4 text-white'>
                Results ({filteredResults.length})
              </h2>
              <div className='overflow-x-auto overflow-y-auto max-h-[70vh] relative'>
                <table className='w-full text-sm min-w-[900px] relative'>
                  <thead>
                    <tr className='border-b border-gray-700 bg-gray-800/40'>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Team ID
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Round
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Current Status
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Update Status
                      </th>
                      <th className='text-left py-3 px-2 text-gray-100 font-semibold'>
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => {
                      const resultKey = `${result.team_id}-${result.round_id}`;
                      const isUpdating = updatingResult === resultKey;

                      return (
                        <tr
                          key={result.result_id}
                          className='border-b border-gray-800 hover:bg-gray-800/40 transition-all duration-300 hover:scale-[1.01] transform-gpu animate-in fade-in-0 slide-in-from-bottom-2'
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className='py-3 px-2 font-mono text-gray-200 text-xs lg:text-sm'>
                            {result.team_id}
                          </td>
                          <td className='py-3 px-2 text-gray-300'>
                            Round {result.round_id}
                          </td>
                          <td className='py-3 px-2'>
                            <StatusBadge variant={result.status}>
                              {result.status}
                            </StatusBadge>
                          </td>
                          <td className='py-3 px-2 relative'>
                            <div className='flex items-center space-x-2 relative'>
                              <select
                                value={result.status}
                                onChange={e =>
                                  updateResultStatus(
                                    result.team_id,
                                    result.round_id,
                                    e.target.value,
                                    result.type || 'regular'
                                  )
                                }
                                disabled={isUpdating}
                                className='min-w-[120px] px-3 py-2 text-sm rounded-md bg-gray-800 text-gray-100 border border-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 outline-none hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
                              >
                                <option value='pending'>Pending</option>
                                <option value='passed'>Passed</option>
                                <option value='failed'>Failed</option>
                              </select>
                              {isUpdating && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2'></div>
                              )}
                            </div>
                          </td>
                          <td className='py-3 px-2 text-gray-400 text-xs lg:text-sm'>
                            {new Date(result.updated_at).toLocaleDateString()}
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
    </div>
  );
}

export default function AdminResults() {
  return (
    <ToastProvider>
      <AdminResultsContent />
    </ToastProvider>
  );
}
