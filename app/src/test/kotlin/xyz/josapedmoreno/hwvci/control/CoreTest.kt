package xyz.josapedmoreno.hwvci.control

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class CoreTest {
    @Test
    fun `Must retrieve available Wifi SSID in Linux`() {
        val notEmpty = Core.getAvailableWifiSSIDsLinux()
        assertEquals(true, notEmpty.isNotEmpty())
    }
    @Test
    fun `Must retrieve available Wifi SSID in Mac`() {
        val notEmpty = Core.getAvailableWifiSSIDMac()
        assertEquals(true, notEmpty.isNotEmpty())
    }
}