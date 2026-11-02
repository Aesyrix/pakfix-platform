'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { contactApi } from '@/lib/api/endpoints';
import type { ContactInput } from '@/lib/api/types';

/**
 * Sends a website form to the PakFix team. Every message is stored in the
 * admin Contact inbox, so a request is never lost.
 */
export function useLeadForm(fallbackError: string) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function send(input: ContactInput): Promise<boolean> {
    setSending(true);
    setSent(false);
    setError('');
    try {
      await contactApi.send(input);
      setSent(true);
      return true;
    } catch (e) {
      const first = e instanceof ApiError ? Object.values(e.errors)[0]?.[0] : undefined;
      setError(first ?? fallbackError);
      return false;
    } finally {
      setSending(false);
    }
  }

  return { sending, sent, error, send };
}
