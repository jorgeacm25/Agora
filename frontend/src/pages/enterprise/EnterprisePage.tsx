import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone, Store } from 'lucide-react';
import { getEnterprise } from '@/api/userEnterprise';
import { listProducts } from '@/api/product';
import { listServicesByEnterprise } from '@/api/service';
import type { Product, Service, UserEnterprise } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
// Leaflet pesa: se carga solo al abrir la ficha, no en el bundle principal.
const BusinessMap = lazy(() =>
  import('@/components/business/BusinessMap').then((m) => ({ default: m.BusinessMap })),
);
import { cn, formatPrice, initials } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

/** Hueco entre donde acaba el texto y donde el velo deja de ser sólido. */
const MARGEN = 20;
/** Cuánto dura el desvanecido, del sólido al mapa limpio. */
const TRANSICION = 400;

/**
 * Ajusta las dos paradas del velo al ancho real del texto, para que el sólido
 * lo cubra por largo que sea el nombre o la dirección del negocio. Mide la caja
 * ya pintada en vez de estimar por tamaño de letra: sale exacto y cuesta igual.
 * Solo se recalcula cuando cambia el tamaño de la cabecera.
 */
function useVeloAjustado(ref: React.RefObject<HTMLElement | null>, listo: boolean) {
  useEffect(() => {
    const hero = ref.current;
    if (!hero || !listo) return;

    const recalcular = () => {
      const caja = hero.getBoundingClientRect();
      const textos = [...hero.querySelectorAll('.business-hero__name, .business-hero__details dd')];
      if (caja.width === 0 || textos.length === 0) return;

      const cajas = textos.map((t) => t.getBoundingClientRect());
      const finTexto = Math.max(...cajas.map((c) => c.right)) - caja.left;
      const medioTexto = (Math.min(...cajas.map((c) => c.top)) + Math.max(...cajas.map((c) => c.bottom))) / 2 - caja.top;

      // Misma geometría que el CSS: circle at 0% 150%, radio hasta la esquina
      // más lejana, que con ese centro es siempre la superior derecha.
      const centroY = 1.5 * caja.height;
      const radio = Math.hypot(caja.width, centroY);
      const dy = centroY - medioTexto;
      const enPorcentaje = (dx: number) => Math.min(100, (Math.hypot(dx, dy) / radio) * 100);

      hero.style.setProperty('--velo-solido', `${enPorcentaje(finTexto + MARGEN).toFixed(1)}%`);
      hero.style.setProperty('--velo-transparente', `${enPorcentaje(finTexto + MARGEN + TRANSICION).toFixed(1)}%`);
    };

    recalcular();
    const observador = new ResizeObserver(recalcular);
    observador.observe(hero);
    return () => observador.disconnect();
  }, [ref, listo]);
}

export function EnterprisePage() {
  const { id } = useParams<{ id: string }>();
  const heroRef = useRef<HTMLElement>(null);
  const { notify } = useToast();
  const [enterprise, setEnterprise] = useState<UserEnterprise | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.allSettled([
      getEnterprise(id),
      listProducts({ limit: 100 }),
      listServicesByEnterprise(id),
    ])
      .then(([enterpriseResult, productsResult, servicesResult]) => {
        const propios =
          productsResult.status === 'fulfilled'
            ? productsResult.value.products.filter((p) => p.userEnterpriseId === id)
            : [];
        setProducts(propios);

        if (enterpriseResult.status === 'fulfilled') {
          setEnterprise(enterpriseResult.value);
        } else {
          // `GET /user-enterprise/:id` responde 403 a todo el que no sea el
          // dueño, así que la ficha solo se veía a uno mismo. En un directorio
          // la ficha del negocio es lo más público que hay: se reconstruye con
          // los datos que el catálogo ya trae anidados en cada producto.
          const desdeCatalogo = propios.find((p) => p.userEnterprise)?.userEnterprise;
          if (desdeCatalogo) setEnterprise(desdeCatalogo);
          else notify('No se pudo cargar este negocio', 'error');
        }

        if (servicesResult.status === 'fulfilled') setServices(servicesResult.value);
      })
      .finally(() => setIsLoading(false));
  }, [id, notify]);

  // Antes de los returns condicionales: el orden de los hooks no puede variar.
  useVeloAjustado(heroRef, !isLoading && Boolean(enterprise));

  if (isLoading) return <PageSpinner />;
  if (!enterprise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-500">No encontramos este negocio.</p>
        <Link to="/negocios" id="business-hero__back-empty" className="business-hero__back-empty mt-4 inline-block text-sm text-ink-700 hover:underline">
          Volver a negocios
        </Link>
      </div>
    );
  }

  const tieneMapa = Boolean(enterprise.latitude && enterprise.longitude);

  const mapUrl = tieneMapa
    ? `https://www.google.com/maps/search/?api=1&query=${enterprise.latitude},${enterprise.longitude}`
    : null;

  return (
    <div>
      <header ref={heroRef} id="business-hero" className="business-hero relative overflow-hidden border-b border-ink-200/70 bg-ink-100">
        {/* El mapa real del negocio hace de fondo. Se dibuja más ancho que el
            contenedor y anclado a la izquierda, así su centro —el marcador—
            cae hacia la derecha y deja la izquierda libre para los datos. */}
        {/* `isolate` es obligatorio: Leaflet pone z-index 400 en sus capas y,
            sin un contexto de apilamiento propio, el mapa se sube por encima
            del degradado y de los datos del negocio. */}
        {tieneMapa && (
          <div id="business-hero__map" className="business-hero__map pointer-events-none absolute inset-0 isolate z-0 overflow-hidden" aria-hidden="true">
            <Suspense fallback={null}>
              <BusinessMap
                latitude={enterprise.latitude!}
                longitude={enterprise.longitude!}
                className="absolute inset-y-0 left-0 h-full w-[150%]"
              />
            </Suspense>
          </div>
        )}
        {/* Degradado sobre la mitad izquierda: es lo que hace legible el texto
            encima del mapa sin tapar la ubicación. */}
        {/* El degradado vive en index.css: es radial y con varias paradas, y eso
            no cabe en utilidades. Ver .business-hero__veil. */}
        <div id="business-hero__veil" className="business-hero__veil pointer-events-none absolute inset-0 z-10" aria-hidden="true" />

        <div id="business-hero__content" className="business-hero__content relative z-20 mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <Link to="/negocios" id="business-hero__back" className="business-hero__back mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={14} aria-hidden="true" /> Volver a negocios
          </Link>

          <div id="business-hero__row" className="business-hero__row flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div id="business-hero__identity" className="business-hero__identity flex items-start gap-4">
              <span id="business-hero__initials" className="business-hero__initials flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
                {initials(enterprise.companyName)}
              </span>
              <div id="business-hero__data" className="business-hero__data min-w-0">
                <h1 id="business-hero__name" className="business-hero__name text-2xl font-semibold text-ink-900">{enterprise.companyName}</h1>
                {/* Acotado para que los datos no se salgan de la zona sólida
                    del degradado y acaben sobre el mapa. */}
                <dl id="business-hero__details" className="business-hero__details mt-2 max-w-sm space-y-1 text-sm text-ink-600">
                  {enterprise.address && (
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">Dirección</dt>
                      <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <dd>
                        {enterprise.address.street}, {enterprise.address.city}, {enterprise.address.state}, {enterprise.address.country}
                      </dd>
                    </div>
                  )}
                  {enterprise.contact?.phone && (
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Teléfono</dt>
                      <Phone size={14} className="shrink-0" aria-hidden="true" />
                      <dd>
                        <a href={`tel:${enterprise.contact.phone}`} className="hover:text-ink-900 hover:underline">
                          {enterprise.contact.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {enterprise.contact?.email && (
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Correo</dt>
                      <Mail size={14} className="shrink-0" aria-hidden="true" />
                      <dd>
                        <a href={`mailto:${enterprise.contact.email}`} className="hover:text-ink-900 hover:underline">
                          {enterprise.contact.email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                id="business-hero__map-link" className="business-hero__map-link inline-flex shrink-0 items-center gap-2 self-start rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark sm:self-end"
              >
                <MapPin size={16} aria-hidden="true" /> Ver en mapa
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* La información y el mapa viven ahora en la cabecera: aquí solo queda
          el catálogo, y los servicios cuando el negocio tiene alguno. */}
      <div className={cn('mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-1 gap-10', services.length > 0 && 'lg:grid-cols-4')}>
        {services.length > 0 && (
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-ink-200 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-ink-900">Servicios</h2>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.idService} className="text-sm">
                    <p className="font-medium text-ink-800">{service.name}</p>
                    <p className="text-ink-500 line-clamp-2">{service.description}</p>
                    <p className="mt-0.5 text-ink-900 font-medium">
                      {formatPrice(service.priceUsd, 'USD') ?? formatPrice(service.priceCup, 'CUP')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className={cn(services.length > 0 && 'lg:col-span-3')}>
          <h2 className="mb-4 text-lg font-semibold text-ink-900">Productos ({products.length})</h2>
          {products.length === 0 ? (
            <EmptyState icon={<Store size={20} />} title="Este negocio aún no publica productos" />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
              {products.map((product) => (
                <ProductCard key={product.idProduct} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
