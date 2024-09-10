package xyz.josapedmoreno.hwvci.control

import com.intellisrc.core.Log
import com.intellisrc.crypt.hash.PasswordHash
import xyz.josapedmoreno.hwvci.table.Users

class LoginAuth(private var user: String = "", private var pass: String = "") {
    /**
     * Validation if the user exists
     */
    fun isValid(): String {
        var success = false
        var message = "success"
        if (user.isNotEmpty() && pass.isNotEmpty()) {
            if (Users().userExists(user)) {
                val map = Users().getUser(user)
                val ph = PasswordHash()
                ph.setPassword(*pass.toCharArray())
                success = ph.verify(map?.password)
                if (!success)
                    message = "Wrong password!"
            } else {
                message = "User doesn't exist!"
            }
        }
        return message
    }
    fun getHashFromDb(email: String): String {
        var hash = ""
        val user = Users().getUser(email)
        if (user != null)
            hash = user.password
        return hash
    }
    fun getHashedFromRaw(pass: String): String {
        var hash = ""
        if (pass.isNotEmpty()) {
            val ph = PasswordHash()
            ph.setPassword(*pass.toCharArray())
            hash = ph.BCrypt()
        } else {
            Log.w("Given password is empty!")
        }
        return hash
    }
}