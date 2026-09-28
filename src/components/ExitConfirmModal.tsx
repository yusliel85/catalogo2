import React from 'react';
import { LogOut } from 'lucide-react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
  primaryColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
}

export function ExitConfirmModal({
  isOpen,
  onCancel,
  onConfirmExit,
  primaryColor = '#8c6d58',
  fontFamily = 'serif'
}: ExitConfirmModalProps) {
  if (!isOpen) return null;

  const fontClass =
    fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div
      id="exit-confirm-modal-overlay"
      style={{ overscrollBehavior: 'contain' }}
      className="modal-overscroll-contain overscroll-contain fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 select-none"
      onClick={onCancel}
    >
      <div
        id="exit-confirm-modal-card"
        style={{ overscrollBehavior: 'contain' }}
        className={`modal-overscroll-contain overscroll-contain bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-stone-200/80 dark:border-stone-800 transform transition-all scale-100 ${fontClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <LogOut className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
          ¡Estás saliendo del Catálogo!
        </h3>

        <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 leading-relaxed">
          ¿Estás seguro que deseas salir?
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            id="btn-exit-cancel"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-exit-confirm"
            onClick={onConfirmExit}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
