'use client';

import { ArrowRight, Camera, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

/**
 * The box in the hero. This is the front door to the whole product: whatever
 * the visitor types is carried straight into the assistant, so they never
 * have to repeat themselves.
 *
 * Photo and voice entry live here too. Both hand off to the assistant rather
 * than trying to do anything on the marketing page.
 */
export function HeroSearch({ examples = [] }: { examples?: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();

    const problem = value.trim();
    router.push(problem ? `/ai?q=${encodeURIComponent(problem)}` : '/ai');
  }

  return (
    <div className="w-full">
      <form onSubmit={submit} className="w-full">
        <label htmlFor="hero-problem" className="sr-only">
          What needs fixing?
        </label>

        <div
          className={cn(
            'flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--border)]',
            'bg-surface p-2 shadow-[var(--shadow-lifted)]',
            'sm:flex-row sm:items-center'
          )}
        >
          <input
            id="hero-problem"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="What needs fixing?"
            autoComplete="off"
            className={cn(
              'min-h-12 w-full flex-1 rounded-[var(--radius-control)] bg-transparent px-3.5',
              'text-base text-foreground outline-none placeholder:text-ink-400'
            )}
          />

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push('/ai?input=camera')}
              aria-label="Send a photo of the problem instead"
              title="Send a photo"
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push('/ai?input=voice')}
              aria-label="Describe the problem out loud instead"
              title="Describe it out loud"
            >
              <Mic className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button type="submit" size="md" className="flex-1 sm:flex-none">
              Diagnose
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>

      {examples.length > 0 ? (
        <div className="mt-4">
          <p className="sr-only" id="hero-examples-label">
            Example problems
          </p>
          <ul
            aria-labelledby="hero-examples-label"
            className="flex flex-wrap items-center gap-2"
          >
            {examples.map((example) => (
              <li key={example}>
                <button
                  type="button"
                  onClick={() => setValue(example)}
                  className={cn(
                    'rounded-[var(--radius-pill)] border border-[var(--border)] bg-surface/70',
                    'px-3.5 py-2 text-sm text-ink-600 transition-colors',
                    'hover:border-brand-300 hover:text-brand-700'
                  )}
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
