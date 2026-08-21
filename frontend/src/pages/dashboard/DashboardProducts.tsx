import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ImageOff, Package } from 'lucide-react';
import { useMyProducts } from '@/hooks/useMyCatalog';
import { deleteProduct, productImageUrl } from '@/api/product';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/utils';

export function DashboardProducts() {
  const { products, isLoading, reload } = useMyProducts();
  const { notify } = useToast();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(toDelete);
      notify('Producto eliminado');
      setToDelete(null);
      reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo eliminar el producto', 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-900">Productos ({products.length})</h2>
        <Link to="/panel/productos/nuevo">
          <Button size="sm" icon={<Plus size={15} />}>Publicar producto</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package size={20} />}
          title="Aún no tienes productos"
          description="Publica tu primer producto para que los compradores lo encuentren."
          action={
            <Link to="/panel/productos/nuevo">
              <Button size="sm" icon={<Plus size={15} />}>Publicar producto</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200">
          <table className="w-full text-sm">
            <tbody>
              {products.map((product) => {
                const imageUrl = productImageUrl(product.image);
                return (
                  <tr key={product.idProduct} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                    <td className="w-16 p-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-ink-100 flex items-center justify-center text-ink-300">
                        {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <ImageOff size={16} />}
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-ink-900">{product.name}</p>
                      <p className="text-xs text-ink-500">{product.category}</p>
                    </td>
                    <td className="p-3 text-ink-700">{formatPrice(product.priceUsd, 'USD') ?? formatPrice(product.priceCup, 'CUP')}</td>
                    <td className="p-3">
                      <Badge variant={product.stock ? 'neutral' : 'dark'}>{product.stock ? 'Disponible' : 'Agotado'}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-1">
                        <Link to={`/panel/productos/${product.idProduct}`}>
                          <Button variant="ghost" size="sm" icon={<Pencil size={14} />} aria-label="Editar" />
                        </Link>
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => setToDelete(product.idProduct)} aria-label="Eliminar" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar producto"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
