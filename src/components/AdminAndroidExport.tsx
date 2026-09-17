import React, { useState } from 'react';
import { 
  Smartphone, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  CheckCircle2, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  FileCode2, 
  FolderArchive,
  Info
} from 'lucide-react';
import { isRunningInAndroidApp } from '../lib/downloadHelper';

export function AdminAndroidExport() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const isAndroid = isRunningInAndroidApp();

  const handleDownloadProjectZip = () => {
    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = './CatalogExporter-Android-Project.zip';
      link.download = 'CatalogExporter-Android-Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error initiating zip download:', e);
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-android-export-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
            <Smartphone className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
                Aplicación Android (.APK) & Código Nativo
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                {isAndroid ? 'Ejecutando en APK' : 'Offline 100%'}
              </span>
            </div>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                Estructura nativa AndroidX lista para compilar (.APK) con WebViewAssetLoader y almacenamiento offline garantizado.
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">
                Sistema completo empaquetado como aplicación Android nativa e independiente, certificada para modo avión.
              </p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-5 space-y-6">
          
          {/* Diagnostic & Compliance status grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-150 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Autonomía Offline Certificada</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Todos los binarios, scripts, estilos e iconografía residen dentro de <code className="bg-stone-200/60 px-1 py-0.5 rounded text-stone-700">/assets/www/</code> de la app. Cero peticiones de red para cargar la interfaz.
              </p>
            </div>

            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-150 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Persistencia Local Blindada</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Almacenamiento permanente en el teléfono con IndexedDB y base de datos privada en Android WebView. No se pierden datos al reiniciar.
              </p>
            </div>

            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-150 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Puente de Archivos & Descargas</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                <code className="bg-stone-200/60 px-1 py-0.5 rounded text-stone-700">AndroidInterface</code> permite guardar los archivos HTML y JSON directo en la carpeta <strong className="text-stone-700">Descargas</strong> de Android.
              </p>
            </div>

            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-150 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Selector de Fotos Nativo</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                <code className="bg-stone-200/60 px-1 py-0.5 rounded text-stone-700">WebChromeClient.onShowFileChooser</code> activo para elegir fotos directamente desde la galería o cámara de Android.
              </p>
            </div>
          </div>

          {/* Action Card: Download Android Project ZIP */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-xs text-stone-900">
                  Paquete del Proyecto Android Completo (.ZIP)
                </h3>
              </div>
              <p className="text-[11px] text-stone-600 max-w-xl">
                Incluye la estructura completa de Android Studio (<code className="text-stone-700">AndroidManifest.xml</code>, <code className="text-stone-700">MainActivity.kt</code>, <code className="text-stone-700">build.gradle</code>, <code className="text-stone-700">gradlew</code>) con todos los archivos compilados del sistema dentro de sus assets.
              </p>
            </div>

            <button
              onClick={handleDownloadProjectZip}
              disabled={isDownloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Descargando...' : 'Descargar Proyecto Android (.ZIP)'}
            </button>
          </div>

          {/* Compilation Guide / Step by step */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-stone-600" />
              Pasos para Compilar la APK (.apk):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Option A: Android Studio */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/70 space-y-2">
                <span className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-stone-800 text-white text-[10px] flex items-center justify-center">1</span>
                  Opción Visual (Android Studio - Recomendada):
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-stone-600 text-[11px] leading-relaxed pl-1">
                  <li>Descomprime el archivo <strong className="text-stone-700">CatalogExporter-Android-Project.zip</strong>.</li>
                  <li>Abre Android Studio y selecciona <strong className="text-stone-700">"Open"</strong> eligiendo la carpeta descomprimida.</li>
                  <li>Ve al menú: <strong className="text-stone-700">Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>.</li>
                  <li>En segundos obtendrás el archivo <code className="bg-stone-200/70 px-1 py-0.5 rounded text-stone-800">app-debug.apk</code> listo para instalar en cualquier teléfono.</li>
                </ol>
              </div>

              {/* Option B: Terminal / Command line */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/70 space-y-2">
                <span className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-stone-800 text-white text-[10px] flex items-center justify-center">2</span>
                  Opción Terminal / CLI:
                </span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  En cualquier equipo con Java (Linux, Mac o Windows), accede a la carpeta descomprimida y ejecuta:
                </p>
                <div className="p-2.5 bg-stone-900 text-stone-100 rounded-lg font-mono text-[10px] select-all overflow-x-auto">
                  ./gradlew assembleDebug
                </div>
                <p className="text-stone-500 text-[10px]">
                  El archivo final se ubicará en <code className="text-stone-600">app/build/outputs/apk/debug/app-debug.apk</code>.
                </p>
              </div>
            </div>

            {/* Note about airplane mode & testing */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Prueba de Modo Avión:</strong> Una vez instalada la APK en tu teléfono Android, puedes desconectar el Wi-Fi y datos móviles. La aplicación se abrirá desde el ícono nativo, permitiendo crear catálogos, cargar fotos, editar, ver la Vista Previa y generar el HTML autónomo completamente sin internet.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
