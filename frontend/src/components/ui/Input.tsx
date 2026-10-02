'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Form controls with the label, hint and error wired together.
 *
 * The error is tied to the input with aria-describedby and aria-invalid, so a
 * screen reader announces the problem rather than leaving a blind user with a
 * form that silently refuses to submit.
 */

interface FieldShellProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, error, required, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required ? (
            <span className="ml-0.5 text-danger-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const controlClasses = [
  'w-full rounded-[var(--radius-control)] border bg-surface px-4 py-3',
  'text-base text-foreground placeholder:text-ink-400',
  'transition-all outline-none',
  'focus:ring-2 focus:ring-[#16A34A] focus:border-transparent',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'min-h-[48px]',
].join(' ');

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, className, id: providedId, required, ...props },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <div className="relative flex items-center">
        {leading ? (
          <span className="pointer-events-none absolute left-3.5 text-ink-400" aria-hidden="true">
            {leading}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            controlClasses,
            leading && 'pl-10',
            error
              ? 'border-danger-500 focus:border-danger-500'
              : 'border-[var(--border)] focus:border-brand-500',
            className
          )}
          {...props}
        />
      </div>
    </FieldShell>
  );
});

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id: providedId, required, rows = 4, ...props },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          controlClasses,
          'resize-y',
          error
            ? 'border-danger-500 focus:border-danger-500'
            : 'border-[var(--border)] focus:border-brand-500',
          className
        )}
        {...props}
      />
    </FieldShell>
  );
});

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, id: providedId, required, children, ...props },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          controlClasses,
          'appearance-none bg-[length:1rem] bg-[right_0.875rem_center] bg-no-repeat pr-10',
          error
            ? 'border-danger-500 focus:border-danger-500'
            : 'border-[var(--border)] focus:border-brand-500',
          className
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: ReactNode;
  error?: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className, id: providedId, ...props },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] text-brand-600',
            'accent-[var(--color-brand-600)]',
            className
          )}
          {...props}
        />
        <span className="text-foreground">{label}</span>
      </label>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});
