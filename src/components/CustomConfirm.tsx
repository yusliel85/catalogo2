import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface CustomConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function CustomConfirm({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}: CustomConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4" id="custom-confirm-modal">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 flex gap-3.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg h-fit flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-stone-800">{title}</h3>
            <p className="text-xs text-stone-500 mt-1 line-clamp-4 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="p-3 bg-stone-50 flex gap-2 justify-end border-t border-stone-100">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-stone-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
