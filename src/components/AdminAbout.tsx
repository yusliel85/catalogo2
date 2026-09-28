import React, { useState, useRef } from 'react';
import { Info, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminAboutProps {
  description: string;
  setDescription: (desc: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminAbout({ description, setDescription, isOpen, onToggle }: AdminAboutProps) {
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
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 text-base">Descripción del Catálogo</h3>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Descripción principal, manifiesto de marca o historia
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex flex-wrap items-center justify-between gap-1">
              <span>Texto descriptivo general:</span>
              <span className="text-[11px] text-stone-400 font-normal">Soporta saltos de línea</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe la historia o presentación de tu catálogo..."
              className="w-full min-w-0 text-sm p-3 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
