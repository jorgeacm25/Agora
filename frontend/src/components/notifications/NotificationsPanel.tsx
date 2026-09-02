import { BellOff, CalendarClock, Megaphone, ShieldAlert, Tags } from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext';
import type { Aviso, TipoAviso } from '@/lib/notificaciones';
import { cn } from '@/lib/utils';

const ICONOS: Record<TipoAviso, typeof CalendarClock> = {
  cuenta: CalendarClock,
  conducta: ShieldAlert,
  demanda: Megaphone,
  categoria: Tags,
};

/** «hace 3 h», «ayer»: la fecha exacta de un aviso rara vez importa. */
function haceCuanto(iso: string) {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? 'ayer' : `hace ${dias} días`;
}

/**
 * La bandeja, dentro del menú de la cuenta. Es de solo lectura: lo que pide
 * respuesta se contesta por WhatsApp, no aquí.
 */
export function NotificationsPanel() {
  const { avisos, sinLeer, marcarLeido, marcarTodoLeido } = useNotifications();

  return (
    <section id="inbox" className="inbox" aria-label="Avisos">
      <header id="inbox__header" className="inbox__header flex items-center justify-between gap-2 px-3 py-2">
        <h2 id="inbox__title" className="inbox__title text-xs font-semibold uppercase tracking-wide text-ink-500">
          Avisos{sinLeer > 0 && ` (${sinLeer})`}
        </h2>
        {sinLeer > 0 && (
          <button
            type="button"
            onClick={marcarTodoLeido}
            id="inbox__mark-all"
            className="inbox__mark-all text-xs font-medium text-ink-500 hover:text-ink-900"
          >
            Marcar todo leído
          </button>
        )}
      </header>

      {avisos.length === 0 ? (
        <p id="inbox__empty" className="inbox__empty flex items-center gap-2 px-3 pb-3 text-sm text-ink-500">
          <BellOff size={14} aria-hidden="true" /> No tienes avisos.
        </p>
      ) : (
        <ul id="inbox__list" className="inbox__list max-h-72 overflow-y-auto">
          {avisos.slice(0, 12).map((aviso) => (
            <Fila key={aviso.id} aviso={aviso} onLeer={() => marcarLeido(aviso.id)} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Fila({ aviso, onLeer }: { aviso: Aviso; onLeer: () => void }) {
  const Icono = ICONOS[aviso.tipo];
  return (
    <li id={`inbox__item--${aviso.id}`} className="inbox__item">
      <button
        type="button"
        onClick={onLeer}
        aria-label={aviso.leido ? aviso.titulo : `${aviso.titulo} (sin leer)`}
        className={cn(
          'inbox__item-button flex w-full gap-2.5 px-3 py-2.5 text-left hover:bg-ink-100',
          !aviso.leido && 'bg-primary/5',
        )}
      >
        <span
          className={cn(
            'inbox__item-icon mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            aviso.leido ? 'bg-ink-100 text-ink-500' : 'bg-primary text-white',
          )}
        >
          <Icono size={14} aria-hidden="true" />
        </span>
        <span className="inbox__item-body min-w-0">
          <span className="inbox__item-title block text-sm font-medium text-ink-900">{aviso.titulo}</span>
          <span className="inbox__item-text mt-0.5 block text-xs leading-relaxed text-ink-500">{aviso.cuerpo}</span>
          <span className="inbox__item-time mt-1 block text-[11px] text-ink-400">{haceCuanto(aviso.enviadoEn)}</span>
        </span>
      </button>
    </li>
  );
}
