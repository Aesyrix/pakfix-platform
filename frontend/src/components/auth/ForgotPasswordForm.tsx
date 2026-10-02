'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';

const schema = z.object({ email: z.string().email('Enter the email address on your account.') });

type Values = z.infer<typeof schema>;

/**
 * The response is deliberately the same whether or not an account exists, so
 * this form cannot be used to find out who has one. The success screen says
 * "if that email belongs to an account" for the same reason.
 */
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  async function onSubmit(values: Values) {
    setFormError(null);

    try {
      await authApi.forgotPassword(values.email);
      setSentTo(values.email);
    } catch (error) {
      if (error instanceof ApiError) {
        const field = error.fieldError('email');

        if (field) setError('email', { message: field });
        else setFormError(error.message);

        return;
      }

      setFormError('Something went wrong. Please try again.');
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[#86EFAC] bg-[#DCFCE7] p-6 text-center">
        <MailCheck className="h-8 w-8 text-[#15803D]" aria-hidden="true" />
        <h2 className="text-lg font-bold">Check your email</h2>
        <p className="text-sm text-ink-700">
          If <strong>{sentTo}</strong> belongs to a PakFix account, a password reset link is on its way. The link is
          valid for 60 minutes.
        </p>
        <p className="text-sm text-ink-600">Nothing arrived? Check spam, then try again in a few minutes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
      {formError ? (
        <p role="alert" className="rounded-[var(--radius-control)] border border-danger-500/40 bg-danger-500/10 px-3.5 py-3 text-sm text-danger-600">
          {formError}
        </p>
      ) : null}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Button type="submit" size="lg" block loading={isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}
