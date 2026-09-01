import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Search, Target, Users } from 'lucide-react';
import { Logo } from './Logo';

interface AuthLayoutProps {
  /** Saludo de la pantalla. Es el h2: el h1 lo ocupa el titular de la página. */
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const POINTS = [
  { icon: Users, title: 'Qué hacemos', description: 'Reunimos lo que ofrecen las mypimes y mercados de tu ciudad.' },
  { icon: Target, title: 'Nuestro objetivo', description: 'Ahorrarte tiempo: nada de recorrer tienda por tienda.' },
  { icon: Search, title: 'Para qué sirve', description: 'Buscar, comparar y localizar lo que necesitas, hoy.' },
];

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div id="auth" className="auth relative flex min-h-screen flex-col bg-ink-100">
      {/* Decoración pura: fuera del árbol de accesibilidad. */}
      <div id="auth__backdrop" className="auth__backdrop pattern-categories pointer-events-none absolute inset-0" aria-hidden="true" />
      <div id="auth__wash" className="auth__wash pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light/50 via-transparent to-secondary-light/40" aria-hidden="true" />

      {/* Un único `main`, y es de nivel superior: dentro va todo el contenido
          de la página, incluido el h1. El pie queda fuera para que cuente como
          contentinfo. */}
      <main id="auth__stage" className="auth__stage relative flex flex-1 items-center justify-center p-4 sm:p-8">
        <div id="auth__card" className="auth__card glass-card grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-2">
          {/* `section` solo es landmark si tiene nombre accesible: se lo da su
              propio encabezado con aria-labelledby. */}
          {/* La divisoria no es un `border`: se dibuja con ::after para poder
              dejarla corta por los extremos. Ver .auth__intro en index.css. */}
          <section id="auth__intro" className="auth__intro relative flex flex-col justify-center gap-6 p-8 xl:p-10" aria-labelledby="auth-title">
            <Logo className="auth__brand" />

            <h1 id="auth-title" className="auth__title text-2xl font-bold leading-tight text-ink-900 xl:text-3xl">
              Todo lo que buscas, en un solo lugar
            </h1>

            {/* En móvil la card se queda en marca + titular + formulario: el
                resto del argumentario sobra cuando lo que toca es entrar. */}
            <p id="auth__lead" className="auth__lead hidden text-sm leading-relaxed text-ink-500 lg:block">
              Agora es el buscador de tu ciudad: encuentra en segundos lo que venden las mypimes y mercados locales, sin recorrerlos uno a uno.
            </p>

            {/* Cada punto es un término y su definición, no una lista suelta. */}
            <dl id="auth__points" className="auth__points hidden space-y-5 border-t border-ink-900/10 pt-6 lg:block">
              {/* `dt` y `dd` tienen que ser hijos directos del div que los
                  agrupa: cualquier envoltorio intermedio rompe la lista de
                  definición. El icono va dentro del propio término. */}
              {POINTS.map(({ icon: Icon, title: pointTitle, description }) => (
                <div key={pointTitle} id="point" className="point">
                  <dt id="point__term" className="point__term flex items-center gap-3 text-sm font-semibold text-ink-900">
                    <span id="point__icon" className="point__icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50/80 text-ink-600 shadow-soft">
                      <Icon size={14} aria-hidden="true" />
                    </span>
                    {pointTitle}
                  </dt>
                  <dd id="point__desc" className="point__desc mt-1 ml-11 text-xs leading-relaxed text-ink-500">{description}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="access" className="access flex flex-col p-8 xl:p-10" aria-labelledby="access-title">
            {/* El contenido se queda centrado y el pie cae al fondo: por eso el
                panel crece con flex-1 en vez de centrar la sección entera. */}
            <div id="access__panel" className="access__panel flex flex-1 items-center">
              <div id="access__content" className="access__content w-full">
                <h2 id="access-title" className="access__title text-3xl font-semibold text-ink-900 sm:text-4xl">
                  {title}
                </h2>
                <p id="access__subtitle" className="access__subtitle mt-2 text-sm text-ink-500">{subtitle}</p>
                <div id="access__body" className="access__body mt-8">{children}</div>
                <p id="access__footer" className="access__footer mt-6 text-sm text-ink-500">{footer}</p>
              </div>
            </div>

            {/* Pie de esta sección, no del documento: por eso no lleva rol de
                contentinfo (un `footer` solo es landmark si cuelga del body). */}
            <footer id="access__legal" className="access__legal mt-8 text-center">
              <small id="auth__copyright" className="auth__copyright text-xs text-ink-500">© {new Date().getFullYear()} Agora</small>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="access__link font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}
