import React, { useState } from 'react';
import { CatalogDesign } from '../types';
import { Palette, Layout, Type, HelpCircle, Share2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { compressImageFile } from '../lib/imageUtils';

interface AdminDesignProps {
  design: CatalogDesign;
  setDesign: React.Dispatch<React.SetStateAction<CatalogDesign>>;
}

export function AdminDesign({ design, setDesign }: AdminDesignProps) {
  const [logoInput, setLogoInput] = useState('');
  const [bannerInput, setBannerInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const updateProp = <K extends keyof CatalogDesign>(key: K, value: CatalogDesign[K]) => {
    setDesign(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveAndConfirm = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImageFile(file, 800, 0.8);
      if (compressed) {
        updateProp('logoImage', compressed);
      }
      e.target.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImageFile(file, 1200, 0.8);
      if (compressed) {
        updateProp('bannerImage', compressed);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-design-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-lg text-violet-700">
            <Palette className="w-5 h-5 text-violet-700" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Información Web
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                Color: <span className="font-semibold uppercase text-stone-700" style={{ color: design.primaryColor }}>{design.primaryColor}</span>
                {` • Cuadrícula: ${design.layoutGrid === 'list' ? 'Lista' : design.layoutGrid}`}
                {` • Tipografía: ${design.fontFamily === 'serif' ? 'Serif' : design.fontFamily === 'mono' ? 'Mono' : 'Sans'}`}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Ajuste la paleta, tipografía, cabecera y el grid para impresionar a sus compradores.</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Color Principal (Hex)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={design.primaryColor}
                  onChange={e => updateProp('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.primaryColor}
                  onChange={e => updateProp('primaryColor', e.target.value)}
                  className="flex-grow text-xs px-2 bg-stone-50 border border-stone-300 rounded focus:outline-none uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Color Secundario (Hex)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={design.secondaryColor}
                  onChange={e => updateProp('secondaryColor', e.target.value)}
                  className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.secondaryColor}
                  onChange={e => updateProp('secondaryColor', e.target.value)}
                  className="flex-grow text-xs px-2 bg-stone-50 border border-stone-300 rounded focus:outline-none uppercase font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Diseño en Cuadrícula</label>
              <select
                value={design.layoutGrid}
                onChange={e => updateProp('layoutGrid', e.target.value as '2x2' | '3x3' | 'list')}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:outline-none"
              >
                <option value="2x2">Cajas amplias (2x2)</option>
                <option value="3x3">Miniaturas compactas (3x3)</option>
                <option value="list">Lista detallada (Fila única)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Estilo de Letra</label>
              <select
                value={design.fontFamily}
                onChange={e => updateProp('fontFamily', e.target.value as 'serif' | 'sans' | 'mono')}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:outline-none"
              >
                <option value="serif">Elegante Serif (Clásica)</option>
                <option value="sans">Artesanal Sans (Moderna)</option>
                <option value="mono">Técnico Mono (Industrial)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-700 tracking-wider uppercase">Logotipos y Banners</h3>
            
            <div className="space-y-3">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-stone-600">Logo de la Marca (.PNG/.JPG)</label>
                  {design.logoImage && (
                    <button
                      type="button"
                      onClick={() => updateProp('logoImage', undefined)}
                      className="text-[9px] text-red-500 hover:underline font-bold"
                    >
                      Quitar Logo
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-[10px] text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                  />
                  <div className="flex gap-2 items-center">
                    <span className="text-[9px] text-stone-400 font-bold uppercase">O URL:</span>
                    <input
                      type="text"
                      placeholder="Pegar enlace de imagen (http...)"
                      value={design.logoImage && !design.logoImage.startsWith('data:') ? design.logoImage : ''}
                      onChange={e => updateProp('logoImage', e.target.value || undefined)}
                      className="flex-grow text-[10px] p-1 bg-white border border-stone-300 rounded focus:outline-none"
                    />
                  </div>
                </div>
                {design.logoImage && (
                  <div className="mt-2 h-10 w-24 border rounded bg-white flex items-center justify-center p-1.5 shadow-sm">
                    <img src={design.logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-stone-600">Banner de Cabecera (.PNG/.JPG)</label>
                  {design.bannerImage && (
                    <button
                      type="button"
                      onClick={() => updateProp('bannerImage', undefined)}
                      className="text-[9px] text-red-500 hover:underline font-bold"
                    >
                      Quitar Banner
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="w-full text-[10px] text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                  />
                  <div className="flex gap-2 items-center">
                    <span className="text-[9px] text-stone-400 font-bold uppercase">O URL:</span>
                    <input
                      type="text"
                      placeholder="Pegar enlace de imagen (http...)"
                      value={design.bannerImage && !design.bannerImage.startsWith('data:') ? design.bannerImage : ''}
                      onChange={e => updateProp('bannerImage', e.target.value || undefined)}
                      className="flex-grow text-[10px] p-1 bg-white border border-stone-300 rounded focus:outline-none"
                    />
                  </div>
                </div>
                {design.bannerImage && (
                  <div className="mt-2 h-12 w-full border rounded bg-white flex items-center justify-center p-1 overflow-hidden shadow-sm">
                    <img src={design.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-600 mb-1">Subtítulo de Cabecera (Banner)</label>
            <input
              type="text"
              value={design.bannerSubtitle || ''}
              onChange={e => updateProp('bannerSubtitle', e.target.value)}
              placeholder="Ej: Catálogo de exhibición o Colección Exclusiva"
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-600 mb-1">Texto al pie de página (Catálogo)</label>
            <input
              type="text"
              value={design.footerText || ''}
              onChange={e => updateProp('footerText', e.target.value)}
              placeholder="Ej: © 2026 Reservados todos los derechos."
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-600 mb-1 flex items-center gap-1">
              <Share2 className="w-3 h-3 text-stone-500" /> URL de Compartir (Botón del catálogo)
            </label>
            <input
              type="text"
              value={design.shareUrl || ''}
              onChange={e => updateProp('shareUrl', e.target.value)}
              placeholder="Ej: https://tucatalogo.com o deja vacío para usar el enlace actual"
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none font-mono"
            />
            <p className="text-[9px] text-stone-400 mt-0.5">Si se deja vacío, se utilizará el enlace de la pestaña actual.</p>
          </div>
        </div>
        <div className="mt-5 pt-3 border-t border-stone-100">
          <button
            onClick={handleSaveAndConfirm}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
              saved 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-stone-900 text-[#fafaf9] hover:bg-stone-850'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-white animate-bounce" />
                ¡Ajustes de Diseño Guardados!
              </>
            ) : (
              'Guardar Ajustes de Diseño'
            )}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
