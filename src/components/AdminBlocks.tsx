import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Layout, Sparkles, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { CustomBlock } from '../types';
import { compressImageFile } from '../lib/imageUtils';
import { scrollToAdminSection } from '../lib/scrollUtils';

export type { CustomBlock };

interface AdminBlocksProps {
  customBlocks: CustomBlock[];
  setCustomBlocks: React.Dispatch<React.SetStateAction<CustomBlock[]>>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminBlocks({ customBlocks, setCustomBlocks, isOpen, onToggle }: AdminBlocksProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState('');

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 800, 0.8);
    if (compressed) setImage(compressed);
    e.target.value = '';
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    const newBlock: CustomBlock = {
      id: `block-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      badge: badge.trim() || undefined,
      image: image || undefined,
      createdAt: Date.now()
    };
    setCustomBlocks((prev) => [newBlock, ...prev]);
    setTitle('');
    setContent('');
    setBadge('');
    setImage('');
  };

  const handleDelete = (id: string) => {
    setCustomBlocks((prev) => prev.filter((b) => b.id !== id));
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
          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-base">Promociones</h3>
              <span className="px-2 py-0.5 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-full text-xs font-semibold">
                {customBlocks.length}
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Banners destacados y ofertas especiales
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-5 animate-fadeIn">
          <form onSubmit={handleAdd} className="bg-stone-50 p-4 rounded-xl border border-stone-200/60 space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Nuevo Bloque Destacado</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del bloque o anuncio..."
                className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
              />
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Distintivo / Badge (ej. Promo, Nuevo)..."
                className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
              />
            </div>
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Texto o descripción del aviso..."
              className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-100">
                  <ImageIcon className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>{image ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto justify-center px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Agregar Bloque</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {customBlocks.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 p-3.5 bg-white border border-stone-200 rounded-xl shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {b.image && (
                    <img src={b.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {b.badge && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold shrink-0">
                          {b.badge}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-stone-900 truncate">{b.title}</h4>
                    </div>
                    {b.content && <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{b.content}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="text-stone-400 hover:text-red-600 p-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

