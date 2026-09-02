import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LayoutGrid, LogOut, Store, User as UserIcon, ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { HeaderSearch } from './HeaderSearch';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { useNotifications } from '@/context/NotificationsContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { cn, initials } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, isSeller, tieneAcceso, logout } = useAuth();
  const { sinLeer } = useNotifications();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors px-3 py-2 rounded-lg',
      // El enlace activo es un estado, no una acción: se marca con peso y fondo
      // neutro para no competir con el único botón primario de la pantalla.
      isActive ? 'text-ink-900 font-semibold bg-ink-100' : 'text-ink-500 hover:text-ink-900',
    );

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/iniciar-sesion', { replace: true });
  }

  return (
    <header id="navbar" className="navbar sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/80 backdrop-blur-md">
      <div id="navbar__bar" className="navbar__bar mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div id="navbar__left" className="navbar__left flex shrink-0 items-center gap-8">
          <Logo />
          {/* Sin membresía al día esas secciones rebotan a las opciones de compra. */}
          {tieneAcceso && (
          <nav id="navbar__nav" className="navbar__nav hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Explorar
            </NavLink>
            <NavLink to="/negocios" className={navLinkClass}>
              Negocios
            </NavLink>
            <Link to="/?pop=1" className={navLinkClass({ isActive: false })}>
              Más populares
            </Link>
            <Link to="/?stock=1" className={navLinkClass({ isActive: false })}>
              Disponibles
            </Link>
            {isSeller && (
              <NavLink to="/panel" className={navLinkClass}>
                Mi negocio
              </NavLink>
            )}
          </nav>
          )}
        </div>

        <div id="navbar__right" className="navbar__right hidden min-w-0 flex-1 md:flex items-center justify-end gap-3">
          <HeaderSearch ambito="desktop" />
          <ThemeToggle />
          <Link
            to="/favoritos"
            aria-label="Favoritos"
            id="navbar__favorites" className="navbar__favorites relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <Heart size={18} />
            {favorites.length > 0 && (
              <span id="navbar__favorites-count" className="navbar__favorites-count absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-semibold text-ink-50">
                {favorites.length}
              </span>
            )}
          </Link>
          {/* Sin sesión no se llega hasta aquí: la cabecera solo existe dentro
              de la zona autenticada, así que no hay botones de acceso. */}
          {user && (
            <div id="navbar__user" className="navbar__user relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                id="navbar__user-button" className="navbar__user-button relative flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-3 hover:border-ink-300 transition-colors"
              >
                <span id="navbar__user-initials" className="navbar__user-initials flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {initials(user.username)}
                </span>
                <span id="navbar__user-name" className="navbar__user-name text-sm font-medium text-ink-800 max-w-[8rem] truncate">{user.username}</span>
                <ChevronDown size={14} className="text-ink-400" />
                {/* Los avisos sin leer, en la esquina del botón: es lo que
                    hace mirar el menú de la cuenta. */}
                {sinLeer > 0 && (
                  <span
                    id="navbar__user-badge"
                    aria-label={`${sinLeer} aviso${sinLeer === 1 ? '' : 's'} sin leer`}
                    className="navbar__user-badge absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary-dark px-1 text-[10px] font-bold text-white"
                  >
                    {sinLeer > 9 ? '9+' : sinLeer}
                  </span>
                )}
              </button>
              {menuOpen && (
                <div id="navbar__menu" className="navbar__menu absolute right-0 mt-2 w-80 animate-fade-up rounded-xl border border-ink-200 bg-ink-50 p-1.5 shadow-lift">
                  <div id="navbar__menu-header" className="navbar__menu-header px-3 py-2 border-b border-ink-100 mb-1">
                    <p id="navbar__menu-username" className="navbar__menu-username text-sm font-medium text-ink-900 truncate">{user.username}</p>
                    <p id="navbar__menu-role" className="navbar__menu-role text-xs text-ink-500">{isSeller ? 'Cuenta de vendedor' : 'Cuenta de comprador'}</p>
                  </div>

                  <div id="navbar__menu-inbox" className="navbar__menu-inbox mb-1 border-b border-ink-100 pb-1">
                    <NotificationsPanel />
                  </div>
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    id="navbar__menu-account" className="navbar__menu-account flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <LayoutGrid size={15} /> Explorar
                  </Link>
                  <Link
                    to="/favoritos"
                    onClick={() => setMenuOpen(false)}
                    id="navbar__menu-favorites" className="navbar__menu-favorites flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <Heart size={15} /> Favoritos
                  </Link>
                  {isSeller ? (
                    <Link
                      to="/panel"
                      onClick={() => setMenuOpen(false)}
                      id="navbar__menu-dashboard" className="navbar__menu-dashboard flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <Store size={15} /> Mi negocio
                    </Link>
                  ) : (
                    <Link
                      to="/vender"
                      onClick={() => setMenuOpen(false)}
                      id="navbar__menu-publish" className="navbar__menu-publish flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <Store size={15} /> Vender en Agora
                    </Link>
                  )}
                  <Link
                    to="/cuenta"
                    onClick={() => setMenuOpen(false)}
                    id="navbar__menu-plans" className="navbar__menu-plans flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <UserIcon size={15} /> Mi cuenta
                  </Link>
                  <button
                    onClick={handleLogout}
                    id="navbar__menu-logout" className="navbar__menu-logout flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"
                  >
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div id="navbar__mobile-actions" className="navbar__mobile-actions flex items-center gap-1 md:hidden">
          <HeaderSearch ambito="mobile" />
          <ThemeToggle id="theme-toggle--mobile" />
          <button id="navbar__mobile-toggle" className="navbar__mobile-toggle p-2 text-ink-700" onClick={() => setMobileOpen((v) => !v)} aria-label="Menú">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="navbar__mobile-menu" className="navbar__mobile-menu md:hidden border-t border-ink-200 bg-ink-50 px-4 py-3 animate-fade-in">
          <div id="navbar__mobile-list" className="navbar__mobile-list flex flex-col gap-1">
            <Link to="/" onClick={() => setMobileOpen(false)} id="navbar__mobile-explore" className="navbar__mobile-explore rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Explorar
            </Link>
            <Link to="/negocios" onClick={() => setMobileOpen(false)} id="navbar__mobile-businesses" className="navbar__mobile-businesses rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Negocios
            </Link>
            <Link to="/?pop=1" onClick={() => setMobileOpen(false)} id="navbar__mobile-popular" className="navbar__mobile-popular rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Más populares
            </Link>
            <Link to="/?stock=1" onClick={() => setMobileOpen(false)} id="navbar__mobile-stock" className="navbar__mobile-stock rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Disponibles
            </Link>
            <Link
              to="/favoritos"
              onClick={() => setMobileOpen(false)}
              id="navbar__mobile-favorites" className="navbar__mobile-favorites flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Favoritos
              {favorites.length > 0 && <span id="navbar__mobile-favorites-count" className="navbar__mobile-favorites-count text-xs text-ink-400">{favorites.length}</span>}
            </Link>
            {isAuthenticated && (
              <>
                {isSeller ? (
                  <Link to="/panel" onClick={() => setMobileOpen(false)} id="navbar__mobile-dashboard" className="navbar__mobile-dashboard rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                    Mi negocio
                  </Link>
                ) : (
                  <Link to="/vender" onClick={() => setMobileOpen(false)} id="navbar__mobile-sell" className="navbar__mobile-sell rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                    Vender en Agora
                  </Link>
                )}
                <Link to="/cuenta" onClick={() => setMobileOpen(false)} id="navbar__mobile-account" className="navbar__mobile-account rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                  Mi cuenta
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  id="navbar__mobile-logout" className="navbar__mobile-logout rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-500/10"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
