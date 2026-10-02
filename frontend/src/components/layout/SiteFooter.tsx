import Link from 'next/link';
import { Phone, Mail, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import type { Bootstrap, ServiceCategory } from '@/lib/api/types';

interface SiteFooterProps {
  bootstrap?: Bootstrap | null;
  popularCategories?: ServiceCategory[];
}

export function SiteFooter({ bootstrap, popularCategories }: SiteFooterProps) {
  return (
    <footer className="bg-[#161616] text-white border-t border-gray-800 pt-16 pb-12">
      <Container>
        {/* Main 6-Column Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-gray-800">
          {/* Column 1: PakFix Brand & Motto */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <PakFixLogo isDarkBackground showWordmark />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Pakistan&apos;s smart home repair platform. Diagnose issues with AI, compare upfront quotes, and book identity-verified local professionals.
            </p>

            {/* Direct Contact Handles */}
            <div className="pt-2 space-y-2 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#008A4B]" />
                <span>Call Us: +92 300 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#008A4B]" />
                <span>Email: support@pakfix.pk</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-[#00A85B]" />
                <span>WhatsApp: +92 345 987 6543</span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">Services</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              {popularCategories && popularCategories.length > 0 ? (
                popularCategories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/services/${cat.slug}`} className="hover:text-white transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/services/plumbing" className="hover:text-white transition-colors">Plumbing</Link></li>
                  <li><Link href="/services/electrical" className="hover:text-white transition-colors">Electrical Repair</Link></li>
                  <li><Link href="/services/ac-repair" className="hover:text-white transition-colors">AC Repair</Link></li>
                  <li><Link href="/services/cleaning" className="hover:text-white transition-colors">Home Cleaning</Link></li>
                  <li><Link href="/services/appliance-repair" className="hover:text-white transition-colors">Appliance Care</Link></li>
                </>
              )}
              <li><Link href="/services" className="hover:text-[#00A85B] font-semibold transition-colors">All Services &rarr;</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">PakFix</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/ai" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/find-a-technician" className="hover:text-white transition-colors">Find a Pro</Link></li>
              <li><Link href="/home-maintenance" className="hover:text-white transition-colors">Home Maintenance</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Estimates</Link></li>
            </ul>
          </div>

          {/* Column 4: For Professionals */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">Professionals</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/become-a-technician" className="hover:text-white transition-colors">Become a Pro</Link></li>
              <li><Link href="/for-service-companies" className="hover:text-white transition-colors">Service Companies</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Pro Portal Login</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Verification Process</Link></li>
            </ul>
          </div>

          {/* Column 5: Support & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">Support</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Safety Rules</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} PakFix.pk. All rights reserved.</span>
            <span className="inline-flex items-center gap-1 text-[#008A4B] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Platform
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>for homes across Pakistan.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
