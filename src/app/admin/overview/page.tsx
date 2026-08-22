'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToastProvider, useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

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

interface Team {
  team_id: string;
  team_name: string;
  university: string;
  created_at: string;
}

interface Member {
  member_id: string;
  team_id: string;
  full_name: string;
  name_with_initials: string;
  email: string;
  is_leader: boolean;
}

interface BisRegistration {
  bis_id: string;
  team_name: string;
  university: string;
  created_at: string;
}

interface BisMember {
  member_id: string;
  bis_id: string;
  full_name: string;
  name_with_initials: string;
  email: string;
  is_leader: boolean;
}

interface Result {
  result_id: string;
  team_id: string;
  round_id: number;
  status: string;
  updated_at: string;
}

interface Submission {
  submission_id: string;
  round_id: number;
  team_id?: string;
  bis_id?: string;
  registration_number: string;
  google_drive_link: string;
  youtube_link?: string;
  status: string;
  submitted_at: string;
  type: 'regular' | 'bis';
  team_name: string;
  university: string;
  registration_id: string;
}

function AdminOverviewContent() {
  const { addToast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bisRegistrations, setBisRegistrations] = useState<BisRegistration[]>(
    []
  );
  const [bisMembers, setBisMembers] = useState<BisMember[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

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

      // Fetch all data in parallel
      const [
        teamsRes,
        membersRes,
        bisRegsRes,
        bisMembersRes,
        resultsRes,
        submissionsRes,
      ] = await Promise.all([
        fetch('/api/admin/teams', { headers }),
        fetch('/api/admin/members', { headers }),
        fetch('/api/admin/bis-registrations', { headers }),
        fetch('/api/admin/bis-members', { headers }),
        fetch('/api/admin/results', { headers }),
        fetch('/api/admin/submissions', { headers }),
      ]);

      if (!teamsRes.ok) throw new Error('Failed to fetch teams');
      if (!membersRes.ok) throw new Error('Failed to fetch members');
      if (!bisRegsRes.ok) throw new Error('Failed to fetch BIS registrations');
      if (!bisMembersRes.ok) throw new Error('Failed to fetch BIS members');
      if (!resultsRes.ok) throw new Error('Failed to fetch results');
      if (!submissionsRes.ok) throw new Error('Failed to fetch submissions');

      const [
        teamsData,
        membersData,
        bisRegsData,
        bisMembersData,
        resultsData,
        submissionsData,
      ] = await Promise.all([
        teamsRes.json(),
        membersRes.json(),
        bisRegsRes.json(),
        bisMembersRes.json(),
        resultsRes.json(),
        submissionsRes.json(),
      ]);

      setTeams(teamsData.data || []);
      setMembers(membersData.data || []);
      setBisRegistrations(bisRegsData.data || []);
      setBisMembers(bisMembersData.data || []);
      setResults(resultsData.data || []);
      setSubmissions(submissionsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
              Admin Dashboard - Overview
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              onClick={fetchData}
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 lg:px-6 transition-all duration-300 hover:scale-105 transform-gpu shadow-lg hover:shadow-xl'
            >
              Refresh Data
            </Button>
            <Button
              onClick={handleLogout}
              className='bg-gray-700 hover:bg-gray-600'
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='flex flex-col sm:flex-row sm:space-x-1 mb-6 lg:mb-8 border-b border-gray-700 overflow-x-auto'>
          <Link href='/admin/overview'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap bg-blue-500/20 text-blue-300 border-b-3 border-blue-400 shadow-sm'>
              Overview
            </button>
          </Link>
          <Link href='/admin/submissions'>
            <button className='px-4 py-3 font-semibold text-sm lg:text-base rounded-t-lg transition-all duration-300 whitespace-nowrap text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:scale-105 transform-gpu'>
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

        {/* Overview Content */}
        <div className='animate-in fade-in-0 slide-in-from-left-4 duration-500'>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8'>
            <Card className='border-l-4 border-l-blue-500 bg-gray-800/50 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu'>
              <CardContent className='p-4 lg:p-6'>
                <div className='text-2xl lg:text-3xl font-bold text-blue-400 mb-2'>
                  {teams.length}
                </div>
                <div className='text-gray-300 font-semibold text-sm lg:text-base'>
                  Regular Teams
                </div>
              </CardContent>
            </Card>
            <Card className='border-l-4 border-l-green-500 bg-gray-800/50 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu'>
              <CardContent className='p-4 lg:p-6'>
                <div className='text-2xl lg:text-3xl font-bold text-green-400 mb-2'>
                  {bisRegistrations.length}
                </div>
                <div className='text-gray-300 font-semibold text-sm lg:text-base'>
                  BIS Teams
                </div>
              </CardContent>
            </Card>
            <Card className='border-l-4 border-l-purple-500 bg-gray-800/50 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu'>
              <CardContent className='p-4 lg:p-6'>
                <div className='text-2xl lg:text-3xl font-bold text-purple-400 mb-2'>
                  {members.length}
                </div>
                <div className='text-gray-300 font-semibold text-sm lg:text-base'>
                  Regular Members
                </div>
              </CardContent>
            </Card>
            <Card className='border-l-4 border-l-orange-500 bg-gray-800/50 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu'>
              <CardContent className='p-4 lg:p-6'>
                <div className='text-2xl lg:text-3xl font-bold text-orange-400 mb-2'>
                  {bisMembers.length}
                </div>
                <div className='text-gray-300 font-semibold text-sm lg:text-base'>
                  BIS Members
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regular Teams */}
          <Card className='mb-6 lg:mb-8 shadow-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl'>
            <CardContent className='p-4 lg:p-6'>
              <h2 className='text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6'>
                Regular Teams ({teams.length})
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[640px]'>
                  <thead>
                    <tr className='border-b-2 border-gray-700 bg-gray-800/40'>
                      <th className='text-left py-3 lg:py-4 px-2 lg:px-3 font-bold text-gray-100 text-sm lg:text-base'>
                        Team ID
                      </th>
                      <th className='text-left py-3 lg:py-4 px-2 lg:px-3 font-bold text-gray-100 text-sm lg:text-base'>
                        Team Name
                      </th>
                      <th className='text-left py-3 lg:py-4 px-2 lg:px-3 font-bold text-gray-100 text-sm lg:text-base'>
                        University
                      </th>
                      <th className='text-left py-3 lg:py-4 px-2 lg:px-3 font-bold text-gray-100 text-sm lg:text-base'>
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map(team => (
                      <tr
                        key={team.team_id}
                        className='border-b border-gray-800 hover:bg-gray-800/40 transition-all duration-300 hover:scale-[1.01] transform-gpu'
                      >
                        <td className='py-3 lg:py-4 px-2 lg:px-3 font-mono font-bold text-gray-100 text-xs lg:text-sm'>
                          {team.team_id}
                        </td>
                        <td className='py-3 lg:py-4 px-2 lg:px-3 font-semibold text-gray-200 text-sm lg:text-base'>
                          {team.team_name}
                        </td>
                        <td className='py-3 lg:py-4 px-2 lg:px-3 text-gray-300 text-sm lg:text-base'>
                          {team.university}
                        </td>
                        <td className='py-3 lg:py-4 px-2 lg:px-3 text-gray-400 text-sm lg:text-base'>
                          {new Date(team.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* BIS Teams */}
          <Card className='mb-6 lg:mb-8 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl'>
            <CardContent className='p-4 lg:p-6'>
              <h2 className='text-lg lg:text-xl font-semibold mb-4 text-white'>
                USJ BIS Teams ({bisRegistrations.length})
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm min-w-[640px]'>
                  <thead>
                    <tr className='border-b border-gray-700 bg-gray-800/40'>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        BIS ID
                      </th>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        Team Name
                      </th>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        University
                      </th>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bisRegistrations.map(reg => (
                      <tr
                        key={reg.bis_id}
                        className='border-b border-gray-800 hover:bg-gray-800/40 transition-all duration-300 hover:scale-[1.01] transform-gpu'
                      >
                        <td className='py-2 lg:py-3 px-2 lg:px-3 font-mono text-gray-200 text-xs lg:text-sm'>
                          {reg.bis_id}
                        </td>
                        <td className='py-2 lg:py-3 px-2 lg:px-3 text-gray-300 text-sm lg:text-base'>
                          {reg.team_name}
                        </td>
                        <td className='py-2 lg:py-3 px-2 lg:px-3 text-gray-300 text-sm lg:text-base'>
                          {reg.university}
                        </td>
                        <td className='py-2 lg:py-3 px-2 lg:px-3 text-gray-400 text-sm lg:text-base'>
                          {new Date(reg.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className='mb-6 lg:mb-8 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl'>
            <CardContent className='p-4 lg:p-6'>
              <h2 className='text-lg lg:text-xl font-semibold mb-4 text-white'>
                Results ({results.length})
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm min-w-[700px]'>
                  <thead>
                    <tr className='border-b border-gray-700 bg-gray-800/40'>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        Team ID
                      </th>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        Round
                      </th>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        Status
                      </th>
                      <th className='text-left py-2 lg:py-3 px-2 lg:px-3 text-gray-100 text-sm lg:text-base'>
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(result => (
                      <tr
                        key={result.result_id}
                        className='border-b border-gray-800 hover:bg-gray-800/40 transition-all duration-300 hover:scale-[1.01] transform-gpu'
                      >
                        <td className='py-2 lg:py-3 px-2 lg:px-3 font-mono text-gray-200 text-xs lg:text-sm'>
                          {result.team_id}
                        </td>
                        <td className='py-2 lg:py-3 px-2 lg:px-3 text-gray-300 text-sm lg:text-base'>
                          Round {result.round_id}
                        </td>
                        <td className='py-2 lg:py-3 px-2 lg:px-3'>
                          <StatusBadge variant={result.status}>
                            {result.status}
                          </StatusBadge>
                        </td>
                        <td className='py-2 lg:py-3 px-2 lg:px-3 text-gray-400 text-sm lg:text-base'>
                          {new Date(result.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Members by Team */}
          <Card className='border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl'>
            <CardContent className='p-4 lg:p-6'>
              <h2 className='text-lg lg:text-xl font-semibold mb-4 text-white'>
                Members by Team
              </h2>
              <div className='space-y-4 lg:space-y-6'>
                {/* Regular Teams */}
                {teams.map(team => {
                  const teamMembers = members.filter(
                    m => m.team_id === team.team_id
                  );
                  return (
                    <div
                      key={team.team_id}
                      className='border border-gray-700 rounded-lg p-3 lg:p-4 bg-gray-800/40 transition-all duration-300 hover:bg-gray-800/60'
                    >
                      <h3 className='font-semibold mb-2 lg:mb-3 text-white text-sm lg:text-base'>
                        {team.team_name} ({team.team_id}) - Regular
                      </h3>
                      <div className='space-y-2'>
                        {teamMembers.map(member => (
                          <div
                            key={member.member_id}
                            className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm'
                          >
                            <span className='font-medium text-gray-100'>
                              {member.full_name}
                            </span>
                            <span className='text-gray-300 text-xs sm:text-sm'>
                              ({member.name_with_initials})
                            </span>
                            <span className='text-gray-300 text-xs sm:text-sm break-all'>
                              {member.email}
                            </span>
                            {member.is_leader && (
                              <span className='bg-blue-500/10 text-blue-300 px-2 py-1 rounded text-xs border border-blue-700 self-start sm:self-auto'>
                                Leader
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* BIS Teams */}
                {bisRegistrations.map(reg => {
                  const teamMembers = bisMembers.filter(
                    m => m.bis_id === reg.bis_id
                  );
                  return (
                    <div
                      key={reg.bis_id}
                      className='border border-gray-700 rounded-lg p-3 lg:p-4 bg-gray-800/40 transition-all duration-300 hover:bg-gray-800/60'
                    >
                      <h3 className='font-semibold mb-2 lg:mb-3 text-white text-sm lg:text-base'>
                        {reg.team_name} ({reg.bis_id}) - BIS
                      </h3>
                      <div className='space-y-2'>
                        {teamMembers.map(member => (
                          <div
                            key={member.member_id}
                            className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm'
                          >
                            <span className='font-medium text-gray-100'>
                              {member.full_name}
                            </span>
                            <span className='text-gray-300 text-xs sm:text-sm'>
                              ({member.name_with_initials})
                            </span>
                            <span className='text-gray-300 text-xs sm:text-sm break-all'>
                              {member.email}
                            </span>
                            {member.is_leader && (
                              <span className='bg-green-500/10 text-green-300 px-2 py-1 rounded text-xs border border-green-700 self-start sm:self-auto'>
                                Leader
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  return (
    <ToastProvider>
      <AdminOverviewContent />
    </ToastProvider>
  );
}
