import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div id="not-found" className="not-found flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p id="not-found__code" className="not-found__code text-6xl font-semibold text-gradient">404</p>
      <h1 id="not-found__title" className="not-found__title mt-3 text-xl font-semibold text-ink-900">Página no encontrada</h1>
      <p id="not-found__text" className="not-found__text mt-2 max-w-sm text-sm text-ink-500">La página que buscas no existe o fue movida.</p>
      <Link to="/" id="not-found__back" className="not-found__back mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
