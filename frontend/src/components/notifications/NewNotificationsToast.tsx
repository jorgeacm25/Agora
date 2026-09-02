import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext';
import { useMotion } from '@/context/MotionContext';
import { cn } from '@/lib/utils';

/** Lo que dura el cartel en pantalla si nadie lo cierra. */
const DURACION = 3700;
/** Lo que tarda en entrar y en salir; tiene que coincidir con la transición. */
const TRANSICION = 320;

/**
 * Cartel que aparece sobre el carrusel al entrar, cuando hay avisos sin leer.
 *
 * No sustituye a la bandeja ni la resume: solo dice que hay algo. Se cierra
 * solo, y con la X antes si estorba.
 */
export function NewNotificationsToast() {
  const { sinLeer, avisaAlEntrar, yaAvisado } = useNotifications();
  const { reducirMovimiento } = useMotion();
  const [visible, setVisible] = useState(false);
  const [entrando, setEntrando] = useState(false);

  useEffect(() => {
    if (!avisaAlEntrar || sinLeer === 0) return;
    setVisible(true);
    // Un fotograma con el cartel ya montado, pero todavía arriba y
    // transparente: sin esto el navegador pinta el estado final y no hay
    // transición que ver.
    const entrada = requestAnimationFrame(() => setEntrando(true));
    const salida = setTimeout(() => cerrar(), DURACION);
    return () => {
      cancelAnimationFrame(entrada);
      clearTimeout(salida);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avisaAlEntrar, sinLeer]);

  function cerrar() {
    setEntrando(false);
    // Se desmonta cuando termina de salir, no antes: si no, desaparece de golpe.
    setTimeout(() => {
      setVisible(false);
      yaAvisado();
    }, reducirMovimiento ? 0 : TRANSICION);
  }

  if (!visible) return null;

  return (
    <div
      id="new-notices"
      role="status"
      aria-live="polite"
      className={cn(
        'new-notices pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center px-4',
      )}
    >
      <div
        id="new-notices__card"
        className={cn(
          'new-notices__card pointer-events-auto flex items-center gap-3 rounded-full border border-ink-200/80',
          'bg-ink-50/95 py-2 pl-4 pr-2 shadow-lift backdrop-blur-md',
          !reducirMovimiento && 'transition-all duration-300 ease-out',
          entrando ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
        )}
      >
        <span id="new-notices__icon" className="new-notices__icon flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
          <Bell size={14} aria-hidden="true" />
        </span>
        <p id="new-notices__text" className="new-notices__text text-sm font-medium text-ink-900">
          Tienes {sinLeer} aviso{sinLeer === 1 ? '' : 's'} sin leer
        </p>
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar aviso"
          id="new-notices__close"
          className="new-notices__close flex h-7 w-7 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
