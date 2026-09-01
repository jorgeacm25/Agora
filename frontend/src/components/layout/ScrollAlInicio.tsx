import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Cada pantalla nueva empieza arriba. Solo actúa cuando la navegación es hacia
 * adelante: al volver atrás no toca nada, para que quien restaure su posición
 * —el catálogo, por ejemplo— pueda hacerlo sin que esto se la pise.
 */
export function ScrollAlInicio() {
  const { pathname } = useLocation();
  const tipo = useNavigationType();

  useEffect(() => {
    if (tipo === 'POP') return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, tipo]);

  return null;
}
