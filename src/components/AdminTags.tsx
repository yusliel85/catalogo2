import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { CatalogProduct } from '../types';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminTagsProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  products?: CatalogProduct[];
  setProducts?: React.Dispatch<React.SetStateAction<CatalogProduct[]>>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminTags({ tags, setTags, isOpen, onToggle }: AdminTagsProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  const [newTag, setNewTag] = useState('');

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setNewTag('');
  };

  const handleDelete = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
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
          <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-xl text-teal-600 group-hover:bg-teal-100 transition-colors shrink-0">
            <Hash className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-base">Etiquetas</h3>
              <span className="px-2 py-0.5 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-xs font-semibold">
                {tags.length}
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Palabras clave y distintivos de productos
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nueva etiqueta (ej. Sostenible, Regalo)..."
              className="flex-1 min-w-0 w-full text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20"
            />
            <button
              type="submit"
              className="shrink-0 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Agregar</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium max-w-full"
              >
                <span className="truncate">#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(tag)}
                  className="text-stone-400 hover:text-red-500 ml-1 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

