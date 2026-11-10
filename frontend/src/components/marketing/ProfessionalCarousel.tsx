'use client';

import { BadgeCheck, ChevronLeft, ChevronRight, MapPin, Siren } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Initials, StarRating } from '@/components/marketing/Cards';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import type { TechnicianCard } from '@/lib/api/types';
import { professionalImage } from '@/lib/images';
import { cn } from '@/lib/utils/cn';

/**
 * Professionals as a coverflow: the card in focus sits forward and sharp,
 * its neighbours step back, tilt and blur. Arrows, the keyboard, swipes,
 * the dots and a tap on a side card all move the focus.
 *
 * Only the focused card is interactive; the others are `inert`, so keyboard
 * and screen-reader users meet one card at a time.
 */
export function ProfessionalCarousel({
  professionals,
  onReachEnd,
}: {
  professionals: TechnicianCard[];
  /** Called when the focus nears the last card, to load the next page. */
  onReachEnd?: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const rtl = locale === 'ur';
  // Open on a middle card so there are neighbours on both sides.
  const [active, setActive] = useState(() => Math.floor((professionals.length - 1) / 2));
  const touchX = useRef<number | null>(null);
  const count = professionals.length;

  // A new filter can shrink the list below the focused index.
  const current = Math.min(active, Math.max(count - 1, 0));

  const go = (index: number) => setActive(Math.max(0, Math.min(count - 1, index)));
  const prev = () => go(current - 1);
  const next = () => go(current + 1);

  useEffect(() => {
    if (onReachEnd && count > 0 && current >= count - 2) onReachEnd();
  }, [current, count, onReachEnd]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === back) {
      event.preventDefault();
      prev();
    } else if (event.key === forward) {
      event.preventDefault();
      next();
    }
  }

  return (
    <div
      role="region"
      data-no-reveal
      aria-roledescription="carousel"
      aria-label={t('Verified professionals', 'تصدیق شدہ پروفیشنلز')}
      onKeyDown={onKeyDown}
      className="relative"
    >
      <div
        className="relative mx-auto h-[23rem] select-none [perspective:1800px] sm:h-[24rem]"
        onTouchStart={(event) => {
          touchX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchX.current === null) return;
          const dx = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 40) return;
          if ((dx < 0) !== rtl) next();
          else prev();
        }}
      >
        <ul className="relative h-full [transform-style:preserve-3d]">
          {professionals.map((professional, index) => {
            const offset = index - current;
            const distance = Math.abs(offset);
            const hidden = distance > 2;
            const direction = rtl ? -1 : 1;
            const style: CSSProperties = {
              transform: [
                'translateX(-50%)',
                `translateX(${offset * direction * 70}%)`,
                `translateZ(${-distance * 110}px)`,
                `rotateY(${-Math.sign(offset) * direction * Math.min(distance, 1) * 12}deg)`,
              ].join(' '),
              filter: distance === 0 ? 'none' : `blur(${distance * 1.5}px)`,
              opacity: hidden ? 0 : distance === 0 ? 1 : distance === 1 ? 0.85 : 0.5,
              zIndex: 10 - distance,
            };

            return (
              <li
                key={professional.id}
                aria-roledescription="slide"
                aria-label={t(`${index + 1} of ${count}`, `${count} میں سے ${index + 1}`)}
                aria-hidden={distance !== 0}
                inert={distance !== 0}
                onClick={distance !== 0 ? () => go(index) : undefined}
                style={style}
                className={cn(
                  'absolute left-1/2 top-4 w-[min(84vw,24rem)] transition-[transform,filter,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none',
                  hidden && 'pointer-events-none',
                  distance !== 0 && 'cursor-pointer'
                )}
              >
                <CarouselCard professional={professional} focused={distance === 0} />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={rtl ? next : prev}
        disabled={rtl ? current >= count - 1 : current === 0}
        aria-label={t('Previous professional', 'پچھلا پروفیشنل')}
        className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md transition-colors hover:border-brand-on-dark/60 hover:bg-white/10 disabled:cursor-default disabled:opacity-30 sm:left-4"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={rtl ? prev : next}
        disabled={rtl ? current === 0 : current >= count - 1}
        aria-label={t('Next professional', 'اگلا پروفیشنل')}
        className="absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md transition-colors hover:border-brand-on-dark/60 hover:bg-white/10 disabled:cursor-default disabled:opacity-30 sm:right-4"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Dots */}
      {count > 1 ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {professionals.map((professional, index) => (
            <button
              key={professional.id}
              type="button"
              onClick={() => go(index)}
              aria-label={t(`Show ${professional.name}`, `${professional.name} دکھائیں`)}
              aria-current={index === current ? 'true' : undefined}
              className={cn(
                'h-2 cursor-pointer rounded-full transition-all duration-300',
                index === current ? 'w-7 bg-brand-on-dark' : 'w-2 bg-white/25 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CarouselCard({ professional, focused }: { professional: TechnicianCard; focused: boolean }) {
  const t = useT();
  const avatar = professional.avatar_url ?? professionalImage(professional.slug);

  return (
    <article
      className={cn(
        'relative flex h-[20rem] flex-col rounded-[var(--radius-card)] border bg-ink-900/95 p-6 text-white backdrop-blur-sm transition-[border-color,box-shadow] duration-500 sm:h-[21rem] sm:p-7',
        focused
          ? 'border-brand-on-dark/70 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-brand-on-dark)_25%,transparent),0_30px_80px_-20px_rgb(0_0_0/0.8),0_0_60px_-10px_color-mix(in_oklab,var(--color-brand-500)_45%,transparent)]'
          : 'border-white/10 shadow-2xl'
      )}
    >
      {/* Decorative quote mark, as in a testimonial */}
      <span aria-hidden="true" className="font-display text-6xl font-bold leading-[0.6] text-brand-on-dark">
        &ldquo;
      </span>

      <div className="mt-6 flex-1">
        <p className="line-clamp-3 text-[1.05rem] font-medium leading-relaxed text-white">{professional.headline}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <StarRating value={professional.rating_average} />
            <span className="font-semibold">{professional.rating_average.toFixed(1)}</span>
            <span className="text-ink-400">({professional.rating_count})</span>
          </span>
          <span className="text-ink-400">
            {t(`${professional.completed_jobs_count} ${professional.completed_jobs_count === 1 ? 'job' : 'jobs'}`, `${professional.completed_jobs_count} کام`)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-ink-200">
            {t(`${professional.years_experience} ${professional.years_experience === 1 ? 'yr' : 'yrs'} experience`, `${professional.years_experience} سال تجربہ`)}
          </span>
          {professional.offers_emergency_service ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-danger-500/30 bg-danger-500/15 px-2.5 py-0.5 text-danger-200">
              <Siren className="h-3 w-3" aria-hidden="true" />
              {t('Emergencies', 'ہنگامی')}
            </span>
          ) : null}
          {professional.visit_fee ? (
            <span className="rounded-full border border-brand-on-dark/25 bg-brand-on-dark/10 px-2.5 py-0.5 text-brand-on-dark">
              {t(`Visit ${professional.visit_fee.display}`, `وزٹ ${professional.visit_fee.display}`)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-on-dark/40" />
        ) : (
          <Initials name={professional.name} className="h-11 w-11 text-sm ring-2 ring-brand-on-dark/40" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold leading-snug">
            <Link href={`/professionals/${professional.slug}`} className="truncate after:absolute after:inset-0 hover:text-brand-on-dark">
              {professional.name}
            </Link>
            {professional.is_verified ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-on-dark" aria-label={t('Verified professional', 'تصدیق شدہ پروفیشنل')} />
            ) : null}
          </h3>
          {professional.city ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {professional.city.name}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
