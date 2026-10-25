package com.example.captionai

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {
  private var webView: WebView? = null
  private val startUrl = "http://192.168.29.28:3000/welcome"

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      AndroidView(
        modifier = Modifier
          .fillMaxSize()
          .systemBarsPadding(),
        factory = { context ->
          WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT
            )

            // Configure Cookie Manager for session persistence across requests
            val cookieManager = CookieManager.getInstance()
            cookieManager.setAcceptCookie(true)
            cookieManager.setAcceptThirdPartyCookies(this, true)

            settings.apply {
              javaScriptEnabled = true
              domStorageEnabled = true
              databaseEnabled = true
              useWideViewPort = true
              loadWithOverviewMode = true
              cacheMode = WebSettings.LOAD_DEFAULT
              allowFileAccess = true
              mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
              userAgentString = "$userAgentString CaptionAIMobileApp/1.0"
            }

            webViewClient = object : WebViewClient() {
              override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                cookieManager.flush()
              }

              @Deprecated("Deprecated in Java")
              override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
              ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                val offlineHtml = """
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body {
                        background-color: #091C14;
                        color: #FFFFFF;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justifyContent: center;
                        min-height: 90vh;
                        text-align: center;
                        padding: 24px;
                        margin: 0;
                        box-sizing: border-box;
                      }
                      .icon {
                        width: 60px;
                        height: 60px;
                        border-radius: 18px;
                        background: linear-gradient(135deg, #10B981, #059669);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 20px;
                      }
                      h2 { margin: 0 0 12px; font-size: 22px; }
                      p { color: #A7F3D0; font-size: 14px; line-height: 1.6; margin: 0 0 24px; max-width: 320px; }
                      .card {
                        background: rgba(255, 255, 255, 0.08);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 14px;
                        padding: 16px;
                        margin-bottom: 24px;
                        font-size: 13px;
                        text-align: left;
                        width: 100%;
                        max-width: 320px;
                        box-sizing: border-box;
                      }
                      .btn {
                        background: linear-gradient(135deg, #10B981, #059669);
                        color: #042217;
                        font-weight: 700;
                        border: none;
                        padding: 14px 28px;
                        border-radius: 12px;
                        font-size: 16px;
                        cursor: pointer;
                        width: 100%;
                        max-width: 320px;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="icon">C</div>
                    <h2>Caption AI Mobile</h2>
                    <p>Cannot connect to development server at <strong>192.168.29.28:3000</strong>.</p>
                    <div class="card">
                      <strong>Wi-Fi Connection Guide:</strong><br>
                      • Ensure your phone is connected to the <strong>same Wi-Fi router</strong> as your laptop.<br>
                      • If your phone is using mobile 5G/4G, switch Wi-Fi ON.<br>
                      • Keep 'npm run dev' running on your laptop.
                    </div>
                    <button class="btn" onclick="window.location.href='$startUrl'">🔄 Retry Connection</button>
                  </body>
                  </html>
                """.trimIndent()
                view?.loadDataWithBaseURL(null, offlineHtml, "text/html", "UTF-8", null)
              }
            }
            webChromeClient = WebChromeClient()

            clearCache(true)
            loadUrl(startUrl)
            webView = this
          }
        }
      )
    }
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    if (webView?.canGoBack() == true) {
      webView?.goBack()
    } else {
      super.onBackPressed()
    }
  }
}
