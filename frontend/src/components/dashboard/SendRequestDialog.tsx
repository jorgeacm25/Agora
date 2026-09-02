import { MessageCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CATEGORIA_TEMPORAL, enlaceModeracion } from '@/lib/solicitudes-categoria';

/**
 * El producto ya está publicado; ahora hay que hacer llegar la solicitud.
 *
 * Se abre WhatsApp desde un enlace y no automáticamente al guardar: una
 * ventana que se abre sola tras una petición la bloquea el navegador la mitad
 * de las veces, y aquí perderla significa que la categoría no se pide.
 */
export function SendRequestDialog({
  open,
  datos,
  onCerrar,
}: {
  open: boolean;
  datos: { categoria: string; productoNombre: string; usuario: string; userId: string };
  onCerrar: () => void;
}) {
  return (
    <Modal open={open} onClose={onCerrar} title="Envía la solicitud">
      <div id="send-request" className="send-request">
        <p id="send-request__text" className="send-request__text text-sm leading-relaxed text-ink-600">
          «{datos.productoNombre}» ya está publicado en {CATEGORIA_TEMPORAL}. Para crear
          «{datos.categoria}» hace falta que un moderador lo apruebe: el mensaje va ya escrito con
          el producto, tu cuenta y la categoría que pides.
        </p>

        <div id="send-request__actions" className="send-request__actions mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCerrar}>
            Enviarla luego
          </Button>
          <a
            href={enlaceModeracion(datos)}
            target="_blank"
            rel="noreferrer"
            onClick={onCerrar}
            id="send-request__whatsapp"
            className="send-request__whatsapp inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <MessageCircle size={15} aria-hidden="true" />
            Enviar por WhatsApp
          </a>
        </div>

        <p id="send-request__note" className="send-request__note mt-3 text-xs text-ink-500">
          Si lo dejas para luego, el enlace queda guardado en tus avisos.
        </p>
      </div>
    </Modal>
  );
}
