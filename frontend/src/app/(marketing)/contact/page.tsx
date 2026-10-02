import type { Metadata } from 'next';
import { Phone, Mail, MessageSquare, MapPin, Clock, Send, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/marketing/PageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us | PakFix Support & Customer Care',
  description:
    'Get in touch with PakFix support team. Call +92 300 123 4567 or email support@pakfix.pk for help with bookings, AI diagnosis or technician onboarding.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Contact Us' }]}
        title="We are here to help"
        subtitle="Have a question about a booking, service price, or AI diagnosis? Reach out to our team anytime."
      />

      <section className="py-12 sm:py-20 bg-white">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">Direct Channels</span>
              <h2 className="text-2xl font-extrabold text-[#161616]">Get in touch with PakFix</h2>
              <p className="text-sm text-[#475467] leading-relaxed">
                Our support desk is operational 7 days a week to assist Pakistani households and service professionals.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <Phone className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">Helpline Phone</h3>
                    <p className="text-sm font-extrabold text-[#00824A]">+92 300 123 4567</p>
                    <p className="text-[11px] text-[#667085]">Available 8:00 AM – 10:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <MessageSquare className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">WhatsApp Support</h3>
                    <p className="text-sm font-extrabold text-[#00824A]">+92 345 987 6543</p>
                    <p className="text-[11px] text-[#667085]">Instant WhatsApp chat support</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <Mail className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">Email Address</h3>
                    <p className="text-sm font-semibold text-[#161616]">support@pakfix.pk</p>
                    <p className="text-[11px] text-[#667085]">Replies within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <MapPin className="h-5 w-5 text-[#00824A] mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#161616]">Head Office</h3>
                    <p className="text-xs text-[#475467]">Sector F-8 Markaz, Islamabad, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <form className="bg-[#F8FAF9] rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
                <h3 className="text-lg font-bold text-[#161616]">Send Us a Message</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#161616] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Usman Malik"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#161616] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="usman@example.com"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1">Subject</label>
                  <select className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A]">
                    <option value="Booking Question">Booking & Service Inquiry</option>
                    <option value="AI Diagnosis Help">AI Diagnosis Assistance</option>
                    <option value="Pro Onboarding">Technician Onboarding</option>
                    <option value="Corporate Partnership">Corporate & B2B Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161616] mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we help you?"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#161616] outline-none focus:border-[#00824A] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Support Message</span>
                </button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
