'use client';

import Link from 'next/link';
import { Wrench, IdCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function ForProfessionalsSection() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24 bg-surface">
      <Container>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Individual Professionals */}
          <div className="bg-premium-dark text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between relative isolate overflow-hidden shadow-floating">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-solid text-white flex items-center justify-center">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {t('Are you a skilled service professional?', 'کیا آپ ہنرمند سروس پروفیشنل ہیں؟')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-300 leading-relaxed">
                {t('Join PakFix to connect directly with customers looking for quality plumbing, electrical, AC and repair services.', 'پاک فکس جوائن کریں اور معیاری پلمبنگ، الیکٹریکل، اے سی اور مرمت کی خدمات کے خواہشمند گاہکوں سے براہِ راست جڑیں۔')}
              </p>

              <ul className="space-y-2 text-xs text-ink-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>{t('Create verified professional profile', 'تصدیق شدہ پروفیشنل پروفائل بنائیں')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>{t('Receive service requests in your area', 'اپنے علاقے میں سروس درخواستیں موصول کریں')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>{t('Send offers and build customer reviews', 'آفرز بھیجیں اور گاہکوں کے ریویو بنائیں')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/become-a-technician"
                className="px-6 py-3 rounded-xl bg-brand-solid hover:bg-brand-solid-hover text-white text-xs font-bold transition-colors"
              >
                {t('Join as Professional', 'پروفیشنل کے طور پر شامل ہوں')}
              </Link>
            </div>
          </div>

          {/* Card 2: What a professional needs to join (the real sign-up steps) */}
          <div className="bg-brand-glow rounded-3xl p-8 border border-brand-200/70 shadow-card space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent-solid text-white flex items-center justify-center">
                <IdCard className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-ink-900">
                {t('What you need to join', 'شامل ہونے کے لیے کیا چاہیے')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                {t('Sign up as a professional, then send these for a quick check by our team. Joining is free.', 'بطور پروفیشنل سائن اپ کریں، پھر ہماری ٹیم کی جانچ کے لیے یہ بھیجیں۔ شامل ہونا مفت ہے۔')}
              </p>

              <ul className="space-y-2 text-xs text-ink-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  <span>{t('Your CNIC, front and back', 'آپ کا شناختی کارڈ، دونوں طرف')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  <span>{t('A selfie, to match your CNIC', 'شناختی کارڈ سے ملانے کے لیے ایک سیلفی')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  <span>{t('The services you offer and your working hours', 'آپ کی خدمات اور کام کے اوقات')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                href="/become-a-technician"
                className="px-6 py-3 rounded-xl bg-accent-solid hover:bg-accent-solid-hover text-white text-xs font-bold transition-colors inline-block"
              >
                {t('How joining works', 'شامل ہونے کا طریقہ')}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
