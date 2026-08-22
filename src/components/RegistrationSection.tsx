'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, School, Sparkles, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPETITIONS, DHACK_2026_CONFIG } from '@/lib/dhack2026';

const icons = {
  inter_university: GraduationCap,
  inter_school: School,
  rebrand: Sparkles,
};

export default function RegistrationSection() {
  const [submissionClosed, setSubmissionClosed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const update = (closeAt = DHACK_2026_CONFIG.countdownTargetAt) => {
      if (mounted) {
        setSubmissionClosed(Date.now() >= new Date(closeAt).getTime());
      }
    };
    const load = async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' });
        const json = await res.json();
        update(json?.settings?.countdownTargetAt);
      } catch {
        update();
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id='registration' className='relative py-20 overflow-hidden'>
      <div className='max-w-1200 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className='mb-3 text-sm font-semibold uppercase tracking-wide text-dhack-orange'>
              Round 02 Submission
            </p>
            <h2 className='text-4xl md:text-5xl font-heading font-bold'>
              Submit your <span className='gradient-text'>Round 2</span> work
            </h2>
            <p className='mt-5 max-w-xl text-muted-foreground leading-7'>
              Congratulations to the teams selected for Round 2 of DHACK 2026.
              Submit your Round 2 solution through the Google Drive submission
              form before the deadline. Round 2 submissions are open
              exclusively to teams selected for Round 2.
            </p>
            <div className='mt-5 rounded-lg border border-dhack-teal/25 bg-dhack-teal/10 px-5 py-3 font-semibold text-dhack-teal'>
              Registration Closed
            </div>
            {submissionClosed ? (
              <div className='mt-8 rounded-lg border border-red-400/30 bg-red-500/10 px-5 py-3 font-semibold text-red-300'>
                Round 2 Submission Closed
              </div>
            ) : (
              <Button asChild variant='gradient' size='lg' className='mt-8 gap-2'>
                <Link href='/round-02-submission'>
                  Submit Round 2
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </Link>
              </Button>
            )}
          </motion.div>

          <div className='grid gap-4 sm:grid-cols-3'>
            {Object.values(COMPETITIONS).map((competition, index) => {
              const Icon = icons[competition.id];

              return (
                <motion.div
                  key={competition.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.08 }}
                  className='rounded-lg border border-dhack-teal/25 bg-background/70 p-5 backdrop-blur-sm'
                >
                  <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-dhack-teal/15 text-dhack-teal'>
                    {submissionClosed ? (
                      <Icon className='h-5 w-5' aria-hidden='true' />
                    ) : (
                      <UploadCloud className='h-5 w-5' aria-hidden='true' />
                    )}
                  </div>
                  <h3 className='font-heading text-lg font-semibold text-foreground'>
                    {competition.shortTitle}
                  </h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {competition.exactMembers
                      ? `Exactly ${competition.exactMembers} members`
                      : `${competition.minMembers}-${competition.maxMembers} members`}
                  </p>
                  {submissionClosed ? (
                    <p className='mt-4 text-sm font-medium text-red-300'>
                      Submission Closed
                    </p>
                  ) : (
                    <Link
                      href='/round-02-submission'
                      className='mt-4 inline-flex items-center gap-2 text-sm font-medium text-dhack-orange hover:text-dhack-teal'
                    >
                      Submit Round 2
                      <ArrowRight className='h-4 w-4' aria-hidden='true' />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
