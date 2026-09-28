import React, { useState, useRef, useEffect } from 'react';
import { CatalogProduct } from '../types';
import { Plus, Trash2, Edit2, Image as ImageIcon, Check, X, Search, Tag, DollarSign, Box, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { compressImageFile } from '../lib/imageUtils';
import { scrollToAdminSection } from '../lib/scrollUtils';
import { CustomConfirm } from './CustomConfirm';

interface AdminProductsProps {
  products: CatalogProduct[];
  setProducts: React.Dispatch<React.SetStateAction<CatalogProduct[]>>;
  categories: string[];
  tags: string[];
  primaryColor?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminProducts({
  products,
  setProducts,
  categories,
  tags,
  primaryColor = '#8c6d58',
  isOpen,
  onToggle
}: AdminProductsProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState(categories[1] || 'General');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');
  const [moq, setMoq] = useState<number | ''>('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!isCollapsed) {
      scrollToAdminSection(sectionRef.current, 30);
    } else {
      setIsEditing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (isEditing && !isCollapsed) {
      scrollToAdminSection(sectionRef.current, 30);
    }
  }, [isEditing, editingId, isCollapsed]);

  const handleHeaderToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.material && p.material.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'TODOS' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSku('');
    setPrice('');
    setCurrency('USD');
    setCategory(categories[1] || 'General');
    setDescription('');
    setDimensions('');
    setMaterial('');
    setMoq('');
    setImages([]);
    setSelectedTags([]);
    setIsEditing(false);
  };

  const startEdit = (p: CatalogProduct) => {
    setEditingId(p.id);
    setName(p.name);
    setSku(p.sku);
    setPrice(p.price);
    setCurrency(p.currency || 'USD');
    setCategory(p.category);
    setDescription(p.description);
    setDimensions(p.dimensions || '');
    setMaterial(p.material || '');
    setMoq(p.moq || '');
    setImages(p.images || []);
    setSelectedTags(p.tags || []);
    setIsEditing(true);
    scrollToAdminSection(sectionRef.current, 40);
  };

  const handleStartNewProduct = () => {
    resetForm();
    setIsEditing(true);
    scrollToAdminSection(sectionRef.current, 40);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImageFile(files[i], 800, 0.82);
      if (compressed) newImages.push(compressed);
    }
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const productData: CatalogProduct = {
      id: editingId || `prod-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      price: typeof price === 'number' ? price : 0,
      currency,
      category,
      description: description.trim(),
      dimensions: dimensions.trim() || undefined,
      material: material.trim() || undefined,
      moq: typeof moq === 'number' ? moq : undefined,
      images: images.length > 0 ? images : ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f5f5f4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23a8a29e">Sin Imagen</text></svg>'],
      tags: selectedTags,
      createdAt: editingId ? products.find((p) => p.id === editingId)?.createdAt || Date.now() : Date.now()
    };

    if (editingId) {
      setProducts((prev) => prev.map((p) => (p.id === editingId ? productData : p)));
    } else {
      setProducts((prev) => [productData, ...prev]);
    }

    resetForm();
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTargetId));
    setDeleteTargetId(null);
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
          <div className="p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-700 group-hover:bg-amber-100 transition-colors shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-base">Productos</h3>
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full text-xs font-semibold">
                {products.length}
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Gestión de catálogo, precios, fotos y medidas
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-5 animate-fadeIn">
          {isEditing ? (
            <form
              onSubmit={handleSave}
              className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200/80 space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm">
                  {editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Silla Acapulco Clásica"
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    SKU / Código
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PROD-01"
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Moneda</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  >
                    {categories
                      .filter((c) => c !== 'TODOS')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla el material, diseño, uso y características..."
                  className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dimensiones
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="Ej. 75 x 85 x 90 cm"
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Material</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Ej. Madera de Roble"
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Pedido Mínimo (MOQ)
                  </label>
                  <input
                    type="number"
                    value={moq}
                    onChange={(e) =>
                      setMoq(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    placeholder="Ej. 10"
                    className="w-full min-w-0 text-sm px-3 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Imágenes del Producto
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-white"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 hover:border-stone-400 flex flex-col items-center justify-center cursor-pointer bg-white text-stone-400 hover:text-stone-600 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-semibold mt-1">Añadir</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, SKU o material..."
                    className="w-full min-w-0 text-xs pl-9 pr-3 py-2.5 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 sm:flex-initial min-w-0 text-xs px-3 py-2.5 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleStartNewProduct}
                    className="shrink-0 px-3.5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Nuevo Producto</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-2 sm:gap-3 hover:bg-stone-50/50 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-stone-900 leading-tight truncate">
                          {p.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-stone-500">
                          <span className="font-semibold text-stone-800">
                            ${p.price} {p.currency}
                          </span>
                          <span>•</span>
                          <span className="truncate">{p.category}</span>
                          {p.sku && <span className="truncate">• {p.sku}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar producto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(p.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <CustomConfirm
        isOpen={deleteTargetId !== null}
        title="¿Eliminar este producto?"
        message="Esta acción no se puede deshacer. El producto será eliminado del catálogo."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
