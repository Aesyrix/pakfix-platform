import Link from 'next/link';
import { Bell, CalendarCheck, Wind, Droplets, Sun, Bug, Zap, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function SmartRemindersSection() {
  const reminders = [
    { title: 'AC Service', cycle: 'Every 6 Months', icon: Wind, desc: 'Prevents compressor failure & saves electricity' },
    { title: 'Water Tank Cleaning', cycle: 'Every 6 Months', icon: Droplets, desc: 'Ensures hygienic water supply for family' },
    { title: 'Solar Panel Cleaning', cycle: 'Monthly', icon: Sun, desc: 'Restores up to 25% lost energy efficiency' },
    { title: 'Pest Control', cycle: 'Every 3 Months', icon: Bug, desc: 'Protects furniture and wood from termites' },
    { title: 'Generator Inspection', cycle: 'Every 3 Months', icon: Zap, desc: 'Oil & filter change for backup power' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold mb-2">
              <Bell className="h-3.5 w-3.5 text-[#008A4B]" />
              Automated Reminders
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616]">
              PakFix remembers maintenance for you.
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              Never miss important seasonal home care schedules.
            </p>
          </div>

          <Link
            href="/home-maintenance"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008A4B] hover:bg-[#007541] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>Create Maintenance Plan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {reminders.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="bg-[#F8FAF9] rounded-2xl p-4 border border-[#E5E7EB] hover:border-[#008A4B] transition-all space-y-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#008A4B]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#161616]">{r.title}</h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                  {r.cycle}
                </span>
                <p className="text-[11px] text-[#667085] leading-snug pt-1">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
