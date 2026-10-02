import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function HomeGuidesSection() {
  const articles = [
    {
      title: "Why Your AC Isn't Cooling & How to Fix It",
      category: 'AC Care',
      readTime: '4 min read',
      href: '/blog/why-ac-isnt-cooling',
    },
    {
      title: 'What to Do When a Tap Won’t Stop Leaking',
      category: 'Plumbing',
      readTime: '3 min read',
      href: '/blog/tap-leakage-guide',
    },
    {
      title: "Electrical Warning Signs You Shouldn't Ignore",
      category: 'Safety',
      readTime: '5 min read',
      href: '/blog/electrical-warning-signs',
    },
    {
      title: 'How Often Should You Clean Your Home Water Tank?',
      category: 'Hygiene',
      readTime: '4 min read',
      href: '/blog/water-tank-cleaning-frequency',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">Home Guides</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] mt-1">
              Help for your home.
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              Expert DIY tips, safety advice and maintenance guides written for Pakistani homes.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00824A] hover:text-[#006B3C] transition-colors"
          >
            <span>View All Home Guides</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((art) => (
            <Link
              key={art.title}
              href={art.href}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5E7EB] hover:border-[#00824A] p-5 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#667085] mb-3">
                  <span className="font-bold px-2 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                    {art.category}
                  </span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-[#161616] group-hover:text-[#00824A] transition-colors leading-snug">
                  {art.title}
                </h3>
              </div>

              <div className="mt-6 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#00824A]">
                <span>Read Article</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
