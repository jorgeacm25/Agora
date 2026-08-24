import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-ink-200/70 bg-ink-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-sm text-ink-500">© {new Date().getFullYear()} Agora. Busca todo lo que necesitas, en un solo lugar.</p>
      </div>
    </footer>
  );
}
