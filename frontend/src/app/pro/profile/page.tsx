'use client';

import { MapPin, Star, Wrench } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { VerifiedBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { useT } from '@/components/i18n/LocaleProvider';

const TRADES = [
  { value: 'electrical', label: 'Electrical work', labelUr: 'بجلی کا کام' },
  { value: 'hvac', label: 'HVAC & cooling', labelUr: 'ایچ وی اے سی اور کولنگ' },
  { value: 'plumbing', label: 'Plumbing', labelUr: 'پلمبنگ' },
  { value: 'appliance', label: 'Appliance repair', labelUr: 'آلات کی مرمت' },
];

const CITIES = [
  { value: 'lahore', label: 'Lahore', labelUr: 'لاہور' },
  { value: 'karachi', label: 'Karachi', labelUr: 'کراچی' },
  { value: 'islamabad', label: 'Islamabad', labelUr: 'اسلام آباد' },
  { value: 'rawalpindi', label: 'Rawalpindi', labelUr: 'راولپنڈی' },
  { value: 'faisalabad', label: 'Faisalabad', labelUr: 'فیصل آباد' },
];

/**
 * The public listing and the form that edits it. Phase 1: sample values until
 * the profile endpoints land.
 */
export default function ProProfilePage() {
  const t = useT();
  const [businessName, setBusinessName] = useState('Usman Electric Works & AC Services');
  const [trade, setTrade] = useState('electrical');
  const [city, setCity] = useState('lahore');
  const [hourlyRate, setHourlyRate] = useState('1,200');
  const [about, setAbout] = useState(
    'Certified electrician and HVAC technician with 12 years of field experience across Lahore.'
  );
  const [emergency, setEmergency] = useState(true);

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Listing"
        eyebrowUr="لِسٹنگ"
        title="Public profile"
        titleUr="عوامی پروفائل"
        description="This is what customers see before they book you."
        descriptionUr="بکنگ سے پہلے گاہک یہی دیکھتے ہیں۔"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-[#00824A] to-[#2563EB]" />
            <CardBody className="space-y-4 p-6">
              <div className="-mt-14 flex items-end justify-between">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-gradient-to-tr from-[#00824A] to-[#2563EB] text-2xl font-extrabold text-white">
                  UE
                </span>
                <VerifiedBadge />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-foreground">{businessName}</h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-500">
                  <Wrench className="h-4 w-4 text-ink-400" />
                  {t('Electrical & HVAC', 'بجلی اور ایچ وی اے سی')}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin className="h-4 w-4 text-[#2563EB]" />
                  {t('Gulberg III, Lahore', 'گلبرگ III، لاہور')}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-surface-muted/60 px-3 py-2">
                <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-sm font-bold text-foreground">4.92</span>
                <span className="text-xs text-ink-500">{t('from 142 reviews', '142 جائزوں سے')}</span>
              </div>

              <p className="text-sm text-ink-600">{about}</p>

              <ButtonLink href="/pro/reviews" variant="secondary" size="sm" block>
                {t('See all reviews', 'تمام جائزے دیکھیں')}
              </ButtonLink>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>{t('Edit listing', 'لِسٹنگ میں ترمیم کریں')}</CardTitle>
            </CardHeader>
            <CardBody>
              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => event.preventDefault()}
              >
                <Input
                  label={t('Business name', 'کاروبار کا نام')}
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label={t('Trade / service category', 'ہنر / سروس کی قسم')}
                    value={trade}
                    onChange={(event) => setTrade(event.target.value)}
                  >
                    {TRADES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {t(item.label, item.labelUr)}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label={t('City', 'شہر')}
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  >
                    {CITIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {t(item.label, item.labelUr)}
                      </option>
                    ))}
                  </Select>
                </div>

                <Input
                  label={t('Hourly rate (PKR)', 'فی گھنٹہ نرخ (روپے)')}
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                  inputMode="numeric"
                  hint={t('Shown as a starting price on your profile.', 'پروفائل پر ابتدائی قیمت کے طور پر دکھایا جاتا ہے۔')}
                />

                <Textarea
                  label={t('About', 'تعارف')}
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  hint={t('A short description of your experience.', 'آپ کے تجربے کی مختصر تفصیل۔')}
                />

                <Checkbox
                  label={t('Available for emergency jobs', 'ہنگامی کاموں کے لیے دستیاب')}
                  checked={emergency}
                  onChange={(event) => setEmergency(event.target.checked)}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit">{t('Save changes', 'تبدیلیاں محفوظ کریں')}</Button>
                  <Button type="button" variant="ghost">
                    {t('Cancel', 'منسوخ کریں')}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <div className="mt-4">
            <SectionTitle urdu="نوٹ">Note</SectionTitle>
            <p className="mt-1 text-xs text-ink-500">
              {t(
                'Changes are reviewed before they go live on the public listing.',
                'تبدیلیاں عوامی لِسٹنگ پر آنے سے پہلے جائزے سے گزرتی ہیں۔'
              )}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
