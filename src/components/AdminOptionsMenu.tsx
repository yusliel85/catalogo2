import React, { useState, useRef, useEffect } from 'react';
import { MenuOptionItem, MenuOptionStep, ContactInfo } from '../types';
import { DEFAULT_MENU_OPTIONS } from '../defaultData';
import { scrollToAdminSection } from '../lib/scrollUtils';
import {
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Building,
  Info,
  HelpCircle,
  Star,
  Sparkles,
  ShoppingBag,
  Package,
  Tag,
  Globe,
  Mail,
  MapPin,
  BookOpen,
  Award,
  Gift,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sliders,
  Pencil,
  RotateCcw,
  Plus,
  Trash2,
  User,
  AlignLeft
} from 'lucide-react';

interface AdminOptionsMenuProps {
  menuOptions: MenuOptionItem[];
  setMenuOptions: React.Dispatch<React.SetStateAction<MenuOptionItem[]>>;
  contact: ContactInfo;
  setContact: React.Dispatch<React.SetStateAction<ContactInfo>>;
  catalogDescription: string;
  onUpdateCatalogDescription: (desc: string) => void;
  shareCatalogMessage: string;
  onUpdateShareCatalogMessage: (msg: string) => void;
  contactWhatsappMessage: string;
  onUpdateContactWhatsappMessage: (msg: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const MENU_ICON_CHOICES: { name: string; label: string }[] = [
  { name: 'Heart', label: 'Corazón (Favoritos)' },
  { name: 'Share2', label: 'Compartir' },
  { name: 'Phone', label: 'Teléfono / WhatsApp' },
  { name: 'MessageCircle', label: 'Mensaje / Chat' },
  { name: 'Building', label: 'Empresa / Tienda' },
  { name: 'Info', label: 'Información' },
  { name: 'HelpCircle', label: 'Ayuda / ¿Cómo funciona?' },
  { name: 'Star', label: 'Estrella' },
  { name: 'Sparkles', label: 'Destellos' },
  { name: 'ShoppingBag', label: 'Bolsa de compra' },
  { name: 'Package', label: 'Producto / Caja' },
  { name: 'Tag', label: 'Etiqueta / Oferta' },
  { name: 'Globe', label: 'Web / Mundo' },
  { name: 'Mail', label: 'Correo' },
  { name: 'MapPin', label: 'Ubicación' },
  { name: 'BookOpen', label: 'Catálogo / Guía' },
  { name: 'Award', label: 'Calidad / Garantía' },
  { name: 'Gift', label: 'Regalo' }
];

export const MENU_COLOR_PRESETS: { value: string; label: string; previewBg: string }[] = [
  { value: 'neutral', label: 'Neutro (Negro/Blanco según modo)', previewBg: '#1c1917' },
  { value: '#ef4444', label: 'Rojo', previewBg: '#ef4444' },
  { value: '#10b981', label: 'Verde Esmeralda', previewBg: '#10b981' },
  { value: '#f59e0b', label: 'Naranja / Ámbar', previewBg: '#f59e0b' },
  { value: '#6366f1', label: 'Índigo', previewBg: '#6366f1' },
  { value: '#8b5cf6', label: 'Violeta', previewBg: '#8b5cf6' },
  { value: '#3b82f6', label: 'Azul', previewBg: '#3b82f6' },
  { value: '#ec4899', label: 'Rosa', previewBg: '#ec4899' },
  { value: '#14b8a6', label: 'Turquesa', previewBg: '#14b8a6' },
  { value: '#8c6d58', label: 'Madera / Tierra', previewBg: '#8c6d58' }
];

export function renderMenuOptionIcon(
  iconName: string,
  color?: string,
  isFavMarked = false,
  className = 'w-4 h-4 shrink-0'
) {
  const isNeutral = !color || color === 'neutral';
  const resolvedColor = isNeutral ? undefined : color;

  if (iconName === 'Heart') {
    return (
      <Heart
        className={`fav-icon-heart ${isFavMarked ? 'fav-is-active' : 'fav-is-empty'} ${className} ${
          isNeutral ? 'text-stone-900 dark:text-white' : ''
        }`}
        style={
          resolvedColor
            ? { color: resolvedColor, stroke: resolvedColor, fill: isFavMarked ? '#ef4444' : 'none' }
            : { fill: isFavMarked ? '#ef4444' : 'none' }
        }
        fill={isFavMarked ? '#ef4444' : 'none'}
      />
    );
  }

  if (iconName === 'Share2') {
    return (
      <Share2
        className={`${isNeutral ? 'icon-share-neutral text-stone-900 dark:text-white' : ''} ${className}`}
        style={resolvedColor ? { color: resolvedColor, stroke: resolvedColor } : undefined}
      />
    );
  }

  const styleProp = resolvedColor ? { color: resolvedColor, stroke: resolvedColor } : undefined;
  const fallbackClass = isNeutral ? 'text-stone-900 dark:text-white' : '';

  switch (iconName) {
    case 'Phone':
      return <Phone className={`${className} ${fallbackClass || 'text-emerald-500'}`} style={styleProp} />;
    case 'MessageCircle':
      return <MessageCircle className={`${className} ${fallbackClass || 'text-emerald-500'}`} style={styleProp} />;
    case 'Building':
      return <Building className={`${className} ${fallbackClass || 'text-amber-500'}`} style={styleProp} />;
    case 'Info':
      return <Info className={`${className} ${fallbackClass || 'text-indigo-500'}`} style={styleProp} />;
    case 'HelpCircle':
      return <HelpCircle className={`${className} ${fallbackClass || 'text-violet-500'}`} style={styleProp} />;
    case 'Star':
      return <Star className={`${className} ${fallbackClass || 'text-amber-500'}`} style={styleProp} />;
    case 'Sparkles':
      return <Sparkles className={`${className} ${fallbackClass || 'text-amber-500'}`} style={styleProp} />;
    case 'ShoppingBag':
      return <ShoppingBag className={`${className} ${fallbackClass || 'text-rose-500'}`} style={styleProp} />;
    case 'Package':
      return <Package className={`${className} ${fallbackClass || 'text-amber-600'}`} style={styleProp} />;
    case 'Tag':
      return <Tag className={`${className} ${fallbackClass || 'text-emerald-600'}`} style={styleProp} />;
    case 'Globe':
      return <Globe className={`${className} ${fallbackClass || 'text-blue-500'}`} style={styleProp} />;
    case 'Mail':
      return <Mail className={`${className} ${fallbackClass || 'text-indigo-500'}`} style={styleProp} />;
    case 'MapPin':
      return <MapPin className={`${className} ${fallbackClass || 'text-red-500'}`} style={styleProp} />;
    case 'BookOpen':
      return <BookOpen className={`${className} ${fallbackClass || 'text-violet-500'}`} style={styleProp} />;
    case 'Award':
      return <Award className={`${className} ${fallbackClass || 'text-amber-500'}`} style={styleProp} />;
    case 'Gift':
      return <Gift className={`${className} ${fallbackClass || 'text-pink-500'}`} style={styleProp} />;
    default:
      return <Info className={`${className} ${fallbackClass || 'text-stone-500'}`} style={styleProp} />;
  }
}

export function AdminOptionsMenu({
  menuOptions,
  setMenuOptions,
  contact,
  setContact,
  catalogDescription,
  onUpdateCatalogDescription,
  shareCatalogMessage,
  onUpdateShareCatalogMessage,
  contactWhatsappMessage,
  onUpdateContactWhatsappMessage,
  isOpen,
  onToggle
}: AdminOptionsMenuProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      scrollToAdminSection(sectionRef.current, 30);
    } else {
      setEditingId(null);
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (editingId && !isCollapsed) {
      const cardEl = document.getElementById(`admin-menu-opt-${editingId}`);
      scrollToAdminSection(cardEl || sectionRef.current, 35);
    }
  }, [editingId, isCollapsed]);

  const handleHeaderToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  const getDefaultColorForOption = (opt: MenuOptionItem): string => {
    if (opt.color) return opt.color;
    if (opt.id === 'favorites' || opt.iconName === 'Heart') return 'neutral';
    if (opt.id === 'share' || opt.iconName === 'Share2') return 'neutral';
    if (opt.id === 'whatsapp' || opt.iconName === 'Phone') return '#10b981';
    if (opt.id === 'company' || opt.iconName === 'Building') return '#f59e0b';
    if (opt.id === 'about' || opt.iconName === 'Info') return '#6366f1';
    if (opt.id === 'how_it_works' || opt.iconName === 'HelpCircle') return '#8b5cf6';
    return 'neutral';
  };

  const updateOption = (id: string, patch: Partial<MenuOptionItem>) => {
    setMenuOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, ...patch } : opt))
    );
  };

  const toggleVisibility = (id: string) => {
    setMenuOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, visible: !opt.visible } : opt))
    );
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    setMenuOptions((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const updateContactField = (field: keyof ContactInfo, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const updateStep = (optId: string, stepIndex: number, field: keyof MenuOptionStep, value: string) => {
    setMenuOptions((prev) =>
      prev.map((opt) => {
        if (opt.id !== optId) return opt;
        const currentSteps = opt.steps || DEFAULT_MENU_OPTIONS.find((d) => d.id === 'how_it_works')?.steps || [];
        const updatedSteps = currentSteps.map((s, idx) =>
          idx === stepIndex ? { ...s, [field]: value } : s
        );
        return { ...opt, steps: updatedSteps };
      })
    );
  };

  const addStep = (optId: string) => {
    setMenuOptions((prev) =>
      prev.map((opt) => {
        if (opt.id !== optId) return opt;
        const currentSteps = opt.steps || DEFAULT_MENU_OPTIONS.find((d) => d.id === 'how_it_works')?.steps || [];
        return {
          ...opt,
          steps: [...currentSteps, { title: 'Nuevo paso', desc: 'Descripción del paso.' }]
        };
      })
    );
  };

  const removeStep = (optId: string, stepIndex: number) => {
    setMenuOptions((prev) =>
      prev.map((opt) => {
        if (opt.id !== optId) return opt;
        const currentSteps = opt.steps || DEFAULT_MENU_OPTIONS.find((d) => d.id === 'how_it_works')?.steps || [];
        return {
          ...opt,
          steps: currentSteps.filter((_, idx) => idx !== stepIndex)
        };
      })
    );
  };

  const handleRestoreDefaults = () => {
    setMenuOptions(DEFAULT_MENU_OPTIONS);
    setEditingId(null);
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
          <div className="p-2.5 bg-violet-50 border border-violet-100 rounded-xl text-violet-600 group-hover:bg-violet-100 transition-colors shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 text-base">Menú de Opciones</h3>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Orden, visibilidad, información de empresa, catálogo, mensajes y pasos
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <p className="text-xs text-stone-500">
              Usa las flechas (↑↓) para ordenar, el ojo para mostrar/ocultar y el lápiz para editar cada opción:
            </p>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Restaurar valores por defecto del menú"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Restaurar por defecto</span>
            </button>
          </div>

          {menuOptions.map((opt, idx) => {
            const isEditing = editingId === opt.id;
            const currentColor = getDefaultColorForOption(opt);
            const stepsList =
              opt.id === 'how_it_works'
                ? opt.steps || DEFAULT_MENU_OPTIONS.find((d) => d.id === 'how_it_works')?.steps || []
                : [];

            return (
              <div
                key={opt.id}
                id={`admin-menu-opt-${opt.id}`}
                className="bg-stone-50 rounded-xl border border-stone-200/80 overflow-hidden transition-all"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-white rounded-lg shadow-2xs border border-stone-200/60 shrink-0 flex items-center justify-center">
                      {renderMenuOptionIcon(opt.iconName, currentColor, opt.id === 'favorites')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-800 truncate">
                        {opt.label}
                      </h4>
                      <p className="text-[10px] text-stone-400 truncate">
                        {opt.visible ? 'Visible' : 'Oculto'} · Ícono: {opt.iconName}
                      </p>
                    </div>
                  </div>

                  {/* Controles: Flechas ↑↓ + Ojo (visibilidad) + Lápiz (editar) */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveOption(idx, 'up')}
                      disabled={idx === 0}
                      className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-colors ${
                        idx === 0
                          ? 'bg-stone-100 text-stone-300 border-stone-200/50 cursor-not-allowed opacity-50'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 cursor-pointer'
                      }`}
                      title="Subir opción"
                      aria-label="Subir opción"
                    >
                      <ArrowUp className="w-3.5 h-3.5 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveOption(idx, 'down')}
                      disabled={idx === menuOptions.length - 1}
                      className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-colors ${
                        idx === menuOptions.length - 1
                          ? 'bg-stone-100 text-stone-300 border-stone-200/50 cursor-not-allowed opacity-50'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 cursor-pointer'
                      }`}
                      title="Bajar opción"
                      aria-label="Bajar opción"
                    >
                      <ArrowDown className="w-3.5 h-3.5 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleVisibility(opt.id)}
                      className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        opt.visible
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                      title={opt.visible ? 'Visible en el menú (tocar para ocultar)' : 'Oculto en el menú (tocar para mostrar)'}
                      aria-label={opt.visible ? 'Ocultar opción' : 'Mostrar opción'}
                    >
                      {opt.visible ? (
                        <>
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden md:inline">Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden md:inline">Oculto</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : opt.id)}
                      className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                        isEditing
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                      title={isEditing ? 'Cerrar edición' : 'Editar opción'}
                      aria-label={isEditing ? 'Cerrar edición' : 'Editar opción'}
                    >
                      <Pencil className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">{isEditing ? 'Cerrar' : 'Editar'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Edit Panel (Acordeón exclusivo por opción) */}
                {isEditing && (
                  <div className="p-4 bg-white border-t border-stone-200/70 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Texto del botón */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Texto de la opción en el menú
                        </label>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => updateOption(opt.id, { label: e.target.value })}
                          placeholder="Nombre en el menú..."
                          className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                        />
                      </div>

                      {/* Selector de Ícono */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Ícono
                        </label>
                        <select
                          value={opt.iconName}
                          onChange={(e) => updateOption(opt.id, { iconName: e.target.value })}
                          className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 cursor-pointer"
                        >
                          {MENU_ICON_CHOICES.map((ic) => (
                            <option key={ic.name} value={ic.name}>
                              {ic.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Selector de Color del Ícono */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Color del ícono
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {MENU_COLOR_PRESETS.map((preset) => {
                          const isSelected = currentColor === preset.value;
                          return (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => updateOption(opt.id, { color: preset.value })}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                                style={{
                                  background:
                                    preset.value === 'neutral'
                                      ? 'linear-gradient(135deg, #1c1917 50%, #ffffff 50%)'
                                      : preset.previewBg
                                }}
                              />
                              <span>{preset.label}</span>
                            </button>
                          );
                        })}

                        {/* Color libre (input color) */}
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 cursor-pointer">
                          <input
                            type="color"
                            value={currentColor.startsWith('#') ? currentColor : '#8c6d58'}
                            onChange={(e) => updateOption(opt.id, { color: e.target.value })}
                            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span>Personalizado</span>
                        </label>
                      </div>
                      {(opt.id === 'favorites' || opt.iconName === 'Heart') && (
                        <p className="text-[11px] text-stone-400 mt-1">
                          Nota: En modo "Neutro", el corazón usa contorno negro/blanco según el tema y relleno rojo (#ef4444) cuando hay favoritos marcados.
                        </p>
                      )}
                    </div>

                    {/* 1. OPCIÓN: INFORMACIÓN DE EMPRESA (TODA LA INFORMACIÓN DE EMPRESA Y EL ÚNICO NÚMERO DE TELÉFONO) */}
                    {opt.id === 'company' && (
                      <div className="space-y-4 pt-3 border-t border-stone-100">
                        <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                          Datos de la Empresa y Contacto
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Empresa o Marca
                            </label>
                            <input
                              type="text"
                              value={contact.company}
                              onChange={(e) => updateContactField('company', e.target.value)}
                              className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                              placeholder="Ej. Artesanías México"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Nombre del Contacto
                            </label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => updateContactField('name', e.target.value)}
                              className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                              placeholder="Ej. Juan Pérez"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Teléfono / WhatsApp
                            </label>
                            <input
                              type="text"
                              value={contact.phone}
                              onChange={(e) => updateContactField('phone', e.target.value)}
                              className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                              placeholder="Ej. +52 55 1234 5678"
                            />
                            <p className="text-[11px] text-stone-400 mt-1">
                              Se reutiliza automáticamente en Contactar por WhatsApp y al consultar productos.
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Correo Electrónico
                            </label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => updateContactField('email', e.target.value)}
                              className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                              placeholder="contacto@miempresa.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Dirección
                            </label>
                            <input
                              type="text"
                              value={contact.address || ''}
                              onChange={(e) => updateContactField('address', e.target.value)}
                              className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                              placeholder="Ciudad, País"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Sitio Web
                            </label>
                            <input
                              type="text"
                              value={contact.website || ''}
                              onChange={(e) => updateContactField('website', e.target.value)}
                              className="w-full min-w-0 text-xs px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                              placeholder="www.miempresa.com"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. OPCIÓN: INFORMACIÓN DEL CATÁLOGO (SOLO DESCRIPCIÓN DEL CATÁLOGO) */}
                    {opt.id === 'about' && (
                      <div className="space-y-3 pt-3 border-t border-stone-100">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1 flex flex-wrap items-center justify-between gap-1">
                            <span>Descripción del Catálogo</span>
                            <span className="text-[11px] text-stone-400 font-normal">Soporta saltos de línea</span>
                          </label>
                          <textarea
                            rows={4}
                            value={catalogDescription}
                            onChange={(e) => onUpdateCatalogDescription(e.target.value)}
                            placeholder="Escribe la historia, presentación o descripción general de tu catálogo..."
                            className="w-full min-w-0 text-xs p-3 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* 3. OPCIÓN: CONTACTAR POR WHATSAPP (SOLO MENSAJE, SIN DUPLICAR TELÉFONO) */}
                    {opt.id === 'whatsapp' && (
                      <div className="space-y-2 pt-3 border-t border-stone-100">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Mensaje al tocar "Contactar por WhatsApp"
                        </label>
                        <textarea
                          rows={3}
                          value={contactWhatsappMessage}
                          onChange={(e) => {
                            onUpdateContactWhatsappMessage(e.target.value);
                          }}
                          placeholder="Hola, me interesa ver más detalles de tu catálogo."
                          className="w-full min-w-0 text-xs font-mono p-3 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                        />
                        <p className="text-[11px] text-stone-400">
                          Variables opcionales: {'{nombre_catalogo}'}, {'{empresa}'}, {'{url}'}. Se enviará al número registrado en "Información de Empresa".
                        </p>
                      </div>
                    )}

                    {/* 4. OPCIÓN: COMPARTIR CATÁLOGO (MENSAJE PARA COMPARTIR EL CATÁLOGO) */}
                    {opt.id === 'share' && (
                      <div className="space-y-2 pt-3 border-t border-stone-100">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Mensaje al Compartir el Catálogo Completo
                        </label>
                        <textarea
                          rows={3}
                          value={shareCatalogMessage}
                          onChange={(e) => onUpdateShareCatalogMessage(e.target.value)}
                          placeholder="¡Hola! Te invito a explorar nuestro catálogo digital interactivo {nombre_catalogo}: {url}"
                          className="w-full min-w-0 text-xs font-mono p-3 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                        />
                        <p className="text-[11px] text-stone-400">
                          Variables disponibles: {'{nombre_catalogo}'}, {'{url}'}
                        </p>
                      </div>
                    )}

                    {/* 5. OPCIÓN: ¿CÓMO FUNCIONA? (PASOS EDITABLES) */}
                    {opt.id === 'how_it_works' && (
                      <div className="space-y-2.5 pt-3 border-t border-stone-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="block text-xs font-bold text-stone-700">
                            Pasos de "¿Cómo funciona?"
                          </label>
                          <button
                            type="button"
                            onClick={() => addStep(opt.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition-colors shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span>Añadir paso</span>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {stepsList.map((st, stepIdx) => (
                            <div
                              key={stepIdx}
                              className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-start gap-2.5"
                            >
                              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                                {stepIdx + 1}
                              </span>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <input
                                  type="text"
                                  value={st.title}
                                  onChange={(e) => updateStep(opt.id, stepIdx, 'title', e.target.value)}
                                  placeholder="Título del paso..."
                                  className="w-full min-w-0 text-xs font-bold px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none"
                                />
                                <textarea
                                  rows={2}
                                  value={st.desc}
                                  onChange={(e) => updateStep(opt.id, stepIdx, 'desc', e.target.value)}
                                  placeholder="Descripción del paso..."
                                  className="w-full min-w-0 text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none"
                                />
                              </div>
                              {stepsList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeStep(opt.id, stepIdx)}
                                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                  title="Eliminar paso"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
