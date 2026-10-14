'use client';

import { useState, type FormEvent } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, KeyRound, Save } from 'lucide-react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useT } from '@/components/i18n/LocaleProvider';

const CITIES = [
  { value: 'lahore', en: 'Lahore', ur: 'لاہور' },
  { value: 'karachi', en: 'Karachi', ur: 'کراچی' },
  { value: 'islamabad', en: 'Islamabad', ur: 'اسلام آباد' },
  { value: 'rawalpindi', en: 'Rawalpindi', ur: 'راولپنڈی' },
  { value: 'faisalabad', en: 'Faisalabad', ur: 'فیصل آباد' },
];

export default function ProfilePage() {
  const t = useT();

  const [fullName, setFullName] = useState('Ahmed Raza');
  const [email, setEmail] = useState('ahmed.raza@example.com');
  const [mobile, setMobile] = useState('+92 300 1234567');
  const [city, setCity] = useState('lahore');
  const [bio, setBio] = useState(
    'Homeowner in Gulberg III. I mostly book AC servicing and electrical repairs.'
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Account"
        eyebrowUr="اکاؤنٹ"
        title="Profile"
        titleUr="پروفائل"
        description="Keep your details up to date so professionals can reach you."
        descriptionUr="اپنی تفصیلات تازہ رکھیں تاکہ پروفیشنلز آپ سے رابطہ کر سکیں۔"
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card>
          <CardBody className="flex flex-col items-center gap-3 p-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#00824A] to-[#2563EB] text-2xl font-bold text-white shadow-xs">
              AR
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{fullName}</p>
              <p className="text-xs text-ink-500">{t('Customer since 2024', '2024 سے گاہک')}</p>
            </div>
            <Button variant="secondary" size="sm" type="button" className="mt-1">
              <KeyRound className="h-4 w-4" />
              {t('Change password', 'پاس ورڈ تبدیل کریں')}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-base font-semibold tracking-tight">{t('Personal details', 'ذاتی تفصیلات')}</h2>
            <CardDescription>{t('This information is only shared with your consent.', 'یہ معلومات صرف آپ کی رضامندی سے شیئر کی جاتی ہیں۔')}</CardDescription>
          </CardHeader>
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <Input
              label={t('Full name', 'پورا نام')}
              leading={<UserIcon className="h-4 w-4" />}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <Input
              label={t('Email address', 'ای میل ایڈریس')}
              type="email"
              leading={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label={t('Mobile number', 'موبائل نمبر')}
              leading={<Phone className="h-4 w-4" />}
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
            />
            <Select
              label={t('City', 'شہر')}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              {CITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.en, option.ur)}
                </option>
              ))}
            </Select>

            <div className="sm:col-span-2">
              <Textarea
                label={t('About you', 'آپ کے بارے میں')}
                hint={t('A short note helps professionals understand your needs.', 'ایک مختصر نوٹ پروفیشنلز کو آپ کی ضروریات سمجھنے میں مدد دیتا ہے۔')}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <Button variant="primary" size="md" type="submit">
                <Save className="h-4 w-4" />
                {t('Save changes', 'تبدیلیاں محفوظ کریں')}
              </Button>
              <Button variant="secondary" size="md" type="button">
                {t('Cancel', 'منسوخ کریں')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>

      <div className="mt-8">
        <SectionTitle urdu="رابطے کی ترجیح" className="mb-3">
          Contact preference
        </SectionTitle>
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-surface p-4 text-sm text-ink-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          {t(
            'We use your city to match you with nearby professionals.',
            'ہم آپ کے شہر کا استعمال آپ کو قریبی پروفیشنلز سے ملانے کے لیے کرتے ہیں۔'
          )}
        </div>
      </div>
    </Container>
  );
}
