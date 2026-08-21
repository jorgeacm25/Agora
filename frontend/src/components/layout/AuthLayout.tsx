import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between surface-gradient bg-grid p-10 text-white">
        <Logo dark />
        <div className="max-w-sm">
          <h2 className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-3xl font-semibold leading-tight text-transparent">
            Todo lo que buscas, en un solo lugar
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Agora es el buscador de tu ciudad: encuentra en segundos lo que venden las mypimes y mercados locales, sin recorrerlos uno a uno.
          </p>
        </div>
        <p className="text-xs text-white/30">© {new Date().getFullYear()} Agora</p>
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
