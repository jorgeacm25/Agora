import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { updateEnterprise } from '@/api/userEnterprise';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function DashboardEnterprise() {
  const { enterprise, refreshSellerStatus } = useAuth();
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!enterprise) return;
    setCompanyName(enterprise.companyName);
    setStreet(enterprise.address?.street ?? '');
    setCity(enterprise.address?.city ?? '');
    setState(enterprise.address?.state ?? '');
    setZipCode(enterprise.address?.zipCode ?? '');
    setCountry(enterprise.address?.country ?? '');
    setEmail(enterprise.contact?.email ?? '');
    setPhone(enterprise.contact?.phone ?? '');
    setWebsite(enterprise.contact?.website ?? '');
  }, [enterprise]);

  if (!enterprise) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!enterprise) return;
    setSubmitting(true);
    try {
      await updateEnterprise(enterprise.idUserEnterprise, {
        companyName,
        address: { street, city, state, zipCode, country },
        contact: { email, phone, website: website || undefined },
      });
      await refreshSellerStatus();
      notify('Empresa actualizada');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo actualizar la empresa', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl p-6">
      <h2 id="dash-enterprise__title" className="dash-enterprise__title mb-5 font-semibold text-ink-900">Información de la empresa</h2>
      <form onSubmit={handleSubmit} id="dash-enterprise__form" className="dash-enterprise__form space-y-4">
        <Input label="Nombre de la empresa / mercado" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <div id="dash-enterprise__address-row" className="dash-enterprise__address-row grid grid-cols-2 gap-3">
          <Input label="Calle" required value={street} onChange={(e) => setStreet(e.target.value)} />
          <Input label="Ciudad" required value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Provincia / Estado" required value={state} onChange={(e) => setState(e.target.value)} />
          <Input label="Código postal" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
        </div>
        <Input label="País" required value={country} onChange={(e) => setCountry(e.target.value)} />
        <div id="dash-enterprise__contact-row" className="dash-enterprise__contact-row grid grid-cols-2 gap-3">
          <Input label="Email de contacto" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Teléfono" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Input label="Sitio web (opcional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <Button type="submit" loading={submitting}>Guardar cambios</Button>
      </form>
    </Card>
  );
}
