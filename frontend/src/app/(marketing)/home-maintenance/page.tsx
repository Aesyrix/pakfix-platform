import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Home,
  ShieldCheck,
  Calendar,
  History,
  Bell,
  Wrench,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Home Maintenance & Asset Management | PakFix.pk',
  description:
    'Protect your home investment with PakFix preventive maintenance schedules, appliance logs, and automated service reminders across Pakistan.',
  path: '/home-maintenance',
});

export default function HomeMaintenancePage() {
  const features = [
    {
      icon: Home,
      title: 'Digital Home Asset Vault',
      desc: 'Log every AC unit, water motor, refrigerator, solar inverter and geyser in your house with serial numbers & warranty dates.',
    },
    {
      icon: Calendar,
      title: 'Preventive Service Schedules',
      desc: 'Avoid sudden mid-summer AC failures or water pump burnouts with automated 3-month and 6-month seasonal tune-up alerts.',
    },
    {
      icon: History,
      title: 'Complete Repair Logs',
      desc: 'Keep every past job receipt, part replacement date, and technician report safely accessible online for your property.',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      desc: 'Receive SMS, WhatsApp, and push notifications when water tank cleaning, filter replacement, or solar washing is due.',
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Home Maintenance' }]}
        eyebrow={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
            <Home className="h-3.5 w-3.5 text-[#00824A]" />
            Property Care System
          </div>
        }
        title="Keep Your Home Maintained, Not Just Repaired"
        subtitle="Prevent expensive home emergency breakdowns with PakFix structured maintenance tracking, asset history, and seasonal reminders."
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-[#F8FAF9] rounded-2xl p-6 border border-[#E5E7EB] space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#00824A]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#161616]">{f.title}</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-[#161616] text-white rounded-3xl p-8 sm:p-12 border border-gray-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to organize your home care?
            </h2>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              Add your property in seconds to begin logging appliances, viewing repair receipts, and scheduling tune-ups.
            </p>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-sm font-bold shadow-md transition-all"
              >
                <span>Open Customer Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
