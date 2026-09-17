package com.catalogexporter.pro

import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.*
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    // Activity result launcher for file/image picking from Android storage or camera
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            var results: Array<Uri>? = when {
                intent?.clipData != null -> {
                    val count = intent.clipData!!.itemCount
                    Array(count) { i -> intent.clipData!!.getItemAt(i).uri }
                }
                intent?.data != null -> arrayOf(intent.data!!)
                else -> null
            }
            // Check if photo was captured via camera intent
            if (results == null && cameraImageUri != null) {
                results = arrayOf(cameraImageUri!!)
            }
            fileChooserCallback?.onReceiveValue(results)
        } else {
            fileChooserCallback?.onReceiveValue(null)
        }
        fileChooserCallback = null
        cameraImageUri = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        setupWebView()
        loadLocalApp()
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.setSupportZoom(true)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.mediaPlaybackRequiresUserGesture = false

        // Cache mode: Prefer local assets with instant offline loading
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Asset Loader: Serves local bundled assets from /assets/www via safe virtual origin
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val url = request?.url ?: return null
                return assetLoader.shouldInterceptRequest(url)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false

                // If URL is an external link (WhatsApp, phone, mail, or external website), launch via Android Intent
                if (url.startsWith("https://wa.me") || 
                    url.startsWith("https://api.whatsapp.com") || 
                    url.startsWith("tel:") || 
                    url.startsWith("mailto:") ||
                    (!url.contains("appassets.androidplatform.net") && (url.startsWith("http://") || url.startsWith("https://")))) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivity, "No se pudo abrir la aplicación externa", Toast.LENGTH_SHORT).show()
                    }
                }
                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            // Native File/Image Chooser for <input type="file"> with camera photo capture and file/gallery picker
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback

                val acceptTypes = fileChooserParams?.acceptTypes
                val isImageRequested = acceptTypes.isNullOrEmpty() || acceptTypes.any { 
                    it.contains("image", ignoreCase = true) || it == "*/*" 
                }

                var takePictureIntent: Intent? = null
                if (isImageRequested) {
                    try {
                        val photoFile = File.createTempFile("photo_", ".jpg", externalCacheDir ?: cacheDir)
                        cameraImageUri = FileProvider.getUriForFile(
                            this@MainActivity,
                            "${applicationContext.packageName}.fileprovider",
                            photoFile
                        )
                        takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                            putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                            addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                    } catch (e: Exception) {
                        cameraImageUri = null
                    }
                }

                val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    if (!acceptTypes.isNullOrEmpty() && acceptTypes[0].isNotEmpty()) {
                        putExtra(Intent.EXTRA_MIME_TYPES, acceptTypes)
                    }
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                val intentArray: Array<Intent> = if (takePictureIntent != null) {
                    arrayOf(takePictureIntent)
                } else {
                    emptyArray()
                }

                val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
                    putExtra(Intent.EXTRA_TITLE, "Cámara o Archivos")
                    if (intentArray.isNotEmpty()) {
                        putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
                    }
                }

                try {
                    filePickerLauncher.launch(chooserIntent)
                } catch (e: Exception) {
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = null
                    cameraImageUri = null
                    return false
                }
                return true
            }

            // JavaScript alert dialog handling
            override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setTitle("Información")
                    .setMessage(message ?: "")
                    .setPositiveButton("Aceptar") { _, _ -> result?.confirm() }
                    .setOnCancelListener { result?.confirm() }
                    .show()
                return true
            }

            // JavaScript confirm dialog handling
            override fun onJsConfirm(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setTitle("Confirmar")
                    .setMessage(message ?: "")
                    .setPositiveButton("Aceptar") { _, _ -> result?.confirm() }
                    .setNegativeButton("Cancelar") { _, _ -> result?.cancel() }
                    .setOnCancelListener { result?.cancel() }
                    .show()
                return true
            }
        }

        // Bridge between web JavaScript and native Android
        webView.addJavascriptInterface(AndroidInterface(), "AndroidInterface")
    }

    private fun loadLocalApp() {
        // Load the 100% offline self-contained web app from local assets
        webView.loadUrl("https://appassets.androidplatform.net/www/index.html")
    }

    inner class AndroidInterface {

        @JavascriptInterface
        fun isAndroidApp(): Boolean {
            return true
        }

        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun saveFile(fileName: String, content: String, mimeType: String): Boolean {
            return try {
                val bytes = if (content.startsWith("data:") && content.contains(";base64,")) {
                    val base64Data = content.substringAfter(";base64,")
                    Base64.decode(base64Data, Base64.DEFAULT)
                } else {
                    content.toByteArray(Charsets.UTF_8)
                }

                val savedUri = saveToDownloads(fileName, bytes, mimeType)
                if (savedUri != null) {
                    runOnUiThread {
                        Toast.makeText(
                            this@MainActivity,
                            "💾 Guardado con éxito en Descargas:\n$fileName",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                    true
                } else {
                    false
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Error al guardar archivo: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
                false
            }
        }

        @JavascriptInterface
        fun shareCatalog(title: String, text: String, url: String) {
            runOnUiThread {
                val sendIntent = Intent().apply {
                    action = Intent.ACTION_SEND
                    putExtra(Intent.EXTRA_TITLE, title)
                    putExtra(Intent.EXTRA_TEXT, "$text\n$url")
                    type = "text/plain"
                }
                val shareIntent = Intent.createChooser(sendIntent, title)
                startActivity(shareIntent)
            }
        }

        private fun saveToDownloads(fileName: String, bytes: ByteArray, mimeType: String): Uri? {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                val resolver = contentResolver
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { outputStream ->
                        outputStream.write(bytes)
                        outputStream.flush()
                    }
                }
                uri
            } else {
                @Suppress("DEPRECATION")
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs()
                }
                val file = File(downloadsDir, fileName)
                FileOutputStream(file).use { outputStream ->
                    outputStream.write(bytes)
                    outputStream.flush()
                }
                Uri.fromFile(file)
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
