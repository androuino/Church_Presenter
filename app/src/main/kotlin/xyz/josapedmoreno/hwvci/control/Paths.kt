package xyz.josapedmoreno.hwvci.control

import java.io.File
import java.net.URISyntaxException

class Paths {
    companion object {
        private fun getJarDir(): File {
            return try {
                val uri = Paths::class.java.protectionDomain.codeSource.location.toURI()
                File(uri).parentFile // JAR's directory
            } catch (e: URISyntaxException) {
                File(".") // fallback
            }
        }

        private val baseDir = getJarDir()
        private val resources = File(baseDir, "resources")
        val publicResources = File(resources.path, "public")
        val privateResources = File(resources.path, "private")
        val cssDir = File(publicResources.path, "css")
        val arduinoSketchPath = File(privateResources.path, "res")
        val uploadDir = File(publicResources.path, "uploaded")
    }
}