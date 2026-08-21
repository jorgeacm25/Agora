import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { createSubscription } from '@/api/subscription';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { PlanPicker } from '@/components/plans/PlanPicker';
import { Button } from '@/components/ui/Button';
import { BUYER_PLAN, getTier } from '@/lib/plans';
import type { BillingCycle } from '@/lib/plans';

export function PlansPage() {
  const { user, isAuthenticated, isLoading, isSeller, subscription, refreshSellerStatus } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) navigate('/', { replace: true });
  }, [subscription, navigate]);

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/registrarse" replace />;
  if (isSeller) return <Navigate to="/panel" replace />;

  async function handleSubscribe(cycle: BillingCycle) {
    if (!user) return;
    const tier = getTier(BUYER_PLAN, cycle);
    setSubmitting(true);
    try {
      await createSubscription({
        userId: user.id,
        name: `${BUYER_PLAN.name} ${tier.label}`,
        cost: tier.cost,
        quantityAccounts: 1,
        durationDays: tier.durationDays,
      });
      await refreshSellerStatus();
      notify('¡Membresía activada!');
      navigate('/', { replace: true });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo activar la membresía', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
          <ShoppingBag size={19} />
        </div>
        <h1 className="text-2xl font-semibold text-ink-900">Elige tu membresía de comprador</h1>
        <p className="mt-2 text-sm text-ink-500">Un paso más y podrás buscar en todo el catálogo de tu ciudad.</p>
      </div>

      <Card className="p-6">
        <PlanPicker plan={BUYER_PLAN} onSubscribe={handleSubscribe} submitting={submitting} ctaLabel="Activar membresía" />
        <p className="mt-3 text-center text-xs text-ink-400">Se registrará tu suscripción; el cobro se gestiona fuera de la plataforma por ahora.</p>
      </Card>

      <div className="mt-6 flex items-center justify-center">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          Decidir más tarde
        </Button>
      </div>
    </div>
  );
}
