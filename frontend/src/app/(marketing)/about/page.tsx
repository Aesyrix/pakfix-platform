import type { Metadata } from 'next';
import { Building2, Sparkles, ShieldCheck, Heart, Users } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About PakFix.pk | Pakistan’s Smart Home Repair Platform',
  description:
    'Discover PakFix mission: transforming home maintenance across Pakistan using artificial intelligence, verified local technicians, and fair pricing.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'About Us' }]}
        title="Reinventing Home Repairs for Pakistan"
        subtitle="PakFix was built to solve the frustration of unreliable home repairs, hidden fees, and safety concerns."
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8 text-sm sm:text-base text-[#475467] leading-relaxed">
            <h2 className="text-2xl font-extrabold text-[#161616]">Our Mission</h2>
            <p>
              Finding a trusted electrician, plumber, or AC mechanic in Pakistani cities used to mean relying on word-of-mouth or dealing with unverified workers who overcharge. PakFix combines cutting-edge AI technology with local technician verification to deliver transparent, reliable, and safe home services.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 my-10 text-center">
              <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                <Sparkles className="h-8 w-8 text-[#00824A] mx-auto" />
                <h3 className="font-bold text-[#161616] text-sm">AI Innovation</h3>
                <p className="text-xs text-[#667085]">Instant diagnostic guidance in English & Roman Urdu.</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                <ShieldCheck className="h-8 w-8 text-[#00824A] mx-auto" />
                <h3 className="font-bold text-[#161616] text-sm">100% Verification</h3>
                <p className="text-xs text-[#667085]">CNIC checked & skill-audited local technicians.</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                <Heart className="h-8 w-8 text-[#00824A] mx-auto" />
                <h3 className="font-bold text-[#161616] text-sm">Made for Pakistan</h3>
                <p className="text-xs text-[#667085]">Serving Islamabad, Rawalpindi, Lahore, Karachi & beyond.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
