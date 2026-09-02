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
import { WHATSAPP_MODERACION } from './contacto';

/** Donde espera un producto cuya categoría aún no está aprobada. */
export const CATEGORIA_TEMPORAL = 'Otros';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudCategoria {
  readonly id: string;
  readonly userId: string;
  /** Quién la pide: el moderador necesita el nombre además del id. */
  readonly usuario: string;
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

/** Lo que tiene delante el moderador. */
export function solicitudesPendientes(): SolicitudCategoria[] {
  return leerTodas().filter((s) => s.estado === 'pendiente');
}

/**
 * El mensaje que recibe el moderador. Lleva lo que necesita para decidir sin
 * tener que preguntar nada: qué producto es, quién lo publica —con su id, que
 * es lo que identifica la cuenta— y qué categoría pide.
 */
export function mensajeParaModerador(s: {
  categoria: string;
  productoNombre: string;
  usuario: string;
  userId: string;
}): string {
  return (
    `Solicitud de categoría nueva en Agora

Producto: ${s.productoNombre}
Publica: ${s.usuario} (id ${s.userId})
Categoría que pide: ${s.categoria}

El producto está publicado en Otros mientras se revisa.`
  );
}

/** El enlace de WhatsApp con esa solicitud ya escrita. */
export function enlaceModeracion(s: Parameters<typeof mensajeParaModerador>[0]): string {
  return `https://wa.me/${WHATSAPP_MODERACION}?text=${encodeURIComponent(mensajeParaModerador(s))}`;
}

/** Registra la petición y avisa al negocio de que se ha enviado. */
export function pedirCategoria(entrada: {
  userId: string;
  usuario: string;
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
    // El aviso guarda el enlace por si la solicitud no llegó a enviarse.
    enlace: enlaceModeracion(entrada),
    enlaceTexto: 'Reenviar al moderador',
  });

  return solicitud;
}

/**
 * Lo que hará quien revise la solicitud. Aprobarla es lo que mueve el producto
 * a su categoría; rechazarla lo deja en la temporal.
 */
export function resolverSolicitud(
  id: string,
  estado: 'aprobada' | 'rechazada',
  /** Cómo quedó escrita finalmente; el moderador pudo corregirla. */
  categoriaFinal?: string,
): SolicitudCategoria | null {
  const todas = leerTodas();
  const solicitud = todas.find((s) => s.id === id);
  if (!solicitud || solicitud.estado !== 'pendiente') return null;

  const categoria = categoriaFinal?.trim() || solicitud.categoria;
  const resuelta: SolicitudCategoria = { ...solicitud, estado, categoria };
  guardar(todas.map((s) => (s.id === id ? resuelta : s)));

  // Si el moderador corrigió el nombre, el aviso lo dice: la categoría no
  // quedó tal como se pidió y quien publica tiene que enterarse.
  const corregida = estado === 'aprobada' && categoria !== solicitud.categoria;
  anadirAviso(solicitud.userId, {
    tipo: 'categoria',
    titulo:
      estado === 'aprobada'
        ? `Se creó la categoría «${categoria}»`
        : `No se creó la categoría «${solicitud.categoria}»`,
    cuerpo:
      estado === 'aprobada'
        ? `«${solicitud.productoNombre}» ya aparece en «${categoria}».` +
          (corregida ? ` Se corrigió el nombre que escribiste («${solicitud.categoria}»).` : '')
        : `«${solicitud.productoNombre}» se queda en ${CATEGORIA_TEMPORAL}. Puedes cambiarle la categoría cuando quieras.`,
  });

  return resuelta;
}
