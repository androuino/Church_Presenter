package xyz.josapedmoreno.hwvci.control

import java.io.File

class Paths {
    companion object {
        val resources = File("resources")
        val publicResources = File(resources.path, "public")
        val privateResources = File(resources.path, "private")
        val cssDir = File(publicResources.path, "css")
        val arduinoSketchPath = File(privateResources.path, "res")
        val uploadDir = File(publicResources.path, "upload")
    }
}