import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  contarSinLeer,
  leerBandeja,
  marcarLeido as marcarLeidoEnAlmacen,
  marcarTodoLeido as marcarTodoLeidoEnAlmacen,
  ordenarPorFecha,
} from '@/lib/notificaciones';
import type { Aviso } from '@/lib/notificaciones';

interface NotificationsValue {
  avisos: Aviso[];
  sinLeer: number;
  /** Había avisos sin leer al abrir la sesión: es lo que anuncia el cartel. */
  avisaAlEntrar: boolean;
  yaAvisado: () => void;
  marcarLeido: (id: string) => void;
  marcarTodoLeido: () => void;
  recargar: () => void;
}

const NotificationsContext = createContext<NotificationsValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [avisaAlEntrar, setAvisaAlEntrar] = useState(false);

  const recargar = useCallback(() => {
    if (!user) {
      setAvisos([]);
      return;
    }
    setAvisos(ordenarPorFecha(leerBandeja(user.id)));
  }, [user]);

  // Al entrar se mira una sola vez si hay algo sin leer: el cartel anuncia lo
  // que había al llegar, no cada aviso que aparezca después.
  useEffect(() => {
    if (!user) {
      setAvisos([]);
      setAvisaAlEntrar(false);
      return;
    }
    const bandeja = ordenarPorFecha(leerBandeja(user.id));
    setAvisos(bandeja);
    setAvisaAlEntrar(contarSinLeer(bandeja) > 0);
  }, [user]);

  const valor = useMemo<NotificationsValue>(
    () => ({
      avisos,
      sinLeer: contarSinLeer(avisos),
      avisaAlEntrar,
      yaAvisado: () => setAvisaAlEntrar(false),
      marcarLeido: (id) => user && setAvisos(marcarLeidoEnAlmacen(user.id, id)),
      marcarTodoLeido: () => user && setAvisos(marcarTodoLeidoEnAlmacen(user.id)),
      recargar,
    }),
    [avisos, avisaAlEntrar, user, recargar],
  );

  return <NotificationsContext.Provider value={valor}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications debe usarse dentro de NotificationsProvider');
  return ctx;
}
