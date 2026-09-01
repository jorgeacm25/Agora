import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'agora_motion';
const CONSULTA = '(prefers-reduced-motion: reduce)';

function preferenciaDelSistema(): boolean {
  try {
    return window.matchMedia(CONSULTA).matches;
  } catch {
    return false;
  }
}

function preferenciaGuardada(): boolean | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : raw === 'reduce';
  } catch {
    return null;
  }
}

interface MotionContextValue {
  /** true = la aplicación no anima nada. */
  reducirMovimiento: boolean;
  /** Lo que pide el sistema operativo, para poder decirlo en la interfaz. */
  loPideElSistema: boolean;
  /** null = se sigue al sistema; true/false = el usuario lo eligió a mano. */
  eleccionManual: boolean | null;
  setReducirMovimiento: (valor: boolean) => void;
  seguirAlSistema: () => void;
}

const MotionContext = createContext<MotionContextValue | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [eleccionManual, setEleccionManual] = useState<boolean | null>(preferenciaGuardada);
  const [loPideElSistema, setLoPideElSistema] = useState(preferenciaDelSistema);

  // El sistema puede cambiar mientras la app está abierta; mientras no haya
  // elección manual, se sigue lo que diga.
  useEffect(() => {
    let media: MediaQueryList;
    try {
      media = window.matchMedia(CONSULTA);
    } catch {
      return;
    }
    const alCambiar = (e: MediaQueryListEvent) => setLoPideElSistema(e.matches);
    media.addEventListener('change', alCambiar);
    return () => media.removeEventListener('change', alCambiar);
  }, []);

  const reducirMovimiento = eleccionManual ?? loPideElSistema;

  // Una sola clase en <html>: de ahí cuelga el apagado de animaciones en CSS.
  useEffect(() => {
    document.documentElement.classList.toggle('motion-off', reducirMovimiento);
  }, [reducirMovimiento]);

  const setReducirMovimiento = useCallback((valor: boolean) => {
    setEleccionManual(valor);
    try {
      localStorage.setItem(STORAGE_KEY, valor ? 'reduce' : 'full');
    } catch {
      // sin almacenamiento la preferencia dura lo que la pestaña
    }
  }, []);

  const seguirAlSistema = useCallback(() => {
    setEleccionManual(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // nada que limpiar
    }
  }, []);

  return (
    <MotionContext.Provider
      value={{ reducirMovimiento, loPideElSistema, eleccionManual, setReducirMovimiento, seguirAlSistema }}
    >
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotion debe usarse dentro de <MotionProvider>');
  return ctx;
}
