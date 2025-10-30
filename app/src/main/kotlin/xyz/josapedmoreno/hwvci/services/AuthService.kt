package xyz.josapedmoreno.hwvci.services

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.session
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.sessions.Sessions
import io.ktor.server.sessions.cookie
import xyz.josapedmoreno.hwvci.control.data.UserSession

fun Application.authService() {
    install(Sessions) {
        cookie<UserSession>("USER_SESSION") {
            cookie.path = "/"
            cookie.httpOnly= true
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