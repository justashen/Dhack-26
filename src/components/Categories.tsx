'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, School, Sparkles } from 'lucide-react';
import { COMPETITIONS } from '@/lib/dhack2026';

const icons = {
  inter_university: GraduationCap,
  inter_school: School,
  rebrand: Sparkles,
};

export default function Categories() {
  return (
    <section id='categories' className='relative py-16 overflow-hidden'>
      <div className='max-w-1200 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 text-center'>
          <h2 className='text-4xl md:text-5xl font-heading font-bold'>
            Three Ways to <span className='gradient-text'>Compete</span>
          </h2>
          <p className='mx-auto mt-4 max-w-2xl text-muted-foreground'>
            DHACK 2026 expands into university, school, and faculty-exclusive
            tracks designed around AI, sustainability, and human-centered design.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-3'>
          {Object.values(COMPETITIONS).map((category, index) => {
            const Icon = icons[category.id];
            return (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08 }}
                className='group relative overflow-hidden rounded-lg border border-dhack-teal/25 bg-background/65 p-6 backdrop-blur-sm hover:border-dhack-orange/60'
              >
                <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-dhack-orange via-dhack-teal to-dhack-accent opacity-80' />
                <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-dhack-teal/15 text-dhack-teal group-hover:bg-dhack-orange/15 group-hover:text-dhack-orange'>
                  <Icon className='h-6 w-6' aria-hidden='true' />
                </div>
                <h3 className='text-xl font-heading font-semibold text-foreground'>
                  {category.title}
                </h3>
                <p className='mt-3 text-sm leading-6 text-muted-foreground'>
                  {category.description}
                </p>
                <ul className='mt-5 space-y-2 text-sm text-muted-foreground'>
                  {category.eligibility.map(item => (
                    <li key={item} className='flex gap-2'>
                      <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dhack-teal' />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href='/round-02-submission'
                  className='mt-6 inline-flex items-center gap-2 text-sm font-semibold text-dhack-orange transition-colors hover:text-dhack-teal'
                >
                  Submit Round 2
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
