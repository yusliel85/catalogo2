import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { CatalogProduct } from '../types';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminCategoriesProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  products?: CatalogProduct[];
  setProducts?: React.Dispatch<React.SetStateAction<CatalogProduct[]>>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminCategories({
  categories,
  setCategories,
  products = [],
  setProducts,
  isOpen,
  onToggle
}: AdminCategoriesProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  const [newCat, setNewCat] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

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
    const trimmed = newCat.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories((prev) => [...prev, trimmed]);
    setNewCat('');
  };

  const handleDelete = (catName: string) => {
    if (catName === 'TODOS') return;
    setCategories((prev) => prev.filter((c) => c !== catName));
  };

  const handleStartEdit = (idx: number, name: string) => {
    setEditingIndex(idx);
    setEditingText(name);
  };

  const handleSaveEdit = (idx: number) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    const oldName = categories[idx];
    setCategories((prev) => {
      const copy = [...prev];
      copy[idx] = trimmed;
      return copy;
    });
    if (setProducts && products.length > 0) {
      setProducts((prev) =>
        prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p))
      );
    }
    setEditingIndex(null);
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
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-base">Categorías</h3>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-full text-xs font-semibold">
                {categories.length}
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Organización y filtros principales de productos
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
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Nombre de la nueva categoría..."
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
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 max-w-full"
              >
                {editingIndex === idx ? (
                  <div className="flex items-center gap-1 max-w-full">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="min-w-0 w-28 sm:w-36 px-2 py-0.5 text-xs bg-white text-stone-900 border border-stone-300 rounded focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(idx)}
                      className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium truncate">{cat}</span>
                    {cat !== 'TODOS' && (
                      <div className="flex items-center gap-0.5 ml-1 border-l border-stone-200 pl-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx, cat)}
                          className="text-stone-400 hover:text-stone-700 p-0.5 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="text-stone-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

