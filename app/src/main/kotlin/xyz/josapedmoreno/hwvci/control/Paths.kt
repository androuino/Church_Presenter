package xyz.josapedmoreno.hwvci.control

import java.io.File

class Paths {
    companion object {
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
    }
}