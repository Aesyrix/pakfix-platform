'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function CostEstimatorSection() {
  const [service, setService] = useState('AC Repair');
  const [city, setCity] = useState('Lahore');
  const [problemType, setProblemType] = useState('Gas Refill & Master Service');
  const [calculatedRange, setCalculatedRange] = useState('PKR 2,500 – 4,500');

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (service === 'AC Repair') setCalculatedRange('PKR 2,500 – 5,000');
    else if (service === 'Plumbing') setCalculatedRange('PKR 1,200 – 3,000');
    else if (service === 'Electrical') setCalculatedRange('PKR 1,500 – 3,500');
    else setCalculatedRange('PKR 2,000 – 6,000');
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-card">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838] text-xs font-bold">
              <Calculator className="h-4 w-4 text-[#00824A]" />
              <span>Interactive Repair Tool</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616]">
              Get an estimated repair range.
            </h2>
            <p className="text-xs sm:text-sm text-[#475467]">
              Select your service type and issue to view standard market PKR estimates.
            </p>
          </div>

          <form onSubmit={handleEstimate} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">Service</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#161616] outline-none"
                >
                  <option value="AC Repair">AC Repair & Service</option>
                  <option value="Plumbing">Plumbing & Pipes</option>
                  <option value="Electrical">Electrical & DB Box</option>
                  <option value="Appliance Care">Appliance Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#161616] outline-none"
                >
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">Problem Type</label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#161616] outline-none"
                >
                  <option value="Gas Refill & Master Service">Gas Refill & Master Service</option>
                  <option value="Water Leakage Repair">Water Leakage Repair</option>
                  <option value="Short Circuit / Breaker">Short Circuit / Breaker</option>
                  <option value="General Inspection">General Inspection</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Calculate Estimated Cost Range
            </button>
          </form>

          {/* Result Output Display */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] bg-[#EAF7F0] p-4 rounded-2xl text-center space-y-1">
            <span className="text-xs font-bold text-[#006838]">Typical Market Range for {city}:</span>
            <div className="text-2xl font-extrabold text-[#006838]">{calculatedRange}</div>
            <p className="text-[11px] text-[#00532C] max-w-md mx-auto pt-1">
              * Actual cost depends on detailed inspection, labour requirements, material parts and service provider choice.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
