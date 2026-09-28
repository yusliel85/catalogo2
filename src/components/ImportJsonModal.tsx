import React, { useState } from 'react';
import { X, FileJson, Upload, AlertCircle } from 'lucide-react';
import { restoreFromJSONText } from '../lib/backupService';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportText: (jsonText: string) => void;
}

export function ImportJsonModal({ isOpen, onClose, onImportText }: ImportJsonModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setJsonInput(text);
      }
    };
    reader.onerror = () => setError('Error al leer el archivo seleccionado.');
    reader.readAsText(file);
  };

  const handleProcess = () => {
    if (!jsonInput.trim()) {
      setError('Por favor pega el contenido JSON o sube un archivo.');
      return;
    }
    try {
      restoreFromJSONText(jsonInput);
      onImportText(jsonInput);
      setJsonInput('');
      setError(null);
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message || 'El texto no es un respaldo JSON válido. Revisa el formato e inténtalo nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-stone-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-stone-900">Restaurar Catálogo desde JSON</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 flex-1 overflow-y-auto">
          <p className="text-xs text-stone-500 leading-relaxed">
            Carga tu archivo de respaldo JSON (100% offline) para recuperar automáticamente la información de empresa, mensajes de WhatsApp, datos del catálogo, menú de opciones, productos con sus imágenes, categorías, etiquetas, promociones y diseño.
          </p>

          <div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-4 cursor-pointer transition-colors bg-stone-50/50 hover:bg-amber-50/20">
              <Upload className="w-6 h-6 text-stone-400 mb-1" />
              <span className="text-xs font-semibold text-stone-700">Seleccionar archivo .json</span>
              <span className="text-[11px] text-stone-400">o arrástralo aquí</span>
              <input type="file" accept=".json,.html" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              O pega el texto JSON directamente:
            </label>
            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
              }}
              placeholder='{"version": "26.0", "project": { ... }}'
              className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProcess}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Restaurar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
