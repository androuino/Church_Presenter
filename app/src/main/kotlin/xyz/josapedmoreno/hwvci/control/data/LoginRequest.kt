package xyz.josapedmoreno.hwvci.control.data

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(val user: String, val pass: String)
