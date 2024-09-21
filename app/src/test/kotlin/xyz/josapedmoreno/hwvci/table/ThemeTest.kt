package xyz.josapedmoreno.hwvci.table

import com.intellisrc.core.Log
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class ThemeTest {
    @Test
    fun `Should pull the saved themes`() {
        val list = Themes().getThemes()
        list.let {
            Log.i(it.toString())
        }
        assertEquals(true, list.isNotEmpty())
    }
}