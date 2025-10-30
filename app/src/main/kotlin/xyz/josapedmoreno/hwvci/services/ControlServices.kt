package xyz.josapedmoreno.hwvci.services

import com.google.gson.*
import com.intellisrc.core.Log
import com.intellisrc.etc.Cache
import io.ktor.http.ContentType
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.http.content.streamProvider
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.http.content.staticResources
import io.ktor.server.request.receive
import io.ktor.server.request.receiveMultipart
import io.ktor.server.response.respond
import io.ktor.server.response.respondFile
import io.ktor.server.response.respondText
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
import kotlinx.serialization.json.Json
import xyz.josapedmoreno.hwvci.ap.APModeChecker
import xyz.josapedmoreno.hwvci.ap.ConfigFileChecker
import xyz.josapedmoreno.hwvci.ap.IPAddressFetcher
import xyz.josapedmoreno.hwvci.ap.IPForwardingChecker
import xyz.josapedmoreno.hwvci.ap.PackageChecker
import xyz.josapedmoreno.hwvci.control.BookApi
import xyz.josapedmoreno.hwvci.control.Core
import xyz.josapedmoreno.hwvci.control.LoginAuth
import xyz.josapedmoreno.hwvci.control.Paths
import xyz.josapedmoreno.hwvci.control.Paths.Companion.publicResources
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
                            event = event.type,
                            data = Json.encodeToString(event)
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
                EventBroadcaster.emit(SseEvent("connected", "true"))
                call.sessions.set(UserSession(username = loginRequest.user))
            }
            call.respond(mapOf("ok" to success, "message" to message))
        }
        post("/searchbibleverse") {
            val map = LinkedHashMap<String, Any>(1)
            val data = call.receive<JsonObject>()
            var verse = ""
            var bookInitials = JsonArray()

            if (data.isJsonObject) {
                val jsonObject = data.asJsonObject
                verse = jsonObject.get("verse").asString
                bookInitials = jsonObject.get("versions").asJsonArray
            } else if (data.isJsonPrimitive) {
                val jsonPrimitive = data.asJsonPrimitive
                val jsonObject = JsonParser.parseString(jsonPrimitive.asString).asJsonObject
                verse = jsonObject.get("verse").asString
                bookInitials = jsonObject.get("versions").asJsonArray
            } else {
                Log.w("Unexpected JSON structure")
            }
            map["ok"] = true
            map["data"] = BookApi.getBook(bookInitials, verse)
            call.respond(map)
        }
        post("/upload") {
            val multiPart = call.receiveMultipart()
            val map = LinkedHashMap<String, Any>(1)
            if (!Paths.uploadDir.exists())
                Paths.uploadDir.mkdirs()

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
            val data = call.receive<JsonObject>()
            if (!data.isEmpty) {
                map["data"] = data
                success = true
            }
            map["ok"] = success
            call.respond(gson.toJson(map))
        }
        get("/logout") {
            call.sessions.clear<UserSession>()
            call.respond(mapOf("ok" to true))
        }
        get("/checksessions") {
            val session = call.sessions.get<UserSession>()
            val success = session?.username == "admin"
            val jsonResponse = gson.toJson(mapOf("ok" to success))
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

                val status = Core.getWifiStatus()
                launch {
                    SseSender().wifiStatus(status)
                }

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
            call.respondText(jsonResponse, ContentType.Application.Json)
        }
        staticResources("/", "public") {
            default("index.html")
        }
        /*staticResources("/admin", "public") {
            default("control.html")
        }*/
        get("/admin") {
            call.respondFile(publicResources, "control.html")
        }
        authenticate("auth-session") {
            get("/create") {
                call.respondFile(File(publicResources, "create.html"))
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
                call.respondFile(publicResources, "settings.html")
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
                call.respondFile(publicResources, "wifisettings.html")
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
                val themeTheme = data.get("theme").asString
                theme = Themes().getByThemeName(themeTheme)
                launch {
                    SseSender().theme(gson.toJson(theme))
                }
                map["ok"] = true
                map["data"] = Themes().getTheme(data)
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
                map["ok"] = true
                map["data"] = BookApi.install(data.get("initials").asString)
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