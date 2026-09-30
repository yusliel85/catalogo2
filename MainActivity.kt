package com.catalogo.interactivo

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val callback = filePathCallback ?: return@registerForActivityResult
        filePathCallback = null

        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val clipData = data?.clipData
            val results: Array<Uri>? = when {
                clipData != null -> Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                data?.data != null -> arrayOf(data.data!!)
                else -> null
            }
            callback.onReceiveValue(results)
        } else {
            callback.onReceiveValue(null)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        @Suppress("DEPRECATION")
        settings.allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        settings.allowUniversalAccessFromFileURLs = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url == "about:blank") {
                    finish()
                    return true
                }
                if (url.startsWith("whatsapp://") ||
                    url.startsWith("https://wa.me/") ||
                    url.startsWith("https://api.whatsapp.com/") ||
                    url.startsWith("tel:") ||
                    url.startsWith("mailto:")
                ) {
                    openExternalUri(Uri.parse(url))
                    return true
                }
                if ((url.startsWith("http://") || url.startsWith("https://")) &&
                    !url.contains("android_asset")
                ) {
                    openExternalUri(Uri.parse(url))
                    return true
                }
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                injectBlobDownloadAndShareBridge()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onCloseWindow(window: WebView?) {
                super.onCloseWindow(window)
                finish()
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                return try {
                    val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                        putExtra(
                            Intent.EXTRA_MIME_TYPES,
                            arrayOf("image/*", "application/json", "text/html", "text/plain")
                        )
                        if (fileChooserParams?.mode == FileChooserParams.MODE_OPEN_MULTIPLE) {
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                        }
                    }
                    fileChooserLauncher.launch(Intent.createChooser(intent, "Seleccionar archivo"))
                    true
                } catch (e: Exception) {
                    this@MainActivity.filePathCallback = null
                    false
                }
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(
                    """
                    (function() {
                      if (typeof window.handleAndroidBackButton === 'function') {
                        window.handleAndroidBackButton();
                        return 'HANDLED';
                      }
                      var exitBtn = document.getElementById('btn-return-preview');
                      if (exitBtn) {
                        exitBtn.click();
                        return 'HANDLED';
                      }
                      window.dispatchEvent(new PopStateEvent('popstate'));
                      return 'DISPATCHED';
                    })();
                    """.trimIndent(),
                    null
                )
            }
        })

        val hasPublicIndex = try {
            assets.open("public/index.html").close()
            true
        } catch (e: Exception) {
            false
        }

        if (hasPublicIndex) {
            webView.loadUrl("file:///android_asset/public/index.html")
        } else {
            webView.loadUrl("file:///android_asset/index.html")
        }
    }

    private fun openExternalUri(uri: Uri) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, uri)
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "No se pudo abrir el enlace externo", Toast.LENGTH_SHORT).show()
        }
    }

    private fun injectBlobDownloadAndShareBridge() {
        val js = """
            (function() {
              if (window.__androidBlobBridgeInstalled) return;
              window.__androidBlobBridgeInstalled = true;

              var origCreateObjectURL = URL.createObjectURL;
              var blobMap = new Map();
              URL.createObjectURL = function(obj) {
                var url = origCreateObjectURL.call(URL, obj);
                if (obj instanceof Blob) {
                  blobMap.set(url, obj);
                }
                return url;
              };

              var origClick = HTMLAnchorElement.prototype.click;
              HTMLAnchorElement.prototype.click = function() {
                var href = this.getAttribute('href') || this.href || '';
                var downloadName = this.getAttribute('download');
                if (downloadName && href.indexOf('blob:') === 0 && window.AndroidBridge) {
                  var blob = blobMap.get(href);
                  if (blob) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                      var base64data = reader.result || '';
                      var commaIdx = base64data.indexOf(',');
                      var rawBase64 = commaIdx >= 0 ? base64data.substring(commaIdx + 1) : base64data;
                      window.AndroidBridge.saveBase64File(
                        downloadName,
                        rawBase64,
                        blob.type || 'application/octet-stream'
                      );
                    };
                    reader.readAsDataURL(blob);
                    return;
                  }
                }
                return origClick.apply(this, arguments);
              };

              if (!navigator.canShare) {
                navigator.canShare = function() { return true; };
              }
              var origShare = navigator.share ? navigator.share.bind(navigator) : null;
              navigator.share = function(data) {
                if (data && data.files && data.files.length > 0 && window.AndroidBridge) {
                  var file = data.files[0];
                  return new Promise(function(resolve, reject) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                      var res = reader.result || '';
                      var comma = res.indexOf(',');
                      var b64 = comma >= 0 ? res.substring(comma + 1) : res;
                      window.AndroidBridge.shareFile(
                        file.name || 'producto.jpg',
                        b64,
                        file.type || 'image/jpeg',
                        data.text || data.title || ''
                      );
                      resolve();
                    };
                    reader.onerror = function(err) { reject(err); };
                    reader.readAsDataURL(file);
                  });
                }
                if (origShare) {
                  return origShare(data);
                }
                if (data && data.text && window.AndroidBridge) {
                  window.AndroidBridge.shareText(data.text);
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Share not supported'));
              };
            })();
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    inner class AndroidBridge {

        @JavascriptInterface
        fun saveFile(fileName: String, content: String, mimeType: String) {
            val bytes = content.toByteArray(Charsets.UTF_8)
            saveBytesToDownloads(fileName, bytes, mimeType)
        }

        @JavascriptInterface
        fun saveBase64File(fileName: String, base64Data: String, mimeType: String) {
            try {
                val bytes = Base64.decode(base64Data, Base64.DEFAULT)
                saveBytesToDownloads(fileName, bytes, mimeType)
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Error al guardar archivo: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }

        @JavascriptInterface
        fun shareFile(fileName: String, base64Data: String, mimeType: String, text: String) {
            try {
                val bytes = Base64.decode(base64Data, Base64.DEFAULT)
                val sharedDir = File(cacheDir, "shared_files").apply { mkdirs() }
                val safeName = fileName.replace(Regex("[^a-zA-Z0-9._-]"), "_")
                val outFile = File(sharedDir, safeName)
                FileOutputStream(outFile).use { it.write(bytes) }

                val contentUri = FileProvider.getUriForFile(
                    this@MainActivity,
                    "${applicationContext.packageName}.fileprovider",
                    outFile
                )

                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = mimeType.ifEmpty { "image/jpeg" }
                    putExtra(Intent.EXTRA_STREAM, contentUri)
                    if (text.isNotEmpty()) {
                        putExtra(Intent.EXTRA_TEXT, text)
                    }
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                startActivity(Intent.createChooser(shareIntent, "Compartir"))
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "No se pudo compartir: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }

        @JavascriptInterface
        fun shareText(text: String) {
            try {
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, text)
                }
                startActivity(Intent.createChooser(intent, "Compartir"))
            } catch (e: Exception) {
                // Ignore
            }
        }

        @JavascriptInterface
        fun closeApp() {
            runOnUiThread { finish() }
        }

        @JavascriptInterface
        fun exitApp() {
            runOnUiThread { finish() }
        }
    }

    private fun saveBytesToDownloads(fileName: String, bytes: ByteArray, mimeType: String) {
        try {
            val cleanMime = mimeType.split(";").firstOrNull()?.trim().orEmpty()
                .ifEmpty { "application/octet-stream" }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val resolver = contentResolver
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, cleanMime)
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { it.write(bytes) }
                }
            } else {
                @Suppress("DEPRECATION")
                val downloadsDir =
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) downloadsDir.mkdirs()
                val outFile = File(downloadsDir, fileName)
                FileOutputStream(outFile).use { it.write(bytes) }
            }

            runOnUiThread {
                Toast.makeText(
                    this@MainActivity,
                    "Archivo guardado en Descargas: $fileName",
                    Toast.LENGTH_LONG
                ).show()
            }
        } catch (e: Exception) {
            runOnUiThread {
                Toast.makeText(
                    this@MainActivity,
                    "Error guardando en Descargas: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}
