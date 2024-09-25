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
        val verse = BookApi.getBook("JapBungo", "Genesis 1:1")
        if (verse != "Verse not found")
            success = true
        Log.i(verse)
        assertEquals(true, success)
    }
    @Test
    fun `Must return installed Bibles`() {
        BookApi.getInstalledBooks()
    }
}