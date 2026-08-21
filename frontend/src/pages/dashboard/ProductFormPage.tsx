import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, ImageOff } from 'lucide-react';
import { createProduct, getProduct, productImageUrl, updateProduct } from '@/api/product';
import { Input, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Link } from 'react-router-dom';

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { enterprise } = useAuth();
  const { notify } = useToast();

  const [name, setName] = useState('');
  const [priceCup, setPriceCup] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then((product) => {
        setName(product.name);
        setPriceCup(product.priceCup?.toString() ?? '');
        setPriceUsd(product.priceUsd?.toString() ?? '');
        setDescription(product.description);
        setUnit(product.unit);
        setCategory(product.category);
        setStock(product.stock);
        setExistingImage(product.image);
      })
      .catch(() => notify('No se pudo cargar el producto', 'error'))
      .finally(() => setLoading(false));
  }, [id, notify]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!priceCup && !priceUsd) {
      notify('Ingresa al menos un precio (CUP o USD)', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && id) {
        await updateProduct(id, {
          name,
          priceCup: priceCup ? Number(priceCup) : null,
          priceUsd: priceUsd ? Number(priceUsd) : null,
          description,
          unit,
          category,
          stock,
        });
        notify('Producto actualizado');
      } else {
        if (!enterprise) {
          notify('Necesitas una empresa registrada para publicar productos', 'error');
          return;
        }
        await createProduct({
          name,
          priceCup: priceCup ? Number(priceCup) : null,
          priceUsd: priceUsd ? Number(priceUsd) : null,
          description,
          unit,
          category,
          stock,
          userEnterpriseId: enterprise.idUserEnterprise,
          image,
        });
        notify('Producto publicado');
      }
      navigate('/panel/productos');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo guardar el producto', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageSpinner />;

  const imageUrl = image ? URL.createObjectURL(image) : productImageUrl(existingImage);

  return (
    <div className="max-w-2xl">
      <Link to="/panel/productos" className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Volver a productos
      </Link>
      <Card className="p-6">
        <h2 className="mb-5 font-semibold text-ink-900">{isEditing ? 'Editar producto' : 'Publicar producto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-800">Imagen</span>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-100 text-ink-300">
                  {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <ImageOff size={22} />}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-400">
                  <ImagePlus size={15} />
                  {image ? 'Cambiar imagen' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </label>
          )}

          <Input label="Nombre" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Café molido" />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Precio (CUP)" inputMode="decimal" value={priceCup} onChange={(e) => setPriceCup(e.target.value)} placeholder="0.00" />
            <Input label="Precio (USD)" inputMode="decimal" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} placeholder="0.00" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Unidad" required value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, unidad, libra…" />
            <Input label="Categoría" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Alimentos" />
          </div>

          <TextArea label="Descripción" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} className="h-4 w-4 accent-ink-900" />
            <span className="text-sm text-ink-700">Disponible en stock</span>
          </label>

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            {isEditing ? 'Guardar cambios' : 'Publicar producto'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
