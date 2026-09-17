import React, { useState } from 'react';
import { Plus, Trash, Check, Tags, ChevronDown, ChevronUp, Edit2, X } from 'lucide-react';
import { CustomConfirm } from './CustomConfirm';
import { CatalogProduct } from '../types';

interface AdminCategoriesProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  products?: CatalogProduct[];
  setProducts?: React.Dispatch<React.SetStateAction<CatalogProduct[]>>;
}

export function AdminCategories({ categories, setCategories, products = [], setProducts }: AdminCategoriesProps) {
  const [newCat, setNewCat] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatValue, setEditCatValue] = useState('');

  const handleAdd = () => {
    if (!newCat.trim()) return;
    const standard = newCat.trim();
    if (categories.some(c => c.toLowerCase() === standard.toLowerCase())) {
      alert('Esta categoría ya existe.');
      return;
    }
    setCategories(prev => [...prev, standard]);
    setNewCat('');
  };

  const handleStartEdit = (catName: string) => {
    setEditingCat(catName);
    setEditCatValue(catName);
  };

  const handleSaveEdit = () => {
    if (!editingCat || !editCatValue.trim()) {
      setEditingCat(null);
      return;
    }
    const newName = editCatValue.trim();
    if (newName.toLowerCase() === editingCat.toLowerCase()) {
      setEditingCat(null);
      return;
    }
    if (categories.some(c => c.toLowerCase() === newName.toLowerCase() && c.toLowerCase() !== editingCat.toLowerCase())) {
      alert('Ya existe una categoría con ese nombre.');
      return;
    }
    const oldName = editingCat;
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    if (setProducts) {
      setProducts(prev => prev.map(p => {
        const prodCats = p.categories && p.categories.length > 0 ? p.categories : [p.category || 'TODOS'];
        const updatedCats = prodCats.map(c => c === oldName ? newName : c);
        const updatedPrimary = p.category === oldName ? newName : (p.category || 'TODOS');
        return {
          ...p,
          category: updatedPrimary,
          categories: updatedCats
        };
      }));
    }
    setEditingCat(null);
  };

  const handleDeleteRequest = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (catName === 'TODOS') {
      alert('No se puede eliminar la categoría unificadora TODOS.');
      return;
    }
    setCatToDelete(catName);
  };

  const handleConfirmDelete = () => {
    if (!catToDelete) return;
    const target = catToDelete;
    
    // 1. Eliminar categoría de la lista de categorías
    setCategories(prev => prev.filter(c => c !== target));

    // 2. Limpiar la categoría de los productos si aplica
    if (setProducts) {
      setProducts(prev => prev.map(p => {
        const prodCats = p.categories && p.categories.length > 0 ? p.categories : [p.category || 'TODOS'];
        const updatedCats = prodCats.filter(c => c !== target);
        const finalCats = updatedCats.length > 0 ? updatedCats : ['TODOS'];
        const finalPrimary = p.category === target ? finalCats[0] : (p.category || 'TODOS');
        return {
          ...p,
          category: finalPrimary,
          categories: finalCats
        };
      }));
    }

    setCatToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-categories-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
            <Tags className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Categorías
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                {`Total: ${categories.length} categorías (${categories.join(', ')})`}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Organice las líneas de diseño del catálogo en secciones interactivas.</p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 flex flex-col justify-between">
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="Nueva Categoría (Ej: Cristalería)"
                className="flex-grow text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-stone-100 hover:bg-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {categories.map(cat => {
                const isEditingThis = editingCat === cat;
                return (
                  <div
                    key={cat}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isEditingThis 
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400/40' 
                        : 'bg-stone-50 text-stone-700 border-stone-100 hover:border-stone-200'
                    }`}
                  >
                    {isEditingThis ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveEdit();
                        }}
                        className="flex items-center gap-1"
                      >
                        <input
                          type="text"
                          value={editCatValue}
                          onChange={e => setEditCatValue(e.target.value)}
                          className="w-24 sm:w-28 text-xs py-0.5 px-1 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-1 rounded text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          title="Guardar nombre"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="p-1 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <span>{cat}</span>
                        {cat !== 'TODOS' && (
                          <div className="flex items-center gap-0.5 ml-0.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1 rounded text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                              title={`Editar nombre de categoría ${cat}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteRequest(cat, e)}
                              className="p-1 rounded text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                              title={`Eliminar categoría ${cat}`}
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <CustomConfirm
        isOpen={!!catToDelete}
        title="Eliminar Categoría"
        message={`¿Está seguro de que desea eliminar la categoría "${catToDelete}"? Se removerá de las categorías disponibles y de los productos vinculados.`}
        confirmText="Eliminar Categoría"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCatToDelete(null)}
      />
    </div>
  );
}
