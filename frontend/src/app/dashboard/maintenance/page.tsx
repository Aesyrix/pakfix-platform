'use client';

import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
  Droplets,
  Shield,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

interface Plan {
  id: string;
  title: string;
  category: string;
  recommendedMonth: string;
  frequency: string;
  icon: LucideIcon;
  tone: 'brand' | 'accent' | 'info' | 'warn';
  estimatedPkr: string;
  benefits: string[];
  status: 'due' | 'scheduled' | 'up_to_date';
}

const MAINTENANCE_PLANS: Plan[] = [
  {
    id: 'M-01',
    title: 'Pre-Summer AC Inverter Jet Clean & Gas Check',
    category: 'HVAC & Cooling',
    recommendedMonth: 'March - April (Pre-Summer)',
    frequency: 'Bi-Annual (Every 6 Months)',
    icon: Sun,
    tone: 'brand',
    estimatedPkr: '2,500 / unit',
    benefits: ['Lowers electricity bills by up to 25%', 'Prevents compressor burnout', 'Anti-bacterial coil wash'],
    status: 'due',
  },
  {
    id: 'M-02',
    title: 'Annual Electrical Safety & Main DB Audit',
    category: 'Electrical Safety',
    recommendedMonth: 'May (Pre-Monsoon)',
    frequency: 'Annual (Once a Year)',
    icon: Zap,
    tone: 'accent',
    estimatedPkr: '3,500 full house',
    benefits: ['Prevents short-circuit fires', 'Load testing for iron & AC', 'Earthing check'],
    status: 'scheduled',
  },
  {
    id: 'M-03',
    title: 'Overhead & Underground Water Tank Flushing',
    category: 'Plumbing & Water',
    recommendedMonth: 'June & December',
    frequency: 'Bi-Annual',
    icon: Droplets,
    tone: 'info',
    estimatedPkr: '4,000 / tank',
    benefits: ['Sediment & algae removal', 'High-pressure chlorination', 'Leak check'],
    status: 'up_to_date',
  },
  {
    id: 'M-04',
    title: 'Monsoon Pest Control & Termite Barrier',
    category: 'Pest Management',
    recommendedMonth: 'August (Monsoon)',
    frequency: 'Quarterly',
    icon: Shield,
    tone: 'warn',
    estimatedPkr: '5,000 / house',
    benefits: ['Odorless Gel spray', 'Cockroach & termite guarantee', 'Safe for children & pets'],
    status: 'due',
  },
];

export default function MaintenancePage() {
  const [filter, setFilter] = useState<'all' | 'due' | 'scheduled'>('all');

  const filtered = filter === 'all' ? MAINTENANCE_PLANS : MAINTENANCE_PLANS.filter((p) => p.status === filter);

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Preventive Care</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Preventive Maintenance Schedule
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            Avoid costly emergency repairs with scheduled seasonal checkups tailored for Pakistani homes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-2xl border border-[var(--border)] shadow-xs text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'all' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-ink-600 hover:text-foreground'}`}
          >
            All Services
          </button>
          <button
            onClick={() => setFilter('due')}
            className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'due' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-ink-600 hover:text-foreground'}`}
          >
            Due Soon
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'scheduled' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-ink-600 hover:text-foreground'}`}
          >
            Scheduled
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.id} className="flex flex-col justify-between shadow-md">
              <div>
                <CardHeader className="border-b border-[var(--border)] pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        plan.tone === 'brand' ? 'bg-[#DCFCE7] text-[#15803D]' :
                        plan.tone === 'accent' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                        plan.tone === 'info' ? 'bg-[#E0F2FE] text-[#0369A1]' : 'bg-[#FEF3C7] text-[#B45309]'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{plan.category}</span>
                        <CardTitle className="text-base font-bold text-foreground leading-snug">{plan.title}</CardTitle>
                      </div>
                    </div>

                    <Badge tone={plan.status === 'due' ? 'warn' : plan.status === 'scheduled' ? 'brand' : 'neutral'}>
                      {plan.status === 'due' ? 'Action Recommended' : plan.status === 'scheduled' ? 'Scheduled' : 'Up To Date'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardBody className="p-4 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-surface-muted/60 p-3 rounded-2xl text-ink-600">
                    <div>
                      <span className="text-[10px] text-ink-400 font-semibold uppercase">Recommended Window</span>
                      <p className="font-bold text-foreground mt-0.5">{plan.recommendedMonth}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-400 font-semibold uppercase">Estimated Cost</span>
                      <p className="font-extrabold text-[#16A34A] mt-0.5">PKR {plan.estimatedPkr}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-foreground text-[11px] uppercase tracking-wide">Key Preventive Benefits</p>
                    {plan.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-ink-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </div>

              <div className="p-4 pt-0 border-t border-[var(--border)] mt-2">
                <ButtonLink href={`/ai?q=${encodeURIComponent(plan.title)}`} variant="primary" size="sm" block>
                  Book Maintenance Inspection
                </ButtonLink>
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
