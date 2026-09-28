export function isRunningInAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as unknown as { AndroidBridge?: unknown }).AndroidBridge ||
    navigator.userAgent.includes('wv') ||
    (navigator.userAgent.includes('Android') && navigator.userAgent.includes('Version/'))
  );
}

export function downloadFile(fileName: string, content: string, mimeType = 'text/html;charset=utf-8') {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  } catch (err) {
    console.error('Error downloading file:', err);
  }
}
