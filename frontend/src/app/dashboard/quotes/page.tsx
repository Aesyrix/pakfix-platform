'use client';

import { CheckCircle2, Clock, DollarSign, MessageSquare, ShieldCheck, Star, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge, VerifiedBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

interface Quote {
  id: string;
  technicianName: string;
  avatar: string;
  rating: string;
  jobsCount: number;
  responseTime: string;
  totalPkr: number;
  breakdown: {
    labor: number;
    parts: number;
    diagnostic: number;
  };
  note: string;
  availability: string;
}

const SAMPLE_QUOTES: Quote[] = [
  {
    id: 'QT-101',
    technicianName: 'Tariq Mahmood',
    avatar: 'TM',
    rating: '4.9',
    jobsCount: 184,
    responseTime: '5 mins',
    totalPkr: 2500,
    breakdown: { labor: 1500, parts: 700, diagnostic: 300 },
    note: 'Includes capacitor replacement with genuine Panasonic parts & 15-day gas leak check warranty.',
    availability: 'Available Today (Within 2 Hours)',
  },
  {
    id: 'QT-102',
    technicianName: 'Muhammad Usman',
    avatar: 'MU',
    rating: '4.8',
    jobsCount: 112,
    responseTime: '12 mins',
    totalPkr: 2200,
    breakdown: { labor: 1400, parts: 500, diagnostic: 300 },
    note: 'Standard jet wash + electrical wiring check. Parts charged at wholesale cost.',
    availability: 'Available Tomorrow Morning',
  },
  {
    id: 'QT-103',
    technicianName: 'Shahid Ali Services',
    avatar: 'SA',
    rating: '4.95',
    jobsCount: 310,
    responseTime: '2 mins',
    totalPkr: 2800,
    breakdown: { labor: 1800, parts: 700, diagnostic: 300 },
    note: 'Premium Master Electrician service. Guarantee certificate provided on site.',
    availability: 'Immediate Dispatch Available',
  },
];

export default function QuotesPage() {
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#00824A]">Transparent Marketplace</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
          Quote Comparison & Bids
        </h1>
        <p className="text-sm text-ink-600 mt-1">
          Compare verified technician bids for your requested repair: <span className="font-bold text-foreground">&ldquo;AC Inverter Cooling Repair&rdquo;</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_QUOTES.map((quote) => {
          const isAccepted = acceptedId === quote.id;

          return (
            <Card key={quote.id} className={`flex flex-col justify-between shadow-md transition-all ${isAccepted ? 'ring-2 ring-[#00824A] border-[#00824A] bg-[#DCFCE7]/10' : ''}`}>
              <div>
                <CardHeader className="border-b border-[var(--border)] pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#00824A] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        {quote.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CardTitle className="text-sm font-bold">{quote.technicianName}</CardTitle>
                        </div>
                        <VerifiedBadge showText={false} />
                      </div>
                    </div>

                    <span className="text-xs text-ink-500 font-mono">
                      {quote.responseTime} ago
                    </span>
                  </div>
                </CardHeader>

                <CardBody className="p-4 space-y-4 text-xs">
                  {/* Rating & Jobs */}
                  <div className="flex items-center justify-between text-ink-600 bg-surface-muted/60 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="font-bold text-foreground">{quote.rating}</span>
                      <span>({quote.jobsCount} jobs)</span>
                    </div>
                    <span className="font-semibold text-[#00824A]">{quote.availability}</span>
                  </div>

                  {/* Pricing Display */}
                  <div className="rounded-2xl border border-[#00824A]/20 bg-[#DCFCE7]/20 p-3 text-center">
                    <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Total Fixed Price</span>
                    <p className="text-2xl font-extrabold text-[#15803D] mt-0.5">PKR {quote.totalPkr.toLocaleString()}</p>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                    <p className="font-bold text-foreground text-[11px] uppercase tracking-wide">Itemized Breakdown</p>
                    <div className="flex justify-between text-ink-600">
                      <span>Labor Charge:</span>
                      <span className="font-semibold">PKR {quote.breakdown.labor}</span>
                    </div>
                    <div className="flex justify-between text-ink-600">
                      <span>Parts / Material:</span>
                      <span className="font-semibold">PKR {quote.breakdown.parts}</span>
                    </div>
                    <div className="flex justify-between text-ink-600">
                      <span>Diagnostic Fee:</span>
                      <span className="font-semibold">PKR {quote.breakdown.diagnostic}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-surface-muted p-2.5 rounded-xl text-ink-600 leading-relaxed italic">
                    &ldquo;{quote.note}&rdquo;
                  </div>
                </CardBody>
              </div>

              <div className="p-4 pt-0 space-y-2">
                {isAccepted ? (
                  <div className="rounded-xl bg-[#00824A] p-3 text-center text-white text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Quote Accepted! Technician Dispatched.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => alert('Quote declined.')}>
                      Decline
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setAcceptedId(quote.id)}>
                      Accept Quote
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
