'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/components/i18n/LocaleProvider';
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
const ROLE_OPTIONS: Array<{
  value: SelfRegisterableRole;
  label: string;
  labelUr: string;
  hint: string;
  hintUr: string;
}> = [
  { value: 'customer', label: 'I need something fixed', labelUr: 'مجھے کچھ ٹھیک کروانا ہے', hint: 'Book repairs and maintenance for your home.', hintUr: 'اپنے گھر کے لیے مرمت اور دیکھ بھال بک کریں۔' },
  { value: 'technician', label: 'I am a professional', labelUr: 'میں ایک پروفیشنل ہوں', hint: 'Receive jobs and quote for work near you.', hintUr: 'اپنے قریب کام کے جاب وصول کریں اور کوٹ دیں۔' },
  { value: 'company', label: 'I run a service company', labelUr: 'میں سروس کمپنی چلاتا ہوں', hint: 'Manage a team of technicians and their jobs.', hintUr: 'ٹیکنیشنز کی ٹیم اور ان کے کام سنبھالیں۔' },
  { value: 'property_manager', label: 'I manage properties', labelUr: 'میں پراپرٹیز کا انتظام کرتا ہوں', hint: 'Track maintenance across multiple units.', hintUr: 'متعدد یونٹس میں دیکھ بھال ٹریک کریں۔' },
];

/** Accepts 03xxxxxxxxx, 923xxxxxxxxx or +923xxxxxxxxx, as the API does. */
const PAKISTANI_MOBILE = /^(\+92|92|0)?3\d{9}$/;

function makeSchema(t: (english: string, urdu?: string) => string) {
  return z
    .object({
      name: z.string().min(2, t('Enter your full name.', 'اپنا پورا نام درج کریں۔')).max(120),
      email: z.string().email(t('Enter a valid email address.', 'درست ای میل پتہ درج کریں۔')),
      phone: z
        .string()
        .transform((value) => value.replace(/[\s()-]/g, ''))
        .refine((value) => PAKISTANI_MOBILE.test(value), {
          message: t('Enter a valid Pakistani mobile number, for example 0300 1234567.', 'درست پاکستانی موبائل نمبر درج کریں، مثلاً 0300 1234567۔'),
        }),
      password: z
        .string()
        .min(8, t('Use at least 8 characters.', 'کم از کم 8 حروف استعمال کریں۔'))
        .regex(/[a-zA-Z]/, t('Include at least one letter.', 'کم از کم ایک حرف شامل کریں۔'))
        .regex(/\d/, t('Include at least one number.', 'کم از کم ایک نمبر شامل کریں۔')),
      password_confirmation: z.string(),
      role: z.enum(['customer', 'technician', 'company', 'property_manager']),
      city_id: z.string().optional(),
      referral_code: z.string().optional(),
      accepts_terms: z.literal(true, {
        message: t('You need to accept the terms to create an account.', 'اکاؤنٹ بنانے کے لیے آپ کو شرائط قبول کرنا ہوں گی۔'),
      }),
    })
    .refine((values) => values.password === values.password_confirmation, {
      message: t('Both passwords must match.', 'دونوں پاس ورڈ یکساں ہونے چاہئیں۔'),
      path: ['password_confirmation'],
    });
}

type RegisterValues = z.input<ReturnType<typeof makeSchema>>;

export function RegisterForm({
  cities,
  className,
}: {
  cities: City[];
  className?: string;
}) {
  const t = useT();
  const schema = useMemo(() => makeSchema(t), [t]);
  const router = useRouter();
  const toast = useToast();
  const registerUser = useAuthStore((state) => state.register);
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer', accepts_terms: false as unknown as true },
  });

  const selectedRole = useWatch({ control, name: 'role' });

  async function nextStep() {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      const valid = await trigger(['name', 'email', 'phone', 'city_id']);
      if (valid) setStep(3);
    }
  }

  function prevStep() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  }

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

      toast.success(t('Account created! Welcome to PakFix.', 'اکاؤنٹ بن گیا! پاک فکس میں خوش آمدید۔'));
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
      setFormError(t('Something went wrong. Please try again.', 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔'));
    }
  }

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Step Indicator Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-ink-500">
          <span>{t('STEP', 'مرحلہ')} {step} {t('OF 3', 'از 3')}</span>
          <span className="text-[#00824A]">
            {step === 1 ? t('Account Type', 'اکاؤنٹ کی قسم') : step === 2 ? t('Personal Info', 'ذاتی معلومات') : t('Security & Terms', 'سیکیورٹی اور شرائط')}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00824A] to-[#2563EB] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {formError ? (
          <p
            role="alert"
            className="rounded-xl border border-danger-500/40 bg-danger-500/10 px-3.5 py-3 text-sm text-danger-600 font-medium"
          >
            {formError}
          </p>
        ) : null}

        {/* STEP 1: Role Selection */}
        {step === 1 && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-bold text-foreground">{t('Select your account type:', 'اپنے اکاؤنٹ کی قسم منتخب کریں:')}</legend>

            {ROLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200',
                  selectedRole === option.value
                    ? 'border-[#00824A] bg-[#DCFCE7]/40 shadow-xs'
                    : 'border-[var(--border)] hover:bg-surface-muted'
                )}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="mt-1 h-4 w-4 accent-[#00824A]"
                  {...register('role')}
                />
                <span>
                  <span className="block text-sm font-bold text-foreground">{t(option.label, option.labelUr)}</span>
                  <span className="block text-xs text-ink-500 mt-0.5">{t(option.hint, option.hintUr)}</span>
                </span>
              </label>
            ))}

            <Button type="button" size="lg" block variant="primary" onClick={nextStep} className="mt-4">
              {t('Continue', 'جاری رکھیں')}
            </Button>
          </fieldset>
        )}

        {/* STEP 2: Personal Details */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Input
              label={t('Full name', 'پورا نام')}
              autoComplete="name"
              placeholder={t('e.g. Ali Khan', 'مثلاً علی خان')}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label={t('Email address', 'ای میل پتہ')}
              type="email"
              autoComplete="email"
              placeholder="ali@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label={t('Mobile number', 'موبائل نمبر')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0300 1234567"
              hint={t('We use this to reach you about bookings.', 'ہم اسے بکنگ کے بارے میں رابطے کے لیے استعمال کرتے ہیں۔')}
              error={errors.phone?.message}
              required
              {...register('phone')}
            />

            <Select label={t('City', 'شہر')} error={errors.city_id?.message} {...register('city_id')}>
              <option value="">{t('Choose your city', 'اپنا شہر منتخب کریں')}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>

            <div className="flex items-center gap-2 mt-2">
              <Button type="button" variant="secondary" size="lg" onClick={prevStep} className="w-1/3">
                {t('Back', 'واپس')}
              </Button>
              <Button type="button" variant="primary" size="lg" onClick={nextStep} className="w-2/3">
                {t('Next Step', 'اگلا مرحلہ')}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Passwords & Terms */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Input
              label={t('Password', 'پاس ورڈ')}
              type="password"
              autoComplete="new-password"
              hint={t('At least 8 characters with a letter & number.', 'کم از کم 8 حروف، ایک حرف اور ایک نمبر کے ساتھ۔')}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Input
              label={t('Confirm password', 'پاس ورڈ کی تصدیق')}
              type="password"
              autoComplete="new-password"
              error={errors.password_confirmation?.message}
              required
              {...register('password_confirmation')}
            />

            <Input
              label={t('Referral code (optional)', 'ریفرل کوڈ (اختیاری)')}
              placeholder="PAKFIX-XXXX00"
              error={errors.referral_code?.message}
              {...register('referral_code')}
            />

            <Checkbox
              label={
                <>
                  {t('I agree to the', 'میں متفق ہوں')}{' '}
                  <Link href="/terms-of-service" className="font-semibold text-[#00824A] underline">
                    {t('terms of service', 'شرائطِ خدمات')}
                  </Link>{' '}
                  {t('and', 'اور')}{' '}
                  <Link href="/privacy-policy" className="font-semibold text-[#00824A] underline">
                    {t('privacy policy', 'رازداری پالیسی')}
                  </Link>
                  .
                </>
              }
              error={errors.accepts_terms?.message}
              {...register('accepts_terms')}
            />

            <div className="flex items-center gap-2 mt-2">
              <Button type="button" variant="secondary" size="lg" onClick={prevStep} className="w-1/3">
                {t('Back', 'واپس')}
              </Button>
              <Button type="submit" size="lg" variant="primary" loading={isSubmitting} className="w-2/3">
                {t('Complete Registration', 'رجسٹریشن مکمل کریں')}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
