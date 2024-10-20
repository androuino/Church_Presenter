package xyz.josapedmoreno.hwvci.control

import org.junit.jupiter.api.Test
import java.io.File
import java.nio.file.Files
import java.nio.file.StandardCopyOption
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
    @Test
    fun `Test saving file`() {
        val resourceFile = File("/Users/sem/Downloads", "Happy 1st Birthday.png")
        val targetFile = File("/Users/sem/IdeaProjects/hwvcipnw/deploy/resources/public/upload", resourceFile.name)
        Files.move(resourceFile.toPath(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING)
        assertEquals(true, targetFile.exists())
    }
}