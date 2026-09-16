'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

/**
 * Sign-in.
 *
 * Client-side validation catches empty fields so the user is not made to wait
 * for a round trip to learn that. Everything that actually matters -- whether
 * the credentials are right, whether the account is suspended, rate limiting
 * -- is decided by the API, and its errors are shown as-is.
 */
const schema = z.object({
  login: z.string().min(1, 'Enter your email address or phone number.'),
  password: z.string().min(1, 'Enter your password.'),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const login = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { login: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);

    try {
      const user = await login(values);

      toast.success(`Signed in as ${user.name}.`);

      // Honour where the user was heading before the guard bounced them,
      // but only within this site.
      const next = searchParams.get('next');
      const destination =
        next && next.startsWith('/') && !next.startsWith('//')
          ? next
          : (user.home_path ?? '/dashboard');

      router.push(destination);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        // Field-level messages where the API gave them.
        for (const [field, messages] of Object.entries(error.errors)) {
          if (field === 'login' || field === 'password') {
            setError(field, { message: messages[0] });
          }
        }

        if (Object.keys(error.errors).length === 0) {
          setFormError(error.message);
        }

        return;
      }

      setFormError('Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-4', className)} noValidate>
      {formError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-control)] border border-danger-500/40 bg-danger-500/10 px-3.5 py-3 text-sm text-danger-600"
        >
          {formError}
        </p>
      ) : null}

      <Input
        label="Email or phone"
        autoComplete="username"
        inputMode="email"
        placeholder="you@example.com or 0300 1234567"
        error={errors.login?.message}
        required
        {...register('login')}
      />

      <div>
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          required
          {...register('password')}
        />
        <div className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" block loading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
