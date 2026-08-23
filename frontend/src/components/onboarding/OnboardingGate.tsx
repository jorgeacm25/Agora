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
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="p-6">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="relative mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-primary-light">
          <MapPin size={56} strokeWidth={1.6} className="text-primary" fill="#0EA5E9" />
          <span className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-ink-900 text-white">
            <Search size={18} />
          </span>
        </div>

        <h1 className="max-w-xs text-2xl font-bold leading-tight text-ink-900">
          Encuentra lo que buscas, justo al lado
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
          Activa tu ubicación para ver primero lo que hay disponible cerca de ti.
        </p>

        <div className="mt-8 w-full max-w-xs">
          {phase === 'detected' ? (
            <div className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-600">
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
            <p className="mt-2.5 text-xs text-red-500">No pudimos acceder a tu ubicación. Puedes continuar sin ella.</p>
          )}
        </div>

        <button onClick={finish} className="mt-5 text-sm font-medium text-ink-500 hover:text-primary">
          Continuar sin ubicación
        </button>
      </div>
    </div>
  );
}
