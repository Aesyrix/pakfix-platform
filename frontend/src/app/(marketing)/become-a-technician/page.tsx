import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Wrench,
  ShieldCheck,
  DollarSign,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Phone,
  UserCheck,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Become a Technician | Register as a Pro on PakFix.pk',
  description:
    'Join PakFix as a skilled plumber, electrician, AC technician, or appliance specialist. Grow your business, get job requests in your city, and earn more.',
  path: '/become-a-technician',
});

export default function BecomeTechnicianPage() {
  const benefits = [
    {
      icon: Briefcase,
      title: 'More Nearby Jobs',
      desc: 'Receive job leads from homeowners in your area directly on your phone.',
    },
    {
      icon: DollarSign,
      title: 'Transparent Earnings',
      desc: 'Set your rates, quote labor & materials, and get paid promptly with zero hidden commission.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Pro Badge',
      desc: 'Build trust with verified CNIC verification and accumulate 5-star customer reviews.',
    },
    {
      icon: Wrench,
      title: 'Full Scheduling Control',
      desc: 'Work on your own terms. Accept jobs that match your expertise and availability.',
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Become a Pro' }]}
        eyebrow={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
            <UserCheck className="h-3.5 w-3.5 text-[#008A4B]" />
            Join Pakistan&apos;s Pro Network
          </div>
        }
        title="Grow Your Home Service Business"
        subtitle="Are you a skilled plumber, electrician, AC mechanic or appliance technician? Register with PakFix to connect directly with paying customers across Pakistan."
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Why Join PakFix?</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
                Everything you need to succeed as a professional.
              </h2>
              <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
                PakFix handles marketing, customer inquiry management, and diagnostic verification so you can focus on delivering high-quality work.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1.5">
                      <Icon className="h-5 w-5 text-[#008A4B]" />
                      <h3 className="text-sm font-bold text-[#161616]">{b.title}</h3>
                      <p className="text-xs text-[#667085] leading-snug">{b.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Registration Card */}
            <div className="lg:col-span-6">
              <div className="bg-[#161616] text-white rounded-3xl p-8 border border-gray-800 shadow-card space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#00A85B] uppercase tracking-wider">Fast Onboarding</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">Register in 3 Minutes</h3>
                  <p className="text-xs text-gray-400 mt-1">Submit your details to start receiving job leads.</p>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ali"
                      className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#008A4B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#008A4B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">City</label>
                      <select className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white outline-none focus:border-[#008A4B]">
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Faisalabad">Faisalabad</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Primary Skill Trade</label>
                    <select className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white outline-none focus:border-[#008A4B]">
                      <option value="Plumber">Plumber & Drainage</option>
                      <option value="Electrician">Electrician & UPS Specialist</option>
                      <option value="AC Mechanic">AC Technician & Service</option>
                      <option value="Appliance Tech">Appliance Care</option>
                      <option value="Solar Installer">Solar Panel Setup</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#008A4B] hover:bg-[#007541] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Submit Registration &rarr;
                  </button>
                </form>

                <div className="pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
                  <span>Questions? Call Pro Onboarding Helpline: </span>
                  <a href="tel:+923001234567" className="text-[#00A85B] font-bold hover:underline">
                    +92 300 123 4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
