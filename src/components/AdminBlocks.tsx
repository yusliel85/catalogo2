import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, Check, Image as ImageIcon, AlignLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import { compressImageFile } from '../lib/imageUtils';
import { CustomConfirm } from './CustomConfirm';
import { CustomBlock, sortPromosNewestFirst } from '../lib/promoUtils';

interface AdminBlocksProps {
  customBlocks: CustomBlock[];
  setCustomBlocks: React.Dispatch<React.SetStateAction<CustomBlock[]>>;
}

export function AdminBlocks({ customBlocks, setCustomBlocks }: AdminBlocksProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImageFile(file, 1000, 0.8);
      if (compressed) {
        setImage(compressed);
      }
      e.target.value = '';
    }
  };

  const handleCancelEdit = () => {
    setEditingBlockId(null);
    setTitle('');
    setContent('');
    setBadge('');
    setImage('');
  };

  const handleSaveBlock = () => {
    if (!title.trim() || !content.trim()) {
      alert('Por favor ingrese el título y contenido de la promoción o aviso.');
      return;
    }

    if (editingBlockId) {
      setCustomBlocks(prev => prev.map(b => b.id === editingBlockId ? {
        ...b,
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim() || undefined,
        image: image || undefined
      } : b));
      handleCancelEdit();
    } else {
      const now = Date.now();
      const newBlock: CustomBlock = {
        id: 'block-' + now,
        createdAt: now,
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim() || undefined,
        image: image || undefined
      };
      setCustomBlocks(prev => [newBlock, ...prev]);
      handleCancelEdit();
    }
  };

  const sortedBlocks = useMemo(() => sortPromosNewestFirst(customBlocks), [customBlocks]);

  const handleStartEdit = (block: CustomBlock) => {
    setEditingBlockId(block.id);
    setTitle(block.title);
    setContent(block.content);
    setBadge(block.badge || '');
    setImage(block.image || '');
  };

  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    setCustomBlocks(prev => prev.filter(b => b.id !== deleteTargetId));
    if (editingBlockId === deleteTargetId) {
      handleCancelEdit();
    }
    setDeleteTargetId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-blocks-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
            <AlignLeft className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Promociones
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                {customBlocks.length > 0 
                  ? `Anuncios activos: ${customBlocks.length} (${customBlocks.map(b => b.title).join(', ')})`
                  : 'Sin promociones o avisos cargados todavía'
                }
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Anuncios especiales, ofertas de temporada o avisos importantes.</p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 flex flex-col justify-between">
          {editingBlockId && (
            <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-amber-900">
                  Modo Edición: Modificando promoción activa
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
            </div>
          )}

          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1">Título de la Promoción o Aviso</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: ¡Oferta de Verano! 20% OFF"
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1">Etiqueta o Categoría (Badge)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  placeholder="Ej: Promo / Importante"
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Contenido / Detalles descriptivos</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Describa los detalles de la oferta, plazos de entrega, vigencia, etc."
                rows={2}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-stone-600 mb-1">Imagen de la Promoción (Opcional)</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-stone-50 hover:bg-stone-100 text-[11px] font-semibold text-stone-700 rounded cursor-pointer transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Subir Imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-[10px] font-bold text-red-700 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Quitar imagen
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto pt-2">
                {editingBlockId ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBlock}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold rounded transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Guardar Cambios
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveBlock}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-800 text-stone-100 hover:bg-stone-700 text-xs font-semibold rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Aviso/Promo
                  </button>
                )}
              </div>
            </div>

            {image && (
              <div className="mt-2 p-1 border border-stone-200 rounded-lg max-w-[120px] bg-stone-50">
                <img src={image} alt="Preview banner" className="w-full h-16 object-cover rounded-md" />
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sortedBlocks.map(block => {
              const isBeingEdited = editingBlockId === block.id;
              return (
                <div 
                  key={block.id} 
                  className={`p-3 rounded-lg border transition-all flex items-start gap-3 relative ${
                    isBeingEdited 
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/30' 
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {block.image && (
                    <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 border border-stone-200 bg-white">
                      <img src={block.image} alt={block.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-serif font-bold text-xs text-stone-800 truncate">{block.title}</h4>
                      {block.badge && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {block.badge}
                        </span>
                      )}
                      {isBeingEdited && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Editando
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2">{block.content}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(block)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                      title="Editar Promoción"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRequest(block.id, e)}
                      className="p-1.5 text-stone-600 hover:text-red-600 bg-white hover:bg-red-50 border border-stone-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                      title="Eliminar Promoción"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {sortedBlocks.length === 0 && (
              <div className="text-center py-4 bg-stone-50 rounded text-[11px] text-stone-400 italic">
                Sin promociones ni avisos activos.
              </div>
            )}
          </div>
        </div>
      )}

      <CustomConfirm
        isOpen={deleteTargetId !== null}
        title="¿Eliminar promoción o aviso?"
        message="Esta acción eliminará permanentemente este anuncio promocional del catálogo tanto en la vista previa como en los archivos exportados. ¿Desea continuar?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
export type { CustomBlock };
