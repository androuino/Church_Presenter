package xyz.josapedmoreno.hwvci.services

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.session
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.sessions.SessionStorage
import io.ktor.server.sessions.SessionTransportTransformerMessageAuthentication
import io.ktor.server.sessions.Sessions
import io.ktor.server.sessions.cookie
import xyz.josapedmoreno.hwvci.App
import xyz.josapedmoreno.hwvci.control.data.UserSession

class InMemorySessionStorage : SessionStorage {
    private val sessions = mutableMapOf<String, String>()

    override suspend fun invalidate(id: String) {
        sessions.remove(id)
    }

    override suspend fun read(id: String): String =
        sessions[id] ?: throw NoSuchElementException("Session $id not found")

    override suspend fun write(id: String, value: String) {
        sessions[id] = value
    }

    fun clearAll() {
        sessions.clear()
    }
}

val sessionStorage = InMemorySessionStorage()

fun Application.authService() {
    install(Sessions) {
        val storage = App.sessionStorage
        cookie<UserSession>("USER_SESSION", storage) {
            cookie.path = "/"
            cookie.httpOnly= true
            // cookie.secure = true // only for HTTPS
            // CRITICAL: This enables cookie to be written
            transform(
                SessionTransportTransformerMessageAuthentication(
                    key = "00112233445566778899aabbccddeeff".toByteArray() // 32 bytes
                )
            )
        }
    }

    install(Authentication) {
        session<UserSession>("auth-session") {
            validate { session ->
                if (session.username == "admin") session else null
            }
            challenge {
                call.respond(HttpStatusCode.Unauthorized)
            }
        }
    }
}