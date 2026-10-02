import { Star, Quote, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function CustomerReviewsSection() {
  const reviews = [
    {
      name: 'Sana Khan',
      city: 'Islamabad',
      service: 'AC Repair',
      rating: 5,
      quote:
        'PakFix made it so easy! I got an instant diagnosis for my AC problem and booked a verified professional the same day. Great transparent service in Islamabad!',
      initials: 'SK',
    },
    {
      name: 'Ahmed Malik',
      city: 'Lahore',
      service: 'Plumbing & Water Motor',
      rating: 5,
      quote:
        'Transparent pricing and very professional technicians. The AI predicted the repair cost within PKR 500 of the final bill. Highly recommended!',
      initials: 'AM',
    },
    {
      name: 'Ayesha Siddiqui',
      city: 'Karachi',
      service: 'Electrical Repair',
      rating: 5,
      quote:
        'Finally a reliable platform for home services in Pakistan. The AI diagnosis feature is amazing and saved me from an expensive unnecessary replacement.',
      initials: 'AS',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">Customer Trust</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            Homeowners deserve a simpler repair experience.
          </h2>
          <p className="text-sm text-[#475467]">
            Trusted by thousands of families across major cities in Pakistan.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-[#00824A]/20" />
                </div>

                <p className="text-xs text-[#475467] leading-relaxed italic mb-6">
                  &quot;{r.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#EAF7F0] text-[#00532C] font-extrabold text-xs flex items-center justify-center border border-[#C2ECCF]">
                  {r.initials}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#161616]">{r.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-[#667085]">
                    <MapPin className="h-3 w-3" />
                    <span>{r.city} &bull; {r.service}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
