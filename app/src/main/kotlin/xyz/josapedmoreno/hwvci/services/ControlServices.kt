package xyz.josapedmoreno.hwvci.services

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.intellisrc.core.Log
import com.intellisrc.web.service.Request
import com.intellisrc.web.service.Service
import com.intellisrc.web.service.ServiciableMultiple
import groovy.lang.Closure
import org.eclipse.jetty.http.HttpMethod
import xyz.josapedmoreno.hwvci.control.Paths.Companion.publicResources
import xyz.josapedmoreno.hwvci.table.SongTable
import java.io.File

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
            fun doCall(request: Request): String {
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