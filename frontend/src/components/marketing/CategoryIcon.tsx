import {
  Armchair,
  BatteryCharging,
  Brush,
  Bug,
  Cctv,
  Construction,
  Container,
  Truck,
  Flower,
  Frame,
  Fuel,
  Gauge,
  Grid3x3,
  Hammer,
  Home,
  House,
  Layers,
  Lock,
  Microwave,
  PanelTop,
  PanelsTopLeft,
  Refrigerator,
  Shield,
  ShieldCheck,
  ShowerHead,
  Siren,
  Sparkles,
  SprayCan,
  Square,
  SquareStack,
  Sun,
  Utensils,
  WashingMachine,
  Wifi,
  Wind,
  Wrench,
  Zap,
  Droplet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps the icon name stored against a service category to a real icon.
 *
 * The name is data set by an admin, so it can be anything; an unrecognised
 * name falls back to a wrench rather than rendering nothing or crashing.
 */
const ICONS: Record<string, LucideIcon> = {
  droplet: Droplet,
  zap: Zap,
  wind: Wind,
  refrigerator: Refrigerator,
  'washing-machine': WashingMachine,
  microwave: Microwave,
  gauge: Gauge,
  container: Container,
  sun: Sun,
  'battery-charging': BatteryCharging,
  fuel: Fuel,
  hammer: Hammer,
  armchair: Armchair,
  paintbrush: Brush,
  'brick-wall': Layers,
  home: Home,
  house: House,
  shield: Shield,
  bug: Bug,
  sparkles: Sparkles,
  'spray-can': SprayCan,
  'shower-head': ShowerHead,
  utensils: Utensils,
  square: Square,
  frame: Frame,
  lock: Lock,
  cctv: Cctv,
  wifi: Wifi,
  'shield-check': ShieldCheck,
  'house-plug': House,
  flower: Flower,
  crane: Truck,
  layers: Layers,
  'grid-3x3': Grid3x3,
  'square-stack': SquareStack,
  'panel-top': PanelTop,
  'panels-top-left': PanelsTopLeft,
  construction: Construction,
  siren: Siren,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  const Icon = (name ? ICONS[name] : undefined) ?? Wrench;

  return <Icon className={className} aria-hidden="true" />;
}
