import Link from 'next/link';
import { Home, ShieldCheck, History, Calendar, Bell, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function HomeMaintenanceSection() {
  const assets = [
    { title: 'Living Room Inverter AC', lastService: '3 Months Ago', nextService: 'Due in 15 Days', status: 'Maintenance Due' },
    { title: 'Dawlance Refrigerator', lastService: '6 Months Ago', nextService: 'Healthy', status: 'Good Condition' },
    { title: 'Solar Inverter 10kW', lastService: '1 Month Ago', nextService: 'Cleaned', status: 'Optimal Output' },
    { title: 'Water Pump Motor', lastService: '4 Months Ago', nextService: 'Due Next Month', status: 'Inspection Due' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Property Care</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
              Keep your home maintained,<br />
              <span className="text-[#008A4B]">not just repaired.</span>
            </h2>
            <p className="text-sm text-[#475467] leading-relaxed">
              Track appliances, save full repair history, schedule recurring preventive maintenance, and receive smart reminders.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] flex items-center gap-2.5">
                <Home className="h-5 w-5 text-[#008A4B]" />
                <span className="text-xs font-bold text-[#161616]">Add Your Property</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] flex items-center gap-2.5">
                <History className="h-5 w-5 text-[#008A4B]" />
                <span className="text-xs font-bold text-[#161616]">Save Repair History</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-[#008A4B]" />
                <span className="text-xs font-bold text-[#161616]">Schedule Maintenance</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] flex items-center gap-2.5">
                <Bell className="h-5 w-5 text-[#008A4B]" />
                <span className="text-xs font-bold text-[#161616]">Get Smart Reminders</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/home-maintenance"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008A4B] hover:bg-[#007541] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Add Your Home Assets</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Dashboard Assets Preview */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-[#008A4B]" />
                <span className="text-xs font-extrabold text-[#161616]">MY HOME ASSETS & MAINTENANCE</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                4 Assets Logged
              </span>
            </div>

            <div className="space-y-3">
              {assets.map((a) => (
                <div key={a.title} className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#161616]">{a.title}</h4>
                    <p className="text-[10px] text-[#667085]">Last Service: {a.lastService}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      a.status.includes('Due') ? 'bg-amber-100 text-amber-800' : 'bg-[#EAF7F0] text-[#006838]'
                    }`}>
                      {a.status}
                    </span>
                    <p className="text-[10px] text-[#667085] mt-1">{a.nextService}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
