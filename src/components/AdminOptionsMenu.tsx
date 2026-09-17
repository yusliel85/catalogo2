import React, { useState } from 'react';
import { MenuOptionItem } from '../types';
import { 
  Heart, Share2, Phone, MessageCircle, Building, Info, HelpCircle, 
  Sparkles, Gift, MapPin, Globe, BookOpen, Star, Mail, ShoppingBag, 
  Tags, Clock, ArrowUp, ArrowDown, Eye, EyeOff, Save, Check, RefreshCw,
  ChevronDown, ChevronUp
} from 'lucide-react';

// Map of support icons we can render dynamically
export const MENU_ICONS: Record<string, React.ComponentType<any>> = {
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Building,
  Info,
  HelpCircle,
  Sparkles,
  Gift,
  MapPin,
  Globe,
  BookOpen,
  Star,
  Mail,
  ShoppingBag,
  Tags,
  Clock
};

interface AdminOptionsMenuProps {
  menuOptions: MenuOptionItem[];
  setMenuOptions: (options: MenuOptionItem[]) => void;
}

export function AdminOptionsMenu({ menuOptions, setMenuOptions }: AdminOptionsMenuProps) {
  const [activeTab, setActiveTab] = useState<string>(menuOptions[0]?.id || 'favorites');
  const [savedOptionId, setSavedOptionId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Helper to reorder menu items
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= menuOptions.length) return;

    const updated = [...menuOptions];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setMenuOptions(updated);
    
    // Quick feedback
    showSaveFeedback('reorder');
  };

  const showSaveFeedback = (id: string) => {
    setSavedOptionId(id);
    setTimeout(() => setSavedOptionId(null), 1500);
  };

  // Helper to update specific option fields
  const updateOption = (id: string, updates: Partial<MenuOptionItem>) => {
    const updated = menuOptions.map(opt => {
      if (opt.id === id) {
        return { ...opt, ...updates };
      }
      return opt;
    });
    setMenuOptions(updated);
    showSaveFeedback(id);
  };

  // Helper to update step content for how_it_works
  const updateHowItWorksStep = (stepIndex: number, fields: { title?: string; desc?: string }) => {
    const option = menuOptions.find(o => o.id === 'how_it_works');
    if (!option) return;

    const steps = option.steps ? [...option.steps] : [];
    if (steps[stepIndex]) {
      steps[stepIndex] = { ...steps[stepIndex], ...fields };
    }

    updateOption('how_it_works', { steps });
  };

  const activeOption = menuOptions.find(opt => opt.id === activeTab);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200/80 font-sans transition-all duration-200" id="admin-options-menu-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
            <SettingsIcon className="w-5 h-5 text-indigo-700 animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Menú de Opciones
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                {`Botones activos: ${menuOptions.filter(o => o.visible).map(o => o.label).join(', ')}`}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Ajusta la posición de los botones, iconos, renómbralos o edita sus contenidos emergentes.</p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 flex flex-col">

      {/* REORDERING AND VISIBILITY PANEL */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/60 mb-6">
        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-3">
          Orden y Visibilidad de los Botones Flotantes
        </span>
        <div className="space-y-2">
          {menuOptions.map((opt, idx) => {
            const IconComp = MENU_ICONS[opt.iconName] || HelpCircle;
            return (
              <div 
                key={opt.id} 
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  activeTab === opt.id 
                    ? 'bg-white border-stone-300 shadow-sm ring-1 ring-stone-200' 
                    : 'bg-stone-100/50 hover:bg-stone-100 border-stone-200'
                }`}
              >
                {/* Drag-alike left handle and label */}
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-grow py-0.5"
                  onClick={() => setActiveTab(opt.id)}
                >
                  <div className="p-1 rounded bg-stone-200/80 text-stone-600">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-stone-800 font-semibold">{opt.label}</span>
                    <span className="text-[10px] text-stone-400 block font-normal">ID: {opt.id}</span>
                  </div>
                </div>

                {/* Controls (Visibility, Move Up/Down) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateOption(opt.id, { visible: !opt.visible })}
                    title={opt.visible ? 'Ocultar del menú' : 'Mostrar en el menú'}
                    className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                      opt.visible 
                        ? 'bg-stone-150 text-stone-700 hover:bg-stone-200 border-stone-250' 
                        : 'bg-red-50 text-red-500 hover:bg-red-100 border-red-200'
                    }`}
                  >
                    {opt.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white text-stone-600 cursor-pointer"
                    title="Subir posición"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === menuOptions.length - 1}
                    className="p-1.5 rounded-md bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white text-stone-600 cursor-pointer"
                    title="Bajar posición"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TAB CONTAINER (Pestañas horizontales para no alargar la pantalla) */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-3">
          Detalles de Contenido por Botón (Pestañas)
        </span>
        
        {/* Tabs Scroller */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-stone-200">
          {menuOptions.map(opt => {
            const IconComp = MENU_ICONS[opt.iconName] || HelpCircle;
            const isSelected = activeTab === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveTab(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected 
                    ? 'bg-stone-800 text-white border-stone-800 shadow-sm' 
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
                {!opt.visible && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" title="Oculto" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Detail Pane */}
        {activeOption && (
          <div className="border border-stone-200 rounded-xl p-5 bg-white space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-stone-800">
                  Editar: {activeOption.label}
                </h4>
                <p className="text-[10px] text-stone-400">ID de Opción: {activeOption.id}</p>
              </div>
              {savedOptionId === activeOption.id && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <Check className="w-3.5 h-3.5" /> Guardado
                </span>
              )}
            </div>

            {/* Label Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                  Etiqueta del Menú
                </label>
                <input
                  type="text"
                  value={activeOption.label}
                  onChange={e => updateOption(activeOption.id, { label: e.target.value })}
                  placeholder="Escribe el nombre de esta opción..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none font-semibold text-stone-800"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                  Icono Asociado
                </label>
                <div className="grid grid-cols-6 gap-1 border border-stone-200 rounded-lg p-1.5 bg-stone-50 max-h-24 overflow-y-auto">
                  {Object.keys(MENU_ICONS).map(iconKey => {
                    const TargetIcon = MENU_ICONS[iconKey];
                    const isSelected = activeOption.iconName === iconKey;
                    return (
                      <button
                        key={iconKey}
                        onClick={() => updateOption(activeOption.id, { iconName: iconKey })}
                        title={iconKey}
                        className={`p-1.5 rounded flex items-center justify-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-stone-800 text-white scale-110 shadow-sm' 
                            : 'hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        <TargetIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* OPTION SPECIFIC CUSTOM CONTENT EDITORS */}
            <div className="pt-2">
              {activeOption.id === 'whatsapp' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 text-xs">
                    <p className="text-emerald-800 font-semibold mb-1">💬 Contenido de WhatsApp</p>
                    <p className="text-stone-500 leading-relaxed text-[11px]">
                      Configura el mensaje por defecto que se enviará automáticamente cuando el cliente presione el botón de WhatsApp.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                      Mensaje Predeterminado
                    </label>
                    <textarea
                      value={activeOption.content || ''}
                      onChange={e => updateOption('whatsapp', { content: e.target.value })}
                      placeholder="Hola, me interesa saber más de tu catálogo..."
                      rows={3}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none resize-none text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}

              {activeOption.id === 'about' && (
                <div className="space-y-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                    <p className="text-stone-800 font-semibold mb-1">ℹ️ Descripción del Catálogo</p>
                    <p className="text-stone-500 leading-relaxed text-[11px]">
                      Si se proporciona un texto aquí, reemplazará la descripción estándar del catálogo que se ve en la pantalla de "Información del catálogo". Dejar vacío para usar la descripción general.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                      Texto Alternativo de Información
                    </label>
                    <textarea
                      value={activeOption.content || ''}
                      onChange={e => updateOption('about', { content: e.target.value })}
                      placeholder="Información personalizada del catálogo o detalles específicos de la temporada..."
                      rows={4}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none resize-none text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}

              {activeOption.id === 'share' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60 text-xs">
                    <p className="text-amber-800 font-semibold mb-1">🔗 Mensaje de Compartido</p>
                    <p className="text-stone-500 leading-relaxed text-[11px]">
                      Configura el mensaje descriptivo inicial que se utiliza al copiar el enlace o compartir por redes.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                      Prefijo del Mensaje al Compartir
                    </label>
                    <input
                      type="text"
                      value={activeOption.content || ''}
                      onChange={e => updateOption('share', { content: e.target.value })}
                      placeholder="¡Hola! Te comparto nuestro catálogo interactivo para que veas nuestros diseños:"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:border-stone-500 focus:outline-none text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}

              {activeOption.id === 'company' && (
                <div className="space-y-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                    <p className="text-stone-800 font-semibold mb-1">🏢 Texto de Introducción de Empresa</p>
                    <p className="text-stone-500 leading-relaxed text-[11px]">
                      Agrega un texto introductorio personalizado que aparecerá arriba de los datos estructurados en la pantalla de "Información de la empresa".
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                      Texto Introductorio
                    </label>
                    <textarea
                      value={activeOption.content || ''}
                      onChange={e => updateOption('company', { content: e.target.value })}
                      placeholder="Somos una empresa dedicada a crear los mejores productos artesanales con materiales sostenibles..."
                      rows={3}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:border-stone-500 focus:outline-none resize-none text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}

              {activeOption.id === 'how_it_works' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60 text-xs">
                    <p className="text-amber-800 font-semibold mb-1">❓ Pasos de "¿Cómo funciona?"</p>
                    <p className="text-stone-500 leading-relaxed text-[11px]">
                      Edita libremente cada uno de los 5 pasos que explican el funcionamiento del catálogo digital a tus clientes.
                    </p>
                  </div>
                  
                  <div className="space-y-4 divide-y divide-stone-100">
                    {Array.from({ length: 5 }).map((_, stepIdx) => {
                      const step = activeOption.steps?.[stepIdx] || { title: '', desc: '' };
                      return (
                        <div key={stepIdx} className={`pt-3 ${stepIdx === 0 ? 'pt-0' : ''} space-y-2`}>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-[10px] font-bold flex items-center justify-center">
                              {stepIdx + 1}
                            </span>
                            <span className="text-[11px] font-bold text-stone-700">Paso {stepIdx + 1}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-1">
                              <label className="block text-[9px] font-bold text-stone-400 mb-0.5 uppercase">Título del Paso</label>
                              <input
                                type="text"
                                value={step.title}
                                onChange={e => updateHowItWorksStep(stepIdx, { title: e.target.value })}
                                placeholder={`Ej. Paso ${stepIdx + 1}`}
                                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none font-semibold text-stone-800"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-bold text-stone-400 mb-0.5 uppercase font-medium">Descripción corta del paso</label>
                              <input
                                type="text"
                                value={step.desc}
                                onChange={e => updateHowItWorksStep(stepIdx, { desc: e.target.value })}
                                placeholder="Escribe la explicación breve..."
                                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none text-stone-700"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeOption.id === 'favorites' && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/60 text-xs">
                    <p className="text-red-800 font-semibold mb-1">❤️ Productos Favoritos</p>
                    <p className="text-stone-500 leading-relaxed text-[11px]">
                      Personaliza un subtítulo u orientación para tus clientes en la pantalla emergente de sus favoritos.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                      Mensaje de Orientación
                    </label>
                    <input
                      type="text"
                      value={activeOption.content || ''}
                      onChange={e => updateOption('favorites', { content: e.target.value })}
                      placeholder="Aquí verás una recopilación de los productos que más te gustan..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:border-stone-500 focus:outline-none text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
}

// Minimal placeholder Settings icon since standard Settings is too fast/simple
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2.5}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
      />
    </svg>
  );
}
