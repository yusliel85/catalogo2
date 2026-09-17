import React, { useState } from 'react';
import { CatalogProject } from './types';
import { CustomBlock } from './components/AdminBlocks';
import { generateStandaloneCatalogHTML } from './exporter';
import { Download, FileDown, Rocket, Check, ExternalLink, ChevronDown, ChevronUp, FileJson, Upload, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createFullJSONBackup } from './lib/backupService';
import { downloadFile } from './lib/downloadHelper';

interface ExporterAdminProps {
  project: CatalogProject;
  projects?: CatalogProject[];
  customBlocks: CustomBlock[];
  onImportConfig?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenImportModal?: () => void;
}

export function ExporterAdmin({ project, projects, customBlocks, onImportConfig, onOpenImportModal }: ExporterAdminProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 140,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      let origin = window.location.origin;
      if (origin && origin !== 'null' && !origin.startsWith('file:')) {
        if (origin.includes('-dev-')) {
          origin = origin.replace('-dev-', '-pre-');
        }
        return origin;
      }
    }
    return 'https://ais-pre-tvnitfjrirlgmma5m3vptj-811628296425.us-east1.run.app';
  };

  const handleDownloadStandalone = () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const pId = project.id;
      let accumulatedViews: Record<string, number> = {};
      try {
        const stored = localStorage.getItem(`catalog-views-${pId}`) || localStorage.getItem(`interactive-catalog-views-${pId}`);
        if (stored) {
          accumulatedViews = JSON.parse(stored) || {};
        }
      } catch(e) {}

      const updatedProducts = (project.products || []).map(p => {
        const totalViews = Math.max(p.viewsCount || 0, accumulatedViews[p.id] || 0);
        return { ...p, viewsCount: totalViews };
      });

      const projectToExport: CatalogProject = {
        ...project,
        products: updatedProducts
      };

      const htmlContent = generateStandaloneCatalogHTML(projectToExport, customBlocks, apiBaseUrl);
      downloadFile('index.html', htmlContent, 'text/html');
      
      triggerConfetti();
      alert('¡Excelente! Tu catálogo standalone autocorrespondido e interactivo ha sido descargado. Puedes enviárselo directamente a tus clientes o subirlo a un hosting estático (Netlify, Vercel, GitHub Pages).');
    } catch (e: any) {
      alert('Hubo un error al compilar el catálogo: ' + e.message);
    }
  };

  const handleExportJSON = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setProgressMsg('Preparando respaldo completo...');

    try {
      const result = await createFullJSONBackup(
        project,
        projects,
        customBlocks,
        (msg) => setProgressMsg(msg)
      );

      downloadFile(result.filename, result.jsonString, 'application/json');

      triggerConfetti();

      let alertMessage = `💾 ¡Respaldo .JSON generado con éxito!\n\nSe incluyeron todos los datos del proyecto y ${result.totalImages} imagen(es) codificadas en Base64 de forma autosuficiente.`;
      if (result.failedImages > 0) {
        alertMessage += `\n\n⚠️ Nota: ${result.failedImages} imagen(es) externas no pudieron convertirse a Base64 por restricciones de la red origen, pero se conservó su enlace original.`;
      }

      alert(alertMessage);
    } catch (e: any) {
      alert('Error al exportar respaldo .JSON: ' + (e?.message || 'Error desconocido'));
    } finally {
      setIsExporting(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="exporter-admin-panel">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-50 rounded-lg text-sky-700">
            <Rocket className="w-5 h-5 text-sky-700 animate-bounce duration-1000" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Publicación
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                Descargar catálogo HTML o respaldar/restaurar archivo de configuración .JSON.
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Exporta el proyecto completo para distribuirlo o resguardar todos tus datos.</p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              {/* Standalone HTML Catalog Download Button */}
              <button
                type="button"
                onClick={handleDownloadStandalone}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold rounded-lg border border-amber-600/80 shadow-xs transition-all cursor-pointer"
                title="Descargar catálogo estático autónomo .HTML con todos los productos e imágenes"
              >
                <FileDown className="w-4 h-4 text-stone-900" />
                <span>🚀 Exportar Catálogo (.HTML)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleExportJSON}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Guarda en archivo .JSON todos los productos, categorías, etiquetas, contacto, colores, menú y bloques con sus imágenes en Base64"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-stone-600 animate-spin" />
                      <span>Generando Base64...</span>
                    </>
                  ) : (
                    <>
                      <FileJson className="w-4 h-4 text-stone-600" />
                      <span>💾 Respaldar (.JSON)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenImportModal || (() => {
                    const el = document.getElementById('global-json-import-input');
                    if (el) el.click();
                  })}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-lg border border-stone-200/80 transition-colors cursor-pointer"
                  title="Cargar archivo .JSON o .HTML exportado para restaurar todo el catálogo"
                >
                  <Upload className="w-4 h-4 text-amber-700" />
                  <span>📥 Restaurar (.JSON / .HTML)</span>
                </button>
              </div>

              <p className="text-[10px] text-stone-400 text-center italic leading-tight">
                El archivo .JSON guarda absolutamente todo lo editable (productos, precios, categorías, etiquetas, contacto, colores, menú y bloques) para actualizar sin perder nada.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

