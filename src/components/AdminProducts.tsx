import React, { useState } from 'react';
import { CatalogProduct } from '../types';
import { Plus, Trash2, Edit2, Check, RefreshCw, Upload, Image as ImageIcon, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { CustomConfirm } from './CustomConfirm';
import { compressImageFile } from '../lib/imageUtils';
import { sortProductsNewestFirst, getProductSortTimestamp } from '../lib/productUtils';

interface AdminProductsProps {
  products: CatalogProduct[];
  categories: string[];
  tags?: string[];
  setProducts: React.Dispatch<React.SetStateAction<CatalogProduct[]>>;
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setTags?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function AdminProducts({ products, categories, tags = [], setProducts, setCategories, setTags }: AdminProductsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');
  const [moq, setMoq] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [colorsString, setColorsString] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [viewsCount, setViewsCount] = useState('');

  // Compute union of available categories from categories prop and existing products
  const availableCategories = React.useMemo(() => {
    const set = new Set<string>();
    (categories || []).forEach(c => {
      if (c && typeof c === 'string' && c.trim() !== '' && c.toUpperCase() !== 'TODOS') {
        set.add(c.trim());
      }
    });
    (products || []).forEach(p => {
      const pCats = (Array.isArray(p.categories) && p.categories.length > 0)
        ? p.categories
        : (p.category ? [p.category] : []);
      pCats.forEach(c => {
        if (c && typeof c === 'string' && c.trim() !== '' && c.toUpperCase() !== 'TODOS') {
          set.add(c.trim());
        }
      });
    });
    if (set.size === 0) {
      set.add('General');
    }
    return Array.from(set);
  }, [categories, products]);

  // Handle image upload base64 with automatic optimization
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressedDataUrl = await compressImageFile(file, 1000, 0.8);
      if (compressedDataUrl) {
        setImages(prev => {
          const clean = prev.filter(img => img && img.trim() !== '');
          return [...clean, compressedDataUrl];
        });
      }
      e.target.value = '';
    }
  };

  const clearForm = () => {
    setName('');
    setSku('');
    setPrice('');
    setCurrency('');
    setCategory('');
    setSelectedCategories([]);
    setCustomCategoryInput('');
    setDescription('');
    setDimensions('');
    setMaterial('');
    setMoq('');
    setImages([]);
    setPrimaryImageIndex(0);
    setColorsString('');
    setTagsString('');
    setViewsCount('');
    setEditingId(null);
    setIsAdding(false);
    setErrorMsg(null);
  };

  const getProdLiveViews = (p: CatalogProduct) => {
    let stored = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('catalog-views-') || k.startsWith('interactive-catalog-views-'))) {
          const val = JSON.parse(localStorage.getItem(k) || '{}');
          if (val && typeof val[p.id] === 'number') {
            stored = Math.max(stored, val[p.id]);
          }
        }
      }
    } catch(e) {}
    return Math.max(p.viewsCount ?? 0, stored);
  };

  const formRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const el = document.getElementById('product-form');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 80);
  };

  const handleEdit = (prod: CatalogProduct) => {
    setErrorMsg(null);
    setIsCollapsed(false);
    setEditingId(prod.id);
    setName(prod.name);
    setSku(prod.sku);
    setPrice(prod.price ? prod.price.toString() : '');
    setCurrency(prod.currency || '');
    setCategory(prod.category || '');
    const prodCats = (prod.categories && prod.categories.length > 0) ? prod.categories : (prod.category ? [prod.category] : []);
    setSelectedCategories(prodCats);
    setCustomCategoryInput('');
    setDescription(prod.description || '');
    setDimensions(prod.dimensions || '');
    setMaterial(prod.material || '');
    setMoq(prod.moq ? prod.moq.toString() : '');
    setImages((prod.images || []).filter(img => img && img.trim() !== ''));
    setPrimaryImageIndex(prod.primaryImageIndex ?? 0);
    setColorsString((prod.colors || []).join(', '));
    setTagsString((prod.tags || []).join(', '));
    const liveViews = getProdLiveViews(prod);
    setViewsCount(liveViews > 0 ? liveViews.toString() : (prod.viewsCount !== undefined ? prod.viewsCount.toString() : ''));
    setIsAdding(true);
    scrollToForm();
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      setProducts(prev => prev.filter(p => p.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Por favor ingrese el nombre del producto.');
      return;
    }

    let finalSku = sku.trim();
    if (!finalSku) {
      finalSku = 'COD-' + Math.floor(1000 + Math.random() * 9000);
    }

    const cleanColors = colorsString
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    const cleanTags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const cleanImages = images.filter(img => img && img.trim() !== '');

    const finalCategories = selectedCategories.length > 0
      ? selectedCategories
      : (category.trim() ? [category.trim()] : ['General']);
    const primaryCategory = finalCategories[0] || 'General';

    const existingProduct = editingId ? products.find(p => p.id === editingId) : null;
    const now = Date.now();
    const highestExistingTs = products.reduce((max, p) => Math.max(max, getProductSortTimestamp(p)), 0);
    const resolvedCreatedAt = editingId 
      ? (existingProduct?.createdAt || getProductSortTimestamp(existingProduct) || now)
      : Math.max(now, highestExistingTs + 1000);

    const parsedPrice = price && price.trim() !== '' ? parseFloat(price.replace(',', '.')) : 0;

    const productData: CatalogProduct = {
      id: editingId || 'prod-' + resolvedCreatedAt,
      createdAt: resolvedCreatedAt,
      name: name.trim(),
      sku: finalSku,
      price: isNaN(parsedPrice) ? 0 : parsedPrice,
      currency: currency || 'USD',
      category: primaryCategory,
      categories: finalCategories,
      description: description.trim(),
      dimensions: dimensions.trim() || undefined,
      material: material.trim() || undefined,
      moq: moq && moq.trim() !== '' ? parseInt(moq, 10) : undefined,
      images: cleanImages,
      primaryImageIndex: primaryImageIndex < cleanImages.length ? primaryImageIndex : 0,
      colors: cleanColors.length > 0 ? cleanColors : undefined,
      tags: cleanTags.length > 0 ? cleanTags : undefined,
      viewsCount: viewsCount && viewsCount.trim() !== '' ? parseInt(viewsCount, 10) : undefined,
    };

    if (editingId) {
      setProducts(prev => sortProductsNewestFirst(prev.map(p => p.id === editingId ? productData : p)));
    } else {
      setProducts(prev => sortProductsNewestFirst([productData, ...prev]));
    }

    // Add new categories to current global list if not existing
    finalCategories.forEach(cat => {
      if (cat && !categories.includes(cat)) {
        setCategories(prev => [...prev, cat]);
      }
    });

    // Add new tags to global tags list if not exists
    if (cleanTags.length > 0 && setTags) {
      setTags(prev => {
        const existing = new Set(prev);
        const toAdd = cleanTags.filter(t => !existing.has(t));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }

    clearForm();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden transition-all duration-200 hover:border-stone-200" id="admin-products-view">
      {/* Clickable Header for collapsing */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
            <ImageIcon className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Productos
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                {`Total: ${products.length} productos cargados • Categorías activas: ${categories.filter(c => c !== 'TODOS').length}`}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Agregue, edite o retire los productos y materiales que exporta.</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isAdding && !isCollapsed && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); // Avoid triggering collapse toggle when clicking the add button
                setIsAdding(true); 
                setEditingId(null); 
                scrollToForm();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-stone-100 hover:bg-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
              id="add-product-btn"
            >
              <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
          )}
          <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-6 border-t border-stone-100/60">
        {isAdding ? (
          <div ref={formRef} className="bg-stone-50 p-5 rounded-lg border border-stone-200 mb-6 space-y-4 shadow-sm" id="product-form">
            <h3 className="font-semibold text-stone-800 text-sm flex items-center justify-between">
              <span>{editingId ? 'Editar Producto Seleccionado' : 'Crear Ficha de Nuevo Producto'}</span>
              {editingId && (
                <span className="text-[11px] font-mono text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
                  ID: {editingId}
                </span>
              )}
            </h3>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-xs font-semibold text-red-700">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Silla Acapulco"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Categorías (Puedes seleccionar una o varias)</label>
                
                {/* Selected categories chips */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[38px] p-2 bg-stone-50 border border-stone-200 rounded-lg items-center">
                  {selectedCategories.length === 0 ? (
                    <span className="text-xs text-stone-400 italic">Sin categorías asignadas (Haga clic abajo o seleccione de la lista)</span>
                  ) : (
                    selectedCategories.map(cat => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-stone-800 text-stone-100 rounded-md font-medium"
                      >
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                          className="hover:text-amber-400 font-bold ml-1 cursor-pointer"
                          title="Eliminar categoría"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown to pick from existing categories */}
                <div className="mb-2">
                  <select
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none cursor-pointer text-stone-700 font-medium"
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !selectedCategories.includes(val)) {
                        setSelectedCategories(prev => [...prev, val]);
                      }
                    }}
                  >
                    <option value="" disabled>-- Seleccionar de la lista de categorías ({availableCategories.length}) --</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat} disabled={selectedCategories.includes(cat)}>
                        {selectedCategories.includes(cat) ? `✓ ${cat} (Ya asignada)` : `+ ${cat}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Categories quick toggle buttons */}
                <div className="space-y-1.5 mb-2">
                  <span className="block text-[11px] font-bold text-stone-600">Categorías disponibles en el catálogo:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-stone-50/80 rounded border border-stone-200">
                    {availableCategories.map(cat => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCategories(prev => prev.filter(c => c !== cat));
                            } else {
                              setSelectedCategories(prev => [...prev, cat]);
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer border font-medium flex items-center gap-1 ${
                            isSelected
                              ? 'bg-stone-800 text-white border-stone-800 font-bold'
                              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add new custom category input */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={e => setCustomCategoryInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customCategoryInput.trim()) {
                          const newC = customCategoryInput.trim();
                          if (!selectedCategories.includes(newC)) {
                            setSelectedCategories(prev => [...prev, newC]);
                          }
                          setCustomCategoryInput('');
                        }
                      }
                    }}
                    placeholder="¿Otra categoría? Escriba y presione Agregar..."
                    className="flex-grow text-xs p-2 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCategoryInput.trim()) {
                        const newC = customCategoryInput.trim();
                        if (!selectedCategories.includes(newC)) {
                          setSelectedCategories(prev => [...prev, newC]);
                        }
                        setCustomCategoryInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded transition-colors cursor-pointer shrink-0"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Precio Unitario FOB</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Ej: 15.50"
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-l focus:border-stone-500 focus:outline-none"
                  />
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="text-xs p-2.5 bg-white border border-l-0 border-stone-300 rounded-r focus:border-stone-500 focus:outline-none w-20"
                  >
                    <option value="">Divisa</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                    <option value="COP">COP</option>
                    <option value="PEN">PEN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Cantidad Mínima (MOQ)</label>
                <input
                  type="number"
                  value={moq}
                  onChange={e => setMoq(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Visualizaciones Base (Views)</label>
                <input
                  type="number"
                  value={viewsCount}
                  onChange={e => setViewsCount(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                  placeholder="Ej: 150"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Dimensiones / Medidas</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  placeholder="Ej: 80x80x90 cm"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Materiales principales</label>
                <input
                  type="text"
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  placeholder="Ej: Madera de Mango, Rafia"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Colores Disponibles (separados por coma)</label>
                <input
                  type="text"
                  value={colorsString}
                  onChange={e => setColorsString(e.target.value)}
                  placeholder="Blanco, Negro, Azul, Verde"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Etiquetas/Tags (separados por coma)</label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={e => setTagsString(e.target.value)}
                  placeholder="Retro, Sostenible, Hand-made"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-[10px] text-stone-400 self-center mr-0.5">Sugeridos:</span>
                    {tags.map(t => {
                      const currentTags = tagsString.split(',').map(s => s.trim().toLowerCase());
                      const isSelected = currentTags.includes(t.toLowerCase());
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            const arr = tagsString.split(',').map(s => s.trim()).filter(Boolean);
                            if (isSelected) {
                              setTagsString(arr.filter(s => s.toLowerCase() !== t.toLowerCase()).join(', '));
                            } else {
                              setTagsString([...arr, t].join(', '));
                            }
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-600 font-bold'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-200'
                          }`}
                        >
                          #{t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Descripción de Exhibición</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Escriba los detalles del producto, origen o historia para llamar la atención del comprador internacional..."
                rows={3}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
              />
            </div>

            {/* Image Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  Imágenes del Producto (JPG/PNG/WEBP)
                </label>
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setImages([]);
                      setPrimaryImageIndex(0);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Eliminar todas las imágenes asignadas a este producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar {images.length > 1 ? 'todas las fotos' : 'la foto'}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-lg p-3 bg-white hover:bg-stone-50 cursor-pointer min-w-[110px] h-[105px] transition-colors">
                  <Upload className="w-5 h-5 text-stone-400 mb-1" />
                  <span className="text-xs font-semibold text-stone-600 font-sans text-center">Subir Foto</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {images.map((img, idx) => {
                  const isPrimary = idx === primaryImageIndex;
                  return (
                    <div key={idx} className={`relative w-[105px] h-[105px] border rounded-lg overflow-hidden group transition-all bg-stone-50 ${
                      isPrimary ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-stone-200'
                    }`}>
                      {img ? (
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-stone-300" />
                        </div>
                      )}

                      {/* Always Visible Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages(prev => prev.filter((_, i) => i !== idx));
                          if (isPrimary) {
                            setPrimaryImageIndex(0);
                          } else if (primaryImageIndex > idx) {
                            setPrimaryImageIndex(prev => prev - 1);
                          }
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md z-30 transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Principal Badge / Set Principal Button */}
                      {isPrimary ? (
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[11px] font-bold text-center py-0.5 select-none font-sans z-10 shadow-sm">
                          ★ Principal
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryImageIndex(idx)}
                          className="absolute bottom-0 inset-x-0 bg-stone-900/80 hover:bg-stone-900 text-white text-[10px] font-bold text-center py-1 font-sans cursor-pointer z-10 transition-colors"
                          title="Establecer como imagen principal"
                        >
                          Usar Principal
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-2 bg-stone-200 text-stone-700 hover:bg-stone-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-stone-100 hover:bg-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer animate-pulse"
              >
                <Check className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </div>
        ) : null}

        {/* Existing Products List Grid */}
        {products.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-stone-500">
            <p className="text-sm font-semibold text-stone-700">No hay productos en este catálogo</p>
            <p className="text-xs text-stone-500 mt-1 mb-4">Puedes registrar un nuevo artículo o restaurar los productos de muestra iniciales.</p>
            <button
              type="button"
              onClick={() => {
                import('../defaultData').then(d => {
                  setProducts(d.INITIAL_PRODUCTS);
                });
              }}
              className="px-4 py-2 bg-stone-800 text-stone-100 hover:bg-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restaurar Productos de Muestra
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="products-list-grid">
            {sortProductsNewestFirst(products).map(prod => (
              <div key={prod.id} className="p-4 rounded-xl border border-stone-200 flex gap-4 hover:border-stone-400 transition-colors bg-white relative">
                <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {prod.images && (prod.images[prod.primaryImageIndex ?? 0] || prod.images[0]) ? (
                    <img src={prod.images[prod.primaryImageIndex ?? 0] || prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-stone-300" />
                  )}
                </div>
                <div className="flex-grow min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-stone-800 truncate text-sm flex-1">{prod.name}</h4>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0" title="Visualizaciones / Views">
                        <Eye className="w-3 h-3" /> {getProdLiveViews(prod)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {((prod.categories && prod.categories.length > 0) ? prod.categories : [prod.category || 'General']).map((cat, idx) => (
                        <span key={idx} className="text-[10px] text-stone-600 font-medium bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1">{prod.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
                    <span className="text-xs font-bold text-stone-800">
                      {prod.price > 0 ? `${prod.price} ${prod.currency}` : 'Consultar Precio'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-1.5 text-stone-600 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 text-stone-600 hover:text-red-600 bg-stone-50 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
      
      <CustomConfirm
        isOpen={deleteTargetId !== null}
        title="¿Eliminar producto?"
        message="¿Seguro que desea eliminar este producto del catálogo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Conservar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
