'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[a-zA-Z]/, 'Include at least one letter.')
      .regex(/\d/, 'Include at least one number.'),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Both passwords must match.',
    path: ['password_confirmation'],
  });

type Values = z.infer<typeof schema>;

/** Token and email arrive in the link from the reset email. */
export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (!token || !email) {
    return (
      <div className="mt-6 flex flex-col gap-4">
        <p role="alert" className="rounded-[var(--radius-control)] border border-danger-500/40 bg-danger-500/10 px-3.5 py-3 text-sm text-danger-600">
          This reset link is incomplete. Request a new one and open the link straight from the email.
        </p>
        <ButtonLink href="/forgot-password" block>
          Request a new link
        </ButtonLink>
      </div>
    );
  }

  async function onSubmit(values: Values) {
    setFormError(null);

    try {
      const message = await authApi.resetPassword({ token, email, ...values });

      toast.success(message || 'Password updated.');
      router.push('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, messages] of Object.entries(error.errors)) {
          if (field === 'password' || field === 'password_confirmation') {
            setError(field, { message: messages[0] });
          }
        }

        if (!error.errors.password && !error.errors.password_confirmation) {
          setFormError(error.message);
        }

        return;
      }

      setFormError('Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
      {formError ? (
        <p role="alert" className="rounded-[var(--radius-control)] border border-danger-500/40 bg-danger-500/10 px-3.5 py-3 text-sm text-danger-600">
          {formError}
        </p>
      ) : null}

      <p className="text-sm text-ink-600">
        Setting a new password for <strong>{email}</strong>.
      </p>

      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.password_confirmation?.message}
        required
        {...register('password_confirmation')}
      />

      <p className="text-sm text-ink-500">Changing your password signs you out everywhere else.</p>

      <Button type="submit" size="lg" block loading={isSubmitting}>
        Save new password
      </Button>
    </form>
  );
}
