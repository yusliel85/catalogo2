import React, { useState, useRef, useEffect } from 'react';
import { CatalogProject, CustomBlock } from './types';
import { generateStandaloneCatalogHTML } from './exporter';
import { createFullJSONBackup, extractCatalogFromHTML } from './lib/backupService';
import { downloadFile } from './lib/downloadHelper';
import { scrollToAdminSection } from './lib/scrollUtils';
import {
  Download,
  FileCode,
  FileJson,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  AlertCircle,
  X
} from 'lucide-react';

interface ExporterAdminProps {
  project: CatalogProject;
  customBlocks: CustomBlock[];
  onOpenImport?: () => void;
  onImportText?: (jsonText: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface PendingHtmlRestore {
  fileName: string;
  extractedJson: string;
  project: CatalogProject;
  customBlocks: CustomBlock[];
}

export function ExporterAdmin({
  project,
  customBlocks,
  onOpenImport,
  onImportText,
  isOpen,
  onToggle
}: ExporterAdminProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  const [exportedHtml, setExportedHtml] = useState(false);
  const [exportedJson, setExportedJson] = useState(false);
  const [importedHtmlSuccess, setImportedHtmlSuccess] = useState(false);
  const [htmlImportError, setHtmlImportError] = useState<string | null>(null);
  const [pendingHtmlRestore, setPendingHtmlRestore] = useState<PendingHtmlRestore | null>(null);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportHTML = () => {
    const html = generateStandaloneCatalogHTML(project, customBlocks);
    downloadFile('index.html', html, 'text/html;charset=utf-8');
    setExportedHtml(true);
    setTimeout(() => setExportedHtml(false), 3000);
  };

  const handleExportJSON = () => {
    const json = createFullJSONBackup(project, customBlocks);
    const sanitizedName = (project.name || 'catalogo').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    downloadFile(`${sanitizedName}_backup.json`, json, 'application/json;charset=utf-8');
    setExportedJson(true);
    setTimeout(() => setExportedJson(false), 3000);
  };

  const handleTriggerHtmlImport = () => {
    setHtmlImportError(null);
    if (htmlFileInputRef.current) {
      htmlFileInputRef.current.value = '';
      htmlFileInputRef.current.click();
    }
  };

  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHtmlImportError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      try {
        const result = extractCatalogFromHTML(content || '');
        setPendingHtmlRestore({
          fileName: file.name,
          extractedJson: result.extractedJson,
          project: result.project,
          customBlocks: result.customBlocks
        });
      } catch (err: unknown) {
        setHtmlImportError(
          (err as Error).message || 'El archivo HTML no contiene datos válidos del catálogo'
        );
      }
    };
    reader.onerror = () => {
      setHtmlImportError('El archivo HTML no contiene datos válidos del catálogo');
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleConfirmHtmlRestore = () => {
    if (!pendingHtmlRestore || !onImportText) return;
    onImportText(pendingHtmlRestore.extractedJson);
    setPendingHtmlRestore(null);
    setHtmlImportError(null);
    setImportedHtmlSuccess(true);
    setTimeout(() => setImportedHtmlSuccess(false), 3500);
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
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-base">Exportación</h3>
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full text-xs font-semibold">
                HTML Autónomo
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Descarga del catálogo web autónomo y copias de seguridad
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
          <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200/70">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
              Catálogo Web Independiente
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Genera un archivo .html único, ligero y 100% autónomo con todos tus productos, imágenes y el contador de vistas sincronizado en tiempo real vía API. No requiere servidores ni bases de datos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              id="btn-export-html"
              onClick={handleExportHTML}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer transform active:scale-98"
            >
              {exportedHtml ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
              <span>{exportedHtml ? '¡Catálogo Exportado!' : 'Exportar Catálogo HTML'}</span>
            </button>

            <button
              type="button"
              id="btn-export-json"
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {exportedJson ? <Check className="w-4 h-4 text-emerald-600" /> : <FileJson className="w-4 h-4 text-stone-600" />}
              <span>{exportedJson ? '¡JSON Guardado!' : 'Copia de Seguridad JSON'}</span>
            </button>

            {onOpenImport && (
              <button
                type="button"
                id="btn-restore-json"
                onClick={onOpenImport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Restaurar copia de seguridad JSON"
              >
                <Upload className="w-4 h-4 text-stone-600" />
                <span>Restaurar Copia JSON</span>
              </button>
            )}

            <button
              type="button"
              id="btn-import-html"
              onClick={handleTriggerHtmlImport}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Importar catálogo desde un archivo HTML exportado previamente"
            >
              {importedHtmlSuccess ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <FileCode className="w-4 h-4 text-stone-600" />
              )}
              <span>{importedHtmlSuccess ? '¡HTML Restaurado!' : 'Importar HTML'}</span>
            </button>

            <input
              ref={htmlFileInputRef}
              type="file"
              id="input-import-html-file"
              accept=".html,.htm,text/html"
              onChange={handleHtmlFileChange}
              className="hidden"
            />
          </div>

          {htmlImportError && (
            <div
              id="html-import-error-banner"
              className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2 text-xs text-red-700 animate-fadeIn"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-semibold">{htmlImportError}</span>
              </div>
              <button
                type="button"
                onClick={() => setHtmlImportError(null)}
                className="p-1 text-red-500 hover:text-red-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {importedHtmlSuccess && (
            <div
              id="html-import-success-banner"
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fadeIn"
            >
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                ¡Catálogo restaurado correctamente desde el archivo HTML! Todos los productos, categorías, etiquetas, promociones y ajustes se han cargado.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmación antes de restaurar desde HTML */}
      {pendingHtmlRestore && (
        <div
          id="modal-confirm-html-restore"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 border border-amber-200/70 rounded-xl text-amber-700">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Confirmar restauración desde HTML
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingHtmlRestore(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <p>
                ¿Estás seguro de que deseas restaurar el catálogo desde el archivo{' '}
                <strong className="text-stone-900">{pendingHtmlRestore.fileName}</strong>?
              </p>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Nombre del catálogo:</span>
                  <span className="font-bold text-stone-900">
                    {pendingHtmlRestore.project.name || 'Sin nombre'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Productos incluidos:</span>
                  <span className="font-bold text-stone-900">
                    {pendingHtmlRestore.project.products?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Categorías:</span>
                  <span className="font-bold text-stone-900">
                    {Math.max(
                      0,
                      (pendingHtmlRestore.project.categories || []).filter((c) => c !== 'TODOS')
                        .length
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Promociones / Bloques:</span>
                  <span className="font-bold text-stone-900">
                    {pendingHtmlRestore.customBlocks?.length || 0}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200/70 rounded-xl p-2.5">
                Al confirmar, los datos actuales del gestor se reemplazarán por los datos extraídos del archivo HTML.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                id="btn-cancel-html-restore"
                onClick={() => setPendingHtmlRestore(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-html-restore"
                onClick={handleConfirmHtmlRestore}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Confirmar y Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

