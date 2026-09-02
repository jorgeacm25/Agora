/**
 * Bandeja de avisos del usuario.
 *
 * Se conserva lo decidido para la web anterior (`_negocio/notificaciones.md`):
 * la bandeja es **de solo lectura** y solo para lo importante —vencimientos,
 * conducta, demanda—; la conversación ocurre por WhatsApp, no aquí dentro. Las
 * promociones no entran: viven en el carrusel.
 *
 * El backend todavía no tiene nada de esto, así que la bandeja se guarda en el
 * navegador, por usuario. Cuando existan los endpoints, solo cambia este
 * archivo: el resto de la aplicación habla con el contexto.
 */

export type TipoAviso =
  /** Vencimientos de la suscripción, altas y bajas de plan. */
  | 'cuenta'
  /** Avisos de conducta. */
  | 'conducta'
  /** Qué busca la gente y nadie publica. */
  | 'demanda'
  /** Estado de una categoría que el negocio pidió crear. */
  | 'categoria';

export interface Aviso {
  readonly id: string;
  readonly tipo: TipoAviso;
  readonly titulo: string;
  readonly cuerpo: string;
  readonly enviadoEn: string;
  readonly leido: boolean;
}

const CLAVE = 'agora_avisos';

function clavePara(userId: string) {
  return `${CLAVE}:${userId}`;
}

export function leerBandeja(userId: string): Aviso[] {
  try {
    const bruto = localStorage.getItem(clavePara(userId));
    if (!bruto) return [];
    const datos: unknown = JSON.parse(bruto);
    return Array.isArray(datos) ? (datos as Aviso[]) : [];
  } catch {
    return [];
  }
}

function guardarBandeja(userId: string, avisos: Aviso[]) {
  try {
    localStorage.setItem(clavePara(userId), JSON.stringify(avisos));
  } catch {
    // Sin almacenamiento la bandeja vive solo en memoria: no es motivo para romper.
  }
}

/** Lo urgente es lo último que ha pasado: del más reciente al más antiguo. */
export function ordenarPorFecha(avisos: readonly Aviso[]): Aviso[] {
  return [...avisos].sort((a, b) => b.enviadoEn.localeCompare(a.enviadoEn));
}

export function contarSinLeer(avisos: readonly Aviso[]): number {
  return avisos.filter((a) => !a.leido).length;
}

export function anadirAviso(userId: string, aviso: Omit<Aviso, 'id' | 'enviadoEn' | 'leido'>): Aviso[] {
  const nuevo: Aviso = {
    ...aviso,
    id: `av-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    enviadoEn: new Date().toISOString(),
    leido: false,
  };
  const avisos = [nuevo, ...leerBandeja(userId)];
  guardarBandeja(userId, avisos);
  return ordenarPorFecha(avisos);
}

export function marcarLeido(userId: string, avisoId: string): Aviso[] {
  const avisos = leerBandeja(userId).map((a) => (a.id === avisoId ? { ...a, leido: true } : a));
  guardarBandeja(userId, avisos);
  return ordenarPorFecha(avisos);
}

export function marcarTodoLeido(userId: string): Aviso[] {
  const avisos = leerBandeja(userId).map((a) => (a.leido ? a : { ...a, leido: true }));
  guardarBandeja(userId, avisos);
  return ordenarPorFecha(avisos);
}
