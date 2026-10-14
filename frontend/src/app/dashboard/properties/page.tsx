'use client';

import { Building2, Home, MapPin, Plus, Wrench, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Input, Select } from '@/components/ui/Input';
import { useT } from '@/components/i18n/LocaleProvider';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: string;
  unitsCount: number;
  activeJobsCount: number;
  totalMaintenancePkr: number;
  lastServiceDate: string;
}

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'PROP-01',
    name: 'Gulberg House (Primary Home)',
    address: '142-B, Block H, Gulberg III',
    city: 'Lahore',
    type: 'Residential House (1 Kanal)',
    unitsCount: 1,
    activeJobsCount: 1,
    totalMaintenancePkr: 45000,
    lastServiceDate: '12 Sep 2026',
  },
  {
    id: 'PROP-02',
    name: 'DHA Apartment Unit 4B',
    address: 'Building 18-C, Commercial Plaza, DHA Phase 5',
    city: 'Lahore',
    type: 'Rental Apartment',
    unitsCount: 1,
    activeJobsCount: 0,
    totalMaintenancePkr: 28000,
    lastServiceDate: '01 Aug 2026',
  },
  {
    id: 'PROP-03',
    name: 'F-7 Commercial Office',
    address: 'Suite 302, Jinnah Super, F-7/2',
    city: 'Islamabad',
    type: 'Commercial Office',
    unitsCount: 3,
    activeJobsCount: 0,
    totalMaintenancePkr: 82000,
    lastServiceDate: '28 Jul 2026',
  },
];

/** Urdu for the sample property copy; nicknames and addresses stay as written. */
const PROPERTY_UR: Record<string, string> = {
  'Residential House (1 Kanal)': 'رہائشی مکان (1 کنال)',
  'Rental Apartment': 'کرائے کا اپارٹمنٹ',
  'Commercial Office': 'تجارتی دفتر',
  'Just Added': 'ابھی شامل کیا گیا',
};

export default function PropertiesDashboardPage() {
  const t = useT();
  const [properties, setProperties] = useState(SAMPLE_PROPERTIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('Residential House');
  const [city, setCity] = useState('Lahore');

  function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !address) return;

    const newProp: Property = {
      id: `PROP-0${properties.length + 1}`,
      name,
      address,
      city,
      type,
      unitsCount: 1,
      activeJobsCount: 0,
      totalMaintenancePkr: 0,
      lastServiceDate: 'Just Added',
    };

    setProperties([...properties, newProp]);
    setShowAddModal(false);
    setName('');
    setAddress('');
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00824A]">{t('Asset Management', 'اثاثہ جات کا انتظام')}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            {t('My Properties & Assets', 'میری پراپرٹیز اور اثاثے')}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            {t('Keep track of maintenance history, active repair tickets, and maintenance logs across all your locations.', 'اپنے تمام مقامات پر مرمت کی تاریخ، فعال مرمت ٹکٹس اور مرمت کے ریکارڈ کا حساب رکھیں۔')}
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          {t('Add New Property', 'نئی پراپرٹی شامل کریں')}
        </Button>
      </div>

      {/* Add Property Form Card Modal */}
      {showAddModal && (
        <Card className="mb-8 border-[#00824A] ring-2 ring-[#00824A]/20 shadow-xl">
          <CardHeader className="border-b border-[var(--border)] pb-3">
            <CardTitle className="text-base font-bold text-foreground">{t('Register New Property', 'نئی پراپرٹی رجسٹر کریں')}</CardTitle>
          </CardHeader>
          <CardBody className="p-5">
            <form onSubmit={handleAddProperty} className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('Property Nickname', 'پراپرٹی کا نام')}
                placeholder={t('e.g. Model Town Villa / Office Suite', 'مثلاً ماڈل ٹاؤن ولا / آفس سویٹ')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Select label={t('City', 'شہر')} value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </Select>
              <Input
                label={t('Full Address', 'مکمل پتہ')}
                placeholder={t('Street, Phase, Sector', 'گلی، فیز، سیکٹر')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <Select label={t('Property Type', 'پراپرٹی کی قسم')} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Residential House">{t('Residential House', 'رہائشی مکان')}</option>
                <option value="Rental Apartment">{t('Rental Apartment', 'کرائے کا اپارٹمنٹ')}</option>
                <option value="Commercial Office">{t('Commercial Office', 'تجارتی دفتر')}</option>
                <option value="Retail Shop">{t('Retail Shop', 'ریٹیل دکان')}</option>
              </Select>

              <div className="sm:col-span-2 flex items-center justify-end gap-2 mt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                  {t('Cancel', 'منسوخ کریں')}
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {t('Save Property', 'پراپرٹی محفوظ کریں')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Property Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((prop) => (
          <Card key={prop.id} interactive className="flex flex-col justify-between shadow-md">
            <div>
              <CardHeader className="border-b border-[var(--border)] pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#15803D]">
                      {prop.type.includes('House') ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </span>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{prop.name}</CardTitle>
                      <span className="text-[11px] font-medium text-ink-500">{t(prop.type, PROPERTY_UR[prop.type])}</span>
                    </div>
                  </div>
                  {prop.activeJobsCount > 0 ? (
                    <Badge tone="brand">{t('1 Active Repair', '1 فعال مرمت')}</Badge>
                  ) : (
                    <Badge tone="neutral">{t('All Systems OK', 'تمام نظام درست')}</Badge>
                  )}
                </div>
              </CardHeader>

              <CardBody className="p-4 space-y-3.5 text-xs">
                <div className="flex items-start gap-1.5 text-ink-600">
                  <MapPin className="h-4 w-4 text-ink-400 shrink-0 mt-0.5" />
                  <span>{prop.address}, {prop.city}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] text-ink-600">
                  <div>
                    <span className="text-[10px] text-ink-400 uppercase font-semibold">{t('Total Maintenance Spend', 'کل مرمت کے اخراجات')}</span>
                    <p className="font-extrabold text-[#00824A] text-sm mt-0.5">PKR {prop.totalMaintenancePkr.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-400 uppercase font-semibold">{t('Last Serviced', 'آخری سروس')}</span>
                    <p className="font-bold text-foreground text-xs mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-ink-400" />
                      {t(prop.lastServiceDate, PROPERTY_UR[prop.lastServiceDate])}
                    </p>
                  </div>
                </div>
              </CardBody>
            </div>

            <div className="p-4 pt-0 border-t border-[var(--border)] mt-2">
              <Button variant="ghost" size="sm" block className="justify-between text-xs font-bold text-[#00824A] hover:bg-[#DCFCE7]/40">
                <span>{t('View Property History & Specs', 'پراپرٹی کی تاریخ اور تفصیلات دیکھیں')}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
