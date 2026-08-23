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
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-light via-white to-primary-light p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <Logo className="relative" />

        <div className="relative max-w-sm">
          <svg width="88" height="88" viewBox="0 0 168 168" fill="none" className="mb-6">
            <circle cx="84" cy="84" r="84" fill="#E0F2FE" />
            <path d="M84 44c-19.9 0-36 16.1-36 36 0 27 36 62 36 62s36-35 36-62c0-19.9-16.1-36-36-36z" fill="#0EA5E9" />
            <circle cx="84" cy="80" r="15" fill="#FFFFFF" />
            <g transform="translate(104 108)">
              <circle cx="14" cy="14" r="13" fill="none" stroke="#1F2937" strokeWidth="4" />
              <line x1="23.5" y1="23.5" x2="34" y2="34" stroke="#1F2937" strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>

          <h2 className="text-3xl font-bold leading-tight text-ink-900">Todo lo que buscas, en un solo lugar</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            Agora es el buscador de tu ciudad: encuentra en segundos lo que venden las mypimes y mercados locales, sin recorrerlos uno a uno.
          </p>

          <div className="mt-8 space-y-5 border-t border-ink-900/10 pt-6">
            {POINTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-soft">
                  <Icon size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ink-400">© {new Date().getFullYear()} Agora</p>
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
    <Link to={to} className="font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}
