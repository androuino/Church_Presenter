package xyz.josapedmoreno.hwvci.services

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.intellisrc.web.service.*
import xyz.josapedmoreno.hwvci.control.LoginAuth
import java.io.File

class AuthService: ServiciableAuth {
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

    override fun getLoginPath(): String {
        return "/login.path"
    }

    override fun getLogoutPath(): String {
        return "/logout.path"
    }

    override fun onLogin(request: Request?, response: Response?): AuthData {
        var success = false
        var message = "Login failed!"
        val returnValue = AuthData()
        val mapToServer = HashMap<String?, Any?>()
        val mapToClient = HashMap<String?, Any?>()
        val gson = Gson()
        val data = gson.fromJson(request!!.body(), JsonObject::class.java)
        val user = data.get("user").asString
        val pass = data.get("pass").asString
        message = LoginAuth(user, pass).isValid()
        if (message == "success") {
            success = true
            mapToServer["username"] = user
        }

        mapToClient["ok"] = success
        mapToClient["message"] = message

        returnValue.toStoreInServer = mapToServer
        returnValue.toSendToClient = mapToClient
        return returnValue
    }

    override fun onLogout(request: Request?, response: Response?): Boolean {
        return true
    }

    override fun getAuthLogFile(): File? {
        return null
    }

    override fun setAuthLogFile(authLogFile: File?) {}

    override fun getAuthFailedLogFile(): File? {
        return null
    }

    override fun setAuthFailedLogFile(authFailedLogFile: File?) {}

    override fun isAuthLog(): Boolean {
        return false
    }

    override fun setAuthLog(authLog: Boolean) {}

    override fun isFailedLog(): Boolean {
        return false
    }

    override fun setFailedLog(failedLog: Boolean) {}
}