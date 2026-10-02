'use client';

import Link from 'next/link';
import {
  Wrench,
  Zap,
  Wind,
  Refrigerator,
  Droplets,
  ZapOff,
  Sparkles,
  Paintbrush,
  Hammer,
  Bug,
  ShieldCheck,
  Home,
  Sun,
  Camera,
  Grid,
  ArrowRight,
} from 'lucide-react';

interface MegaMenuProps {
  onClose?: () => void;
}

export function MegaMenu({ onClose }: MegaMenuProps) {
  const categories = [
    {
      title: 'Repairs & Fixes',
      description: 'Quick resolution for urgent household utility issues.',
      items: [
        { href: '/services/plumbing', label: 'Plumbing', icon: Droplets, badge: 'Popular' },
        { href: '/services/electrical', label: 'Electrical Wiring', icon: Zap, badge: 'High Demand' },
        { href: '/services/ac-repair', label: 'AC Repair & Gas', icon: Wind, badge: 'Hot' },
        { href: '/services/appliance-repair', label: 'Appliance Care', icon: Refrigerator },
        { href: '/services/water-motor', label: 'Water Motor & Pump', icon: Wrench },
        { href: '/services/generator', label: 'Generator Repair', icon: ZapOff },
        { href: '/services/ups-inverter', label: 'UPS & Solar Inverter', icon: Sun },
      ],
    },
    {
      title: 'Home Care & Protection',
      description: 'Regular maintenance and protection for your property.',
      items: [
        { href: '/services/cleaning', label: 'Home Deep Cleaning', icon: Sparkles },
        { href: '/services/painting', label: 'Interior & Exterior Painting', icon: Paintbrush },
        { href: '/services/carpentry', label: 'Carpentry & Woodwork', icon: Hammer },
        { href: '/services/pest-control', label: 'Pest Control', icon: Bug },
        { href: '/services/waterproofing', label: 'Waterproofing & Sealing', icon: ShieldCheck },
        { href: '/services/roofing', label: 'Roofing & Seepage Repair', icon: Home },
      ],
    },
    {
      title: 'Home Improvement & Tech',
      description: 'Upgrade your living spaces with modern smart technology.',
      items: [
        { href: '/services/renovation', label: 'Full Home Renovation', icon: Grid },
        { href: '/services/flooring-tiles', label: 'Flooring & Tile Work', icon: Home },
        { href: '/services/false-ceiling', label: 'False Ceiling & Lighting', icon: Sparkles },
        { href: '/services/cctv-security', label: 'CCTV & Security Systems', icon: Camera },
        { href: '/services/smart-home', label: 'Smart Home Automation', icon: Zap },
        { href: '/services/solar-installation', label: 'Solar Panel Setup', icon: Sun, badge: 'Trending' },
      ],
    },
  ];

  return (
    <div className="absolute top-full left-0 w-full bg-white border-b border-[#E5E7EB] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((col) => (
            <div key={col.title} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#161616] tracking-wider uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00824A]" />
                  {col.title}
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">{col.description}</p>
              </div>

              <div className="space-y-1.5 border-t border-[#E5E7EB] pt-3">
                {col.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-2 rounded-lg text-sm text-[#475467] hover:text-[#00824A] hover:bg-[#F4FBF7] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-[#667085] group-hover:text-[#00824A] transition-colors" />
                        <span className="font-medium group-hover:font-semibold">{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Bar inside Mega Menu */}
        <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 bg-[#F8FAF9] p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#00532C] font-bold">
              AI
            </span>
            <div>
              <p className="text-xs font-bold text-[#161616]">Not sure which service you need?</p>
              <p className="text-xs text-[#667085]">
                Let PakFix AI diagnose your issue in 10 seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/ai"
              onClick={onClose}
              className="text-xs font-bold text-[#00824A] hover:underline"
            >
              Try AI Diagnosis &rarr;
            </Link>

            <Link
              href="/services"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-[#00824A] text-white hover:bg-[#006B3C] transition-colors shadow-xs"
            >
              <span>View All Services</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
