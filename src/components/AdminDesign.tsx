import React, { useState, useRef, useEffect } from 'react';
import { CatalogDesign } from '../types';
import { Palette, Layout, Type, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Upload, BookOpen, AlignLeft, X } from 'lucide-react';
import { compressImageFile } from '../lib/imageUtils';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminDesignProps {
  design: CatalogDesign;
  setDesign: React.Dispatch<React.SetStateAction<CatalogDesign>>;
  catalogName?: string;
  onUpdateCatalogName?: (name: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminDesign({
  design,
  setDesign,
  catalogName = '',
  onUpdateCatalogName,
  isOpen,
  onToggle
}: AdminDesignProps) {
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

  const updateField = <K extends keyof CatalogDesign>(field: K, value: CatalogDesign[K]) => {
    setDesign((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 400, 0.85);
    if (compressed) {
      updateField('logoImage', compressed);
    }
    e.target.value = '';
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 1600, 0.85);
    if (compressed) {
      updateField('bannerImage', compressed);
    }
    e.target.value = '';
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
          <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 text-base">Diseño y Cabecera</h3>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Título, subtítulo, logo, banner, colores, tipografía y diseño de cuadrícula
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-5 animate-fadeIn">
          {/* 1. Título del Catálogo (nombre) */}
          <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200/60">
            <label
              htmlFor="admin-project-name-input"
              className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Título del Catálogo (Nombre)</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                id="admin-project-name-input"
                value={catalogName}
                onChange={(e) => onUpdateCatalogName && onUpdateCatalogName(e.target.value)}
                placeholder="Agregar nombre del catálogo..."
                className="w-full min-w-0 text-sm sm:text-base font-bold px-3.5 py-2 pr-9 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 transition-colors"
              />
              {catalogName && (
                <button
                  type="button"
                  onClick={() => onUpdateCatalogName && onUpdateCatalogName('')}
                  className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                  title="Eliminar título del catálogo"
                  aria-label="Eliminar título del catálogo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Subtítulo */}
          <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200/60">
            <label
              htmlFor="input-catalog-subtitle"
              className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5"
            >
              <AlignLeft className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Subtítulo del Catálogo</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                id="input-catalog-subtitle"
                value={design.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Agregar subtítulo (ej. Diseño natural, regalos y corte láser)..."
                className="w-full min-w-0 text-xs sm:text-sm font-medium px-3.5 py-2.5 pr-9 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 transition-colors"
              />
              {design.subtitle && (
                <button
                  type="button"
                  onClick={() => updateField('subtitle', '')}
                  className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                  title="Eliminar subtítulo del catálogo"
                  aria-label="Eliminar subtítulo del catálogo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Logo / Ícono del Catálogo */}
          <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200/60">
            <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Logo o Ícono de la Cabecera</span>
            </label>

            {design.logoImage && design.logoImage.trim() !== '' ? (
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-stone-200">
                <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200 shrink-0">
                  <img
                    src={design.logoImage}
                    alt="Logo actual"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-800 truncate">Logo cargado</p>
                  <p className="text-[11px] text-stone-400">Visible en la cabecera junto al título</p>
                </div>
                <button
                  type="button"
                  id="btn-remove-logo"
                  onClick={() => updateField('logoImage', '')}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 border border-red-200 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" /> Quitar Logo
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-white transition-colors text-center">
                <Upload className="w-4 h-4 text-stone-500 shrink-0" />
                <span className="text-xs font-semibold text-stone-700">Subir Logo o Ícono (PNG, SVG, JPG)</span>
                <input
                  type="file"
                  id="file-input-logo"
                  accept="image/*,.svg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}

            <p className="text-[11px] text-stone-500 mt-2 leading-normal">
              💡 Si está vacío, no se mostrará ninguna imagen rota ni margen en blanco.
            </p>
          </div>

          {/* Campo de Banner de la Cabecera */}
          <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200/60">
            <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Banner de la Cabecera (Imagen o SVG)</span>
            </label>

            {design.bannerImage && design.bannerImage.trim() !== '' ? (
              <div className="space-y-3 bg-white p-3 rounded-xl border border-stone-200">
                <div className="w-full h-28 sm:h-36 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200">
                  <img
                    src={design.bannerImage}
                    alt="Banner actual"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800">Banner cargado</p>
                    <p className="text-[11px] text-stone-400">Visible en la parte superior del catálogo</p>
                  </div>
                  <button
                    type="button"
                    id="btn-remove-banner"
                    onClick={() => updateField('bannerImage', '')}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 border border-red-200 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" /> Quitar Banner
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-white transition-colors text-center">
                <Upload className="w-4 h-4 text-stone-500 shrink-0" />
                <span className="text-xs font-semibold text-stone-700">Subir Banner (PNG, SVG, JPG)</span>
                <input
                  type="file"
                  id="file-input-banner"
                  accept="image/*,.svg"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>
            )}

            <p className="text-[11px] text-stone-500 mt-2 leading-normal">
              💡 Si está vacío, no se mostrará ninguna imagen rota ni margen residual en el catálogo o HTML exportado.
            </p>
          </div>

          {/* Colores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                Color Primario (Acento, botones y destacados)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-stone-200 shrink-0"
                />
                <input
                  type="text"
                  value={design.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="flex-1 min-w-0 text-sm font-mono px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                Color Secundario (Fondos o detalles)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.secondaryColor}
                  onChange={(e) => updateField('secondaryColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-stone-200 shrink-0"
                />
                <input
                  type="text"
                  value={design.secondaryColor}
                  onChange={(e) => updateField('secondaryColor', e.target.value)}
                  className="flex-1 min-w-0 text-sm font-mono px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tipografía y Disposición */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Estilo Tipográfico
              </label>
              <select
                value={design.fontFamily}
                onChange={(e) => updateField('fontFamily', e.target.value as 'sans' | 'serif' | 'mono')}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20"
              >
                <option value="serif">Playfair / Elegante (Serif)</option>
                <option value="sans">Moderno / Limpio (Sans-serif)</option>
                <option value="mono">Técnico / Detallado (Mono)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Cuadrícula de Productos
              </label>
              <select
                value={design.layoutGrid}
                onChange={(e) => updateField('layoutGrid', e.target.value as '1x1' | '2x2' | '3x3')}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20"
              >
                <option value="2x2">2 Columnas (Recomendado móviles y tablets)</option>
                <option value="1x1">1 Columna (Tarjetas grandes destacadas)</option>
                <option value="3x3">3 Columnas (Compacto escritorio)</option>
              </select>
            </div>
          </div>

          {/* Pie de página */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Texto del Pie de Página (Footer)
            </label>
            <input
              type="text"
              value={design.footerText || ''}
              onChange={(e) => updateField('footerText', e.target.value)}
              placeholder="© 2026 Mi Empresa. Todos los derechos reservados."
              className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
