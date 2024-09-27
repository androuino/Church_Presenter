package xyz.josapedmoreno.hwvci.services

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.intellisrc.core.Log
import com.intellisrc.web.service.Request
import com.intellisrc.web.service.Response
import com.intellisrc.web.service.Service
import com.intellisrc.web.service.ServiciableMultiple
import groovy.lang.Closure
import org.eclipse.jetty.http.HttpMethod
import xyz.josapedmoreno.hwvci.control.BookApi
import xyz.josapedmoreno.hwvci.control.Core
import xyz.josapedmoreno.hwvci.control.Paths.Companion.publicResources
import xyz.josapedmoreno.hwvci.table.SongTable
import xyz.josapedmoreno.hwvci.table.Themes
import java.io.File
import java.io.PrintWriter
import java.nio.charset.StandardCharsets

class ControlServices : ServiciableMultiple {
    override fun getPath(): String {
        return ""
    }

    override fun getAllowOrigin(): String {
        return "*"
    }

    override fun getAcceptType(): String {
        return ""
    }

    override fun getAcceptCharset(): String {
        return ""
    }

    override fun getAllow(): Service.Allow? {
        return null
    }

    override fun getBeforeRequest(): Service.BeforeRequest? {
        return null
    }

    override fun getBeforeResponse(): Service.BeforeResponse? {
        return null
    }

    override fun getOnError(): Service.ServiceError? {
        return null
    }

    override fun getServices(): MutableList<Service> {
        val services: MutableList<Service> = mutableListOf()
        services.add(adminService())
        services.add(createService())
        services.add(checkSessionService())
        services.add(saveSongService())
        services.add(getSongsService())
        services.add(editSongsService())
        services.add(deleteSongsService())
        services.add(getSongLyricsService())
        services.add(saveEditedSongService())
        services.add(getSongTitleService())
        services.add(steamService())
        services.add(settingsService())
        services.add(getFontsService())
        services.add(getSSIDService())
        services.add(wifiSettingsService())
        services.add(wifiConnectService())
        services.add(wifiDisconnectService())
        services.add(saveThemeService())
        services.add(getThemeService())
        services.add(getThemesService())
        services.add(setThemeService())
        services.add(liveClearService())
        services.add(getBooksService())
        services.add(getInstalledVersionsService())
        services.add(installBookService())
        services.add(uninstallBookService())
        services.add(searchBibleVerseService())
        services.add(projectVerseService())
        return services
    }

    private fun adminService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.contentType = "text/html"
        service.path = "/admin"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): File {
                return File(publicResources, "control.html")
            }
        }
        return service
    }

    private fun createService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.contentType = "text/html"
        service.path = "/create"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): File {
                return File(publicResources, "create.html")
            }
        }
        return service
    }

    private fun checkSessionService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.path = "/checksessions"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                try {
                    if (request.session().attribute("username").toString() == "admin")
                        success = true
                } catch (ex: NullPointerException) {
                    success = false
                }
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun saveSongService(): Service {
        val service = Service()
        service.method = HttpMethod.PUT
        service.allow = getUserAllow()
        service.path = "/savesong"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body, JsonObject::class.java)
                if (SongTable().insertSong(data))
                    success = true
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getSongsService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getsongs"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val data = SongTable().getAllSongs()
                if (data.isNotEmpty()) {
                    success = true
                    map["data"] = data
                }
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun editSongsService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/editsong/:id"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val id = request.params("id")
                val data = SongTable().getSongById(id.toInt())
                if (data.author.isNotEmpty()) {
                    success = true
                    map["data"] = data
                }
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun deleteSongsService(): Service {
        val service = Service()
        service.method = HttpMethod.DELETE
        service.allow = getUserAllow()
        service.path = "/deletesong/:id"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val id = request.params("id")
                success = SongTable().deleteSongById(id.toInt())
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getSongLyricsService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getsonglyrics/:id"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val id: String = request.params("id")
                val lyrics: String = SongTable().getSongLyricsById(id.toInt())
                if (lyrics.isNotEmpty()) {
                    success = true
                    map["data"] = lyrics
                }
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun saveEditedSongService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/saveeditedsong"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body, JsonObject::class.java)
                success = SongTable().saveEditedSong(data)
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getSongTitleService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getsongtitle/:id"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                var title = ""
                val map = LinkedHashMap<String, Any>(1)
                val id = request.params("id").toInt()
                title = SongTable().getSongTitleById(id)
                if (title.isNotEmpty()) {
                    success = true
                    map["title"] = title
                }
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun steamService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/stream"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body, JsonObject::class.java)
                val lyrics = data.get("lyrics").asString
                SSENotifier.sendLyrics(lyrics)
                map["ok"] = true
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun settingsService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.contentType = "text/html"
        service.path = "/settings"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): File {
                return File(publicResources, "settings.html")
            }
        }
        return service
    }

    private fun getFontsService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getfonts"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): String {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = Core.getFonts()
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getSSIDService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getssid"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val data = Core.getAvailableWifiSSID()
                if (data.isNotEmpty()) {
                    success = true
                    map["data"] = data
                }
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun wifiSettingsService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.contentType = "text/html"
        service.path = "/wifisettings"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): File {
                return File(publicResources, "wifisettings.html")
            }
        }
        return service
    }

    private fun wifiConnectService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/wificonnect"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                var success = false
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body, JsonObject::class.java)
                success = Core.connectToWifi(data)
                map["ok"] = success
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun wifiDisconnectService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/wifidisconnect"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): String {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = Core.wifiDisconnect()
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun saveThemeService(): Service {
        val service = Service()
        service.method = HttpMethod.PUT
        service.allow = getUserAllow()
        service.path = "/savetheme"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body, JsonObject::class.java)
                map["ok"] = Themes().saveTheme(data)
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getThemeService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/gettheme"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body(), JsonObject::class.java)
                map["ok"] = true
                map["data"] = Themes().getTheme(data)
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getThemesService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getthemes"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = Themes().getThemes()
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun setThemeService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/settheme"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body(), JsonObject::class.java)
                Core.setTheme(data)
                map["ok"] = true
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun liveClearService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/liveclear"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(): String {
                val map = LinkedHashMap<String, Any>(1)
                Core.liveClear()
                map["ok"] = true
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getBooksService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getbooks"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = BookApi.listAvailableBibles()
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun getInstalledVersionsService(): Service {
        val service = Service()
        service.method = HttpMethod.GET
        service.allow = getUserAllow()
        service.path = "/getversions"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                map["ok"] = true
                map["data"] = BookApi.getInstalledBooks()
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun installBookService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/installbook"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body(), JsonObject::class.java)
                map["ok"] = true
                map["data"] = BookApi.install(data.get("initials").asString)
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun uninstallBookService(): Service {
        val service = Service()
        service.method = HttpMethod.DELETE
        service.allow = getUserAllow()
        service.path = "/uninstallbook"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body(), JsonObject::class.java)
                map["ok"] = true
                map["data"] = BookApi.uninstallBook(data.get("initials").asString)
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun searchBibleVerseService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/searchbibleverse"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request): String {
                val map = LinkedHashMap<String, Any>(1)
                val data = gson.fromJson(request.body(), JsonObject::class.java)
                val bookInitials = data.get("versions").asJsonArray
                val verse = data.get("verse").asString
                map["ok"] = true
                map["data"] = BookApi.getBook(bookInitials, verse)
                return gson.toJson(map)
            }
        }
        return service
    }

    private fun projectVerseService(): Service {
        val service = Service()
        service.method = HttpMethod.POST
        service.allow = getUserAllow()
        service.path = "/projectverse"
        service.action = object : Closure<LinkedHashMap<String?, Boolean?>?>(this, this) {
            fun doCall(request: Request, response: Response): String {
                val map = LinkedHashMap<String, Any>(1)
                response.characterEncoding = StandardCharsets.UTF_8.name()
                response.setHeader("Cache-Control", "no-cache")
                val data = gson.fromJson(request.body(), JsonObject::class.java)
                val verse = data.get("verse").asString
                val versions = data.get("versions").asJsonArray
                SSENotifier.projectVerse(gson.toJson(data))
                map["ok"] = true
                return gson.toJson(map)
            }
        }
        return service
    }

    companion object {
        fun getUserAllow() = Service.Allow { request ->
            if (request.session() != null) {
                return@Allow request.session().attribute("username").toString() == "admin"
            } else {
                return@Allow false
            }
        }
        private val gson = Gson().newBuilder().create()
    }
}