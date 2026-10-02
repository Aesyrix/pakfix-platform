'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Globe, HelpCircle, UserPlus, PhoneCall } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function TopUtilityBar() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  return (
    <div className="hidden sm:block border-b border-[#E5E7EB] bg-[#161616] text-white text-xs font-medium py-2">
      <Container>
        <div className="flex items-center justify-between">
          {/* Left Side Tagline */}
          <div className="flex items-center gap-2 text-gray-300">
            <span className="inline-block h-2 w-2 rounded-full bg-[#008A4B] animate-pulse" />
            <span>Pakistan&apos;s Smart Home Repair Platform</span>
            <span className="text-gray-500">|</span>
            <span className="text-[#00A85B] font-semibold flex items-center gap-1">
              <PhoneCall className="h-3 w-3" /> 24/7 Support: +92 300 123 4567
            </span>
          </div>

          {/* Right Side Links */}
          <div className="flex items-center gap-5 text-gray-300">
            <Link
              href="/contact"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Support</span>
            </Link>

            <Link
              href="/become-a-technician"
              className="hover:text-[#00A85B] transition-colors flex items-center gap-1 font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5 text-[#008A4B]" />
              <span>Become a Pro</span>
            </Link>

            <div className="h-3 w-px bg-gray-700" />

            {/* Language Selector Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-gray-800/80 px-2 py-0.5 rounded text-[11px]"
            >
              <Globe className="h-3 w-3 text-[#008A4B]" />
              <span>{lang === 'en' ? 'English' : 'اردو'}</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
