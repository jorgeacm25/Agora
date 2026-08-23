import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  PackageSearch,
  Store,
  ArrowRight,
  ShoppingBag,
  Star,
  Clock3,
  Users,
  Target,
  List as ListIcon,
  Map as MapIcon,
} from 'lucide-react';
import { getProduct, listProducts } from '@/api/product';
import { productImageUrl } from '@/api/product';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Carousel } from '@/components/home/Carousel';
import type { CarouselSlide } from '@/components/home/Carousel';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { DiscoveryRow } from '@/components/home/DiscoveryRow';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Membership } from '@/components/home/Membership';
import { FiltersPanel } from '@/components/explore/FiltersPanel';
import type { SortOrder } from '@/components/explore/FiltersPanel';
const ResultsMap = lazy(() => import('@/components/explore/ResultsMap').then((m) => ({ default: m.ResultsMap })));
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { getRecentlyViewed } from '@/lib/recentlyViewed';
import { cn, formatPrice } from '@/lib/utils';

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    icon: <MapPin size={20} />,
    eyebrow: 'Búsqueda local',
    title: 'Productos de tu ciudad, cerca de ti',
    description: 'Filtra por ubicación y descubre lo que venden las mypimes y mercados de tu zona.',
    cta: { label: 'Buscar cerca de mí', to: '/' },
    gradient: 'bg-gradient-to-br from-primary to-primary-dark',
  },
  {
    icon: <Store size={20} />,
    eyebrow: 'Para negocios',
    title: 'Publica tu catálogo y que te encuentren',
    description: 'Regístrate como vendedor y aparece cuando alguien busque lo que ofreces en tu ciudad.',
    cta: { label: 'Empezar a vender', to: '/vender' },
    gradient: 'bg-gradient-to-br from-secondary to-secondary-dark',
  },
  {
    icon: <Star size={20} />,
    eyebrow: 'Con confianza',
    title: 'Decide con reseñas reales',
    description: 'Revisa las calificaciones de otros usuarios antes de decidir dónde ir.',
    cta: { label: 'Ver mejor calificados', to: '/' },
    gradient: 'bg-gradient-to-br from-primary-dark to-primary',
  },
  {
    icon: <ShoppingBag size={20} />,
    eyebrow: 'Para tu casa o tu negocio',
    title: 'Todo lo disponible en tu ciudad, en un solo lugar',
    description: 'Desde el mercado hasta la mypime de tu barrio: un solo buscador, sin perder tiempo paseando de tienda en tienda.',
    cta: { label: 'Explorar productos', to: '/' },
    gradient: 'bg-gradient-to-br from-primary to-secondary',
  },
];

const PAGE_SIZE = 24;

type View = 'list' | 'map';

export function ExplorePage() {
  const { notify } = useToast();
  const { isSeller } = useAuth();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [minPrice, setMinPrice] = useState(() => searchParams.get('min') ?? '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('max') ?? '');
  const [popularOnly, setPopularOnly] = useState(() => searchParams.get('pop') === '1');
  const [inStockOnly, setInStockOnly] = useState(() => searchParams.get('stock') === '1');
  const [category, setCategory] = useState<string | null>(() => searchParams.get('cat'));
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => (searchParams.get('sort') === 'desc' ? 'desc' : 'asc'));
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [view, setView] = useState<View>('list');

  const [nearMe, setNearMe] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);
  const [locating, setLocating] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [recentProducts, setRecentProducts] = useState<Product[] | null>(null);
  const [popularProducts, setPopularProducts] = useState<Product[] | null>(null);

  // Keep the URL in sync so filters survive back/forward navigation and can be shared.
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (minPrice) params.min = minPrice;
    if (maxPrice) params.max = maxPrice;
    if (popularOnly) params.pop = '1';
    if (inStockOnly) params.stock = '1';
    if (category) params.cat = category;
    if (sortOrder === 'desc') params.sort = 'desc';
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minPrice, maxPrice, popularOnly, inStockOnly, category, sortOrder, page]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listProducts({
      page,
      limit: PAGE_SIZE,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: popularOnly ? 4 : undefined,
      latitude: nearMe?.lat,
      longitude: nearMe?.lng,
      radius: nearMe ? radiusKm : undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setRawProducts(data.products);
        setTotal(data.total);
      })
      .catch(() => {
        if (!cancelled) notify('No se pudieron cargar los productos', 'error');
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, minPrice, maxPrice, popularOnly, nearMe, radiusKm, notify]);

  useEffect(() => {
    setPage(1);
  }, [minPrice, maxPrice, popularOnly, nearMe, radiusKm]);

  // "Vistos recientemente": read once, then resolve each id against the API.
  useEffect(() => {
    const ids = getRecentlyViewed();
    if (ids.length === 0) {
      setRecentProducts([]);
      return;
    }
    Promise.allSettled(ids.slice(0, 8).map((id) => getProduct(id)))
      .then((results) => {
        const found = results
          .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
          .map((r) => r.value);
        setRecentProducts(found);
      })
      .catch(() => setRecentProducts([]));
  }, []);

  // "Productos populares": real signal, backed by the backend's average-rating filter.
  useEffect(() => {
    listProducts({ minRating: 4, limit: 8 })
      .then((data) => setPopularProducts(data.products))
      .catch(() => setPopularProducts([]));
  }, []);

  const visibleProducts = useMemo(() => {
    let list = rawProducts;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.userEnterprise?.companyName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    if (inStockOnly) list = list.filter((p) => p.stock);
    if (sortOrder === 'desc') list = [...list].reverse();
    return list;
  }, [rawProducts, search, category, inStockOnly, sortOrder]);

  function locateMe() {
    if (!navigator.geolocation) {
      notify('Tu navegador no soporta geolocalización', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        notify('No pudimos acceder a tu ubicación', 'error');
        setLocating(false);
      },
      { timeout: 8000 },
    );
  }

  function selectCategory(c: string) {
    setCategory((current) => (current === c ? null : c));
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilters = Boolean(minPrice || maxPrice || popularOnly || nearMe || category || inStockOnly);

  function clearFilters() {
    setMinPrice('');
    setMaxPrice('');
    setPopularOnly(false);
    setInStockOnly(false);
    setCategory(null);
    setNearMe(null);
  }

  const filtersProps = {
    minPrice,
    maxPrice,
    onMinPrice: setMinPrice,
    onMaxPrice: setMaxPrice,
    sortOrder,
    onSortOrder: setSortOrder,
    popularOnly,
    onPopularOnly: setPopularOnly,
    inStockOnly,
    onInStockOnly: setInStockOnly,
    nearMe: Boolean(nearMe),
    onLocateMe: locateMe,
    locating,
    radiusKm,
    onRadiusKm: setRadiusKm,
    categories,
    activeCategory: category,
    onSelectCategory: selectCategory,
    hasActiveFilters,
    onClear: clearFilters,
  };

  const mapResults = visibleProducts.filter((p) => p.userEnterprise?.latitude && p.userEnterprise?.longitude);

  return (
    <div>
      <Carousel slides={CAROUSEL_SLIDES} />

      <div className="relative overflow-hidden border-b border-ink-200/70 bg-gradient-to-b from-primary-light/60 to-ink-100 bg-grid">
        <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="max-w-xl text-3xl sm:text-4xl font-semibold leading-tight text-ink-900">
            Todo lo que necesitas, para tu casa o tu negocio
          </h1>
          <p className="mt-3 max-w-lg text-ink-500">
            Busca en todos los mercados y mypimes de tu ciudad desde un solo lugar: compara precios y ubicaciones sin perder tiempo recorriendo tienda por tienda.
          </p>
          <div className="mt-7 flex max-w-xl gap-2">
            <div
              className={cn(
                'relative flex-1 origin-left transition-transform duration-200 ease-out',
                searchFocused && 'scale-[1.02]',
              )}
            >
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Busca productos, categorías o tiendas…"
                className={cn(
                  'h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition-all duration-200',
                  searchFocused ? 'border-primary shadow-lift ring-4 ring-primary/10' : 'border-ink-200 shadow-soft',
                )}
              />
            </div>
            <Button variant="outline" className="sm:hidden h-12" onClick={() => setFiltersOpen(true)} icon={<SlidersHorizontal size={15} />}>
              Filtros
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-ink-200/70 pt-6 sm:grid-cols-3">
            <AboutItem icon={<Users size={15} />} title="Quiénes somos" description="Una plataforma que reúne lo que ofrecen las mypimes y mercados de tu ciudad." />
            <AboutItem icon={<Target size={15} />} title="Nuestro objetivo" description="Ahorrarte tiempo: que encuentres lo que buscas sin recorrer tienda por tienda." />
            <AboutItem icon={<Search size={15} />} title="Para qué sirve" description="Para buscar, comparar y localizar productos disponibles en tu ciudad, hoy." />
          </div>
        </div>
      </div>

      <CategoryTiles categories={categories} isLoading={categoriesLoading} activeCategory={category} onSelect={selectCategory} />

      {recentProducts !== null && recentProducts.length > 0 && (
        <DiscoveryRow icon={<Clock3 size={16} />} title="Vistos recientemente" products={recentProducts} />
      )}

      <DiscoveryRow icon={<TrendingUp size={16} />} title="Populares en Agora" subtitle="Los mejor calificados por otros usuarios" products={popularProducts} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-500">
            {total} producto{total === 1 ? '' : 's'} publicados por vendedores en Agora
          </p>
          <SegmentedToggle
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'Lista', icon: <ListIcon size={15} /> },
              { value: 'map', label: 'Mapa', icon: <MapIcon size={15} /> },
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-64 shrink-0 space-y-6">
            <div className="rounded-2xl border border-ink-200 bg-white p-4">
              <FiltersPanel {...filtersProps} />
            </div>

            {!isSeller && (
              <Link
                to="/vender"
                className="group flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-primary"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Store size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">¿Tienes un negocio?</p>
                  <p className="text-xs text-ink-500">Publica tu catálogo en Agora</p>
                </div>
                <ArrowRight size={15} className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </aside>

          <div className="flex-1 min-w-0">
            <div key={view} className="animate-fade-in [animation-duration:300ms]">
              {view === 'list' ? (
                isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : visibleProducts.length === 0 ? (
                  <EmptyState
                    icon={<PackageSearch size={22} />}
                    title="No encontramos productos"
                    description="Prueba ajustando los filtros o busca con otras palabras."
                    action={hasActiveFilters ? <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button> : undefined}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {visibleProducts.map((product) => (
                        <ProductCard key={product.idProduct} product={product} />
                      ))}
                    </div>
                    <div className="mt-8">
                      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                    </div>
                  </>
                )
              ) : (
                <div className="relative h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-ink-200">
                  {mapResults.length === 0 ? (
                    <EmptyState icon={<MapIcon size={22} />} title="Ningún resultado tiene ubicación" description="Prueba con otros filtros." />
                  ) : (
                    <>
                      <Suspense fallback={<div className="flex h-full items-center justify-center bg-ink-100 text-sm text-ink-400">Cargando mapa…</div>}>
                        <ResultsMap products={mapResults} />
                      </Suspense>
                      <BottomSheet open dismissible={false} onClose={() => {}} peekHeight={0.32} fullHeight={0.9}>
                        <p className="mb-3 text-center text-xs text-ink-400">Desliza hacia arriba para ver toda la lista</p>
                        <div className="space-y-1">
                          {mapResults.map((product) => (
                            <MapResultRow key={product.idProduct} product={product} />
                          ))}
                        </div>
                      </BottomSheet>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HowItWorks />
      <Membership />

      {filtersOpen && (
        <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtrar resultados" fullHeight={0.85} peekHeight={0.85}
          footer={
            <Button className="w-full" size="lg" onClick={() => setFiltersOpen(false)}>
              Aplicar filtros ({visibleProducts.length} resultados)
            </Button>
          }
        >
          <div className="pb-4">
            <FiltersPanel {...filtersProps} />
          </div>
        </BottomSheet>
      )}

      <ScrollToTop />
    </div>
  );
}

function MapResultRow({ product }: { product: Product }) {
  const imageUrl = productImageUrl(product.image);
  return (
    <Link to={`/productos/${product.idProduct}`} className="flex items-center gap-3 border-t border-ink-100 py-2.5 first:border-t-0">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-100">
        {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink-900">{product.name}</p>
        <p className="truncate text-[11px] text-ink-500">{product.userEnterprise?.companyName}</p>
      </div>
      <span className="shrink-0 text-sm font-bold text-secondary">
        {formatPrice(product.priceUsd, 'USD') ?? formatPrice(product.priceCup, 'CUP')}
      </span>
    </Link>
  );
}

function AboutItem({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">{icon}</div>
      <div>
        <p className="text-sm font-medium text-ink-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
      </div>
    </div>
  );
}
