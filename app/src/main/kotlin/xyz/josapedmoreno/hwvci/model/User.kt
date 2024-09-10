package xyz.josapedmoreno.hwvci.model

import com.intellisrc.db.annot.Column
import com.intellisrc.db.auto.Model
import xyz.josapedmoreno.hwvci.control.LoginAuth

class User : Model() {
    @Column(primary = true, autoincrement = true)
    var id: Int = 0
    @Column(nullable = false, length = 100)
    var username: String = ""
    @Column(nullable = false, key = true, unique = true, length = 100)
    var password: String = ""

    private fun getHashed(): String {
        val hashed = LoginAuth().getHashFromDb(username)
        return hashed.ifEmpty {
            LoginAuth().getHashedFromRaw(password)
        }
    }

    override fun toMap(): MutableMap<String, Any?> {
        return mutableMapOf(
            "id" to id,
            "username" to username,
            "password" to getHashed()
        )
    }
}