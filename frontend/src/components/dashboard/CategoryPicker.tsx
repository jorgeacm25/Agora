import { useMemo, useRef, useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

/**
 * Campo de categoría: se escribe y va filtrando las que ya existen.
 *
 * Escribir la categoría a mano llena el catálogo de variantes —«Alimento»,
 * «alimentos», «Comida»— que parten en tres una misma estantería. Así que lo
 * primero que se ofrece es lo que ya hay; estrenar una es un camino aparte, y
 * pasa por aprobación.
 */
export function CategoryPicker({
  value,
  onChange,
  onCrearNueva,
}: {
  value: string;
  onChange: (categoria: string) => void;
  /** Se pide una que no existe: el aviso y la solicitud los lleva el formulario. */
  onCrearNueva: (categoria: string) => void;
}) {
  const { categories, isLoading } = useCategories();
  const [abierto, setAbierto] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  const escrito = value.trim();
  const coincidencias = useMemo(() => {
    const termino = escrito.toLowerCase();
    if (!termino) return categories;
    return categories.filter((c) => c.category.toLowerCase().includes(termino));
  }, [categories, escrito]);

  // Escrita entera y ya existe: no hay nada que crear ni que sugerir.
  const yaExiste = categories.some((c) => c.category.toLowerCase() === escrito.toLowerCase());
  const puedeCrear = escrito.length >= 2 && !yaExiste && coincidencias.length === 0;

  function elegir(categoria: string) {
    onChange(categoria);
    setAbierto(false);
    campo.current?.blur();
  }

  return (
    <div id="category-picker" className="category-picker relative">
      <label id="category-picker__label" className="category-picker__label mb-1.5 block text-sm font-medium text-ink-800" htmlFor="category-picker__input">
        Categoría
      </label>

      <div id="category-picker__field" className="category-picker__field relative">
        <Search
          size={15}
          aria-hidden="true"
          className="category-picker__icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input
          ref={campo}
          id="category-picker__input"
          type="text"
          required
          autoComplete="off"
          role="combobox"
          aria-expanded={abierto}
          aria-controls="category-picker__list"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          // El clic en una sugerencia llega después del blur: se cierra con
          // retraso para que le dé tiempo a registrarse.
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          placeholder="Busca una categoría o escribe una nueva"
          className="category-picker__control h-10 w-full rounded-xl border border-ink-200 bg-ink-50 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-primary"
        />
      </div>

      {abierto && (
        <div
          id="category-picker__list"
          role="listbox"
          aria-label="Categorías"
          className="category-picker__list absolute left-0 right-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-ink-200 bg-ink-50 py-1 shadow-lift"
        >
          {isLoading && (
            <p id="category-picker__loading" className="category-picker__loading px-3 py-2 text-sm text-ink-500">
              Cargando categorías…
            </p>
          )}

          {!isLoading &&
            coincidencias.map(({ category, count }) => (
              <button
                key={category}
                type="button"
                role="option"
                aria-selected={category === value}
                // `mousedown` y no `click`: el blur del campo se dispara antes.
                onMouseDown={(e) => {
                  e.preventDefault();
                  elegir(category);
                }}
                id={`category-picker__option--${category}`}
                className="category-picker__option flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-ink-900 hover:bg-ink-100"
              >
                <span className="category-picker__option-name truncate">{category}</span>
                <span className="category-picker__option-count shrink-0 text-xs text-ink-500">
                  {count} producto{count === 1 ? '' : 's'}
                  {category === value && <Check size={13} className="ml-1.5 inline text-primary" aria-hidden="true" />}
                </span>
              </button>
            ))}

          {/* Nada coincide: lo que queda no es una sugerencia, es estrenarla. */}
          {!isLoading && puedeCrear && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setAbierto(false);
                onCrearNueva(escrito);
              }}
              id="category-picker__create"
              className={cn(
                'category-picker__create m-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-3 py-2.5',
                'bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark',
              )}
            >
              <Plus size={15} aria-hidden="true" />
              Crear nueva: «{escrito}»
            </button>
          )}

          {!isLoading && !puedeCrear && coincidencias.length === 0 && (
            <p id="category-picker__empty" className="category-picker__empty px-3 py-2 text-sm text-ink-500">
              Escribe al menos dos letras.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
