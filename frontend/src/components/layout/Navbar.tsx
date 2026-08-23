import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LayoutGrid, LogOut, Store, User as UserIcon, ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { cn, initials } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
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
      isActive ? 'text-primary bg-primary-light' : 'text-ink-500 hover:text-ink-900',
    );

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Explorar
            </NavLink>
            {isSeller && (
              <NavLink to="/panel" className={navLinkClass}>
                Mi tienda
              </NavLink>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/favoritos"
            aria-label="Favoritos"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <Heart size={18} />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-semibold text-white">
                {favorites.length}
              </span>
            )}
          </Link>
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-3 hover:border-ink-300 transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {initials(user.username)}
                </span>
                <span className="text-sm font-medium text-ink-800 max-w-[8rem] truncate">{user.username}</span>
                <ChevronDown size={14} className="text-ink-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 animate-fade-up rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift">
                  <div className="px-3 py-2 border-b border-ink-100 mb-1">
                    <p className="text-sm font-medium text-ink-900 truncate">{user.username}</p>
                    <p className="text-xs text-ink-500">{isSeller ? 'Cuenta de vendedor' : 'Cuenta de comprador'}</p>
                  </div>
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <LayoutGrid size={15} /> Explorar
                  </Link>
                  <Link
                    to="/favoritos"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <Heart size={15} /> Favoritos
                  </Link>
                  {isSeller ? (
                    <Link
                      to="/panel"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <Store size={15} /> Mi tienda
                    </Link>
                  ) : (
                    <Link
                      to="/vender"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <Store size={15} /> Vender en Agora
                    </Link>
                  )}
                  <Link
                    to="/cuenta"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <UserIcon size={15} /> Mi cuenta
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/iniciar-sesion')}>
                Iniciar sesión
              </Button>
              <Button size="sm" onClick={() => navigate('/registrarse')}>
                Crear cuenta
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-ink-700" onClick={() => setMobileOpen((v) => !v)} aria-label="Menú">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-ink-200 bg-white px-4 py-3 animate-fade-in">
          <div className="flex flex-col gap-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Explorar
            </Link>
            <Link
              to="/favoritos"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Favoritos
              {favorites.length > 0 && <span className="text-xs text-ink-400">{favorites.length}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                {isSeller ? (
                  <Link to="/panel" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                    Mi tienda
                  </Link>
                ) : (
                  <Link to="/vender" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                    Vender en Agora
                  </Link>
                )}
                <Link to="/cuenta" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                  Mi cuenta
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/iniciar-sesion')}>
                  Iniciar sesión
                </Button>
                <Button className="flex-1" onClick={() => navigate('/registrarse')}>
                  Crear cuenta
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
