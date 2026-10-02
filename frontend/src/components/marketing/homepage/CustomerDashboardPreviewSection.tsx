import Link from 'next/link';
import {
  LayoutDashboard,
  Sparkles,
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Wrench,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function CustomerDashboardPreviewSection() {
  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, active: true },
    { label: 'PakFix AI', icon: Sparkles },
    { label: 'Properties', icon: Home },
    { label: 'Bookings', icon: Calendar, badge: '2 Active' },
    { label: 'Quotes', icon: FileText, badge: '1 Open' },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Maintenance', icon: Wrench, badge: 'Due' },
    { label: 'Payments', icon: CreditCard },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#008A4B] uppercase tracking-wider">Customer Portal</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161616]">
            Everything about your home in one place.
          </h2>
          <p className="text-sm text-[#475467]">
            Track active repair jobs, inspect itemized quotes, check AI diagnosis history, and manage recurring maintenance.
          </p>
        </div>

        {/* Screenshot-Style Web App UI Container */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-floating overflow-hidden">
          {/* Top Window Control Bar */}
          <div className="bg-[#161616] px-4 py-3 flex items-center justify-between text-xs text-gray-400 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 font-mono text-[11px] text-gray-400">app.pakfix.pk/dashboard</span>
            </div>
            <span className="text-[#00A85B] font-bold">Customer Portal</span>
          </div>

          {/* Web App Body Layout */}
          <div className="grid lg:grid-cols-12 min-h-[480px]">
            {/* App Sidebar */}
            <div className="lg:col-span-3 bg-[#161616] text-white p-4 border-r border-gray-800 space-y-1 hidden lg:block">
              <div className="px-3 py-2 text-xs font-extrabold text-[#00A85B] tracking-wider uppercase mb-2">
                PAKFIX APP
              </div>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      item.active ? 'bg-[#008A4B] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-700 text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* App Main Content Area */}
            <div className="lg:col-span-9 p-6 sm:p-8 bg-[#F8FAF9] space-y-6">
              {/* Header banner inside app */}
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E7EB]">
                <div>
                  <h3 className="text-base font-extrabold text-[#161616]">Welcome back, Ahmed!</h3>
                  <p className="text-xs text-[#667085]">Here is the live status for your property in Islamabad.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF7F0] text-[#006838]">
                  Verified Account
                </span>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Card 1: Upcoming Booking */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>Upcoming Booking</span>
                    <span className="text-[#008A4B]">Active</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">AC Master Service & Gas Refill</p>
                    <p className="text-[#667085]">Technician: Ali Raza &bull; Arriving Today 3 PM</p>
                  </div>
                </div>

                {/* Card 2: Open Quote */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>Open Quote</span>
                    <span className="text-[#2563EB]">1 Pending</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">Plumbing Leak Repair</p>
                    <p className="text-[#667085]">TechFix Quote: PKR 3,500 (Labour + Pipe)</p>
                  </div>
                </div>

                {/* Card 3: Recent Diagnosis */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>Recent AI Diagnosis</span>
                    <span className="text-xs text-[#667085]">Yesterday</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">Circuit Overload Alert</p>
                    <p className="text-[#667085]">Safety: Medium Risk &bull; Electrician Recommended</p>
                  </div>
                </div>

                {/* Card 4: Maintenance Due */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161616]">
                    <span>Maintenance Schedule</span>
                    <span className="text-amber-600 font-bold">Due</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#161616]">Water Tank Deep Cleaning</p>
                    <p className="text-[#667085]">Scheduled for Next Week &bull; 6 Mo Cycle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
