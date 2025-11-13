package xyz.josapedmoreno.hwvci.control

import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.intellisrc.core.Log
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class BookApiTest {
    @Test
    fun `Must install KJV Book`() {
        val bookInitials = "JapBungo"
        val isInstalled = BookApi.install(bookInitials)
        assertEquals(true, isInstalled)
    }
    @Test
    fun `Installed Bible version must return a verse`() {
        var success = false
        val initials = arrayListOf("KJV")
        val jsonArray = JsonArray()
        jsonArray.add("KJV")
        jsonArray.add("TagAngBiblia")
        val res = BookApi.getBook(jsonArray, "Genesis 1:1-5")
        if (res.isNotEmpty())
            success = true
        res.forEach { version ->
            version.entries.forEach { (k, v) ->
                Log.i("Verse: $k: $v")
            }
        }
        assertEquals(true, success)
    }
    @Test
    fun `Must return installed Bibles`() {
        BookApi.getInstalledBooks().entries.forEach { (k, v) ->
            Log.i("$k : $v")
        }
    }
    @Test
    fun `Should install the default Bible versions`() {
        val success = BookApi.installDefaultBibleVersions()
        assertEquals(false, success)
    }
    @Test
    fun `Will get all available Bible versions for download and install`() {
        BookApi.listAvailableBibles()
    }
    @Test
    fun `Will uninstall a book`() {
        BookApi.uninstallBook("SpaTDP")
        BookApi.getInstalledBooks().entries.forEach { (k, v) ->
            Log.i("$k : $v")
        }
    }
}