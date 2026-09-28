import React, { useState, useRef, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Tag } from 'lucide-react';
import { APP_VERSIONS_HISTORY } from '../versionsData';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminVersionsHistoryProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminVersionsHistory({ isOpen, onToggle }: AdminVersionsHistoryProps = {}) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed) {
      scrollToAdminSection(sectionRef.current, 30);
    }
  }, [isCollapsed]);

  const handleHeaderToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed(!localCollapsed);
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
          <div className="p-2.5 bg-stone-100 rounded-xl text-stone-700 group-hover:bg-stone-200 transition-colors shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-base">Historial de Versiones</h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[11px] font-bold">
                v{APP_VERSIONS_HISTORY[0]?.version || '21.0'} Actual
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Registro de mejoras continuas, arquitectura y estabilidad
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
          {APP_VERSIONS_HISTORY.map((rel) => (
            <div
              key={rel.version}
              className={`p-4 rounded-xl border ${
                rel.isCurrent
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-stone-50 border-stone-200/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">Versión {rel.version}</span>
                  {rel.isCurrent && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                      ACTUAL
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-500">{rel.date}</span>
              </div>
              <h4 className="text-xs font-semibold text-stone-800 mb-2">{rel.title}</h4>
              <ul className="space-y-1.5">
                {rel.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-stone-600 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
