import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/homepage/HeroSection';
import { TrustStripSection } from '@/components/marketing/homepage/TrustStripSection';
import { PopularServicesSection } from '@/components/marketing/homepage/PopularServicesSection';
import { AiAssistantFeatureSection } from '@/components/marketing/homepage/AiAssistantFeatureSection';
import { SafetyNoticeSection } from '@/components/marketing/homepage/SafetyNoticeSection';
import { HowItWorksSection } from '@/components/marketing/homepage/HowItWorksSection';
import { QuickBookingFormSection } from '@/components/marketing/homepage/QuickBookingFormSection';
import { FindProfessionalsSection } from '@/components/marketing/homepage/FindProfessionalsSection';
import { QuoteComparisonSection } from '@/components/marketing/homepage/QuoteComparisonSection';
import { EmergencyRepairSection } from '@/components/marketing/homepage/EmergencyRepairSection';
import { HomeMaintenanceSection } from '@/components/marketing/homepage/HomeMaintenanceSection';
import { SmartRemindersSection } from '@/components/marketing/homepage/SmartRemindersSection';
import { CustomerDashboardPreviewSection } from '@/components/marketing/homepage/CustomerDashboardPreviewSection';
import { AiToProHandoffSection } from '@/components/marketing/homepage/AiToProHandoffSection';
import { CustomerReviewsSection } from '@/components/marketing/homepage/CustomerReviewsSection';
import { CitiesSection } from '@/components/marketing/homepage/CitiesSection';
import { CostEstimatorSection } from '@/components/marketing/homepage/CostEstimatorSection';
import { ForProfessionalsSection } from '@/components/marketing/homepage/ForProfessionalsSection';
import { MobilePwaSection } from '@/components/marketing/homepage/MobilePwaSection';
import { HomeGuidesSection } from '@/components/marketing/homepage/HomeGuidesSection';
import { FaqAccordionSection } from '@/components/marketing/homepage/FaqAccordionSection';
import { FinalCtaSection } from '@/components/marketing/homepage/FinalCtaSection';
import { FloatingAiAction } from '@/components/marketing/homepage/FloatingAiAction';

export const metadata: Metadata = {
  title: { absolute: 'PakFix.pk | AI Home Repair & Professional Services in Pakistan' },
  description:
    'Show or describe your home repair problem, get instant AI diagnosis, transparent upfront estimates, and book identity-verified local professionals across Pakistan.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'PakFix.pk | AI Home Repair & Professional Services',
    description: 'Show the Problem. PakFix Helps You Fix It.',
    url: 'https://pakfix.pk',
    siteName: 'PakFix.pk',
    locale: 'en_PK',
    type: 'website',
  },
};

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />

      {/* Section 2: Hero + AI Problem Box + AI UI Result Card */}
      <HeroSection />

      {/* Section 3: Trust Strip */}
      <TrustStripSection />

      {/* Section 4: Popular Services */}
      <PopularServicesSection />

      {/* Section 5: AI Repair Assistant Feature Section */}
      <AiAssistantFeatureSection />

      {/* Section 6: Safety Notice */}
      <SafetyNoticeSection />

      {/* Section 7: How PakFix Works */}
      <HowItWorksSection />

      {/* Section 8: Quick Booking Form */}
      <QuickBookingFormSection />

      {/* Section 9: Find a Professional */}
      <FindProfessionalsSection />

      {/* Section 10: Quote Comparison */}
      <QuoteComparisonSection />

      {/* Section 11: Emergency Repair */}
      <EmergencyRepairSection />

      {/* Section 12: Home Maintenance & Property Assets */}
      <HomeMaintenanceSection />

      {/* Section 13: Smart Reminders */}
      <SmartRemindersSection />

      {/* Section 14: Customer Dashboard Preview */}
      <CustomerDashboardPreviewSection />

      {/* Section 15: AI-to-Professional Handoff */}
      <AiToProHandoffSection />

      {/* Section 16: Customer Reviews */}
      <CustomerReviewsSection />

      {/* Section 17: Cities */}
      <CitiesSection />

      {/* Section 18: Cost Estimator */}
      <CostEstimatorSection />

      {/* Section 19: For Professionals & Companies */}
      <ForProfessionalsSection />

      {/* Section 20: Mobile / PWA */}
      <MobilePwaSection />

      {/* Section 21: Home Repair Guides */}
      <HomeGuidesSection />

      {/* Section 22: FAQ Accordion */}
      <FaqAccordionSection />

      {/* Section 23: Final AI CTA */}
      <FinalCtaSection />

      {/* Floating Desktop AI Button */}
      <FloatingAiAction />
    </>
  );
}

function HomeJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pakfix.pk';

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'PakFix.pk',
      url: siteUrl,
      logo: `${siteUrl}/images/pakfix.png`,
      areaServed: { '@type': 'Country', name: 'Pakistan' },
      slogan: 'Show the Problem. PakFix Helps You Fix It.',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'PakFix.pk',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-PK',
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  );
}
