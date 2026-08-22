'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ReCAPTCHA from 'react-google-recaptcha';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z
  .object({
    team_id: z.string().optional().or(z.literal('')),
    team_name: z.string().optional().or(z.literal('')),
    submission_link: z
      .string()
      .url('Please provide a valid Google Drive link.')
      .refine(
        value => value.startsWith('https://drive.google.com/'),
        'Please provide a valid Google Drive link.'
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.team_id?.trim() && !data.team_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['team_id'],
        message: 'Please enter either your Team ID or Team Name.',
      });
    }
  });

type Values = z.infer<typeof schema>;

type SubmissionResult = {
  team_id: string;
  team_name: string;
  status: string;
  submitted_at: string;
  submission_link: string;
};

export default function Round02SubmissionForm() {
  const [error, setError] = useState<string | null>(null);
  const [windowStatus, setWindowStatus] = useState<
    'upcoming' | 'open' | 'closed'
  >('closed');
  const [windowLabel, setWindowLabel] = useState('Loading submission window...');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      team_id: '',
      team_name: '',
      submission_link: '',
    },
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' });
        const json = await res.json();
        const windows = json?.submissionWindows || [];
        const window = windows.find((item: any) => item.round === 2);
        if (!window) {
          if (mounted) {
            setWindowStatus('closed');
            setWindowLabel('Round 2 submission window is not configured.');
          }
          return;
        }

        const now = Date.now();
        const open = new Date(window.opens_at).getTime();
        const close = new Date(window.closes_at).getTime();
        if (mounted) {
          if (now < open) {
            setWindowStatus('upcoming');
            setWindowLabel(`Opens on ${new Date(window.opens_at).toLocaleString()}`);
          } else if (now >= open && now < close) {
            setWindowStatus('open');
            setWindowLabel(`Closes on ${new Date(window.closes_at).toLocaleString()}`);
          } else {
            setWindowStatus('closed');
            setWindowLabel('Round 2 submission window has closed.');
          }
        }
      } catch {
        if (mounted) {
          setWindowStatus('closed');
          setWindowLabel('Submission window unavailable.');
        }
      }
    };

    load();
    const id = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const onSubmit = async (values: Values) => {
    setError(null);

    if (windowStatus !== 'open') {
      setError(windowLabel || 'Submission closed');
      return;
    }

    const recaptchaToken = recaptchaSiteKey ? recaptchaRef.current?.getValue() : '';
    if (recaptchaSiteKey && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    const res = await fetch('/api/round-02-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: values.team_id,
        team_name: values.team_name,
        submission_link: values.submission_link,
        recaptchaToken,
      }),
    });
    const data = await res.json();
    recaptchaRef.current?.reset();

    if (!res.ok) {
      setError(data?.error || 'Submission failed.');
      return;
    }

    setResult({
      team_id: data.team_id,
      team_name: data.team_name,
      status: data.status,
      submitted_at: data.submitted_at,
      submission_link: data.submission_link,
    });
    reset({ team_id: '', team_name: '', submission_link: '' });
  };

  if (result) {
    return (
      <Card>
        <CardContent className='space-y-4 pt-6'>
          <div className='rounded-lg border border-dhack-teal/30 bg-dhack-teal/10 p-4'>
            <p className='font-semibold text-dhack-teal'>
              Round 2 submission submitted successfully!
            </p>
          </div>
          <dl className='grid gap-3 text-sm sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground'>Team Name</dt>
              <dd className='font-medium'>{result.team_name}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Team ID</dt>
              <dd className='font-medium'>{result.team_id}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Submission Status</dt>
              <dd className='font-medium capitalize'>{result.status}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Submitted At</dt>
              <dd className='font-medium'>
                {new Date(result.submitted_at).toLocaleString()}
              </dd>
            </div>
            <div className='sm:col-span-2'>
              <dt className='text-muted-foreground'>Google Drive Link</dt>
              <dd className='break-all font-medium'>
                <a
                  href={result.submission_link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-dhack-teal underline'
                >
                  {result.submission_link}
                </a>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className='space-y-6 pt-6'>
        <div
          className={`rounded-lg p-3 text-sm ${
            windowStatus === 'open'
              ? 'border border-dhack-teal/30 bg-dhack-teal/10 text-dhack-teal'
              : windowStatus === 'upcoming'
                ? 'border border-yellow-400/30 bg-yellow-400/10 text-yellow-300'
                : 'border border-red-400/40 bg-red-500/10 text-red-200'
          }`}
        >
          {windowLabel}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div>
            <Label>Team ID</Label>
            <Controller
              name='team_id'
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder='DH048' />
              )}
            />
          </div>

          <div className='flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground'>
            <span className='h-px flex-1 bg-border' />
            OR
            <span className='h-px flex-1 bg-border' />
          </div>

          <div>
            <Label>Team Name</Label>
            <Controller
              name='team_name'
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder='Your registered team name' />
              )}
            />
            {errors.team_id && (
              <p className='mt-1 text-sm text-red-400'>
                {errors.team_id.message}
              </p>
            )}
          </div>

          <div>
            <Label>Google Drive Link</Label>
            <Controller
              name='submission_link'
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder='https://drive.google.com/...' />
              )}
            />
            {errors.submission_link && (
              <p className='mt-1 text-sm text-red-400'>
                {errors.submission_link.message}
              </p>
            )}
          </div>

          {recaptchaSiteKey && (
            <div className='flex justify-center overflow-hidden py-2'>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                size='normal'
                theme='light'
              />
            </div>
          )}

          {error && <div className='text-sm text-red-400'>{error}</div>}

          <Button
            type='submit'
            disabled={isSubmitting || windowStatus !== 'open'}
            className='w-full'
          >
            {isSubmitting ? 'Submitting...' : 'Submit Round 2'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
