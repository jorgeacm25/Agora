import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { createEnterprise } from '@/api/userEnterprise';
import { createSubscription } from '@/api/subscription';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { PlanPicker } from '@/components/plans/PlanPicker';
import { cn } from '@/lib/utils';
import { SELLER_PLAN, daAccesoDeNegocio, getTier } from '@/lib/plans';
import type { BillingCycle } from '@/lib/plans';

export function BecomeSellerPage() {
  const { user, isAuthenticated, isLoading, enterprise, subscription, refreshSellerStatus } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('Cuba');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (enterprise) setStep(2);
  }, [enterprise]);

  // Con la empresa creada y un plan que dé negocio ya no hay nada que hacer
  // aquí: se entra al panel. Con la prueba activa vale igual, así que el paso
  // del plan se salta.
  const planDaNegocio = daAccesoDeNegocio(subscription);
  useEffect(() => {
    if (enterprise && planDaNegocio) {
      navigate('/panel', { replace: true });
    }
  }, [enterprise, planDaNegocio, navigate]);

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    return (
      <div id="sell__gate" className="sell__gate mx-auto max-w-md px-4 py-20 text-center">
        <Store size={28} className="mx-auto mb-4 text-ink-400" />
        <h1 id="sell__gate-title" className="sell__gate-title text-xl font-semibold text-ink-900">Crea una cuenta para vender</h1>
        <p id="sell__gate-text" className="sell__gate-text mt-2 text-sm text-ink-500">Regístrate como vendedor para publicar tu catálogo en Agora.</p>
        <Button className="mt-6" onClick={() => navigate('/registrarse')}>
          Crear cuenta de vendedor
        </Button>
      </div>
    );
  }

  async function handleCreateEnterprise(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEnterprise({
        companyName,
        address: { street, city, state, zipCode, country },
        contact: { email, phone, website: website || undefined },
      });
      await refreshSellerStatus();
      notify('Empresa registrada correctamente');
      setStep(2);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo registrar la empresa', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivatePlan(cycle: BillingCycle) {
    if (!user) return;
    const tier = getTier(SELLER_PLAN, cycle);
    setSubmitting(true);
    try {
      await createSubscription({
        userId: user.id,
        name: `${SELLER_PLAN.name} ${tier.label}`,
        cost: tier.cost,
        quantityAccounts: 1,
        durationDays: tier.durationDays,
      });
      await refreshSellerStatus();
      notify('¡Plan de vendedor activado!');
      navigate('/panel', { replace: true });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo activar el plan', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="sell" className="sell mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div id="sell__intro" className="sell__intro mb-10 text-center">
        <h1 id="sell__title" className="sell__title text-2xl font-semibold text-ink-900">Empieza a vender en Agora</h1>
        <p id="sell__subtitle" className="sell__subtitle mt-2 text-sm text-ink-500">Dos pasos y tu catálogo estará listo para tus clientes.</p>
      </div>

      <div id="sell__steps" className="sell__steps mb-10 flex items-center justify-center gap-4">
        <StepIndicator number={1} label="Tu empresa" active={step === 1} done={Boolean(enterprise)} />
        <div id="sell__steps-line" className="sell__steps-line h-px w-10 bg-ink-200" />
        <StepIndicator number={2} label="Plan vendedor" active={step === 2} done={Boolean(subscription)} />
      </div>

      {step === 1 && (
        <Card className="p-6">
          <form onSubmit={handleCreateEnterprise} id="sell__form" className="sell__form space-y-4">
            <Input label="Nombre de la empresa / mercado" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Mercado La Esquina" />
            <div id="sell__address-row" className="sell__address-row grid grid-cols-2 gap-3">
              <Input label="Calle" required value={street} onChange={(e) => setStreet(e.target.value)} />
              <Input label="Ciudad" required value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Provincia / Estado" required value={state} onChange={(e) => setState(e.target.value)} />
              <Input label="Código postal" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
            <Input label="País" required value={country} onChange={(e) => setCountry(e.target.value)} />
            <div id="sell__contact-row" className="sell__contact-row grid grid-cols-2 gap-3">
              <Input label="Email de contacto" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Teléfono" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Input label="Sitio web (opcional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Continuar
            </Button>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h2 id="sell__plan-title" className="sell__plan-title mb-1 font-medium text-ink-900">Elige tu plan de vendedor</h2>
          <p id="sell__plan-subtitle" className="sell__plan-subtitle mb-5 text-sm text-ink-500">Puedes cambiar de ciclo más adelante desde tu cuenta.</p>
          <PlanPicker plan={SELLER_PLAN} onSubscribe={handleActivatePlan} submitting={submitting} ctaLabel="Activar plan de vendedor" />
          <p id="sell__plan-note" className="sell__plan-note mt-3 text-center text-xs text-ink-400">Se registrará tu suscripción; el cobro se gestiona fuera de la plataforma por ahora.</p>
        </Card>
      )}
    </div>
  );
}

function StepIndicator({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div id={`sell__step--${number}`} className="sell__step flex items-center gap-2">
      <span
        id={`sell__step-number--${number}`}
        className={cn(
          'sell__step-number flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
          done ? 'bg-ink-900 text-ink-50' : active ? 'border-2 border-ink-900 text-ink-900' : 'border border-ink-300 text-ink-400',
        )}
      >
        {done ? <Check size={13} /> : number}
      </span>
      <span id={`sell__step-label--${number}`} className={cn('sell__step-label', 'text-sm font-medium', active || done ? 'text-ink-900' : 'text-ink-400')}>{label}</span>
    </div>
  );
}
