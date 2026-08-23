import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone, Store } from 'lucide-react';
import { getEnterprise } from '@/api/userEnterprise';
import { listProducts } from '@/api/product';
import { listServicesByEnterprise } from '@/api/service';
import type { Product, Service, UserEnterprise } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { MapEmbed } from '@/components/ui/MapEmbed';
import { formatPrice, initials } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export function EnterprisePage() {
  const { id } = useParams<{ id: string }>();
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
        if (enterpriseResult.status === 'fulfilled') setEnterprise(enterpriseResult.value);
        else notify('No se pudo cargar esta tienda', 'error');
        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value.products.filter((p) => p.userEnterpriseId === id));
        }
        if (servicesResult.status === 'fulfilled') setServices(servicesResult.value);
      })
      .finally(() => setIsLoading(false));
  }, [id, notify]);

  if (isLoading) return <PageSpinner />;
  if (!enterprise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-500">No encontramos esta tienda.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-ink-700 hover:underline">
          Volver a explorar
        </Link>
      </div>
    );
  }

  const mapUrl =
    enterprise.latitude && enterprise.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${enterprise.latitude},${enterprise.longitude}`
      : null;

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-light via-white to-primary-light bg-grid">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={14} /> Volver a explorar
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
              {initials(enterprise.companyName)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink-900">{enterprise.companyName}</h1>
              {enterprise.address && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin size={13} /> {enterprise.address.city}, {enterprise.address.state}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-ink-200 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-ink-900">Información</h2>
            {enterprise.address && (
              <p className="flex items-start gap-2 text-sm text-ink-600">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                {enterprise.address.street}, {enterprise.address.city}, {enterprise.address.state}, {enterprise.address.country}
              </p>
            )}
            {enterprise.contact?.phone && (
              <p className="flex items-center gap-2 text-sm text-ink-600">
                <Phone size={14} className="shrink-0" /> {enterprise.contact.phone}
              </p>
            )}
            {enterprise.contact?.email && (
              <p className="flex items-center gap-2 text-sm text-ink-600">
                <Mail size={14} className="shrink-0" /> {enterprise.contact.email}
              </p>
            )}
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900">
                Abrir en Google Maps <ExternalLink size={12} />
              </a>
            )}
          </div>

          {enterprise.latitude && enterprise.longitude && (
            <div className="overflow-hidden rounded-2xl border border-ink-200">
              <MapEmbed
                latitude={enterprise.latitude}
                longitude={enterprise.longitude}
                label={enterprise.companyName}
                className="h-48 w-full border-0"
              />
            </div>
          )}

          {services.length > 0 && (
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
          )}
        </div>

        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-ink-900">Productos ({products.length})</h2>
          {products.length === 0 ? (
            <EmptyState icon={<Store size={20} />} title="Esta tienda aún no publica productos" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
