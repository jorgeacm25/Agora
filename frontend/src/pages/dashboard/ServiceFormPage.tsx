import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createService, getService, updateService } from '@/api/service';
import { Input, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { soloPrecio } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export function ServiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { enterprise } = useAuth();
  const { notify } = useToast();

  const [name, setName] = useState('');
  const [priceCup, setPriceCup] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getService(id)
      .then((service) => {
        setName(service.name);
        setPriceCup(service.priceCup?.toString() ?? '');
        setPriceUsd(service.priceUsd?.toString() ?? '');
        setDescription(service.description);
      })
      .catch(() => notify('No se pudo cargar el servicio', 'error'))
      .finally(() => setLoading(false));
  }, [id, notify]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && id) {
        await updateService(id, {
          name,
          priceCup: priceCup ? Number(priceCup) : null,
          priceUsd: priceUsd ? Number(priceUsd) : null,
          description,
        });
        notify('Servicio actualizado');
      } else {
        if (!enterprise) {
          notify('Necesitas una empresa registrada para publicar servicios', 'error');
          return;
        }
        await createService({
          name,
          priceCup: priceCup ? Number(priceCup) : null,
          priceUsd: priceUsd ? Number(priceUsd) : null,
          description,
          userEnterpriseId: enterprise.idUserEnterprise,
        });
        notify('Servicio publicado');
      }
      navigate('/panel/servicios');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo guardar el servicio', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div id="service-form" className="service-form max-w-2xl">
      <Link to="/panel/servicios" id="service-form__back" className="service-form__back mb-5 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Volver a servicios
      </Link>
      <Card className="p-6">
        <h2 id="service-form__title" className="service-form__title mb-5 font-semibold text-ink-900">{isEditing ? 'Editar servicio' : 'Publicar servicio'}</h2>
        <form onSubmit={handleSubmit} id="service-form__form" className="service-form__form space-y-4">
          <Input label="Nombre" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Mensajería express" />
          <div id="service-form__price-row" className="service-form__price-row grid grid-cols-2 gap-3">
            <Input label="Precio (CUP)" inputMode="decimal" value={priceCup} onChange={(e) => setPriceCup(soloPrecio(e.target.value))} placeholder="0.00" />
            <Input label="Precio (USD)" inputMode="decimal" value={priceUsd} onChange={(e) => setPriceUsd(soloPrecio(e.target.value))} placeholder="0.00" />
          </div>
          <TextArea label="Descripción" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            {isEditing ? 'Guardar cambios' : 'Publicar servicio'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
