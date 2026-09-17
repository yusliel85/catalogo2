import React, { useState } from 'react';
import { CustomMessages } from '../types';
import { DEFAULT_CUSTOM_MESSAGES } from '../defaultData';
import { MessageSquare, Share2, Phone, RotateCcw, Check, Sparkles, ChevronDown, ChevronUp, Info, Copy } from 'lucide-react';

interface AdminMessagesProps {
  messages?: CustomMessages;
  setMessages: (messages: CustomMessages) => void;
}

export function AdminMessages({ messages, setMessages }: AdminMessagesProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'shareCatalog' | 'shareProduct' | 'consultProduct'>('shareCatalog');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentMsgs: CustomMessages = {
    shareCatalog: messages?.shareCatalog ?? DEFAULT_CUSTOM_MESSAGES.shareCatalog,
    shareProduct: messages?.shareProduct ?? DEFAULT_CUSTOM_MESSAGES.shareProduct,
    consultProduct: messages?.consultProduct ?? DEFAULT_CUSTOM_MESSAGES.consultProduct,
  };

  const handleChange = (key: keyof CustomMessages, value: string) => {
    setMessages({
      ...currentMsgs,
      [key]: value
    });
  };

  const handleReset = (key: keyof CustomMessages) => {
    setMessages({
      ...currentMsgs,
      [key]: DEFAULT_CUSTOM_MESSAGES[key]
    });
  };

  const insertVariable = (key: keyof CustomMessages, variableTag: string) => {
    const currentVal = currentMsgs[key] || '';
    handleChange(key, currentVal + variableTag);
  };

  // Sample data for rendering live preview
  const sampleData = {
    nombre_catalogo: 'Catálogo de Exhibición Primavera',
    empresa: 'Artesanías Globales S.A.',
    direccion: 'Av. Principal #123, Ciudad',
    url: 'https://mi-catalogo.com/',
    nombre: 'Silla Acapulco Clásica',
    categoria: 'Muebles de Exterior',
    descripcion: 'Diseño icónico tejido a mano con PVC flexible y marco de acero.',
    precio: '$89.99 USD',
    sku: 'CHR-01',
    imagen: '🖼️ Imagen: https://mi-catalogo.com/images/silla_acapulco.jpg'
  };

  const renderPreview = (template: string) => {
    let result = template || '';
    result = result
      .replace(/\{nombre_catalogo\}/gi, sampleData.nombre_catalogo)
      .replace(/\{nombre\}/gi, sampleData.nombre)
      .replace(/\{empresa\}/gi, sampleData.empresa)
      .replace(/\{direccion\}/gi, sampleData.direccion)
      .replace(/\{url\}/gi, sampleData.url)
      .replace(/\{categoria\}/gi, sampleData.categoria)
      .replace(/\{descripcion\}/gi, sampleData.descripcion)
      .replace(/\{precio\}/gi, sampleData.precio)
      .replace(/\{sku\}/gi, sampleData.sku)
      .replace(/\{imagen\}/gi, sampleData.imagen);

    return result;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200/80 font-sans transition-all duration-200" id="admin-messages-section">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <span>Compartir WhatsApp</span>
            </h2>
            <p className="text-xs text-stone-500">
              Personaliza el texto automático que se enviará al compartir tu catálogo, productos o recibir consultas por WhatsApp.
            </p>
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      {!isCollapsed && (
        <div className="p-5 pt-0 border-t border-stone-100 space-y-6">
          {/* Subtabs selector */}
          <div className="flex flex-wrap gap-2 pt-4 border-b border-stone-100 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('shareCatalog')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'shareCatalog'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Compartir Catálogo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shareProduct')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'shareProduct'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Compartir Producto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('consultProduct')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'consultProduct'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Consultar / Cotizar por WhatsApp</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Template Editor */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {activeTab === 'shareCatalog' && 'Plantilla: Compartir Catálogo Completo'}
                    {activeTab === 'shareProduct' && 'Plantilla: Compartir Producto Individual'}
                    {activeTab === 'consultProduct' && 'Plantilla: Consulta de Producto por WhatsApp'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleReset(activeTab)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-amber-700 transition-colors cursor-pointer"
                  title="Restablecer plantilla predeterminada"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer</span>
                </button>
              </div>

              <textarea
                rows={7}
                value={currentMsgs[activeTab] || ''}
                onChange={(e) => handleChange(activeTab, e.target.value)}
                placeholder="Escribe el mensaje o usa los botones de abajo para insertar variables..."
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner"
              />

              {/* Variables Insertion Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-500 block">
                  Haz clic en una variable para agregarla al mensaje:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTab === 'shareCatalog' && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertVariable('shareCatalog', ' {nombre_catalogo}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;nombre_catalogo&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable('shareCatalog', ' {empresa}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;empresa&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable('shareCatalog', ' {direccion}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;direccion&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable('shareCatalog', ' {url}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;url&#125;
                      </button>
                    </>
                  )}

                  {(activeTab === 'shareProduct' || activeTab === 'consultProduct') && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {nombre}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;nombre&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {categoria}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;categoria&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {descripcion}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;descripcion&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {precio}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;precio&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {sku}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;sku&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {imagen}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;imagen&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {empresa}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;empresa&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {direccion}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;direccion&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable(activeTab, ' {url}')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                      >
                        + &#123;url&#125;
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-stone-500">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  Tip de formato WhatsApp: Usa <strong>*texto*</strong> para negrita, <strong>_texto_</strong> para cursiva y salto de línea para separar párrafos.
                </span>
              </div>
            </div>

            {/* Right Col: Live Preview */}
            <div className="lg:col-span-5 bg-stone-900 rounded-xl p-4 text-white flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-stone-200">Vista Previa del Mensaje</span>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    {activeTab === 'shareCatalog' ? 'Compartir' : activeTab === 'shareProduct' ? 'Producto' : 'WhatsApp'}
                  </span>
                </div>

                <div className="bg-stone-800/90 rounded-lg p-3.5 text-xs text-stone-200 whitespace-pre-wrap font-sans border border-stone-700/60 leading-relaxed">
                  {renderPreview(currentMsgs[activeTab] || '')}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                <span>Variables de ejemplo rellenadas automáticamente</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(renderPreview(currentMsgs[activeTab] || ''));
                    setCopiedSuccess(true);
                    setTimeout(() => setCopiedSuccess(false), 2000);
                  }}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Prueba</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
