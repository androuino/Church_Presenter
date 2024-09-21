package xyz.josapedmoreno.hwvci.control

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class CoreTest {
    @Test
    fun `Automatically detect OS and gets wifi SSIDs`() {
        val notEmpty = Core.getAvailableWifiSSID()
        assertEquals(true, notEmpty.isNotEmpty())
    }
    @Test
    fun `This will return the status of wifi connection`() {
        val status = Core.getWifiStatus()
        assertEquals(true, status.isNotEmpty())
    }
}