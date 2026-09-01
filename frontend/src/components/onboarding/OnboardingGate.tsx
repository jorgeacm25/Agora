import { useState } from 'react';
import type { ReactNode } from 'react';
import { Search, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';

const STORAGE_KEY = 'agora_onboarded';

type Phase = 'idle' | 'loading' | 'detected' | 'error';

export function OnboardingGate({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [phase, setPhase] = useState<Phase>('idle');

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage unavailable — just proceed without persisting the flag
    }
    setDismissed(true);
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      setPhase('error');
      return;
    }
    setPhase('loading');
    navigator.geolocation.getCurrentPosition(
      () => {
        setPhase('detected');
        setTimeout(finish, 700);
      },
      () => setPhase('error'),
      { timeout: 8000 },
    );
  }

  if (dismissed) return <>{children}</>;

  return (
    <div id="onboarding" className="onboarding fixed inset-0 z-50 flex flex-col bg-ink-50">
      <div id="onboarding__topbar" className="onboarding__topbar p-6">
        <Logo />
      </div>

      <div id="onboarding__body" className="onboarding__body flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div id="onboarding__art" className="onboarding__art relative mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-primary-light">
          <MapPin size={56} strokeWidth={1.6} className="text-primary" />
          <span id="onboarding__badge" className="onboarding__badge absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full border-4 border-ink-50 bg-neutral-900 text-white">
            <Search size={18} />
          </span>
        </div>

        <h1 id="onboarding__title" className="onboarding__title max-w-xs text-2xl font-bold leading-tight text-ink-900">
          Encuentra lo que buscas, justo al lado
        </h1>
        <p id="onboarding__text" className="onboarding__text mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
          Activa tu ubicación para ver primero lo que hay disponible cerca de ti.
        </p>

        <div id="onboarding__actions" className="onboarding__actions mt-8 w-full max-w-xs">
          {phase === 'detected' ? (
            <div id="onboarding__granted" className="onboarding__granted flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 text-sm font-semibold text-emerald-600">
              <CheckCircle2 size={18} /> Ubicación detectada
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              loading={phase === 'loading'}
              icon={<MapPin size={17} />}
              onClick={handleLocate}
            >
              Usar mi ubicación
            </Button>
          )}
          {phase === 'error' && (
            <p id="onboarding__error" className="onboarding__error mt-2.5 text-xs text-red-500">No pudimos acceder a tu ubicación. Puedes continuar sin ella.</p>
          )}
        </div>

        <button onClick={finish} id="onboarding__skip" className="onboarding__skip mt-5 text-sm font-medium text-ink-500 hover:text-primary">
          Continuar sin ubicación
        </button>
      </div>
    </div>
  );
}
