import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      id="scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className={cn(
        'fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 text-ink-700 shadow-lift ring-1 ring-ink-200 transition-all duration-300',
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none',
      )}
    >
      <ArrowUp size={18} />
    </button>
  );
}
