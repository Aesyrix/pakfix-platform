import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BadgeCheck,
  CircleCheck,
  MessageSquareText,
  Quote,
  ShieldAlert,
  Star,
  Wrench,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { HeroSearch } from '@/components/marketing/HeroSearch';
import { ServiceCategoryGrid } from '@/components/marketing/ServiceCategoryGrid';
import { catalogueApi, contentApi } from '@/lib/api/endpoints';
import { safeFetch } from '@/lib/api/safe';
import type { ContentBlocks, Faq, Testimonial } from '@/lib/api/types';

export const metadata: Metadata = {
  // Absolute, so the root layout template does not append "| PakFix" to a
  // title that already carries the brand.
  title: { absolute: 'PakFix | Show the Problem. Get It Fixed.' },
  description:
    'Upload a photo, describe the problem, or book a verified professional near you. Home repair, maintenance and appliance care across Pakistan.',
  alternates: { canonical: '/' },
};

/** Revalidated rather than static, so CMS edits appear without a deploy. */
export const revalidate = 300;

export default async function HomePage() {
  const [blocks, categories, testimonials, faqs] = await Promise.all([
    safeFetch<ContentBlocks>(() => contentApi.blocks('home'), {}, 'home content blocks'),
    safeFetch(() => catalogueApi.categories({ popular: true }), [], 'popular categories'),
    safeFetch<Testimonial[]>(() => contentApi.testimonials(), [], 'testimonials'),
    safeFetch<Faq[]>(() => contentApi.faqs(), [], 'faqs'),
  ]);

  const hero = blocks['home.hero'];
  const howItWorks = blocks['home.how_it_works'];
  const whyPakfix = blocks['home.why_pakfix'];
  const technicianCta = blocks['home.technician_cta'];
  const propertyCta = blocks['home.property_manager_cta'];
  const finalCta = blocks['home.final_cta'];

  const heroExamples = (hero?.content?.examples as string[] | undefined) ?? [];
  const steps =
    (howItWorks?.content?.steps as Array<{ title: string; body: string }> | undefined) ?? [];
  const points =
    (whyPakfix?.content?.points as Array<{ title: string; body: string }> | undefined) ?? [];

  return (
    <>
      <HomeJsonLd faqs={faqs} />

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-brand-wash to-background">
        <Container className="py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="brand" className="mb-5">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified professionals across Pakistan
            </Badge>

            <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {hero?.title ?? 'Show Us What is Wrong. PakFix Helps You Fix It.'}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-ink-600 sm:text-lg">
              {hero?.subtitle ??
                'Upload a photo, describe the problem, or book a verified professional near you.'}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            <HeroSearch examples={heroExamples} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <CircleCheck className="h-4 w-4 text-safe-600" aria-hidden="true" />
              Identity-checked professionals
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CircleCheck className="h-4 w-4 text-safe-600" aria-hidden="true" />
              Price agreed before work starts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CircleCheck className="h-4 w-4 text-safe-600" aria-hidden="true" />
              Every repair kept on record
            </span>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Popular services                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-14 sm:py-20" aria-labelledby="popular-services">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="popular-services" className="text-2xl font-bold tracking-tight sm:text-3xl">
                What can we help with?
              </h2>
              <p className="mt-2 text-ink-600">
                Prices are typical ranges. Your professional confirms before starting.
              </p>
            </div>

            <Link
              href="/services"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              All services &rarr;
            </Link>
          </div>

          <ServiceCategoryGrid categories={categories} limit={8} />
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                      */}
      {/* ---------------------------------------------------------------- */}
      {steps.length > 0 ? (
        <section
          className="border-y border-[var(--border)] bg-surface py-14 sm:py-20"
          aria-labelledby="how-it-works"
        >
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="how-it-works" className="text-2xl font-bold tracking-tight sm:text-3xl">
                {howItWorks?.title ?? 'How PakFix works'}
              </h2>
              {howItWorks?.subtitle ? (
                <p className="mt-3 text-ink-600">{howItWorks.subtitle}</p>
              ) : null}
            </div>

            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="relative">
                  <Card className="h-full">
                    <CardBody>
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.body}</p>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Safety — the one section that is deliberately not sales copy      */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-14 sm:py-20" aria-labelledby="safety-first">
        <Container>
          <Card className="overflow-hidden border-warn-500/30">
            <div className="grid gap-0 md:grid-cols-[auto_1fr]">
              <div className="flex items-center justify-center bg-warn-500/10 p-8">
                <ShieldAlert className="h-12 w-12 text-warn-600" aria-hidden="true" />
              </div>
              <CardBody className="sm:p-8">
                <h2 id="safety-first" className="text-xl font-bold tracking-tight sm:text-2xl">
                  Some problems we will not talk you through
                </h2>
                <p className="mt-3 text-pretty text-ink-600">
                  Gas leaks, exposed high-voltage wiring, structural cracks and flooding are
                  classified as emergencies. PakFix will not give you repair steps for any of
                  them. You get safety instructions and a route to a professional, because the
                  alternative is someone getting hurt following advice from a screen.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="safe">Low &mdash; safe to inspect</Badge>
                  <Badge tone="warn">Medium &mdash; take care</Badge>
                  <Badge tone="danger">High &mdash; professional recommended</Badge>
                  <Badge tone="danger">Emergency &mdash; do not attempt</Badge>
                </div>
              </CardBody>
            </div>
          </Card>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why PakFix                                                        */}
      {/* ---------------------------------------------------------------- */}
      {points.length > 0 ? (
        <section
          className="border-y border-[var(--border)] bg-surface py-14 sm:py-20"
          aria-labelledby="why-pakfix"
        >
          <Container>
            <h2 id="why-pakfix" className="text-2xl font-bold tracking-tight sm:text-3xl">
              {whyPakfix?.title ?? 'Why choose PakFix'}
            </h2>

            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {points.map((point) => (
                <li key={point.title}>
                  <CircleCheck className="h-6 w-6 text-brand-600" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{point.body}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Testimonials                                                      */}
      {/* ---------------------------------------------------------------- */}
      {testimonials.length > 0 ? (
        <section className="py-14 sm:py-20" aria-labelledby="testimonials">
          <Container>
            <h2 id="testimonials" className="text-2xl font-bold tracking-tight sm:text-3xl">
              What customers say
            </h2>

            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <li key={testimonial.quote}>
                  <Card className="h-full">
                    <CardBody className="flex h-full flex-col">
                      <Quote className="h-6 w-6 text-brand-300" aria-hidden="true" />

                      <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-ink-700">
                        {testimonial.quote}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{testimonial.author_name}</p>
                          {testimonial.author_location ? (
                            <p className="text-xs text-ink-500">{testimonial.author_location}</p>
                          ) : null}
                        </div>

                        <div
                          className="flex items-center gap-0.5"
                          aria-label={`${testimonial.rating} out of 5`}
                        >
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={
                                index < testimonial.rating
                                  ? 'h-4 w-4 fill-accent-400 text-accent-400'
                                  : 'h-4 w-4 text-ink-300'
                              }
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Audience CTAs                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-14 sm:py-20" aria-label="Work with PakFix">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { block: technicianCta, icon: Wrench, fallbackHref: '/become-a-technician' },
              { block: propertyCta, icon: MessageSquareText, fallbackHref: '/for-property-managers' },
            ].map(({ block, icon: Icon, fallbackHref }, index) =>
              block ? (
                <Card key={index} className="bg-brand-950 text-white">
                  <CardBody className="flex h-full flex-col gap-4 sm:p-8">
                    <Icon className="h-8 w-8 text-accent-400" aria-hidden="true" />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold tracking-tight">{block.title}</h2>
                      <p className="mt-2 text-sm text-brand-100">{block.subtitle}</p>
                    </div>
                    <ButtonLink
                      href={block.cta?.url ?? fallbackHref}
                      variant="accent"
                      className="self-start"
                    >
                      {block.cta?.label ?? 'Find out more'}
                    </ButtonLink>
                  </CardBody>
                </Card>
              ) : null
            )}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ---------------------------------------------------------------- */}
      {faqs.length > 0 ? (
        <section
          className="border-y border-[var(--border)] bg-surface py-14 sm:py-20"
          aria-labelledby="faq"
        >
          <Container size="narrow">
            <h2 id="faq" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Common questions
            </h2>

            <div className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                    {faq.question}
                    <span
                      className="shrink-0 text-ink-400 transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Final CTA                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-16 sm:py-24">
        <Container size="narrow" className="text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {finalCta?.title ?? 'Something broken at home?'}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-ink-600">
            {finalCta?.subtitle ??
              'Tell PakFix what is wrong and find out what it takes to fix it.'}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={finalCta?.cta?.url ?? '/ai'} size="lg">
              {finalCta?.cta?.label ?? 'Ask PakFix AI'}
            </ButtonLink>
            <ButtonLink href="/find-a-technician" variant="secondary" size="lg">
              Browse professionals
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

/**
 * Structured data for the homepage. The FAQ block is generated from the same
 * rows the page renders, so the markup can never describe questions that are
 * not actually on the page.
 */
function HomeJsonLd({ faqs }: { faqs: Faq[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pakfix.pk';

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'PakFix',
      url: siteUrl,
      areaServed: { '@type': 'Country', name: 'Pakistan' },
      slogan: 'Show the Problem. Get It Fixed.',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'PakFix',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-PK',
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  );
}
