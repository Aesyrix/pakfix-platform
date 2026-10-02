'use client';

import { Building2, Home, MapPin, Plus, Wrench, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Input, Select } from '@/components/ui/Input';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: string;
  unitsCount: number;
  activeJobsCount: number;
  totalMaintenancePkr: number;
  lastServiceDate: string;
}

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'PROP-01',
    name: 'Gulberg House (Primary Home)',
    address: '142-B, Block H, Gulberg III',
    city: 'Lahore',
    type: 'Residential House (1 Kanal)',
    unitsCount: 1,
    activeJobsCount: 1,
    totalMaintenancePkr: 45000,
    lastServiceDate: '12 Sep 2026',
  },
  {
    id: 'PROP-02',
    name: 'DHA Apartment Unit 4B',
    address: 'Building 18-C, Commercial Plaza, DHA Phase 5',
    city: 'Lahore',
    type: 'Rental Apartment',
    unitsCount: 1,
    activeJobsCount: 0,
    totalMaintenancePkr: 28000,
    lastServiceDate: '01 Aug 2026',
  },
  {
    id: 'PROP-03',
    name: 'F-7 Commercial Office',
    address: 'Suite 302, Jinnah Super, F-7/2',
    city: 'Islamabad',
    type: 'Commercial Office',
    unitsCount: 3,
    activeJobsCount: 0,
    totalMaintenancePkr: 82000,
    lastServiceDate: '28 Jul 2026',
  },
];

export default function PropertiesDashboardPage() {
  const [properties, setProperties] = useState(SAMPLE_PROPERTIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('Residential House');
  const [city, setCity] = useState('Lahore');

  function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !address) return;

    const newProp: Property = {
      id: `PROP-0${properties.length + 1}`,
      name,
      address,
      city,
      type,
      unitsCount: 1,
      activeJobsCount: 0,
      totalMaintenancePkr: 0,
      lastServiceDate: 'Just Added',
    };

    setProperties([...properties, newProp]);
    setShowAddModal(false);
    setName('');
    setAddress('');
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Asset Management</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            My Properties & Assets
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            Keep track of maintenance history, active repair tickets, and maintenance logs across all your locations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add New Property
        </Button>
      </div>

      {/* Add Property Form Card Modal */}
      {showAddModal && (
        <Card className="mb-8 border-[#16A34A] ring-2 ring-[#16A34A]/20 shadow-xl">
          <CardHeader className="border-b border-[var(--border)] pb-3">
            <CardTitle className="text-base font-bold text-foreground">Register New Property</CardTitle>
          </CardHeader>
          <CardBody className="p-5">
            <form onSubmit={handleAddProperty} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Property Nickname"
                placeholder="e.g. Model Town Villa / Office Suite"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Select label="City" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </Select>
              <Input
                label="Full Address"
                placeholder="Street, Phase, Sector"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <Select label="Property Type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Residential House">Residential House</option>
                <option value="Rental Apartment">Rental Apartment</option>
                <option value="Commercial Office">Commercial Office</option>
                <option value="Retail Shop">Retail Shop</option>
              </Select>

              <div className="sm:col-span-2 flex items-center justify-end gap-2 mt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Property
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Property Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((prop) => (
          <Card key={prop.id} interactive className="flex flex-col justify-between shadow-md">
            <div>
              <CardHeader className="border-b border-[var(--border)] pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#15803D]">
                      {prop.type.includes('House') ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </span>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{prop.name}</CardTitle>
                      <span className="text-[11px] font-medium text-ink-500">{prop.type}</span>
                    </div>
                  </div>
                  {prop.activeJobsCount > 0 ? (
                    <Badge tone="brand">1 Active Repair</Badge>
                  ) : (
                    <Badge tone="neutral">All Systems OK</Badge>
                  )}
                </div>
              </CardHeader>

              <CardBody className="p-4 space-y-3.5 text-xs">
                <div className="flex items-start gap-1.5 text-ink-600">
                  <MapPin className="h-4 w-4 text-ink-400 shrink-0 mt-0.5" />
                  <span>{prop.address}, {prop.city}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] text-ink-600">
                  <div>
                    <span className="text-[10px] text-ink-400 uppercase font-semibold">Total Maintenance Spend</span>
                    <p className="font-extrabold text-[#16A34A] text-sm mt-0.5">PKR {prop.totalMaintenancePkr.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-400 uppercase font-semibold">Last Serviced</span>
                    <p className="font-bold text-foreground text-xs mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-ink-400" />
                      {prop.lastServiceDate}
                    </p>
                  </div>
                </div>
              </CardBody>
            </div>

            <div className="p-4 pt-0 border-t border-[var(--border)] mt-2">
              <Button variant="ghost" size="sm" block className="justify-between text-xs font-bold text-[#16A34A] hover:bg-[#DCFCE7]/40">
                <span>View Property History & Specs</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
