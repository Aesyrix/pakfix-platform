'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function QuickBookingFormSection() {
  const [formData, setFormData] = useState({
    service: 'Plumbing',
    city: 'Lahore',
    address: '',
    preferred_date: '',
    preferred_time: 'Morning (9 AM - 12 PM)',
    description: '',
    urgency: 'Normal',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const services = [
    'Plumbing',
    'Electrical Repair',
    'AC Repair & Service',
    'Appliance Repair',
    'Home Cleaning',
    'Carpentry',
    'Painting',
    'Solar Installation',
    'Pest Control',
  ];

  const cities = [
    'Islamabad',
    'Rawalpindi',
    'Lahore',
    'Karachi',
    'Faisalabad',
    'Peshawar',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Quetta',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Simulate real API dispatch to /api/v1/service-requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({
        service: 'Plumbing',
        city: 'Lahore',
        address: '',
        preferred_date: '',
        preferred_time: 'Morning (9 AM - 12 PM)',
        description: '',
        urgency: 'Normal',
      });
    } catch {
      setError('Could not submit booking request. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]" id="quick-booking">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Fast Booking</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
              Know what you need?<br />
              <span className="text-[#008A4B]">Book a service.</span>
            </h2>
            <p className="text-sm text-[#475467] leading-relaxed">
              Fill out the details below to receive instant upfront estimates and connect with available verified service professionals in your area.
            </p>

            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#161616]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7F0] text-[#008A4B]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Verified & skilled professionals</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#161616]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7F0] text-[#008A4B]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Transparent PKR pricing with no surprises</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#161616]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7F0] text-[#008A4B]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>On-time arrival & job tracking</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-card space-y-4"
            >
              <h3 className="text-lg font-bold text-[#161616]">Service Booking Form</h3>

              {success ? (
                <div className="p-4 rounded-xl bg-[#EAF7F0] border border-[#C2ECCF] text-[#006838] text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#008A4B]" />
                  <div>
                    <p className="font-bold text-sm">Booking Request Sent Successfully!</p>
                    <p className="mt-0.5">Verified service professionals in your city will review your request and send upfront quotes shortly.</p>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">Service Needed</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#008A4B]"
                  >
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#008A4B]"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area / Address */}
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">Area / Street Address</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 45, Street 12, Sector F-8/2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 pl-9 text-xs text-[#161616] placeholder-[#9CA3AF] outline-none focus:border-[#008A4B]"
                  />
                  <MapPin className="h-4 w-4 text-[#667085] absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">Preferred Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#008A4B]"
                    />
                  </div>
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1.5">Preferred Time</label>
                  <select
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#008A4B]"
                  >
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                    <option value="Anytime Today">Anytime Today</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">Problem Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe what needs fixing or specific details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] placeholder-[#9CA3AF] outline-none focus:border-[#008A4B] resize-none"
                />
              </div>

              {/* Urgency Selector */}
              <div>
                <label className="block text-xs font-bold text-[#161616] mb-1.5">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Normal', 'Urgent', 'Emergency'].map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: urg })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.urgency === urg
                          ? urg === 'Emergency'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#008A4B] text-white'
                          : 'bg-white border border-[#E5E7EB] text-[#475467] hover:bg-[#EAF7F0]'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#008A4B] hover:bg-[#007541] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Find Available Professionals</span>
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
