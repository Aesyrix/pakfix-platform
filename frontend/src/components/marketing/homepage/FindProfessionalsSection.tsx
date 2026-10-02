import Link from 'next/link';
import { Star, CheckCircle2, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function FindProfessionalsSection() {
  const pros = [
    {
      name: 'Ali Raza',
      trade: 'AC & Refrigeration Master',
      city: 'Islamabad',
      rating: 4.9,
      reviews: 142,
      jobs: '280+ Jobs',
      exp: '8 Yrs Exp',
      price: 'PKR 1,500 Visit Fee',
      status: 'Available Today',
      initials: 'AR',
    },
    {
      name: 'Usman Khan',
      trade: 'Senior Licensed Plumber',
      city: 'Rawalpindi',
      rating: 4.9,
      reviews: 98,
      jobs: '190+ Jobs',
      exp: '10 Yrs Exp',
      price: 'PKR 1,200 Visit Fee',
      status: 'Available Today',
      initials: 'UK',
    },
    {
      name: 'Bilal Ahmed',
      trade: 'Electrical & UPS Specialist',
      city: 'Lahore',
      rating: 4.8,
      reviews: 86,
      jobs: '150+ Jobs',
      exp: '6 Yrs Exp',
      price: 'PKR 1,000 Visit Fee',
      status: 'Available Today',
      initials: 'BA',
    },
    {
      name: 'Kamran Shafiq',
      trade: 'Appliance Repair Tech',
      city: 'Karachi',
      rating: 4.9,
      reviews: 114,
      jobs: '210+ Jobs',
      exp: '7 Yrs Exp',
      price: 'PKR 1,500 Visit Fee',
      status: 'Available Today',
      initials: 'KS',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">Top Rated</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] mt-1">
              Professionals you can check before you book.
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              View verified profiles, real customer ratings, background status, and experience.
            </p>
          </div>

          <Link
            href="/find-a-technician"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00824A] hover:text-[#006B3C] transition-colors"
          >
            <span>Browse All Professionals</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Professionals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pros.map((pro) => (
            <div
              key={pro.name}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs hover:shadow-card hover:border-[#00824A] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#00532C] font-extrabold text-base border border-[#C2ECCF]">
                    {pro.initials}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7F0] text-[#006838] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#00824A]" /> Verified
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#161616]">{pro.name}</h3>
                <p className="text-xs font-semibold text-[#00824A]">{pro.trade}</p>

                <div className="flex items-center gap-1 text-xs text-[#667085] mt-1">
                  <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                  <span>{pro.city}</span>
                </div>

                {/* Metrics Badges */}
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2 text-[11px] text-[#475467]">
                  <div className="flex items-center gap-1 font-bold text-[#161616]">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{pro.rating} ({pro.reviews})</span>
                  </div>
                  <div className="text-right font-medium text-[#667085]">{pro.jobs}</div>
                  <div className="font-medium text-[#667085]">{pro.exp}</div>
                  <div className="text-right font-bold text-[#006838]">{pro.price}</div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2">
                <Link
                  href={`/technicians/${pro.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="py-2 px-3 rounded-xl border border-[#E5E7EB] text-center text-xs font-semibold text-[#161616] hover:bg-[#F8FAF9] transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  href="#quick-booking"
                  className="py-2 px-3 rounded-xl bg-[#00824A] text-center text-xs font-bold text-white hover:bg-[#006B3C] transition-colors shadow-2xs"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
