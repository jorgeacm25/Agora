import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import { useMyServices } from '@/hooks/useMyCatalog';
import { deleteService } from '@/api/service';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/utils';

export function DashboardServices() {
  const { services, isLoading, reload } = useMyServices();
  const { notify } = useToast();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteService(toDelete);
      notify('Servicio eliminado');
      setToDelete(null);
      reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo eliminar el servicio', 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-900">Servicios ({services.length})</h2>
        <Link to="/panel/servicios/nuevo">
          <Button size="sm" icon={<Plus size={15} />}>Publicar servicio</Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<Wrench size={20} />}
          title="Aún no tienes servicios"
          action={
            <Link to="/panel/servicios/nuevo">
              <Button size="sm" icon={<Plus size={15} />}>Publicar servicio</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200">
          <table className="w-full text-sm">
            <tbody>
              {services.map((service) => (
                <tr key={service.idService} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                  <td className="p-3.5">
                    <p className="font-medium text-ink-900">{service.name}</p>
                    <p className="line-clamp-1 text-xs text-ink-500">{service.description}</p>
                  </td>
                  <td className="p-3.5 text-ink-700">{formatPrice(service.priceUsd, 'USD') ?? formatPrice(service.priceCup, 'CUP')}</td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <Link to={`/panel/servicios/${service.idService}`}>
                        <Button variant="ghost" size="sm" icon={<Pencil size={14} />} aria-label="Editar" />
                      </Link>
                      <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => setToDelete(service.idService)} aria-label="Eliminar" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar servicio"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
