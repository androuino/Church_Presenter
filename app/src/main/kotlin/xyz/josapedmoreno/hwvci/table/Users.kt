package xyz.josapedmoreno.hwvci.table

import com.intellisrc.core.Log
import com.intellisrc.db.auto.Table
import xyz.josapedmoreno.hwvci.model.User

class Users : Table<User>() {
    fun createAdmin(): Boolean {
        return checkAdminExist()
    }
    private fun checkAdminExist(): Boolean {
        var success = false
        if (!adminExists()) {
            val user = User()
            user.username = "admin"
            user.password = "admin"
            success = table.insert(user.toMap())
        }
        return success
    }
    private fun adminExists(): Boolean {
        var success = false
        val user: User? = find("username", "admin")
        if (user != null) {
            success = true
        }
        return success
    }
    /**
     * get the user using email keyword
     */
    fun getUser(username: String): User? {
        return try {
            find("username", username)
        } catch (ex: Exception) {
            Log.w("Ignore this, it's just that the user doesn't exists yet.")
            null
        }
    }
    /**
     * check if the user is existing already
     */
    fun userExists(username: String): Boolean {
        var success = false
        val map = findAll("username", username) //table.where("email LIKE '%?%'", email).get().toListMap()
        if (map.isNotEmpty()) {
            success = true
        }
        return success
    }
}