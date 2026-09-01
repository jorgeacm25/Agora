import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Store, X } from 'lucide-react';
import { listProducts } from '@/api/product';
import type { Product } from '@/types';

/**
 * Buscador de la cabecera.
 *
 * Plegado son la lupa y, si hay búsqueda activa, el término a su izquierda. Ese
 * término ocupa lo que ocupe la palabra y, cuando no cabe en el hueco libre, se
 * corta con puntos suspensivos: el reparto lo hace el propio flex —`min-w-0` más
 * `truncate`— sin medir nada a mano.
 *
 * Desplegado, el botón no se mueve: el campo crece hacia la izquierda por encima
 * de la cabecera —posición absoluta, así no empuja a nadie— hasta la mitad del
 * ancho de la ventana, con cristal esmerilado.
 */
export function HeaderSearch({ ambito = 'desktop' }: { ambito?: string }) {
  /** Distingue la copia del header de escritorio de la del móvil. */
  const uid = (nombre: string) => `${nombre}--${ambito}`;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const consultaActual = searchParams.get('q') ?? '';
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState(consultaActual);

  const capa = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  // El catálogo para sugerir se pide una sola vez, la primera que se abre el
  // buscador: no tiene sentido cargarlo en cada pantalla si no se usa.
  const [catalogo, setCatalogo] = useState<Product[] | null>(null);
  useEffect(() => {
    if (!abierto || catalogo !== null) return;
    listProducts({ limit: 200 })
      .then((d) => setCatalogo(d.products))
      .catch(() => setCatalogo([]));
  }, [abierto, catalogo]);

  const sugerencias = useMemo(() => {
    const q = texto.trim().toLowerCase();
    if (q.length < 2 || !catalogo) return [];
    const coincide = (v?: string) => (v ?? '').toLowerCase().includes(q);
    return catalogo
      .filter((p) => coincide(p.name) || coincide(p.category) || coincide(p.userEnterprise?.companyName))
      // Primero lo que empieza por lo tecleado: es lo que se suele buscar.
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)))
      .slice(0, 6);
  }, [texto, catalogo]);

  useEffect(() => setTexto(consultaActual), [consultaActual]);
  useEffect(() => {
    if (abierto) campo.current?.focus();
  }, [abierto]);

  function buscar(valor = texto) {
    setAbierto(false);
    const q = valor.trim();
    if (q === consultaActual) return;
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/', { replace: pathname === '/' });
  }

  // Pulsar fuera equivale a aceptar: busca y se pliega.
  useEffect(() => {
    if (!abierto) return;
    function fuera(e: MouseEvent) {
      if (!capa.current?.contains(e.target as Node)) buscar();
    }
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  });

  return (
    <div ref={capa} id={uid('header-search')} className="header-search relative flex min-w-0 flex-1 items-center justify-end gap-2">
      {/* Cristal sobre el resto de la cabecera mientras se escribe: el menú
          queda entrevisto detrás, y el campo y la lupa por encima, nítidos. */}
      {abierto && (
        <div
          id={uid('header-search__glass')} className="header-search__glass fixed inset-x-0 top-0 z-10 h-[65px] bg-ink-50/60 backdrop-blur-md"
          aria-hidden="true"
        />
      )}

      {abierto ? (
        <input
          ref={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') buscar();
            if (e.key === 'Escape') {
              setTexto(consultaActual);
              setAbierto(false);
            }
          }}
          aria-label="Buscar productos o negocios"
          placeholder="Busca productos o negocios…"
          // El texto va alineado a la derecha: se escribe pegado al botón y la
          // frase crece hacia la izquierda, en vez de teclear en una esquina y
          // tener que cruzar la pantalla para pulsar la lupa.
          id={uid('header-search__input')} className="header-search__input absolute right-11 z-20 h-10 w-[45vw] max-w-md rounded-full border border-ink-200 bg-white/85 px-4 text-right text-sm text-neutral-900 shadow-lift outline-none backdrop-blur-xl placeholder:text-ink-400 focus:border-primary"
        />
      ) : (
        consultaActual && (
          <span id={uid('header-search__term')} className="header-search__term flex min-w-0 items-center gap-1 rounded-full border border-ink-200 bg-white py-1 pl-3 pr-1 shadow-soft">
            <span className="truncate text-xs font-medium text-neutral-900">{consultaActual}</span>
            <button
              onClick={() => {
                setTexto('');
                navigate('/', { replace: pathname === '/' });
              }}
              aria-label="Quitar la búsqueda"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            >
              <X size={11} aria-hidden="true" />
            </button>
          </span>
        )
      )}

      {abierto && sugerencias.length > 0 && (
        <ul id={uid('header-search__suggestions')} className="header-search__suggestions absolute right-11 top-12 z-20 w-[45vw] max-w-md overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 py-1 shadow-lift">
          {sugerencias.map((p) => (
            <li key={p.idProduct} id={uid(`header-search__option--${p.idProduct}`)} className="header-search__option">
              <button
                // `mousedown` y no `click`: el clic fuera que cierra el buscador
                // se dispara antes y la sugerencia nunca llegaría a recibirlo.
                onMouseDown={(e) => {
                  e.preventDefault();
                  setAbierto(false);
                  navigate(`/productos/${p.idProduct}`);
                }}
                id={uid(`header-search__suggestion--${p.idProduct}`)} className="header-search__suggestion flex w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-ink-100"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink-900">{p.name}</span>
                  {p.userEnterprise && (
                    <span className="flex items-center gap-1 truncate text-[11px] text-ink-500">
                      <Store size={10} aria-hidden="true" /> {p.userEnterprise.companyName}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs font-semibold text-ink-900">{p.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* El botón no se mueve: pulsarlo abre el campo y, ya abierto, busca. */}
      <button
        onClick={() => (abierto ? buscar() : setAbierto(true))}
        aria-label="Buscar"
        aria-expanded={abierto}
        id={uid('header-search__toggle')} className="header-search__toggle relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
      >
        <Search size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
