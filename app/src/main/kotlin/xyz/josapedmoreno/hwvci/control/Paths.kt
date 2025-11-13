package xyz.josapedmoreno.hwvci.control

import java.io.File
import java.net.URISyntaxException

class Paths {
    companion object {
<<<<<<< HEAD
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
=======
        // Base directories
        val workingDir = File(System.getProperty("user.dir")) // current working directory (writable)
        val resourcesDir = File(workingDir, "resources") // optional, if you still need it
        val publicDir = File(resourcesDir, "public") // for static packaged files (read-only)

        // Uploads should go OUTSIDE classpath
        val uploadDir = File(workingDir, "uploaded").apply {
            if (!exists()) mkdirs()
        }

        // Optional: other directories (if used elsewhere)
        val privateResources = File(resourcesDir, "private")
        val cssDir = File(publicDir, "css")
        val arduinoSketchPath = File(privateResources, "res")
>>>>>>> ktor
    }
}