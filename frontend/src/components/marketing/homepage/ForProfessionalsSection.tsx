import Link from 'next/link';
import { Wrench, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function ForProfessionalsSection() {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Individual Professionals */}
          <div className="bg-[#161616] text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#008A4B] text-white flex items-center justify-center">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Are you a skilled service professional?
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Join PakFix to connect directly with homeowners looking for quality plumbing, electrical, AC and home repair services.
              </p>

              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00A85B]" />
                  <span>Create verified professional profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00A85B]" />
                  <span>Receive service requests in your area</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00A85B]" />
                  <span>Send quotes and build customer reviews</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/become-a-technician"
                className="px-6 py-3 rounded-xl bg-[#008A4B] hover:bg-[#007541] text-white text-xs font-bold transition-colors"
              >
                Join as Professional
              </Link>
            </div>
          </div>

          {/* Card 2: Service Companies */}
          <div className="bg-[#F8FAF9] rounded-3xl p-8 border border-[#E5E7EB] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#161616]">
                Register your service company
              </h3>
              <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
                Manage teams of technicians, assign job requests, issue invoices, and track revenue across Pakistan.
              </p>

              <ul className="space-y-2 text-xs text-[#475467]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />
                  <span>Team management & technician dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />
                  <span>Automated quotes & customer messaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />
                  <span>Corporate analytics dashboard</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                href="/for-service-companies"
                className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors inline-block"
              >
                Register Your Company
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
