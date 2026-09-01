import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMotion } from '@/context/MotionContext';

export interface CarouselSlide {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: { label: string; to: string };
  gradient: string;
}

const AUTO_ADVANCE_MS = 7200;

export function Carousel({ slides }: { slides: CarouselSlide[] }) {
  const { reducirMovimiento } = useMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // El avance solo también es movimiento no pedido: se queda quieto cuando la
  // preferencia está activa, y entonces se pasa de diapositiva a mano.
  useEffect(() => {
    if (paused || reducirMovimiento) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, reducirMovimiento, slides.length]);

  return (
    <section
      id="carousel" className="carousel relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrusel"
    >
      <div id="carousel__track" className="carousel__track relative h-[340px] sm:h-[400px]">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            id={`carousel__slide--${i}`}
            className={cn(
              'carousel__slide',
              'absolute inset-0 transition-opacity duration-700 ease-out',
              slide.gradient,
              'gradient-drift',
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            aria-hidden={i !== index}
            // Sin `inert`, la diapositiva oculta sigue siendo alcanzable con el
            // tabulador aunque esté marcada como oculta: son los 3 fallos de
            // aria-hidden-focus que sacaba axe.
            inert={i !== index}
          >
            <div id={`carousel__grid--${i}`} className="carousel__grid absolute inset-0 bg-grid opacity-40" />
            <div id={`carousel__content--${i}`} className="carousel__content relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
              <div id={`carousel__icon--${i}`} className="carousel__icon flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm">
                {slide.icon}
              </div>
              {/* Sobre el fucsia, el blanco al 50-60% se quedaba corto de
                  contraste; con los degradados cruzados se nota más aún. */}
              <span id={`carousel__eyebrow--${i}`} className="carousel__eyebrow mt-4 text-xs font-medium uppercase tracking-wider text-white/75">{slide.eyebrow}</span>
              <h2 id={`carousel__title--${i}`} className="carousel__title mt-2 max-w-lg text-2xl sm:text-3xl font-semibold leading-tight text-white">{slide.title}</h2>
              <p id={`carousel__description--${i}`} className="carousel__description mt-3 max-w-md text-sm sm:text-base leading-relaxed text-white/90">{slide.description}</p>
              <Link to={slide.cta.to} id={`carousel__cta--${i}`} className="carousel__cta mt-6">
                <span id={`carousel__cta-label--${i}`} className="carousel__cta-label inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-transform hover:scale-[1.02]">
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
        id="carousel__prev" className="carousel__prev absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente"
        id="carousel__next" className="carousel__next absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
      >
        <ChevronRight size={18} />
      </button>

      <div id="carousel__dots" className="carousel__dots absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            onClick={() => goTo(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            id={`carousel__dot--${i}`}
            className={cn('carousel__dot h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60')}
          />
        ))}
      </div>
    </section>
  );
}
