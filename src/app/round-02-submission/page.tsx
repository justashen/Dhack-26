'use client';

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';

const Round02SubmissionForm = dynamic(
  () => import('@/components/forms/Round02SubmissionForm'),
  {
    ssr: false,
    loading: () => (
      <div className='rounded-lg border border-dhack-teal/20 p-6 text-center text-muted-foreground'>
        Loading submission form...
      </div>
    ),
  }
);

export default function RoundTwoSubmissionPage() {
  useEffect(() => {
    document.body.classList.add('submit-page');
    return () => document.body.classList.remove('submit-page');
  }, []);

  return (
    <main className='min-h-screen bg-dhack-base text-foreground'>
      <Navbar />
      <section className='relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='mb-10 text-center'>
            <p className='mb-3 text-sm font-semibold uppercase tracking-wide text-dhack-orange'>
              Round 02 Submission
            </p>
            <h1 className='text-4xl md:text-5xl font-heading font-bold'>
              DHACK 2026 — <span className='gradient-text'>Round 2 Submission</span>
            </h1>
            <p className='mx-auto mt-5 max-w-2xl text-muted-foreground leading-7'>
              Congratulations to the teams selected for Round 2 of DHACK
              2026. Submit your Round 2 solution through the submission form
              below by providing the Google Drive link containing your work,
              before the deadline. Enter your Team ID or Team Name to
              identify your team.
            </p>
            <p className='mx-auto mt-3 max-w-2xl text-sm text-muted-foreground'>
              Round 2 submissions are open exclusively to teams selected for
              Round 2.
            </p>
          </div>

          <Card className='border-dhack-teal/30 bg-background/80 backdrop-blur-sm'>
            <CardContent className='pt-6'>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className='p-4 text-center'>
                      Loading submission form...
                    </div>
                  }
                >
                  <Round02SubmissionForm />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  );
}
