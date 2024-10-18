package xyz.josapedmoreno.hwvci.ap

import java.io.BufferedReader
import java.io.InputStreamReader

object IPAddressFetcher {

    fun getIPAddress(interfaceName: String): String? {
        return try {
            val process = Runtime.getRuntime().exec("ip -4 addr show $interfaceName")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = reader.readText()
            process.waitFor()
            reader.close()

            // Parse the output to find the IP address
            val regex = Regex("inet (\\d+\\.\\d+\\.\\d+\\.\\d+)")
            val matchResult = regex.find(output)
            matchResult?.groups?.get(1)?.value
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}