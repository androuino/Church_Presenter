package xyz.josapedmoreno.hwvci.model

import com.intellisrc.db.annot.Column
import com.intellisrc.db.auto.Model
import xyz.josapedmoreno.hwvci.control.LoginAuth

class Admin : Model() {
    @Column(primary = true, autoincrement = true)
    var id: Int = 0
    @Column(nullable = false, key = true, unique = true, length = 100)
    var user: String = ""
    @Column(nullable = false)
    var pass: String = ""

    private fun getHashed(): String {
        return LoginAuth().getHashedFromRaw(pass)
    }

    override fun toMap(): MutableMap<String, Any> {
        return mutableMapOf(
            "id" to id,
            "user" to user,
            "pass" to getHashed(),
        )
    }
}