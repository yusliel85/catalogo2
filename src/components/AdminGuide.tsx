import React, { useState, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminGuideProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminGuide({ isOpen, onToggle }: AdminGuideProps = {}) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleHeaderToggle = () => {
    const willOpen = isCollapsed;
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
    if (willOpen) {
      scrollToAdminSection(sectionRef.current);
    }
  };

  return (
    <div
      ref={sectionRef}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-sm transition-all overflow-hidden"
    >
      <button
        type="button"
        onClick={handleHeaderToggle}
        className="w-full flex items-center justify-between text-left group cursor-pointer gap-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-700 group-hover:bg-amber-100 transition-colors shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-base">Guía de Uso</h3>
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full text-xs font-semibold">
                5 Pasos
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Pasos recomendados para configurar y publicar tu catálogo
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-[11px] flex items-center justify-center mb-2">
                  1
                </span>
                <h4 className="font-bold text-stone-900 mb-1">Diseño y Cabecera</h4>
                <p className="text-stone-500 leading-relaxed">
                  Personaliza el nombre, subtítulo, logo, banner, colores y estilo visual de tu catálogo.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-[11px] flex items-center justify-center mb-2">
                  2
                </span>
                <h4 className="font-bold text-stone-900 mb-1">Categorías y Etiquetas</h4>
                <p className="text-stone-500 leading-relaxed">
                  Define las secciones y palabras clave para que tus clientes filtren fácilmente.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-[11px] flex items-center justify-center mb-2">
                  3
                </span>
                <h4 className="font-bold text-stone-900 mb-1">Carga de Productos</h4>
                <p className="text-stone-500 leading-relaxed">
                  Añade tus artículos con fotos reales, precios, medidas, material y código SKU.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-[11px] flex items-center justify-center mb-2">
                  4
                </span>
                <h4 className="font-bold text-stone-900 mb-1">Contacto y WhatsApp</h4>
                <p className="text-stone-500 leading-relaxed">
                  Configura tu teléfono de WhatsApp y las plantillas de mensajes para consultas.
                </p>
              </div>
            </div>

            {/* 5TO PUNTO REQUERIDO */}
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center mb-2">
                  5
                </span>
                <h4 className="font-bold text-amber-950 mb-1">Exportación Final</h4>
                <p className="text-amber-900/90 leading-relaxed">
                  Cuando ya esté todo listo, Exportar el HTML. Es un fichero compacto con toda la información necesaria para poder usarlo a gusto de cada cual.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
