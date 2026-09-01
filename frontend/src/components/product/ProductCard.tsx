import { Link } from 'react-router-dom';
import { Heart, ImageOff, Store } from 'lucide-react';
import type { Product } from '@/types';
import { productImageUrl } from '@/api/product';
import { formatPrice, cn } from '@/lib/utils';
import { useFavorites } from '@/context/FavoritesContext';

interface ProductCardProps {
  product: Product;
  /**
   * Marca la tarjeta entera cuando el producto está agotado. Se usa en la lista
   * de favoritos: ahí el producto se guardó estando disponible, así que hay que
   * avisar de que ya no lo está sin obligar a leer el badge pequeño.
   */
  avisarAgotado?: boolean;
}

export function ProductCard({ product, avisarAgotado = false }: ProductCardProps) {
  const imageUrl = productImageUrl(product.image);
  const price = formatPrice(product.priceUsd, 'USD') ?? formatPrice(product.priceCup, 'CUP');
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.idProduct);
  const agotadoResaltado = avisarAgotado && !product.stock;

  return (
    <Link
      id={`product--${product.idProduct}`}
      to={`/productos/${product.idProduct}`}
      className={cn(
        'product group flex h-full flex-col overflow-hidden rounded-xl border shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card',
        agotadoResaltado
          ? 'border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30'
          : 'border-ink-200/80 bg-ink-50',
      )}
    >
      <div
        className={cn(
          'product__image relative aspect-[4/3] w-full flex-auto min-h-0 overflow-hidden',
          agotadoResaltado ? 'bg-red-100/60 dark:bg-red-950/40' : 'bg-ink-100',
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            id={`product__image--${product.idProduct}`}
          className="product__image h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div id={`product__placeholder--${product.idProduct}`} className="product__placeholder flex h-full w-full items-center justify-center text-ink-300">
            <ImageOff size={20} aria-hidden="true" />
          </div>
        )}

        {!product.stock && (
          <span
            className={cn(
              'product__badge absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
              agotadoResaltado ? 'bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200' : 'bg-white/90 text-danger',
            )}
          >
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
          id={`product__fav--${product.idProduct}`} className="product__fav absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-500 backdrop-blur-sm transition-colors hover:text-ink-900"
        >
          <Heart size={14} className={cn(favorite && 'fill-danger text-danger')} aria-hidden="true" />
        </button>
      </div>

      <div id={`product__body--${product.idProduct}`} className="product__body flex flex-1 flex-col gap-1.5 p-3">
        <h3 id={`product__name--${product.idProduct}`} className="product__name line-clamp-2 text-sm font-medium leading-snug text-ink-900">{product.name}</h3>
        {product.description && (
          <p id={`product__description--${product.idProduct}`} className="product__description line-clamp-1 text-xs text-ink-500">{product.description}</p>
        )}
        <p id={`product__price--${product.idProduct}`} className="product__price mt-auto text-base font-bold text-ink-900">{price ?? 'Consultar precio'}</p>
        {product.userEnterprise && (
          <p id={`product__seller--${product.idProduct}`} className="product__seller flex items-center gap-1 text-xs text-ink-500">
            <Store size={11} className="shrink-0" aria-hidden="true" />
            <span id={`product__seller-name--${product.idProduct}`} className="product__seller-name truncate">{product.userEnterprise.companyName}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
