package xyz.josapedmoreno.hwvci.services

import com.google.gson.*
import com.intellisrc.core.Log
import com.intellisrc.etc.Cache
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.http.content.streamProvider
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.http.content.files
import io.ktor.server.http.content.static
import io.ktor.server.http.content.staticResources
import io.ktor.server.request.receive
import io.ktor.server.request.receiveMultipart
import io.ktor.server.request.receiveText
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import io.ktor.server.sessions.clear
import io.ktor.server.sessions.get
import io.ktor.server.sessions.sessions
import io.ktor.server.sessions.set
import io.ktor.server.sse.sse
import io.ktor.sse.ServerSentEvent
import kotlinx.coroutines.launch
import xyz.josapedmoreno.hwvci.ap.APModeChecker
import xyz.josapedmoreno.hwvci.ap.ConfigFileChecker
import xyz.josapedmoreno.hwvci.ap.IPAddressFetcher
import xyz.josapedmoreno.hwvci.ap.IPForwardingChecker
import xyz.josapedmoreno.hwvci.ap.PackageChecker
import xyz.josapedmoreno.hwvci.control.BookApi
import xyz.josapedmoreno.hwvci.control.Core
import xyz.josapedmoreno.hwvci.control.LoginAuth
import xyz.josapedmoreno.hwvci.control.Paths
import xyz.josapedmoreno.hwvci.control.Paths.Companion.uploadDir
import xyz.josapedmoreno.hwvci.control.data.EventBroadcaster
import xyz.josapedmoreno.hwvci.control.data.LoginRequest
import xyz.josapedmoreno.hwvci.control.data.SseEvent
import xyz.josapedmoreno.hwvci.control.data.UserSession
import xyz.josapedmoreno.hwvci.model.Song
import xyz.josapedmoreno.hwvci.table.SongTable
import xyz.josapedmoreno.hwvci.table.Themes
import java.io.File

fun Application.controller() {
    val gson = Gson().newBuilder().create()
    val cache = Cache<Any>()

    routing {
        sse("/events") {
            val collectJob = launch {
                EventBroadcaster.events.collect { event ->
                    send(
                        ServerSentEvent(
                            event = event.event,
                            data = gson.toJson(event)
                        )
                    )
                }
            }
            collectJob.join()
        }
        post("/login") {
            val loginRequest = call.receive<LoginRequest>()
            var message = "Login failed!"
            var success = false
            message = LoginAuth(loginRequest.user, loginRequest.pass).isValid()
            if (message == "success") {
                success = true

                Log.i("Setting session for user: ${loginRequest.user}")
                call.sessions.set(UserSession(username = loginRequest.user))

                val cookieAfter = call.response.cookies["USER_SESSION"]?.value
                val cookieRequest = call.request.cookies["USER_SESSION"]
                Log.i("SESSION SET - Response cookie: $cookieAfter")
                Log.i("SESSION SET - Request cookie (should be old): $cookieRequest")

                EventBroadcaster.emit(SseEvent("connected", "true"))
                Log.i("Setting session for user: ${loginRequest.user}")
                call.sessions.set(UserSession(username = loginRequest.user))
            }
            call.respond(mapOf("ok" to success, "message" to message))
        }
        post("/searchbibleverse") {
            val rawBody = call.receiveText()
            val jsonPrimitive = JsonParser.parseString(rawBody).asJsonPrimitive
            val innerJson = JsonParser.parseString(jsonPrimitive.asString).asJsonObject

            val verse = innerJson.get("verse").asString
            val bookInitials = innerJson.getAsJsonArray("versions")

            val map = mapOf(
                "ok" to true,
                "data" to BookApi.getBook(bookInitials, verse)
            )
            call.respond(map)
        }
        post("/upload") {
            val multiPart = call.receiveMultipart()
            val map = LinkedHashMap<String, Any>(1)

            multiPart.forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        val filename = part.originalFileName?.replace("\\s".toRegex(), "_") ?: "unknown"
                        val file = File(Paths.uploadDir, filename)

                        // Read bytes from the ByteReadChannel
                        part.streamProvider().use { input ->
                            file.writeBytes(input.readAllBytes())
                        }

                        launch {
                            SseSender().changeBackground(filename)
                        }
                        map["ok"] = file.exists()
                    }
                    is PartData.FormItem -> {
                        val fieldName = part.name
                        val fieldValue = part.value
                        println("Form field $fieldName = $fieldValue")
                    }
                    else -> {}
                }
                part.dispose()
            }
            call.respond(map)
        }
        post("/bglink") {
            val map = LinkedHashMap<String, Any>(1)
            val data = call.receive<JsonObject>()
            val link = data.get("link").asString
            cache.set("link", link)
            launch {
                SseSender().changeBackground("link")
            }
            map["ok"] = true
            call.respond(map)
        }
        get("/getlink") {
            var success = false
            val map = LinkedHashMap<String, Any>(1)
            val link = Core.getLink(cache)
            if (link.isNotEmpty()) {
                map["link"] = link
                success = true
            }
            map["ok"] = success
            call.respond(map)
        }
        get("/getip") {
            var success = false
            val map = LinkedHashMap<String, Any>(1)
            val data = gson.fromJson(Core.getWifiStatus(), JsonObject::class.java)
            if (!data.isEmpty) {
                map["data"] = data
                success = true
            }
            map["ok"] = success
            call.respond(map)
        }
        get("/logout") {
            call.sessions.clear<UserSession>()
            call.response.cookies.append(
                name = "USER_SESSION",
                value = "",
                maxAge = 0,
                path = "/",
                httpOnly = true
            )
            call.respond(mapOf("ok" to true))
        }
        get("/checksessions") {
            val rawCookie = call.request.cookies["USER_SESSION"]
            Log.i("CHECKSessions - RAW COOKIE: '$rawCookie'")

            val session = call.sessions.get<UserSession>()
            Log.i("CHECKSessions - DESERIALIZED SESSION: $session")

            val success = session?.username?.isNotEmpty() == true
            Log.i("success = $success")
            val map = LinkedHashMap<String, Any>()
            Log.i("success is %s", success)
            map["ok"] = success
            val status = Core.getWifiStatus()
            map["wifistatus"] = status
            if (!Core.getWifiConnectionStatus()) {
                Log.w("Switching to AP mode")
                // Check if packages are installed
                PackageChecker.installPackagesIfNecessary()
                // Check if configuration files are set
                ConfigFileChecker.setupConfigurationFiles()
                // Check if IP forwarding is enabled
                IPForwardingChecker.enableIPForwardingIfNecessary()
                // Check if Access Point is active
                APModeChecker.startAccessPointIfNecessary()
                Log.i("Access point setup complete")

                /*launch {
                    SseSender().wifiStatus(status)
                }*/

                val ipAddress = IPAddressFetcher.getIPAddress("wlan0") // Replace with the correct interface
                if (ipAddress != null) {
                    Log.i("Access Point IP Address: $ipAddress")
                    launch {
                        SseSender().mode(ipAddress)
                    }
                } else {
                    Log.w("Unable to fetch the IP address.")
                }
            } else {
                Log.i("Device is connected to wifi")
            }
            val jsonResponse = gson.toJson(map)
            call.respond(jsonResponse)
        }
        static("/uploaded") {
            files(uploadDir)
        }
        staticResources("/", "public") {
            default("index.html")
        }
        get("/admin") {
            val stream = object {}.javaClass.getResourceAsStream("/public/control.html")
            if (stream != null) {
                val bytes = stream.readBytes()
                call.respondBytes(bytes, ContentType.Text.Html)
            } else {
                call.respond(HttpStatusCode.NotFound, "control.html not found")
            }
        }
        authenticate("auth-session") {
            get("/create") {
                val stream = object {}.javaClass.getResourceAsStream("/public/create.html")
                if (stream != null) {
                    val bytes = stream.readBytes()
                    call.respondBytes(bytes, ContentType.Text.Html)
                } else {
                    call.respond(HttpStatusCode.NotFound, "create.html not found")
                }
            }
            put("/savesong") {
                val song = call.receive<Song>()
                var success = false
                if (SongTable().insertSong(song))
                    success = true
                call.respond(mapOf("ok" to success))
            }
            get("/getsongs") {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val data = SongTable().getAllSongs()
                if (data.isNotEmpty()) {
                    success = true
                    map["data"] = data
                }
                map["ok"] = success
                call.respond(map)
            }
            get("/editsong/{id}") {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val id = call.parameters["id"]
                val data = SongTable().getSongById(id?.toInt() ?: 0)
                if (data.author.isNotEmpty()) {
                    success = true
                    map["data"] = data
                }
                map["ok"] = success
                call.respond(map)
            }
            delete("/deletesong/{id}") {
                var success: Boolean
                val map = LinkedHashMap<String, Any>(1)
                val id = call.parameters["id"]
                success = SongTable().deleteSongById(id?.toInt() ?: 0)
                map["ok"] = success
                call.respond(map)
            }
            get("/getsonglyrics/{id}") {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val id = call.parameters["id"]
                val lyrics: String = SongTable().getSongLyricsById(id?.toInt() ?: 0)
                launch {
                    SseSender().songTitle(SongTable().getSongTitleById(id?.toInt() ?: 0))
                }
                if (lyrics.isNotEmpty()) {
                    success = true
                    map["data"] = lyrics
                }
                map["ok"] = success
                call.respond(map)
            }
            post("/saveeditedsong") {
                var success: Boolean
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                success = SongTable().saveEditedSong(data)
                map["ok"] = success
                call.respond(map)
            }
            post("/deletetheme/{id}") {
                val map = LinkedHashMap<String, Any>(1)
                val id = call.parameters["id"]
                map["ok"] = Themes().deleteTheme(id?.toInt() ?: 0)
                call.respond(map)
            }
            post("/disableservice") {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = Core.disableService()
                call.respond(map)
            }
            post("/enableservice") {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = Core.enableService()
                call.respond(map)
            }
            post("/startprojector") {
                val success = true
                Core.startKiosk()
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = success
                call.respond(map)
            }
            post("/stopprojector") {
                val success = true
                Core.stopKiosk()
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = success
                call.respond(map)
            }
            get("/getsongtitle/{id}") {
                var success = false
                var title: String
                val map = LinkedHashMap<String, Any>(1)
                val id = call.parameters["id"]
                title = SongTable().getSongTitleById(id?.toInt() ?: 0)
                if (title.isNotEmpty()) {
                    success = true
                    map["title"] = title
                }
                map["ok"] = success
                call.respond(map)
            }
            post("/stream") {
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                val lyrics = data.get("lyrics").asString
                launch {
                    SseSender().changeLyrics(lyrics)
                }
                map["ok"] = true
                call.respond(map)
            }
            get("/settings") {
                val stream = object {}.javaClass.getResourceAsStream("/public/settings.html")
                if (stream != null) {
                    val bytes = stream.readBytes()
                    call.respondBytes(bytes, ContentType.Text.Html)
                } else {
                    call.respond(HttpStatusCode.NotFound, "settings.html not found")
                }
            }
            get("/getfonts") {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = Core.getFonts()
                call.respond(map)
            }
            get("/getssid") {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val data = Core.getAvailableWifiSSID()
                if (data.isNotEmpty()) {
                    success = true
                    map["data"] = data
                }
                map["ok"] = success
                call.respond(map)
            }
            get("/wifisettings") {
                val stream = object {}.javaClass.getResourceAsStream("/public/wifisettings.html")
                if (stream != null) {
                    val bytes = stream.readBytes()
                    call.respondBytes(bytes, ContentType.Text.Html)
                } else {
                    call.respond(HttpStatusCode.NotFound, "wifisettings.html not found")
                }
            }
            post("/wificonnect") {
                var success: Boolean
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                success = Core.connectToWifi(data)
                map["ok"] = success
                call.respond(map)
            }
            post("/wifidisconnect") {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = Core.wifiDisconnect()
                call.respond(map)
            }
            put("/savetheme") {
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                map["ok"] = Themes().saveTheme(data)
                call.respond(map)
            }
            post("/gettheme") {
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                map["ok"] = true
                map["data"] = Themes().getTheme(data)
                call.respond(map)
            }
            get("/getthemes") {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = Themes().getThemes()
                call.respond(map)
            }
            post("/settheme") {
                var theme: Map<String, Any?>
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                theme = Themes().getTheme(data)
                launch {
                    SseSender().theme(gson.toJson(theme))
                }
                map["ok"] = true
                map["data"] = theme
                call.respond(map)
            }
            post("/liveclear") {
                val map = LinkedHashMap<String, Any>(1)
                launch {
                    SseSender().clearLive("clear")
                }
                map["ok"] = true
                call.respond(map)
            }
            get("/getbooks") {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = BookApi.listAvailableBibles()
                call.respond(map)
            }
            get("/getversions") {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = BookApi.getInstalledBooks()
                call.respond(map)
            }
            post("/installbook") {
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                map["ok"] = BookApi.install(data.get("initials").asString)
                call.respond(map)
            }
            delete("/uninstallbook") {
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                map["ok"] = true
                map["data"] = BookApi.uninstallBook(data.get("initials").asString)
                call.respond(map)
            }
            post("/projectverse") {
                val map = LinkedHashMap<String, Any>(1)
                val data = call.receive<JsonObject>()
                launch {
                    SseSender().verse(gson.toJson(mapOf("verse" to data.get("verse").asString, "versions" to data.get("versions").asJsonArray)))
                }
                map["ok"] = true
                call.respond(map)
            }
            post("/hidelyrics") {
                val map = LinkedHashMap<String, Any>(1)
                launch {
                    SseSender().hideLyrics("true")
                }
                map["ok"] = true
                call.respond(map)
            }
            post("/blackscreen") {
                val map = LinkedHashMap<String, Any>(1)
                launch {
                    SseSender().blackScreen("true")
                }
                map["ok"] = true
                call.respond(map)
            }
            post("/showlyrics") {
                val map = LinkedHashMap<String, Any>(1)
                launch {
                    SseSender().showLyrics("true")
                }
                map["ok"] = true
                call.respond(map)
            }
            post("/removebackground") {
                val map = LinkedHashMap<String, Any>(1)
                launch {
                    SseSender().removeBackground("true")
                }
                map["ok"] = true
                call.respond(map)
            }
        }
    }
}