import Link from 'next/link';
import {
  Droplets,
  Zap,
  Wind,
  Refrigerator,
  Sparkles,
  Hammer,
  Paintbrush,
  Sun,
  Bug,
  Grid,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function PopularServicesSection() {
  const services = [
    { title: 'Plumbing', desc: 'Leaks, pipes, drainage & motors', icon: Droplets, href: '/services/plumbing' },
    { title: 'Electrical', desc: 'Wiring, switches, breakers & UPS', icon: Zap, href: '/services/electrical' },
    { title: 'AC Repair', desc: 'Installation, gas filling & servicing', icon: Wind, href: '/services/ac-repair' },
    { title: 'Appliance Repair', desc: 'Fridge, washing machine, microwave', icon: Refrigerator, href: '/services/appliance-repair' },
    { title: 'Cleaning', desc: 'Home, office & sofa deep cleaning', icon: Sparkles, href: '/services/cleaning' },
    { title: 'Carpentry', desc: 'Furniture, doors, locks & cabinets', icon: Hammer, href: '/services/carpentry' },
    { title: 'Painting', desc: 'Interior, exterior & damp proofing', icon: Paintbrush, href: '/services/painting' },
    { title: 'Solar', desc: 'Installation, inverter & panel care', icon: Sun, href: '/services/solar-installation' },
    { title: 'Pest Control', desc: 'Termites, cockroaches & general', icon: Bug, href: '/services/pest-control' },
    { title: 'Home Renovation', desc: 'Tile, ceiling, bath & kitchen remodeling', icon: Grid, href: '/services/renovation' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Services</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] mt-1">
              Whatever needs fixing, start here.
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              Find the right verified professional for common household repairs across Pakistan.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008A4B] hover:text-[#007541] transition-colors"
          >
            <span>View All Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                href={s.href}
                className="group relative bg-[#F8FAF9] hover:bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#008A4B] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white group-hover:bg-[#EAF7F0] border border-[#E5E7EB] group-hover:border-[#C2ECCF] text-[#161616] group-hover:text-[#008A4B] transition-colors mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#161616] group-hover:text-[#008A4B] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#008A4B]">
                  <span>Book Now</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
