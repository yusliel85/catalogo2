import React, { useState } from 'react';
import { Info, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface AdminAboutProps {
  description: string;
  setDescription: (desc: string) => void;
}

export function AdminAbout({ description, setDescription }: AdminAboutProps) {
  const [saved, setSaved] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-about-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
            <Info className="w-5 h-5 text-amber-700 animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Acerca de la Aplicación
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans italic">
                {description ? `"${description}"` : 'Sin descripción de nosotros todavía'}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Personaliza la presentación de tu negocio que los clientes verán.</p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Texto de Presentación / Eslogan
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Catálogo de exhibición de artículos variados en madera..."
                rows={5}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-lg focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none resize-none leading-relaxed text-stone-800 font-medium"
              />
              <p className="text-[10px] text-stone-400 mt-1 leading-normal">
                Este es el mensaje de bienvenida y filosofía de tu marca. El uso de saltos de línea ayuda a estructurar los párrafos de forma elegante.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100">
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                saved 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-stone-900 text-[#fafaf9] hover:bg-stone-850'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white animate-bounce" />
                  ¡Descripción Guardada con Éxito!
                </>
              ) : (
                'Guardar Sección Acerca de'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
