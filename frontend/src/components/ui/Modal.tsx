import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div id="modal" className="modal fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        id="modal__backdrop" className="modal__backdrop absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div id="modal__panel" className="modal__panel relative w-full max-w-md animate-fade-up rounded-2xl bg-ink-50 p-6 shadow-lift">
        <div id="modal__header" className="modal__header mb-4 flex items-center justify-between">
          {title && <h3 id="modal__title" className="modal__title text-lg font-semibold text-ink-900">{title}</h3>}
          <button
            onClick={onClose}
            id="modal__close" className="modal__close ml-auto rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
