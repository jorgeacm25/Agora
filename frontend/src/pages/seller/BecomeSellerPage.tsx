import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Store, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { createEnterprise } from '@/api/userEnterprise';
import { createSubscription } from '@/api/subscription';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const SELLER_PLAN = {
  name: 'Plan Vendedor Mensual',
  cost: 10,
  durationDays: 30,
  quantityAccounts: 1,
};

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

  useEffect(() => {
    if (enterprise && subscription) {
      navigate('/panel', { replace: true });
    }
  }, [enterprise, subscription, navigate]);

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Store size={28} className="mx-auto mb-4 text-ink-400" />
        <h1 className="text-xl font-semibold text-ink-900">Crea una cuenta para vender</h1>
        <p className="mt-2 text-sm text-ink-500">Regístrate como vendedor para publicar tu catálogo en Agora.</p>
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

  async function handleActivatePlan() {
    if (!user) return;
    setSubmitting(true);
    try {
      await createSubscription({
        userId: user.id,
        name: SELLER_PLAN.name,
        cost: SELLER_PLAN.cost,
        quantityAccounts: SELLER_PLAN.quantityAccounts,
        durationDays: SELLER_PLAN.durationDays,
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
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold text-ink-900">Empieza a vender en Agora</h1>
        <p className="mt-2 text-sm text-ink-500">Dos pasos y tu catálogo estará listo para tus clientes.</p>
      </div>

      <div className="mb-10 flex items-center justify-center gap-4">
        <StepIndicator number={1} label="Tu empresa" active={step === 1} done={Boolean(enterprise)} />
        <div className="h-px w-10 bg-ink-200" />
        <StepIndicator number={2} label="Plan vendedor" active={step === 2} done={Boolean(subscription)} />
      </div>

      {step === 1 && (
        <Card className="p-6">
          <form onSubmit={handleCreateEnterprise} className="space-y-4">
            <Input label="Nombre de la empresa / mercado" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Mercado La Esquina" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Calle" required value={street} onChange={(e) => setStreet(e.target.value)} />
              <Input label="Ciudad" required value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Provincia / Estado" required value={state} onChange={(e) => setState(e.target.value)} />
              <Input label="Código postal" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
            <Input label="País" required value={country} onChange={(e) => setCountry(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
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
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100">
              <CreditCard size={18} className="text-ink-700" />
            </div>
            <div>
              <p className="font-medium text-ink-900">{SELLER_PLAN.name}</p>
              <p className="text-sm text-ink-500">${SELLER_PLAN.cost} USD / {SELLER_PLAN.durationDays} días</p>
            </div>
          </div>
          <ul className="mb-6 space-y-2 text-sm text-ink-600">
            <li className="flex items-center gap-2"><Check size={14} className="text-ink-900" /> Publica productos y servicios ilimitados</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-ink-900" /> Aparece en las búsquedas por ubicación</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-ink-900" /> Recibe calificaciones de tus clientes</li>
          </ul>
          <Button className="w-full" size="lg" loading={submitting} onClick={handleActivatePlan} icon={<ShieldCheck size={16} />}>
            Activar plan de vendedor
          </Button>
          <p className="mt-3 text-center text-xs text-ink-400">Se registrará tu suscripción; el cobro se gestiona fuera de la plataforma por ahora.</p>
        </Card>
      )}
    </div>
  );
}

function StepIndicator({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
          done ? 'bg-ink-900 text-white' : active ? 'border-2 border-ink-900 text-ink-900' : 'border border-ink-300 text-ink-400',
        )}
      >
        {done ? <Check size={13} /> : number}
      </span>
      <span className={cn('text-sm font-medium', active || done ? 'text-ink-900' : 'text-ink-400')}>{label}</span>
    </div>
  );
}
