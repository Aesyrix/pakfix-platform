import Link from 'next/link';
import { ShieldAlert, Phone, AlertCircle, Zap, Droplets, Lock, Wind } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function EmergencyRepairSection() {
  const emergencies = [
    { title: 'Major Plumbing Leak', icon: Droplets, desc: 'Uncontrolled pipe burst or water tank overflow' },
    { title: 'Electrical Short Fault', icon: Zap, desc: 'Power tripping or burning smell near DB panel' },
    { title: 'Water Pump Failure', icon: Droplets, desc: 'Zero water supply to overhead tanks' },
    { title: 'Door Lock Outage', icon: Lock, desc: 'Main door jam or security lock breakdown' },
    { title: 'AC Complete Breakdown', icon: Wind, desc: 'Extreme summer heat emergency servicing' },
  ];

  return (
    <section className="py-12 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="bg-[#161616] text-white rounded-2xl p-6 sm:p-10 relative overflow-hidden border border-gray-800">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/20 border border-[#DC2626]/40 text-[#FCA5A5] text-xs font-bold">
                <AlertCircle className="h-4 w-4" />
                <span>Urgent Emergency Service</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Need urgent help?
              </h2>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Create an urgent service request with photo, location and contact info to dispatch local emergency repair technicians.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="#quick-booking"
                  className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md"
                >
                  Request Urgent Service
                </Link>
                <a
                  href="tel:+923001234567"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#00824A]" />
                  <span>Call Support</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {emergencies.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-gray-900/90 rounded-xl p-3.5 border border-gray-800 hover:border-[#DC2626] transition-colors space-y-1.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DC2626]/20 text-[#FCA5A5]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    <p className="text-[10px] text-gray-400 leading-snug">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
