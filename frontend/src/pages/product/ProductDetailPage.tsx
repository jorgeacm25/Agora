import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CreditCard, Heart, ImageOff, MapPin, Navigation, Phone, Store, ExternalLink } from 'lucide-react';
import { getProduct, productImageUrl } from '@/api/product';
import { averageRating, createRating, listRatingsByProduct } from '@/api/rating';
import type { Product, Rating } from '@/types';
import { Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { PageSpinner } from '@/components/ui/Spinner';
import { MapEmbed } from '@/components/ui/MapEmbed';
import { AccordionItem } from '@/components/ui/Accordion';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useFavorites } from '@/context/FavoritesContext';
import { hasPermission, Permissions } from '@/lib/permissions';
import { addRecentlyViewed } from '@/lib/recentlyViewed';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { notify } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsAvailable, setRatingsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getProduct(id)
      .then((data) => {
        setProduct(data);
        addRecentlyViewed(id);
      })
      .catch(() => notify('No se pudo cargar el producto', 'error'))
      .finally(() => setIsLoading(false));

    listRatingsByProduct(id)
      .then(setRatings)
      .catch(() => setRatingsAvailable(false));
  }, [id, notify]);

  async function handleRate(quantity: number) {
    if (!id || !user) return;
    setSubmittingRating(true);
    try {
      const rating = await createRating({ quantity, userId: user.id, productId: id });
      setRatings((prev) => [...prev, rating]);
      notify('¡Gracias por tu calificación!');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo enviar la calificación', 'error');
    } finally {
      setSubmittingRating(false);
    }
  }

  if (isLoading) return <PageSpinner />;
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-500">No encontramos este producto.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Volver a explorar
        </Button>
      </div>
    );
  }

  const imageUrl = productImageUrl(product.image);
  const enterprise = product.userEnterprise;
  const avg = averageRating(ratings);
  const myRating = ratings.find((r) => r.userId === user?.id);
  const canRate = isAuthenticated && hasPermission(user?.permissions, Permissions.RATING_CREATE) && !myRating;
  const mapUrl =
    enterprise?.latitude && enterprise?.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${enterprise.latitude},${enterprise.longitude}`
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Volver a explorar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-ink-100">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-300">
                <ImageOff size={40} />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge>{product.category}</Badge>
                {!product.stock && <Badge variant="danger">Agotado</Badge>}
              </div>
              <button
                onClick={() => toggleFavorite(product.idProduct)}
                aria-pressed={isFavorite(product.idProduct)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:text-ink-900"
                aria-label={isFavorite(product.idProduct) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                <Heart size={16} className={cn(isFavorite(product.idProduct) && 'fill-primary text-primary')} />
              </button>
            </div>
            <h1 className="text-2xl font-semibold text-ink-900">{product.name}</h1>
            {ratingsAvailable && ratings.length > 0 && (
              <div className="mt-2">
                <RatingStars value={avg} count={ratings.length} />
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            {product.priceUsd !== null && <span className="text-3xl font-extrabold text-secondary">{formatPrice(product.priceUsd, 'USD')}</span>}
            {product.priceCup !== null && <span className="text-ink-500">{formatPrice(product.priceCup, 'CUP')}</span>}
          </div>

          <p className="leading-relaxed text-ink-600">{product.description}</p>
          <p className="text-sm text-ink-500">Unidad de venta: <span className="text-ink-800 font-medium">{product.unit}</span></p>

          {enterprise && (
            <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-4 space-y-2.5">
              <Link to={`/tiendas/${enterprise.idUserEnterprise}`} className="flex items-center gap-2 font-medium text-ink-900 hover:underline">
                <Store size={16} /> {enterprise.companyName}
              </Link>
              {enterprise.address && (
                <p className="flex items-start gap-2 text-sm text-ink-600">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {enterprise.address.street}, {enterprise.address.city}, {enterprise.address.state}
                </p>
              )}
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900">
                  Abrir en Google Maps <ExternalLink size={12} />
                </a>
              )}
              {enterprise.latitude && enterprise.longitude && (
                <div className="overflow-hidden rounded-xl border border-ink-200">
                  <MapEmbed
                    latitude={enterprise.latitude}
                    longitude={enterprise.longitude}
                    label={enterprise.companyName}
                    className="h-40 w-full border-0"
                  />
                </div>
              )}
            </div>
          )}

          {enterprise && (mapUrl || enterprise.contact?.phone) && (
            <div className="flex gap-2.5">
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noreferrer" className="flex-1">
                  <Button className="w-full" size="lg" icon={<Navigation size={16} />}>
                    ¿Cómo llegar?
                  </Button>
                </a>
              )}
              {enterprise.contact?.phone && (
                <a href={`tel:${enterprise.contact.phone}`}>
                  <Button variant="outline" size="lg" className="h-12 w-12 px-0" aria-label="Llamar a la tienda">
                    <Phone size={17} />
                  </Button>
                </a>
              )}
            </div>
          )}

          {enterprise && (
            <div>
              <AccordionItem icon={<Clock size={15} className="text-ink-500" />} title="Horario de apertura" defaultOpen>
                {enterprise.officeHours
                  ? new Date(enterprise.officeHours).toLocaleString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
                  : 'Esta tienda aún no publicó su horario. Contáctala directamente para confirmarlo.'}
              </AccordionItem>
              <AccordionItem icon={<CreditCard size={15} className="text-ink-500" />} title="Formas de pago">
                Consulta con la tienda las formas de pago que acepta al momento de tu visita.
              </AccordionItem>
            </div>
          )}

          {ratingsAvailable && canRate && (
            <div className="rounded-2xl border border-ink-200 p-4">
              <p className="mb-2 text-sm font-medium text-ink-800">¿Ya probaste este producto? Califícalo</p>
              <RatingStars value={0} interactive onChange={handleRate} size={22} />
              {submittingRating && <p className="mt-2 text-xs text-ink-400">Enviando…</p>}
            </div>
          )}
          {myRating && (
            <p className="text-sm text-ink-500">
              Ya calificaste este producto con <span className="font-medium text-ink-800">{myRating.quantity} estrellas</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
