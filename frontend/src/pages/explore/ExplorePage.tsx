import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, TrendingUp, X, PackageSearch, Store, ArrowRight } from 'lucide-react';
import { listProducts } from '@/api/product';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 24;

type SortOrder = 'asc' | 'desc';

export function ExplorePage() {
  const { notify } = useToast();
  const { isSeller } = useAuth();
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [popularOnly, setPopularOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [nearMe, setNearMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
      radius: nearMe ? 15 : undefined,
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
  }, [page, minPrice, maxPrice, popularOnly, nearMe, notify]);

  useEffect(() => {
    setPage(1);
  }, [minPrice, maxPrice, popularOnly, nearMe]);

  const categories = useMemo(() => {
    const set = new Set(rawProducts.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [rawProducts]);

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

  return (
    <div>
      <div className="border-b border-ink-200/70 bg-gradient-to-b from-ink-100/70 to-ink-50 bg-grid">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="max-w-xl text-3xl sm:text-4xl font-semibold leading-tight text-ink-900">
            Todo lo que necesitas, para tu casa o tu negocio
          </h1>
          <p className="mt-3 max-w-lg text-ink-500">
            Compra directo a mypimes y mercados de tu ciudad: compara precios, revisa reseñas y encuentra lo que buscas cerca de ti.
          </p>
          <div className="mt-7 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca productos, categorías o tiendas…"
                className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm shadow-soft outline-none transition-colors focus:border-ink-500 focus:ring-4 focus:ring-ink-900/5"
              />
            </div>
            <Button variant="outline" className="sm:hidden h-12" onClick={() => setFiltersOpen((v) => !v)} icon={<SlidersHorizontal size={15} />}>
              Filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <p className="mb-6 text-sm text-ink-500">
        {total} producto{total === 1 ? '' : 's'} publicados por vendedores en Agora
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className={cn('lg:w-64 shrink-0 space-y-6', !filtersOpen && 'hidden lg:block')}>
          <div className="rounded-2xl border border-ink-200 bg-white p-4 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Filtros</h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-ink-500 hover:text-ink-900 inline-flex items-center gap-1">
                  <X size={12} /> Limpiar
                </button>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Precio (CUP)</p>
              <div className="flex items-center gap-2">
                <Input placeholder="Mín" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ''))} />
                <span className="text-ink-300">–</span>
                <Input placeholder="Máx" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Ordenar por precio</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder('asc')}
                  className={cn('flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium', sortOrder === 'asc' ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 text-ink-600')}
                >
                  Menor a mayor
                </button>
                <button
                  onClick={() => setSortOrder('desc')}
                  className={cn('flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium', sortOrder === 'desc' ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 text-ink-600')}
                >
                  Mayor a menor
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-700">
                <TrendingUp size={14} /> Más populares
              </span>
              <input type="checkbox" checked={popularOnly} onChange={(e) => setPopularOnly(e.target.checked)} className="h-4 w-4 accent-ink-900" />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-ink-700">Solo disponibles</span>
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-ink-900" />
            </label>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Ubicación</p>
              <Button variant="outline" size="sm" className="w-full" onClick={locateMe} loading={locating} icon={<MapPin size={14} />}>
                {nearMe ? 'Cerca de mí ✓' : 'Buscar cerca de mí'}
              </Button>
            </div>

            {categories.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Categoría</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button key={c} onClick={() => setCategory(category === c ? null : c)}>
                      <Badge variant={category === c ? 'dark' : 'neutral'} className="cursor-pointer">
                        {c}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isSeller && (
            <Link
              to="/vender"
              className="group flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-ink-400"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
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
          {isLoading ? (
            <PageSpinner />
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
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
