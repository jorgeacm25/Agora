export function Footer() {
  return (
    <footer id="site-footer" className="site-footer border-t border-ink-200/70 bg-ink-50 px-4 py-4 text-center sm:px-6">
      {/* ink-400 sobre el fondo de página da 2,43:1; ink-500 llega a 5,4:1. */}
      <small id="site-footer__copyright" className="site-footer__copyright text-xs text-ink-500">© {new Date().getFullYear()} Agora</small>
    </footer>
  );
}
