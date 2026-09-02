import { AlertTriangle, Clock, PackageOpen } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CATEGORIA_TEMPORAL } from '@/lib/solicitudes-categoria';

/**
 * Lo que hay que contar antes de estrenar una categoría, porque no es lo mismo
 * que elegir una de la lista: el producto no aparece donde se pidió hasta que
 * alguien lo aprueba.
 */
export function NewCategoryDialog({
  categoria,
  open,
  onCancelar,
  onConfirmar,
}: {
  categoria: string;
  open: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const puntos = [
    {
      icono: PackageOpen,
      texto: `Ahora mismo no hay ningún producto en «${categoria}»: el tuyo sería el único, y una categoría con un solo producto casi nadie la abre.`,
    },
    {
      icono: Clock,
      texto: 'Crearla es una solicitud a los desarrolladores, y tiene que confirmarse antes de existir.',
    },
    {
      icono: AlertTriangle,
      texto: `Mientras se revisa, tu producto se publica en ${CATEGORIA_TEMPORAL}. Si se aprueba pasa solo a «${categoria}»; si no, se queda en ${CATEGORIA_TEMPORAL}.`,
    },
  ];

  return (
    <Modal open={open} onClose={onCancelar} title="Esa categoría todavía no existe">
      <div id="new-category" className="new-category">
        <ul id="new-category__points" className="new-category__points space-y-3.5">
          {puntos.map(({ icono: Icono, texto }, i) => (
            <li key={i} id={`new-category__point--${i}`} className="new-category__point flex gap-3">
              <span className="new-category__point-icon mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                <Icono size={15} aria-hidden="true" />
              </span>
              <p className="new-category__point-text text-sm leading-relaxed text-ink-600">{texto}</p>
            </li>
          ))}
        </ul>

        <div id="new-category__actions" className="new-category__actions mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancelar}>
            Elegir una existente
          </Button>
          <Button onClick={onConfirmar}>Pedir «{categoria}»</Button>
        </div>
      </div>
    </Modal>
  );
}
