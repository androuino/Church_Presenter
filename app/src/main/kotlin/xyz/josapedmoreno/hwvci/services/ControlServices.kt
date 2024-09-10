package xyz.josapedmoreno.hwvci.services

import com.intellisrc.web.service.Service
import com.intellisrc.web.service.ServiciableMultiple
import groovy.lang.Closure
import org.eclipse.jetty.http.HttpMethod
import xyz.josapedmoreno.hwvci.control.Paths.Companion.publicResources
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
}