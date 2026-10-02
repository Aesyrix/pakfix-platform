import Link from 'next/link';
import { Star, CheckCircle2, ArrowRight, Calculator } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function QuoteComparisonSection() {
  const quotes = [
    {
      pro: 'TechFix Services',
      rating: 4.9,
      reviews: 110,
      visitFee: 'PKR 500',
      labour: 'PKR 2,000',
      materials: 'PKR 1,500',
      total: 'PKR 4,000',
      time: '1-2 Hours',
      badge: 'Recommended',
    },
    {
      pro: 'HomeCare Pros',
      rating: 4.8,
      reviews: 95,
      visitFee: 'PKR 500',
      labour: 'PKR 2,500',
      materials: 'PKR 1,500',
      total: 'PKR 4,500',
      time: '2-3 Hours',
      badge: 'Fast Arrival',
    },
    {
      pro: 'Lahore Repairs',
      rating: 4.7,
      reviews: 78,
      visitFee: 'PKR 700',
      labour: 'PKR 2,000',
      materials: 'PKR 1,000',
      total: 'PKR 3,700',
      time: '2 Hours',
      badge: 'Lowest Cost',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Transparent Pricing</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            Compare before you choose.
          </h2>
          <p className="text-sm text-[#475467]">
            Receive multiple itemized quotes for labor and materials. Pick the offer that matches your budget and timeline.
          </p>
        </div>

        {/* Side by Side Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {quotes.map((q) => (
            <div
              key={q.pro}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5E7EB] hover:border-[#008A4B] p-6 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EAF7F0] text-[#006838]">
                    {q.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#161616]">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{q.rating} ({q.reviews})</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#161616] mb-4">{q.pro}</h3>

                {/* Price Itemization */}
                <div className="space-y-2 text-xs border-t border-b border-[#E5E7EB] py-3 my-3">
                  <div className="flex justify-between text-[#667085]">
                    <span>Inspection / Visit Fee</span>
                    <span className="font-semibold text-[#161616]">{q.visitFee}</span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>Labour Charges</span>
                    <span className="font-semibold text-[#161616]">{q.labour}</span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>Estimated Materials</span>
                    <span className="font-semibold text-[#161616]">{q.materials}</span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>Estimated Time</span>
                    <span className="font-semibold text-[#161616]">{q.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#667085]">Estimated Total</span>
                  <span className="text-lg font-extrabold text-[#008A4B]">{q.total}</span>
                </div>
              </div>

              <Link
                href="#quick-booking"
                className="mt-6 w-full py-2.5 rounded-xl bg-[#008A4B] hover:bg-[#007541] text-white text-xs font-bold text-center transition-colors block shadow-2xs"
              >
                Accept Quote & Book
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
