import React, { useState } from 'react';
import { Plus, Trash, Tag, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
import { CustomConfirm } from './CustomConfirm';
import { CatalogProduct } from '../types';

interface AdminTagsProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  products?: CatalogProduct[];
  setProducts?: React.Dispatch<React.SetStateAction<CatalogProduct[]>>;
}

export function AdminTags({ tags, setTags, products = [], setProducts }: AdminTagsProps) {
  const [newTag, setNewTag] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');

  const handleAdd = () => {
    if (!newTag.trim()) return;
    const standard = newTag.trim().replace(/^#/, '');
    if (!standard) return;
    if (tags.some(t => t.toLowerCase() === standard.toLowerCase())) {
      alert('Esta etiqueta ya existe.');
      return;
    }
    setTags(prev => [...prev, standard]);
    setNewTag('');
  };

  const handleStartEdit = (tagName: string) => {
    setEditingTag(tagName);
    setEditTagValue(tagName);
  };

  const handleSaveEdit = () => {
    if (!editingTag || !editTagValue.trim()) {
      setEditingTag(null);
      return;
    }
    const standard = editTagValue.trim().replace(/^#/, '');
    if (!standard) {
      setEditingTag(null);
      return;
    }
    if (standard.toLowerCase() === editingTag.toLowerCase()) {
      setEditingTag(null);
      return;
    }
    if (tags.some(t => t.toLowerCase() === standard.toLowerCase() && t.toLowerCase() !== editingTag.toLowerCase())) {
      alert('Ya existe una etiqueta con ese nombre.');
      return;
    }
    const oldTag = editingTag;
    setTags(prev => prev.map(t => t === oldTag ? standard : t));
    if (setProducts) {
      setProducts(prev => prev.map(p => {
        const updatedTags = (p.tags || []).map(t => t === oldTag ? standard : t);
        return {
          ...p,
          tags: updatedTags
        };
      }));
    }
    setEditingTag(null);
  };

  const handleDeleteRequest = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTagToDelete(tagName);
  };

  const handleConfirmDelete = () => {
    if (!tagToDelete) return;
    const target = tagToDelete;

    // 1. Eliminar etiqueta de la lista global de etiquetas
    setTags(prev => prev.filter(t => t !== target));

    // 2. Limpiar la etiqueta de los productos asignados
    if (setProducts) {
      setProducts(prev => prev.map(p => {
        const updatedTags = (p.tags || []).filter(t => t !== target);
        return {
          ...p,
          tags: updatedTags
        };
      }));
    }

    setTagToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-tags-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
            <Tag className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Etiquetas
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                {tags.length > 0
                  ? `Total: ${tags.length} etiquetas (${tags.join(', ')})`
                  : 'Sin etiquetas asignadas. Agregue etiquetas para organizar sus productos.'}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Administre los descriptores y palabras clave (tags) para destacar productos.</p>
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
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="Nueva Etiqueta (Ej: Oferta, Sostenible, Hand-made)"
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

            {tags.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2 text-center">No hay etiquetas creadas todavía.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {tags.map(tag => {
                  const isEditingThis = editingTag === tag;
                  return (
                    <div
                      key={tag}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isEditingThis
                          ? 'bg-amber-100/90 text-amber-950 border-amber-400 ring-1 ring-amber-400/50'
                          : 'bg-amber-50/70 text-amber-900 border-amber-200/60 hover:border-amber-300'
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
                          <span className="text-amber-700 font-bold">#</span>
                          <input
                            type="text"
                            value={editTagValue}
                            onChange={e => setEditTagValue(e.target.value)}
                            className="w-20 sm:w-24 text-xs py-0.5 px-1 bg-white border border-amber-300 rounded focus:border-amber-500 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="p-1 rounded text-emerald-700 hover:text-emerald-800 hover:bg-amber-200/50 cursor-pointer"
                            title="Guardar etiqueta"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTag(null)}
                            className="p-1 rounded text-stone-500 hover:text-stone-700 hover:bg-amber-200/50 cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <span>#{tag}</span>
                          <div className="flex items-center gap-0.5 ml-0.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(tag)}
                              className="p-1 rounded text-amber-700/60 hover:text-amber-900 transition-colors cursor-pointer"
                              title={`Editar etiqueta #${tag}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteRequest(tag, e)}
                              className="p-1 rounded text-amber-700/60 hover:text-red-600 transition-colors cursor-pointer"
                              title={`Eliminar etiqueta #${tag}`}
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <CustomConfirm
        isOpen={!!tagToDelete}
        title="Eliminar Etiqueta"
        message={`¿Está seguro de que desea eliminar la etiqueta "${tagToDelete}"? Se desvinculará de los productos asignados.`}
        confirmText="Eliminar Etiqueta"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTagToDelete(null)}
      />
    </div>
  );
}
