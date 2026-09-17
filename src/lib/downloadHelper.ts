/**
 * Universal file download helper that bridges standard browser downloads
 * and native Android WebView bridge (AndroidInterface) for 100% offline file saving.
 */

declare global {
  interface Window {
    AndroidInterface?: {
      saveFile: (fileName: string, content: string, mimeType: string) => boolean;
      shareCatalog?: (title: string, text: string, url: string) => void;
      showToast?: (message: string) => void;
      isAndroidApp?: () => boolean;
    };
  }
}

export function downloadFile(fileName: string, content: string, mimeType: string = 'text/html'): void {
  // 1. Check if running inside the native Android APK environment
  if (typeof window !== 'undefined' && window.AndroidInterface && typeof window.AndroidInterface.saveFile === 'function') {
    try {
      const handled = window.AndroidInterface.saveFile(fileName, content, mimeType);
      if (handled) {
        if (window.AndroidInterface.showToast) {
          window.AndroidInterface.showToast(`Archivo guardado: ${fileName}`);
        }
        return;
      }
    } catch (e) {
      console.warn('[downloadHelper] AndroidInterface saveFile failed, falling back to browser download', e);
    }
  }

  // 2. Standard Browser / PWA fallback
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);
  } catch (err) {
    console.error('[downloadHelper] Error downloading file:', err);
    // 3. Last-resort fallback for constrained webviews: data URI
    try {
      const encoded = encodeURIComponent(content);
      const link = document.createElement('a');
      link.href = `data:${mimeType};charset=utf-8,` + encoded;
      link.download = fileName;
      link.target = '_blank';
      link.click();
    } catch (fallbackErr) {
      console.error('[downloadHelper] Fallback download failed:', fallbackErr);
    }
  }
}

export function isRunningInAndroidApp(): boolean {
  return typeof window !== 'undefined' && !!window.AndroidInterface;
}
