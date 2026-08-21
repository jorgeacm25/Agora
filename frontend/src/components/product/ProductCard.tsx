import { Link } from 'react-router-dom';
import { Heart, ImageOff, MapPin, Store } from 'lucide-react';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/Card';
import { productImageUrl } from '@/api/product';
import { formatPrice, cn } from '@/lib/utils';
import { useFavorites } from '@/context/FavoritesContext';

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = productImageUrl(product.image);
  const price = formatPrice(product.priceUsd, 'USD') ?? formatPrice(product.priceCup, 'CUP');
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.idProduct);

  return (
    <Link
      to={`/productos/${product.idProduct}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <ImageOff size={28} />
          </div>
        )}
        {!product.stock && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink-950/85 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Agotado
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.idProduct);
          }}
          aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-pressed={favorite}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-500 backdrop-blur-sm transition-colors hover:text-ink-900"
        >
          <Heart size={15} className={cn(favorite && 'fill-ink-900 text-ink-900')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-medium text-ink-900">{product.name}</h3>
        </div>
        <p className="line-clamp-2 text-sm text-ink-500 min-h-[2.5rem]">{product.description}</p>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink-900">{price ?? 'Consultar precio'}</span>
            <Badge>{product.category}</Badge>
          </div>
          {product.userEnterprise && (
            <div className="flex flex-col gap-0.5 border-t border-ink-100 pt-2 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5 truncate">
                <Store size={12} className="shrink-0" /> {product.userEnterprise.companyName}
              </span>
              {product.userEnterprise.address && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <MapPin size={12} className="shrink-0" />
                  {product.userEnterprise.address.city}, {product.userEnterprise.address.state}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
