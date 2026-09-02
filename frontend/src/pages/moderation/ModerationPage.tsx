import { useCallback, useEffect, useState } from 'react';
import { Check, ShieldCheck, Store, Tags, X } from 'lucide-react';
import { listProducts, updateProduct } from '@/api/product';
import type { Product } from '@/types';
import { CATEGORIA_TEMPORAL, resolverSolicitud, solicitudesPendientes } from '@/lib/solicitudes-categoria';
import type { SolicitudCategoria } from '@/lib/solicitudes-categoria';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { ApiError } from '@/api/client';

/**
 * Lo que ve el moderador: los productos que esperan en la categoría temporal.
 *
 * La lista sale del catálogo, no de las solicitudes. La solicitud llega por
 * WhatsApp y el moderador puede estar en otro navegador, pero un producto
 * parado en «Otros» se ve siempre. Si la solicitud está a mano, se usa para
 * rellenar la categoría que pidió el negocio.
 *
 * El campo es editable a propósito: la categoría la escribe quien publica, y
 * «Mascota», «mascotas» o «Msacotas» son la misma estantería. Se corrige aquí,
 * antes de que exista.
 */
export function ModerationPage() {
  const { notify } = useToast();
  const [enEspera, setEnEspera] = useState<Product[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudCategoria[]>([]);
  const [propuestas, setPropuestas] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    setCargando(true);
    const pendientes = solicitudesPendientes();
    setSolicitudes(pendientes);
    listProducts({ limit: 200 })
      .then(({ products }) => {
        const parados = products.filter((p) => p.category === CATEGORIA_TEMPORAL);
        setEnEspera(parados);
        // Cada producto arranca con la categoría que su negocio pidió.
        setPropuestas(
          Object.fromEntries(
            parados.map((p) => [
              p.idProduct,
              pendientes.find((s) => s.productoNombre === p.name)?.categoria ?? '',
            ]),
          ),
        );
      })
      .catch(() => setEnEspera([]))
      .finally(() => setCargando(false));
  }, []);

  useEffect(cargar, [cargar]);

  async function aprobar(producto: Product) {
    const categoria = (propuestas[producto.idProduct] ?? '').trim();
    if (categoria.length < 2) {
      notify('Escribe la categoría con la que se publicará', 'error');
      return;
    }
    setGuardando(producto.idProduct);
    try {
      // Aprobar es, literalmente, mover el producto: la categoría existe en
      // cuanto hay un producto en ella.
      await updateProduct(producto.idProduct, { category: categoria });
      const solicitud = solicitudes.find((s) => s.productoNombre === producto.name);
      if (solicitud) resolverSolicitud(solicitud.id, 'aprobada', categoria);
      notify(`«${producto.name}» pasó a «${categoria}»`);
      cargar();
    } catch (err) {
      // `PATCH /products/:id` exige que el producto sea de tu propia empresa y
      // no hace excepción con quien modera, así que mover uno ajeno da 403.
      // Sin eso la moderación puede revisar pero no ejecutar.
      const esAjeno = err instanceof ApiError && err.status === 403;
      notify(
        esAjeno
          ? 'El backend no deja mover productos de otra empresa, ni siquiera moderando. Está pendiente de resolver con el equipo.'
          : err instanceof Error
            ? err.message
            : 'No se pudo mover el producto',
        'error',
      );
    } finally {
      setGuardando('');
    }
  }

  function rechazar(producto: Product) {
    const solicitud = solicitudes.find((s) => s.productoNombre === producto.name);
    if (solicitud) resolverSolicitud(solicitud.id, 'rechazada');
    notify(`«${producto.name}» se queda en ${CATEGORIA_TEMPORAL}`);
    cargar();
  }

  if (cargando) return <PageSpinner />;

  return (
    <div id="moderation" className="moderation mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <title>Moderación · Agora</title>

      <header id="moderation__header" className="moderation__header mb-6">
        <span
          id="moderation__eyebrow"
          className="moderation__eyebrow inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500"
        >
          <ShieldCheck size={14} aria-hidden="true" /> Moderación
        </span>
        <h1 id="moderation__title" className="moderation__title mt-2 text-2xl font-semibold text-ink-900">
          Categorías por revisar
        </h1>
        <p id="moderation__subtitle" className="moderation__subtitle mt-1.5 text-sm text-ink-500">
          Productos parados en {CATEGORIA_TEMPORAL} esperando categoría. Corrige el nombre antes de
          crearla si hace falta: así no acaban «Mascotas» y «mascota» siendo dos estanterías.
        </p>
      </header>

      {enEspera.length === 0 ? (
        <EmptyState
          icon={<Tags size={20} />}
          title="No hay nada esperando"
          description={`Cuando un negocio pida una categoría que no existe, su producto aparecerá aquí en ${CATEGORIA_TEMPORAL}.`}
        />
      ) : (
        <ul id="moderation__list" className="moderation__list space-y-3">
          {enEspera.map((producto) => {
            const solicitud = solicitudes.find((s) => s.productoNombre === producto.name);
            return (
              <li
                key={producto.idProduct}
                id={`moderation__item--${producto.idProduct}`}
                className="moderation__item rounded-2xl border border-ink-200 bg-ink-50 p-5"
              >
                <div className="moderation__item-head flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="moderation__item-name font-medium text-ink-900">{producto.name}</h2>
                  {producto.userEnterprise && (
                    <p className="moderation__item-seller flex items-center gap-1.5 text-xs text-ink-500">
                      <Store size={12} aria-hidden="true" /> {producto.userEnterprise.companyName}
                    </p>
                  )}
                </div>

                {producto.description && (
                  <p className="moderation__item-description mt-1 line-clamp-2 text-sm text-ink-500">
                    {producto.description}
                  </p>
                )}

                {solicitud && (
                  <p className="moderation__item-request mt-2 text-xs text-ink-500">
                    Pedida por <span className="font-medium text-ink-800">{solicitud.usuario}</span>
                    <span className="ml-1 text-ink-400">(id {solicitud.userId})</span>
                  </p>
                )}

                <label
                  htmlFor={`moderation__category--${producto.idProduct}`}
                  className="moderation__item-label mt-4 mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500"
                >
                  Categoría con la que se publicará
                </label>
                <div className="moderation__item-actions flex flex-wrap gap-2">
                  <input
                    id={`moderation__category--${producto.idProduct}`}
                    value={propuestas[producto.idProduct] ?? ''}
                    onChange={(e) =>
                      setPropuestas((p) => ({ ...p, [producto.idProduct]: e.target.value }))
                    }
                    placeholder="Mascotas"
                    className="moderation__item-input h-10 min-w-0 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-primary"
                  />
                  <Button
                    icon={<Check size={15} />}
                    loading={guardando === producto.idProduct}
                    onClick={() => aprobar(producto)}
                  >
                    Crear y mover
                  </Button>
                  <Button variant="outline" icon={<X size={15} />} onClick={() => rechazar(producto)}>
                    No crearla
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
