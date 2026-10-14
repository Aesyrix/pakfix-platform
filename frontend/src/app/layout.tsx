import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { SkipLink } from '@/components/layout/SkipLink';
import { localeInitScript } from '@/lib/i18n';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pakfix.pk';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PakFix | Pakistan Smart Home Repair Platform',
    // Every page supplies its own title; this keeps the brand on the end.
    template: '%s | PakFix',
  },
  description:
    'Upload a photo, describe the problem, or book a verified professional near you. Home repair, maintenance and appliance care across Pakistan.',
  applicationName: 'PakFix',
  keywords: [
    'home repair Pakistan',
    'plumber Lahore',
    'electrician Karachi',
    'AC repair Islamabad',
    'home maintenance',
    'verified technicians',
  ],
  authors: [{ name: 'PakFix' }],
  openGraph: {
    type: 'website',
    siteName: 'PakFix',
    locale: 'en_PK',
    url: siteUrl,
    title: 'PakFix | Show the Problem. Get It Fixed.',
    description:
      'Describe or photograph what is wrong at home and get a plain-language diagnosis, a realistic cost, and a verified professional near you.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PakFix | Show the Problem. Get It Fixed.',
    description:
      'Pakistan smart home repair platform. AI diagnosis, verified professionals, transparent pricing.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'PakFix',
    statusBarStyle: 'default',
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom stays available: disabling it fails WCAG 1.4.4.
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={jakarta.variable}>
      <body className="antialiased">
        {/* Applies the saved English/اردو choice before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: localeInitScript() }} />
        {/* First stop for a keyboard user on every page. */}
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
