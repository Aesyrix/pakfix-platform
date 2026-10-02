import Link from 'next/link';
import { MapPin, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function CitiesSection() {
  const cities = [
    { name: 'Islamabad', slug: 'islamabad', active: true },
    { name: 'Rawalpindi', slug: 'rawalpindi', active: true },
    { name: 'Lahore', slug: 'lahore', active: true },
    { name: 'Karachi', slug: 'karachi', active: true },
    { name: 'Faisalabad', slug: 'faisalabad', active: true },
    { name: 'Peshawar', slug: 'peshawar', active: true },
    { name: 'Multan', slug: 'multan', active: true },
    { name: 'Gujranwala', slug: 'gujranwala', active: true },
    { name: 'Sialkot', slug: 'sialkot', active: true },
    { name: 'Quetta', slug: 'quetta', active: true },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">Nationwide Coverage</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616]">
            Home services across Pakistan.
          </h2>
          <p className="text-sm text-[#475467]">
            Connecting homeowners with verified local repair professionals in major metropolitan cities.
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="bg-[#F8FAF9] hover:bg-[#EAF7F0] border border-[#E5E7EB] hover:border-[#00824A] rounded-xl p-3.5 text-center transition-all group"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#161616] group-hover:text-[#00824A]">
                <Building2 className="h-4 w-4 text-[#667085] group-hover:text-[#00824A]" />
                <span>{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
