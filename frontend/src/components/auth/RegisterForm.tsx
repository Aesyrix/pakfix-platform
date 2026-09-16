'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import type { City, SelfRegisterableRole } from '@/lib/api/types';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

/**
 * Sign-up.
 *
 * The rules here deliberately mirror the Laravel FormRequest rather than
 * inventing their own: the server is still the authority, and duplicating a
 * *different* rule set is how a form ends up rejecting things the API accepts.
 */
const ROLE_OPTIONS: Array<{ value: SelfRegisterableRole; label: string; hint: string }> = [
  { value: 'customer', label: 'I need something fixed', hint: 'Book repairs and maintenance for your home.' },
  { value: 'technician', label: 'I am a professional', hint: 'Receive jobs and quote for work near you.' },
  { value: 'company', label: 'I run a service company', hint: 'Manage a team of technicians and their jobs.' },
  { value: 'property_manager', label: 'I manage properties', hint: 'Track maintenance across multiple units.' },
];

/** Accepts 03xxxxxxxxx, 923xxxxxxxxx or +923xxxxxxxxx, as the API does. */
const PAKISTANI_MOBILE = /^(\+92|92|0)?3\d{9}$/;

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name.').max(120),
    email: z.string().email('Enter a valid email address.'),
    phone: z
      .string()
      .transform((value) => value.replace(/[\s()-]/g, ''))
      .refine((value) => PAKISTANI_MOBILE.test(value), {
        message: 'Enter a valid Pakistani mobile number, for example 0300 1234567.',
      }),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[a-zA-Z]/, 'Include at least one letter.')
      .regex(/\d/, 'Include at least one number.'),
    password_confirmation: z.string(),
    role: z.enum(['customer', 'technician', 'company', 'property_manager']),
    city_id: z.string().optional(),
    referral_code: z.string().optional(),
    accepts_terms: z.literal(true, {
      message: 'You need to accept the terms to create an account.',
    }),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Both passwords must match.',
    path: ['password_confirmation'],
  });

type RegisterValues = z.input<typeof schema>;

export function RegisterForm({
  cities,
  className,
}: {
  cities: City[];
  className?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const registerUser = useAuthStore((state) => state.register);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer', accepts_terms: false as unknown as true },
  });

  // useWatch rather than watch(): it subscribes to one field instead of
  // re-rendering on every keystroke anywhere in the form.
  const selectedRole = useWatch({ control, name: 'role' });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);

    const parsed = schema.parse(values);

    try {
      const user = await registerUser({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        password: parsed.password,
        password_confirmation: parsed.password_confirmation,
        role: parsed.role,
        city_id: parsed.city_id ? Number(parsed.city_id) : null,
        referral_code: parsed.referral_code || null,
        accepts_terms: true,
      });

      toast.success('Account created. Welcome to PakFix.');
      router.push(user.home_path ?? '/dashboard');
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        let matched = false;

        for (const [field, messages] of Object.entries(error.errors)) {
          if (field in schema.shape || field === 'password') {
            setError(field as keyof RegisterValues, { message: messages[0] });
            matched = true;
          }
        }

        if (!matched) setFormError(error.message);

        return;
      }

      setFormError('Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-5', className)} noValidate>
      {formError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-control)] border border-danger-500/40 bg-danger-500/10 px-3.5 py-3 text-sm text-danger-600"
        >
          {formError}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">What brings you to PakFix?</legend>

        {ROLE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border p-3.5 transition-colors',
              selectedRole === option.value
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-[var(--border)] hover:bg-surface-muted'
            )}
          >
            <input
              type="radio"
              value={option.value}
              className="mt-1 h-4 w-4 accent-[var(--color-brand-600)]"
              {...register('role')}
            />
            <span>
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="block text-xs text-ink-500">{option.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <Input
        label="Full name"
        autoComplete="name"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Input
        label="Mobile number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0300 1234567"
        hint="We use this to reach you about a job. It is never shown publicly."
        error={errors.phone?.message}
        required
        {...register('phone')}
      />

      <Select label="City" error={errors.city_id?.message} {...register('city_id')}>
        <option value="">Choose your city</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </Select>

      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.password_confirmation?.message}
        required
        {...register('password_confirmation')}
      />

      <Input
        label="Referral code (optional)"
        placeholder="PAKFIX-XXXX00"
        error={errors.referral_code?.message}
        {...register('referral_code')}
      />

      <Checkbox
        label={
          <>
            I agree to the{' '}
            <a href="/terms-of-service" className="font-medium text-brand-600 underline">
              terms of service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" className="font-medium text-brand-600 underline">
              privacy policy
            </a>
            .
          </>
        }
        error={errors.accepts_terms?.message}
        {...register('accepts_terms')}
      />

      <Button type="submit" size="lg" block loading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
