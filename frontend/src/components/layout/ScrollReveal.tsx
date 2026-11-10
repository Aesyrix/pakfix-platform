'use client';

import { useEffect } from 'react';

/**
 * Fades content up into place as it scrolls into view.
 *
 * Content is always in the server HTML and fully visible without JavaScript;
 * this only hides things that are still below the fold once the page has
 * loaded, then reveals them as they arrive. Anything already on screen is
 * left alone, so nothing flashes. Items in the same list arrive one after
 * another. New content (client navigation, "show more", loaded data) is
 * picked up automatically.
 *
 * Reveal is position-based, not IntersectionObserver-based: a fast scroll or
 * a jump link can carry an element from below the screen to above it without
 * it ever "intersecting", and it would stay hidden. Here anything whose top
 * has reached the lower part of the viewport, or gone past it, is revealed.
 *
 * Opt out with data-no-reveal on any ancestor. Does nothing for visitors who
 * ask their device for reduced motion.
 */
const TARGETS = [
  'main section h2',
  'main section h2 + p',
  'main section .eyebrow',
  'main section li',
  'main section form',
  'main section article',
  'main section .card-lift',
  'main [data-reveal]',
].join(',');

const STAGGER_MS = 70;
const MAX_STAGGER_MS = 420;
/** Reveal once an element's top passes this fraction of the viewport height. */
const TRIGGER = 0.92;

export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.getElementById('main');
    if (!main) return;

    const seen = new WeakSet<Element>();
    let pending: HTMLElement[] = [];

    function reveal() {
      const line = window.innerHeight * TRIGGER;
      pending = pending.filter((el) => {
        if (!el.isConnected) return false;
        if (el.getBoundingClientRect().top < line) {
          el.classList.add('reveal-in');
          return false;
        }
        return true;
      });
    }

    function scan() {
      const viewport = window.innerHeight;
      main!.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.closest('[data-no-reveal]')) return;
        // A target inside another target would animate twice.
        if (el.parentElement?.closest('.reveal-pending')) return;
        if (el.getBoundingClientRect().top < viewport) return; // already visible

        if (el.tagName === 'LI' && el.parentElement) {
          const index = Array.prototype.indexOf.call(el.parentElement.children, el);
          el.style.setProperty('--reveal-delay', `${Math.min(index * STAGGER_MS, MAX_STAGGER_MS)}ms`);
        }
        el.classList.add('reveal-pending');
        pending.push(el);
      });
      reveal();
    }

    // Separate frames, so a scroll never cancels a pending scan for new content.
    let revealFrame = 0;
    let scanFrame = 0;
    const onScroll = () => {
      cancelAnimationFrame(revealFrame);
      revealFrame = requestAnimationFrame(reveal);
    };

    scan();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(scanFrame);
      scanFrame = requestAnimationFrame(scan);
    });
    mutations.observe(main, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(revealFrame);
      cancelAnimationFrame(scanFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mutations.disconnect();
    };
  }, []);

  return null;
}
