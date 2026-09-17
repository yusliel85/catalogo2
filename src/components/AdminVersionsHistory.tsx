import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Tag, Calendar, ShieldCheck } from 'lucide-react';
import { APP_VERSIONS_HISTORY } from '../versionsData';

export function AdminVersionsHistory() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const currentVersion = APP_VERSIONS_HISTORY.find(v => v.isCurrent) || APP_VERSIONS_HISTORY[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-versions-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
            <History className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
                Historial de Versiones
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100/70 text-indigo-800 border border-indigo-200">
                <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                v{currentVersion.version}
              </span>
            </div>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                <span className="font-semibold text-stone-700">v{currentVersion.version}</span>: {currentVersion.title} • Clic para ver historial completo
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">
                Registro de cambios, mejoras y correcciones implementadas en cada versión del catálogo.
              </p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 space-y-4">
          <div className="space-y-3">
            {APP_VERSIONS_HISTORY.map((ver) => (
              <div 
                key={ver.version} 
                className={`p-4 rounded-xl border transition-all ${
                  ver.isCurrent 
                    ? 'bg-gradient-to-r from-indigo-50/40 via-white to-indigo-50/20 border-indigo-200 shadow-xs' 
                    : 'bg-stone-50/50 border-stone-150 hover:bg-stone-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono tracking-tight ${
                      ver.isCurrent 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      v{ver.version}
                    </span>
                    <h3 className="font-bold text-xs text-stone-900">
                      {ver.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-sans flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {ver.date}
                    </span>
                    {ver.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ver.isCurrent 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {ver.badge}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 pl-1">
                  {ver.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-stone-600 leading-relaxed font-sans">
                      <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${ver.isCurrent ? 'text-indigo-600' : 'text-stone-400'}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[11px] text-stone-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Cada nueva versión estable queda registrada consecutivamente en este historial para control y seguimiento.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
