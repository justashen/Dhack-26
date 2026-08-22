'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { COMPETITIONS } from '@/lib/dhack2026';
import { Button } from '@/components/ui/button';

export default function RegistrationPage() {
  return (
    <main className='min-h-screen bg-dhack-base text-foreground'>
      <Navbar />
      <section className='relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='mb-10 text-center'>
            <p className='mb-3 text-sm font-semibold uppercase tracking-wide text-dhack-orange'>
              Official Registration
            </p>
            <h1 className='text-4xl md:text-5xl font-heading font-bold'>
              DHACK&apos;26 <span className='gradient-text'>Registration Closed</span>
            </h1>
            <p className='mx-auto mt-5 max-w-3xl text-muted-foreground leading-7'>
              New registrations are no longer accepted. Teams selected for
              Round 2 should use the Round 2 submission portal for
              deliverables.
            </p>
            <Button asChild variant='gradient' size='lg' className='mt-8'>
              <Link href='/round-02-submission'>Go to Round 2 Submission</Link>
            </Button>
          </div>

          <div className='mb-8 grid gap-4 md:grid-cols-3'>
            {Object.values(COMPETITIONS).map(competition => (
              <div
                key={competition.id}
                className='rounded-lg border border-dhack-teal/25 bg-background/70 p-4'
              >
                <h2 className='font-heading text-lg font-semibold'>
                  {competition.title}
                </h2>
                <p className='mt-2 text-sm text-muted-foreground'>
                  {competition.exactMembers
                    ? `Exactly ${competition.exactMembers} members`
                    : `${competition.minMembers}-${competition.maxMembers} members`}
                </p>
              </div>
            ))}
          </div>

          <div className='rounded-lg border border-red-400/30 bg-red-500/10 p-6 text-center font-semibold text-red-300'>
            Registration Closed
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
