package xyz.josapedmoreno.hwvci

import com.intellisrc.core.Config
import com.intellisrc.core.Log
import com.intellisrc.core.SysService
import com.intellisrc.db.Database
import io.ktor.serialization.gson.gson
import io.ktor.server.application.install
import io.ktor.server.engine.ApplicationEngine
import io.ktor.server.engine.EmbeddedServer
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.sse.SSE
import xyz.josapedmoreno.hwvci.control.BookApi
import xyz.josapedmoreno.hwvci.services.InMemorySessionStorage
import xyz.josapedmoreno.hwvci.services.authService
import xyz.josapedmoreno.hwvci.services.controller
import xyz.josapedmoreno.hwvci.table.Themes
import xyz.josapedmoreno.hwvci.table.Users

class App : SysService() {
    override fun onStart() {
        var port = Config.getInt("web.port")
        if (!args.isEmpty())
            port = Integer.parseInt(args.poll())

        sessionStorage = InMemorySessionStorage()
        server = embeddedServer(
            Netty,
            port = port,
            host = "0.0.0.0"
        ) {
            install(ContentNegotiation) {
                gson {
                    setPrettyPrinting()
                }
            }
            install(SSE)
            authService()
            controller()
        }.start(wait = true)

        if (Users().createAdmin()) {
            Log.i("Admin is created")
        }
        if (Themes().createDefaultTheme()) {
            Log.i("Default theme is created")
        }
        if (BookApi.installDefaultBibleVersions()) { // This needs internet connection
            Log.i("Bible versions are installed")
        }
    }

    override fun onStop() {
        super.onStop()
        sessionStorage.clearAll()
        server?.stop(500, 1000)
        Database.getDefault().quit()
    }

    companion object {
        var server: EmbeddedServer<*, *>? = null
        lateinit var sessionStorage: InMemorySessionStorage

        init {
            service = App()
        }
    }
}