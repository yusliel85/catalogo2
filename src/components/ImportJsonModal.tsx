import React, { useState } from 'react';
import { X, FileJson, Upload, Code, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportText: (jsonText: string) => boolean;
}

export function ImportJsonModal({ isOpen, onClose, onImportText }: ImportJsonModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || !content.trim()) {
        setError('El archivo seleccionado está vacío.');
        return;
      }
      setJsonText(content);
      // Automatically process
      const success = onImportText(content);
      if (success) {
        setJsonText('');
        onClose();
      } else {
        setError('El contenido del archivo no pudo ser procesado como un catálogo válido.');
      }
    };
    reader.onerror = () => {
      setError('Error al leer el archivo seleccionado.');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitPastedText = () => {
    setError(null);
    if (!jsonText.trim()) {
      setError('Por favor selecciona un archivo o pega el código JSON antes de continuar.');
      return;
    }
    const success = onImportText(jsonText);
    if (success) {
      setJsonText('');
      onClose();
    } else {
      setError('El texto ingresado no tiene un formato JSON válido de catálogo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-800 rounded-xl">
              <FileJson className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-100">Cargar / Restaurar Catálogo (.JSON o .HTML)</h3>
              <p className="text-[11px] text-stone-400">Selecciona tu archivo de respaldo .json o tu archivo index.html exportado</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Option 1: File dropzone & file picker */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer relative ${
              isDragging 
                ? 'border-amber-500 bg-amber-50/50 scale-[1.01]' 
                : 'border-stone-300 bg-stone-50 hover:bg-stone-100/70 hover:border-stone-400'
            }`}
          >
            <input 
              type="file" 
              accept=".json,.html,.htm,application/json,text/html,text/plain,*/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-full">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-800">
                Haz clic aquí para seleccionar tu archivo (.json o .html)
              </p>
              <p className="text-[11px] text-stone-500">
                o arrastra y suelta tu archivo <span className="font-semibold text-amber-700">.json</span> o <span className="font-semibold text-amber-700">.html exportado</span> aquí
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">o pega el código directo</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          {/* Option 2: Textarea for direct JSON or HTML paste */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-stone-500" />
              <span>Código JSON o HTML directo:</span>
            </label>
            <textarea
              rows={5}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Pega aquí el contenido de tu archivo .json o el código de tu archivo .html exportado...'
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Error notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmitPastedText}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Cargar y Restaurar Catálogo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
