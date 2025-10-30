package xyz.josapedmoreno.hwvci.control

import java.io.File

class Paths {
    companion object {
/*
        val resources = SysInfo.getFile("resources")
        val publicResources = SysInfo.getFile("resources${File.pathSeparator}public")
        val privateResources = SysInfo.getFile("resources${File.pathSeparator}private")
        val cssDir = SysInfo.getFile("resources${File.pathSeparator}public${File.pathSeparator}css")
        val arduinoSketchPath = SysInfo.getFile("resources${File.pathSeparator}private${File.pathSeparator}res")
        val uploadDir = SysInfo.getFile("resources${File.pathSeparator}public${File.pathSeparator}uploaded")
*/

        val resources = File("resources")
        val publicResources = File(resources.path, "public")
        val privateResources = File(resources.path, "private")
        val cssDir = File(publicResources.path, "css")
        val arduinoSketchPath = File(privateResources.path, "res")
        val uploadDir = File(publicResources.path, "uploaded")
    }
}