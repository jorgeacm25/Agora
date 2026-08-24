import { useState } from 'react';
import { Check } from 'lucide-react';
import type { BillingCycle, PlanConfig } from '@/lib/plans';
import { CYCLE_LABELS, getTier } from '@/lib/plans';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'yearly'];

interface PlanPickerProps {
  plan: PlanConfig;
  onSubscribe: (cycle: BillingCycle) => void;
  submitting?: boolean;
  ctaLabel?: string;
}

export function PlanPicker({ plan, onSubscribe, submitting, ctaLabel = 'Continuar' }: PlanPickerProps) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const tier = getTier(plan, cycle);

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-1.5 rounded-xl bg-ink-100 p-1">
        {CYCLES.map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={cn(
              'rounded-lg py-2 text-sm font-medium transition-colors',
              cycle === c ? 'bg-ink-50 text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {CYCLE_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-ink-900">${tier.cost}</span>
        <span className="text-sm text-ink-400">/ {tier.durationDays} días</span>
        {tier.savingsLabel && (
          <span className="ml-auto rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">{tier.savingsLabel}</span>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-ink-600">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check size={14} className="text-ink-900 shrink-0" /> {feature}
          </li>
        ))}
      </ul>

      <Button className="mt-6 w-full" size="lg" loading={submitting} onClick={() => onSubscribe(cycle)}>
        {ctaLabel}
      </Button>
    </div>
  );
}
