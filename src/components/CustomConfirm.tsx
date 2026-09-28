import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface CustomConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CustomConfirm({
  isOpen,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel
}: CustomConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-100 transform transition-all animate-scaleUp">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            {isDestructive ? <AlertTriangle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-bold text-stone-900 leading-tight">{title}</h3>
        </div>
        <p className="text-stone-600 text-sm mb-6 whitespace-pre-line leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-stone-900 hover:bg-stone-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
