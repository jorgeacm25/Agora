/**
 * Solicitudes para crear una categoría que todavía no existe.
 *
 * Una categoría no la estrena cualquiera: si cada negocio pudiera inventar la
 * suya, el catálogo se llenaría de «Alimento», «alimentos» y «Comida». Por eso
 * la petición queda **pendiente de aprobación** y el producto se publica
 * mientras tanto en [[CATEGORIA_TEMPORAL]].
 *
 * Sin endpoints todavía: se guarda en el navegador. `resolverSolicitud` es lo
 * que ejecutará el panel de administración —o el backend— el día que exista;
 * ahí es donde el producto pasa a su categoría definitiva.
 */
import { anadirAviso } from './notificaciones';

/** Donde espera un producto cuya categoría aún no está aprobada. */
export const CATEGORIA_TEMPORAL = 'Otros';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudCategoria {
  readonly id: string;
  readonly userId: string;
  /** La categoría tal como la escribió el negocio. */
  readonly categoria: string;
  /** El producto que espera a que se apruebe. */
  readonly productoId: string | null;
  readonly productoNombre: string;
  readonly estado: EstadoSolicitud;
  readonly pedidaEn: string;
}

const CLAVE = 'agora_solicitudes_categoria';

function leerTodas(): SolicitudCategoria[] {
  try {
    const bruto = localStorage.getItem(CLAVE);
    const datos: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(datos) ? (datos as SolicitudCategoria[]) : [];
  } catch {
    return [];
  }
}

function guardar(solicitudes: SolicitudCategoria[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(solicitudes));
  } catch {
    // Igual que la bandeja: sin almacenamiento se pierde, pero no rompe nada.
  }
}

export function solicitudesDe(userId: string): SolicitudCategoria[] {
  return leerTodas().filter((s) => s.userId === userId);
}

/** Registra la petición y avisa al negocio de que se ha enviado. */
export function pedirCategoria(entrada: {
  userId: string;
  categoria: string;
  productoId: string | null;
  productoNombre: string;
}): SolicitudCategoria {
  const solicitud: SolicitudCategoria = {
    ...entrada,
    id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    estado: 'pendiente',
    pedidaEn: new Date().toISOString(),
  };
  guardar([solicitud, ...leerTodas()]);

  anadirAviso(entrada.userId, {
    tipo: 'categoria',
    titulo: `Pediste la categoría «${entrada.categoria}»`,
    cuerpo:
      `Mientras se revisa, «${entrada.productoNombre}» está publicado en ${CATEGORIA_TEMPORAL}. ` +
      'Si se aprueba, pasa solo a su categoría; si no, se queda donde está.',
  });

  return solicitud;
}

/**
 * Lo que hará quien revise la solicitud. Aprobarla es lo que mueve el producto
 * a su categoría; rechazarla lo deja en la temporal.
 */
export function resolverSolicitud(id: string, estado: 'aprobada' | 'rechazada'): SolicitudCategoria | null {
  const todas = leerTodas();
  const solicitud = todas.find((s) => s.id === id);
  if (!solicitud || solicitud.estado !== 'pendiente') return null;

  const resuelta: SolicitudCategoria = { ...solicitud, estado };
  guardar(todas.map((s) => (s.id === id ? resuelta : s)));

  anadirAviso(solicitud.userId, {
    tipo: 'categoria',
    titulo:
      estado === 'aprobada'
        ? `Se creó la categoría «${solicitud.categoria}»`
        : `No se creó la categoría «${solicitud.categoria}»`,
    cuerpo:
      estado === 'aprobada'
        ? `«${solicitud.productoNombre}» ya aparece en «${solicitud.categoria}».`
        : `«${solicitud.productoNombre}» se queda en ${CATEGORIA_TEMPORAL}. Puedes cambiarle la categoría cuando quieras.`,
  });

  return resuelta;
}
