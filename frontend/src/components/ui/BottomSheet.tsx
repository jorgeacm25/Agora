import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  peekHeight?: number; // fraction of viewport height, e.g. 0.55
  fullHeight?: number; // fraction of viewport height, e.g. 0.92
  children: ReactNode;
  footer?: ReactNode;
  /** When false, renders without a dismiss backdrop and never fully closes — just snaps back to the peek height. */
  dismissible?: boolean;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  peekHeight = 0.55,
  fullHeight = 0.92,
  children,
  footer,
  dismissible = true,
  className,
}: BottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const [dragPx, setDragPx] = useState<number | null>(null);
  const dragState = useRef<{ startY: number; startHeight: number } | null>(null);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const targetHeight = expanded ? fullHeight : peekHeight;

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      const vh = window.innerHeight;
      dragState.current = { startY: e.clientY, startHeight: (expanded ? fullHeight : peekHeight) * vh };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [expanded, fullHeight, peekHeight],
  );

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragState.current) return;
    const vh = window.innerHeight;
    const delta = dragState.current.startY - e.clientY;
    const next = Math.min(vh * 0.98, Math.max(vh * 0.18, dragState.current.startHeight + delta));
    setDragPx(next);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragState.current) return;
    const vh = window.innerHeight;
    const current = dragPx ?? dragState.current.startHeight;
    const peekPx = peekHeight * vh;
    const fullPx = fullHeight * vh;

    if (dismissible && current < peekPx * 0.6) {
      onClose();
    } else if (current > (peekPx + fullPx) / 2) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
    dragState.current = null;
    setDragPx(null);
  }, [dragPx, peekHeight, fullHeight, onClose, dismissible]);

  if (!open) return null;

  const heightVh = dragPx !== null ? `${dragPx}px` : `${targetHeight * 100}vh`;

  return (
    <div id="sheet" className={cn('sheet', dismissible ? 'fixed inset-0 z-50' : 'absolute inset-0 z-20', className)}>
      {dismissible && <div id="sheet__backdrop" className="sheet__backdrop absolute inset-0 bg-black/45 animate-fade-in" onClick={onClose} />}
      <div
        id="sheet__panel" className="sheet__panel absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl bg-ink-50 shadow-lift animate-sheet-up"
        style={{ height: heightVh, transition: dragPx !== null ? 'none' : 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div
          id="sheet__handle" className="sheet__handle flex shrink-0 cursor-grab touch-none flex-col items-center pt-2.5 pb-1 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div id="sheet__grip" className="sheet__grip h-1.5 w-10 rounded-full bg-ink-200" />
        </div>

        {title && (
          <div id="sheet__header" className="sheet__header flex shrink-0 items-center justify-between px-5 pb-2 pt-1">
            <h2 id="sheet__title" className="sheet__title text-lg font-bold text-ink-900">{title}</h2>
          </div>
        )}

        <div id="sheet__body" className={cn('sheet__body flex-1 overflow-y-auto scrollbar-none px-5', !title && 'pt-1')}>{children}</div>

        {footer && <div id="sheet__footer" className="sheet__footer shrink-0 border-t border-ink-100 p-4">{footer}</div>}
      </div>
    </div>
  );
}
