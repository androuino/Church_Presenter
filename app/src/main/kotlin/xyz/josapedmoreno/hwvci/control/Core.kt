package xyz.josapedmoreno.hwvci.control

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.intellisrc.core.Log
import java.awt.GraphicsEnvironment
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.InetAddress
import java.net.NetworkInterface
import kotlin.concurrent.fixedRateTimer


class Core {
    companion object {
        private val gson = Gson().newBuilder().create()

        fun getFonts() : Array<String> {
            // Get the local graphics environment
            val ge = GraphicsEnvironment.getLocalGraphicsEnvironment()
            // Get all font family names
            val fontNames = ge.availableFontFamilyNames
            return fontNames
        }
        fun getAvailableWifiSSIDsPi(): List<String> {
            val ssids = mutableListOf<String>()

            try {
                // Execute the 'iwlist' command to scan for WiFi networks
                val process = ProcessBuilder("sh", "-c", "iwlist wlan0 scan | grep 'ESSID'").start()
                // Execute the 'airport' command to scan for WiFi networks
                val reader = BufferedReader(InputStreamReader(process.inputStream))

                // Read the output line by line
                reader.useLines { lines ->
                    lines.forEach { line ->
                        // Extract the SSID from the line
                        val ssid = line.substringAfter("ESSID:\"").substringBefore("\"")
                        if (ssid.isNotEmpty()) {
                            Log.i("SSID is ", ssid)
                            ssids.add(ssid)
                        }
                    }
                }

                process.waitFor()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            return ssids
        }
        fun getAvailableWifiSSIDsLinux(): List<String> {
            val ssids = mutableListOf<String>()

            try {
                // Execute the 'iwlist' command to scan for WiFi networks
                val process = ProcessBuilder("sh", "-c", "iwlist wlp2s0 scan | grep 'ESSID'").start()
                // Execute the 'airport' command to scan for WiFi networks
                val reader = BufferedReader(InputStreamReader(process.inputStream))

                // Read the output line by line
                reader.useLines { lines ->
                    lines.forEach { line ->
                        // Extract the SSID from the line
                        val ssid = line.substringAfter("ESSID:\"").substringBefore("\"")
                        if (ssid.isNotEmpty()) {
                            Log.i("SSID is ", ssid)
                            ssids.add(ssid)
                        }
                    }
                }

                process.waitFor()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            return ssids
        }
        fun getAvailableWifiSSIDMac() : List<String> {
            val ssids = mutableListOf<String>()

            try {
                // Execute the 'airport' command to scan for WiFi networks
                val process = ProcessBuilder("sh", "-c",
                    "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s").start()
                val reader = BufferedReader(InputStreamReader(process.inputStream))

                // Skip the header line
                reader.readLine()

                // Read the output line by line
                reader.useLines { lines ->
                    lines.forEach { line ->
                        val parts = line.trim().split("\\s+".toRegex())
                        if (parts.isNotEmpty()) {
                            // The SSID is typically the first field in the output
                            val ssid = parts[0]
                            if (ssid.isNotEmpty()) {
                                Log.i("SSID is ", ssid)
                                ssids.add(ssid)
                            }
                        }
                    }
                }

                process.waitFor()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            return ssids
        }
        fun connectToWifi(data: JsonObject): Boolean {
            var success = false
            if (!data.isEmpty) {
                val ssid = data.get("ssid").asString
                val pass = data.get("pass").asString
                try {
                    // Create the nmcli command to connect to a WiFi network
                    val command = "nmcli dev wifi connect '$ssid' password '$pass'"

                    // Execute the command
                    val processBuilder = ProcessBuilder("bash", "-c", command)
                    processBuilder.redirectErrorStream(true) // Combine stdout and stderr

                    // Start the process
                    val process = processBuilder.start()

                    // Capture the output from the command
                    val reader = BufferedReader(InputStreamReader(process.inputStream))
                    var line: String?

                    // Read the output
                    while (reader.readLine().also { line = it } != null) {
                        Log.i(line)
                    }

                    // Wait for the process to complete
                    val exitCode = process.waitFor()
                    if (exitCode == 0) {
                        Log.i("Connected to WiFi successfully.")
                        success = true
                    } else {
                        Log.e("Failed to connect to WiFi. Exit code: $exitCode")
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            return success
        }
        // Method to check the current Wi-Fi status
        private fun checkWiFiStatus(): String {
            return try {
                // Command to check if Wi-Fi is enabled or disabled
                val command = "nmcli -t -f WIFI g"

                val processBuilder = ProcessBuilder("bash", "-c", command)
                processBuilder.redirectErrorStream(true)

                val process = processBuilder.start()
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                val status = reader.readLine()

                process.waitFor() // Wait for the process to finish

                status?.trim() ?: "unknown" // Return status
            } catch (e: Exception) {
                e.printStackTrace()
                "error"
            }
        }

        // Method to check the active Wi-Fi connection (SSID)
        private fun getActiveWiFiConnection(): String {
            return try {
                // Command to check active Wi-Fi connection and SSID
                val command = "nmcli -t -f ACTIVE,SSID dev wifi | grep '^yes'"

                val processBuilder = ProcessBuilder("bash", "-c", command)
                processBuilder.redirectErrorStream(true)

                val process = processBuilder.start()
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                val result = reader.readLine()

                process.waitFor() // Wait for the process to finish

                // Extract SSID from the result (if available)
                if (result != null && result.isNotEmpty()) {
                    val parts = result.split(":")
                    if (parts.size == 2 && parts[0] == "yes") {
                        return parts[1] // SSID
                    }
                }

                "disconnected" // Default if not connected

            } catch (e: Exception) {
                e.printStackTrace()
                "error"
            }
        }
        private fun getWiFiIPAddress(): String? {
            try {
                val interfaces = NetworkInterface.getNetworkInterfaces()
                for (iface in interfaces) {
                    // Check if the interface is active and not a loopback (ignoring localhost)
                    if (iface.isUp && !iface.isLoopback) {
                        val addresses = iface.inetAddresses
                        for (addr in addresses) {
                            if (addr is InetAddress && !addr.isLoopbackAddress) {
                                val ip = addr.hostAddress
                                // Filter out IPv6 addresses if necessary
                                if (ip.contains(":")) continue
                                return ip
                            }
                        }
                    }
                }
            } catch (ex: Exception) {
                ex.printStackTrace()
            }
            return null
        }
        fun getWifiStatus(): String {
            var status = "disconnected"
            val map = LinkedHashMap<String, Any>(1)
            var previousStatus = ""
            var previousSSID = ""

            // Periodically check the Wi-Fi connection every 5 seconds
            //fixedRateTimer("WiFiStatusTimer", initialDelay = 0, period = 5000) {
                val wifiStatus = checkWiFiStatus()
                val activeSSID = getActiveWiFiConnection()
                val ipAddress = getWiFiIPAddress()

                // Check if the status or connection has changed
                if (wifiStatus != previousStatus || activeSSID != previousSSID) {
                    Log.i("Wi-Fi Status: $wifiStatus")
                    Log.i("Connected to: $activeSSID")
                    Log.d("IP Address: $ipAddress")

                    previousStatus = wifiStatus
                    previousSSID = activeSSID
                    map["status"] = "connected"
                    map["ssid"] = previousSSID
                    map["ip"] = ipAddress!!
                }
            //}
            return gson.toJson(map)
        }
        // Method to disconnect from the current Wi-Fi network
        fun wifiDisconnect(): Boolean {
            return try {
                // Command to disconnect the current Wi-Fi connection
                val command = "nmcli connection down id $(nmcli -t -f NAME connection show --active)"

                val processBuilder = ProcessBuilder("bash", "-c", command)
                processBuilder.redirectErrorStream(true)

                val process = processBuilder.start()
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                val result = reader.readText()

                process.waitFor() // Wait for the process to finish

                if (result.isEmpty()) true else false
            } catch (e: Exception) {
                e.printStackTrace()
                "error"
            } as Boolean
        }
    }
}