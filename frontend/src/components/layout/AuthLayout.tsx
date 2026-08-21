import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Search, Target, Users } from 'lucide-react';
import { Logo } from './Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const POINTS = [
  { icon: Users, title: 'Quiénes somos', description: 'Reunimos lo que ofrecen las mypimes y mercados de tu ciudad.' },
  { icon: Target, title: 'Nuestro objetivo', description: 'Ahorrarte tiempo: nada de recorrer tienda por tienda.' },
  { icon: Search, title: 'Para qué sirve', description: 'Buscar, comparar y localizar lo que necesitas, hoy.' },
];

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden surface-gradient bg-grid p-10 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-ink-400/10 blur-3xl" />

        <Logo dark className="relative" />

        <div className="relative max-w-sm">
          <h2 className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-3xl font-semibold leading-tight text-transparent">
            Todo lo que buscas, en un solo lugar
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Agora es el buscador de tu ciudad: encuentra en segundos lo que venden las mypimes y mercados locales, sin recorrerlos uno a uno.
          </p>

          <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
            {POINTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/45">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/30">© {new Date().getFullYear()} Agora</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-ink-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium text-ink-900 hover:underline">
      {children}
    </Link>
  );
}
