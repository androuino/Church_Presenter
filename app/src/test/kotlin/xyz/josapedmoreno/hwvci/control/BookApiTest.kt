package xyz.josapedmoreno.hwvci.control

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
    fun `Installed Bible version mus return a verse`() {
        var success = false
        val res = BookApi.getBook("KJV", "Genesis 1:1-5")
        if (res.isNotEmpty())
            success = true
        res.entries.forEach { (k, v) ->
            Log.i("Verse: $k: $v")
        }
        assertEquals(true, success)
    }
    @Test
    fun `Must return installed Bibles`() {
        BookApi.getInstalledBooks()
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
}