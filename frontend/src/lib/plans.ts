export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface PlanTier {
  cycle: BillingCycle;
  label: string;
  cost: number;
  durationDays: number;
  savingsLabel: string | null;
}

export interface PlanConfig {
  name: string;
  tiers: PlanTier[];
  features: string[];
}

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

export const BUYER_PLAN: PlanConfig = {
  name: 'Plan Comprador',
  tiers: [
    { cycle: 'monthly', label: 'Mensual', cost: 3, durationDays: 30, savingsLabel: null },
    { cycle: 'quarterly', label: 'Trimestral', cost: 8, durationDays: 90, savingsLabel: 'Ahorra 11%' },
    { cycle: 'yearly', label: 'Anual', cost: 28, durationDays: 365, savingsLabel: 'Ahorra 22%' },
  ],
  features: [
    'Búsqueda y filtros ilimitados',
    'Ubicación y reseñas de vendedores',
    'Contacto directo con mypimes y mercados',
    'Favoritos y alertas de tus búsquedas',
  ],
};

export const SELLER_PLAN: PlanConfig = {
  name: 'Plan Vendedor',
  tiers: [
    { cycle: 'monthly', label: 'Mensual', cost: 10, durationDays: 30, savingsLabel: null },
    { cycle: 'quarterly', label: 'Trimestral', cost: 27, durationDays: 90, savingsLabel: 'Ahorra 10%' },
    { cycle: 'yearly', label: 'Anual', cost: 96, durationDays: 365, savingsLabel: 'Ahorra 20%' },
  ],
  features: [
    'Productos y servicios ilimitados',
    'Apareces en búsquedas por ubicación',
    'Recibe calificaciones de tus clientes',
    'Panel para gestionar tu catálogo',
  ],
};

export function getTier(plan: PlanConfig, cycle: BillingCycle): PlanTier {
  return plan.tiers.find((t) => t.cycle === cycle) ?? plan.tiers[0];
}

export function monthlyEquivalent(tier: PlanTier): number {
  return tier.cost / (tier.durationDays / 30);
}
