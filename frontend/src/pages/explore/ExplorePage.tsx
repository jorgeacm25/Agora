import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  PackageSearch,
  Store,
  ArrowRight,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { listProducts } from '@/api/product';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Carousel } from '@/components/home/Carousel';
import type { CarouselSlide } from '@/components/home/Carousel';
import { DiscoveryRow } from '@/components/home/DiscoveryRow';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Membership } from '@/components/home/Membership';
import { FiltersPanel } from '@/components/explore/FiltersPanel';
import type { SortOrder } from '@/components/explore/FiltersPanel';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    icon: <MapPin size={20} />,
    eyebrow: 'Búsqueda local',
    title: 'Productos de tu ciudad, cerca de ti',
    description: 'Filtra por ubicación y descubre lo que venden las mypimes y mercados de tu zona.',
    cta: { label: 'Buscar cerca de mí', to: '/' },
    // Los degradados cruzan de un color de marca al otro. Antes iban de un tono
    // a su propia variante oscura y el recorrido no se veía: parecían planos.
    gradient: 'bg-gradient-to-br from-primary via-primary to-secondary',
  },
  {
    icon: <Store size={20} />,
    eyebrow: 'Para negocios',
    title: 'Publica tu catálogo y que te encuentren',
    description: 'Regístrate como vendedor y aparece cuando alguien busque lo que ofreces en tu ciudad.',
    cta: { label: 'Empezar a vender', to: '/vender' },
    gradient: 'bg-gradient-to-tr from-secondary via-secondary-dark to-primary',
  },
  {
    icon: <Star size={20} />,
    eyebrow: 'Con confianza',
    title: 'Decide con reseñas reales',
    description: 'Revisa las calificaciones de otros usuarios antes de decidir dónde ir.',
    cta: { label: 'Ver mejor calificados', to: '/' },
    gradient: 'bg-gradient-to-r from-primary-dark via-primary to-secondary-dark',
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

// Dos filas por página: 4 columnas en escritorio. Con `auto-fill` el número
// de columnas variaba con el ancho y las filas nunca cuadraban.
const COLUMNAS = 4;
const PAGE_SIZE = COLUMNAS * 2;
/** Tope de lo que se trae de una vez para filtrar y paginar en el cliente. */
const CATALOGO_MAX = 200;
const SCROLL_KEY = 'agora_explorar_scroll';


export function ExplorePage() {
  const { notify } = useToast();
  const { isSeller, subscription } = useAuth();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [minPrice, setMinPrice] = useState(() => searchParams.get('min') ?? '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('max') ?? '');
  const [popularOnly, setPopularOnly] = useState(() => searchParams.get('pop') === '1');
  const [inStockOnly, setInStockOnly] = useState(() => searchParams.get('stock') === '1');
  const [category, setCategory] = useState<string | null>(() => searchParams.get('cat'));
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => (searchParams.get('sort') === 'desc' ? 'desc' : 'asc'));
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);

  const [nearMe, setNearMe] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);
  const [locating, setLocating] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // Mirror the URL back into state: the component doesn't remount when a
  // navbar link (e.g. "Más populares") points at "/" with different query
  // params, so without this the filters would silently keep whatever was
  // set before navigating.
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
    setMinPrice(searchParams.get('min') ?? '');
    setMaxPrice(searchParams.get('max') ?? '');
    setPopularOnly(searchParams.get('pop') === '1');
    setInStockOnly(searchParams.get('stock') === '1');
    setCategory(searchParams.get('cat'));
    setSortOrder(searchParams.get('sort') === 'desc' ? 'desc' : 'asc');
    setPage(Number(searchParams.get('page')) || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listProducts({
      // Sin paginar en el servidor: el backend no sabe filtrar por texto ni por
      // categoría, así que se trae el catálogo y se pagina aquí. Si no, buscar
      // «arroz» solo miraba dentro de la página que tocara.
      limit: CATALOGO_MAX,
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
  }, [minPrice, maxPrice, popularOnly, nearMe, radiusKm, notify]);

  useEffect(() => {
    setPage(1);
  }, [minPrice, maxPrice, popularOnly, nearMe, radiusKm, search, category, inStockOnly]);


  // "Productos populares": real signal, backed by the backend's average-rating filter.
  useEffect(() => {
    listProducts({ minRating: 4, limit: 8 })
      .then((data) => setPopularProducts(data.products))
      .catch(() => setPopularProducts([]));
  }, []);

  // Se apunta dónde estaba el scroll mientras se navega por el catálogo. Los
  // filtros y la búsqueda ya viajan en la URL, así que al volver atrás se
  // recuperan solos; esto añade lo que falta: el sitio exacto de la página.
  useEffect(() => {
    const guardar = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    window.addEventListener('scroll', guardar, { passive: true });

    // Mientras se está en el catálogo mandamos nosotros: si no, al volver atrás
    // el navegador restaura su propia posición —medida cuando la página aún era
    // corta— justo después de la nuestra y la pisa. Se devuelve el control al
    // salir, para que al abrir un producto siga apareciendo desde arriba.
    const anterior = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    return () => {
      window.removeEventListener('scroll', guardar);
      history.scrollRestoration = anterior;
    };
  }, []);

  // Y se restaura cuando los productos ya están pintados: antes de eso la
  // página no mide lo suficiente y el navegador ignoraría el salto.
  const scrollRestaurado = useRef(false);
  useEffect(() => {
    if (isLoading || scrollRestaurado.current) return;
    scrollRestaurado.current = true;
    const y = Number(sessionStorage.getItem(SCROLL_KEY) ?? 0);
    if (y <= 0) return;
    // Dos fotogramas de margen: en el primero React ya ha pintado las tarjetas,
    // pero el documento todavía no ha crecido y el navegador recortaría el
    // salto a lo que midiera en ese instante.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        // Tope: alto del carrusel menos el de la cabecera. Así al volver nunca
        // se esconde el carrusel del todo —queda asomando una franja de su
        // mismo alto bajo la cabecera— en lugar de aterrizar en un corte seco.
        const carrusel = document.querySelector<HTMLElement>('[aria-roledescription="carrusel"]');
        const cabecera = document.querySelector<HTMLElement>('header');
        const tope = Math.max(0, (carrusel?.offsetHeight ?? 0) - (cabecera?.offsetHeight ?? 0));
        window.scrollTo({ top: Math.min(y, tope), behavior: 'instant' as ScrollBehavior });
      }),
    );
    return () => cancelAnimationFrame(id);
  }, [isLoading]);

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
    // Orden por precio real. Antes se invertía la lista, que solo coincide con
    // ordenar si el servidor ya la devolvía ordenada.
    const precio = (p: Product) => p.priceUsd ?? p.priceCup ?? 0;
    return [...list].sort((a, b) => (sortOrder === 'asc' ? precio(a) - precio(b) : precio(b) - precio(a)));
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

  // Las páginas salen de los resultados filtrados, no del total del catálogo.
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const paginaActual = Math.min(page, totalPages);
  const productosDeLaPagina = visibleProducts.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);
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

  return (
    <div>
      <Carousel slides={CAROUSEL_SLIDES} />

      {/* El h1 de la página no tiene por qué verse: era un titular decorativo
          y lo que manda aquí es el buscador. */}
      <h1 id="explore__title" className="explore__title sr-only">Explorar productos de tu ciudad</h1>

      <DiscoveryRow icon={<TrendingUp size={16} />} title="Populares en Agora" subtitle="Los mejor calificados por otros usuarios" products={popularProducts} />

      <div id="explore__catalog" className="explore__catalog mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-6">
        {/* En móvil no hay panel lateral: los filtros se abren desde aquí. */}
        <div id="explore__mobile-filters" className="explore__mobile-filters mb-4 flex justify-end lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)} icon={<SlidersHorizontal size={15} />}>
            Filtros
          </Button>
        </div>

        <div id="explore__layout" className="explore__layout flex flex-col gap-8 lg:h-[calc(100vh-117px)] lg:flex-row lg:items-start">
          {/* El panel ocupa el alto de la ventana menos la cabecera, con 20px de aire
              arriba y abajo para no pegarse a nada. Queda fijo mientras se recorre
              el catálogo. */}
          <aside id="explore__sidebar" className="explore__sidebar hidden lg:sticky lg:top-[81px] lg:flex lg:flex-col lg:w-64 shrink-0 gap-4">
            <div id="explore__filters-card" className="explore__filters-card rounded-2xl border border-ink-200 bg-ink-50 p-4">
              <FiltersPanel {...filtersProps} ambito="aside" />
            </div>

            {!isSeller && (
              <Link
                to="/vender"
                id="explore__seller-cta" className="explore__seller-cta group flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4 transition-colors hover:border-primary"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
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

          <div id="explore__results" className="explore__results flex min-w-0 flex-1 flex-col lg:h-full">
            {isLoading ? (
              <div id="explore__grid-loading" className="explore__grid grid min-h-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:flex-1 lg:grid-rows-2">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
              <div id="explore__results-body" className="explore__results-body flex min-h-0 flex-1 flex-col">
                <div id="explore__grid" className="explore__grid grid min-h-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:flex-1 lg:grid-rows-2">
                  {productosDeLaPagina.map((product) => (
                    <ProductCard key={product.idProduct} product={product} />
                  ))}
                </div>
                <div id="explore__pagination" className="explore__pagination mt-4 shrink-0">
                  <Pagination page={paginaActual} totalPages={totalPages} onChange={setPage} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p id="explore__count" className="explore__count mx-auto max-w-6xl px-4 pb-8 text-center text-sm text-ink-500 sm:px-6">
        {total} producto{total === 1 ? '' : 's'} publicados por vendedores en Agora
      </p>

      <HowItWorks />
      {/* Los planes solo tienen sentido para quien todavía no paga ninguno. */}
      {!subscription && <Membership />}

      {filtersOpen && (
        <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtrar resultados" fullHeight={0.85} peekHeight={0.85}
          footer={
            <Button className="w-full" size="lg" onClick={() => setFiltersOpen(false)}>
              Aplicar filtros ({visibleProducts.length} resultados)
            </Button>
          }
        >
          <div id="explore__filters-sheet" className="explore__filters-sheet pb-4">
            <FiltersPanel {...filtersProps} ambito="sheet" />
          </div>
        </BottomSheet>
      )}

      <ScrollToTop />
    </div>
  );
}


