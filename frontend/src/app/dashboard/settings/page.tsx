'use client';

import { useState } from 'react';
import { Globe, ShieldCheck, AlertTriangle, Trash2, Info } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Checkbox } from '@/components/ui/Input';
import { useT } from '@/components/i18n/LocaleProvider';

type Language = 'en' | 'ur';

export default function SettingsPage() {
  const t = useT();

  const [language, setLanguage] = useState<Language>('en');
  const [sharePhone, setSharePhone] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Preferences"
        eyebrowUr="ترجیحات"
        title="Settings"
        titleUr="ترتیبات"
        description="Control your language, privacy and account."
        descriptionUr="اپنی زبان، رازداری اور اکاؤنٹ کو کنٹرول کریں۔"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#00824A]" />
              <h2 className="text-base font-semibold tracking-tight">{t('Language & region', 'زبان اور علاقہ')}</h2>
            </div>
            <CardDescription>{t('Choose the language for the app.', 'ایپ کے لیے زبان منتخب کریں۔')}</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={language === 'en' ? 'primary' : 'secondary'}
                size="md"
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
              >
                {t('English', 'English')}
              </Button>
              <Button
                variant={language === 'ur' ? 'primary' : 'secondary'}
                size="md"
                type="button"
                onClick={() => setLanguage('ur')}
                aria-pressed={language === 'ur'}
              >
                اردو
              </Button>
            </div>
            <div className="flex items-start gap-2 text-xs text-ink-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t(
                'The quick language toggle lives in the top bar on every page.',
                'ہر صفحے پر فوری زبان کی تبدیلی اوپر والے بار میں موجود ہے۔'
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00824A]" />
              <h2 className="text-base font-semibold tracking-tight">{t('Privacy', 'رازداری')}</h2>
            </div>
            <CardDescription>{t('Decide what others can see.', 'فیصلہ کریں کہ دوسرے کیا دیکھ سکتے ہیں۔')}</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <Checkbox
              label={t('Share my phone number with assigned professionals', 'میرا فون نمبر تفویض کردہ پروفیشنلز کے ساتھ شیئر کریں')}
              checked={sharePhone}
              onChange={(event) => setSharePhone(event.target.checked)}
            />
            <Checkbox
              label={t('Make my profile visible to other customers', 'میرا پروفائل دوسرے گاہکوں کو دکھائیں')}
              checked={publicProfile}
              onChange={(event) => setPublicProfile(event.target.checked)}
            />
          </CardBody>
        </Card>

        <Card className="border-[#DC2626]/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
              <h2 className="text-base font-semibold tracking-tight text-[#DC2626]">{t('Danger zone', 'خطرناک زون')}</h2>
            </div>
            <CardDescription>
              {t(
                'Deleting your account removes your bookings, saved pros and history. This cannot be undone.',
                'اکاؤنٹ حذف کرنے سے آپ کی بکنگ، محفوظ پروفیشنلز اور تاریخ ختم ہو جائے گی۔ اسے واپس نہیں لایا جا سکتا۔'
              )}
            </CardDescription>
          </CardHeader>
          <CardBody className="pt-0">
            <Button variant="danger" size="md" type="button">
              <Trash2 className="h-4 w-4" />
              {t('Delete account', 'اکاؤنٹ حذف کریں')}
            </Button>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
