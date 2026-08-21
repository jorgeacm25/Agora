import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-semibold text-gradient">404</p>
      <h1 className="mt-3 text-xl font-semibold text-ink-900">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
