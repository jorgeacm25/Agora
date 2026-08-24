import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarouselSlide {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: { label: string; to: string };
  gradient: string;
}

const AUTO_ADVANCE_MS = 5500;

export function Carousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrusel"
    >
      <div className="relative h-[340px] sm:h-[400px]">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              slide.gradient,
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            aria-hidden={i !== index}
          >
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm">
                {slide.icon}
              </div>
              <span className="mt-4 text-xs font-medium uppercase tracking-wider text-white/50">{slide.eyebrow}</span>
              <h2 className="mt-2 max-w-lg text-2xl sm:text-3xl font-semibold leading-tight text-white">{slide.title}</h2>
              <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-white/60">{slide.description}</p>
              <Link to={slide.cta.to} className="mt-6">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-transform hover:scale-[1.02]">
                  {slide.cta.label}
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
      >
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            onClick={() => goTo(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60')}
          />
        ))}
      </div>
    </section>
  );
}
