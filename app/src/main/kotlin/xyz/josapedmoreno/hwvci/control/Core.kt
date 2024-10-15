package xyz.josapedmoreno.hwvci.control

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.intellisrc.core.Log
import com.intellisrc.etc.Cache
import xyz.josapedmoreno.hwvci.services.SSENotifier
import xyz.josapedmoreno.hwvci.table.Themes
import java.awt.GraphicsEnvironment
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.NetworkInterface
import java.net.URL

class Core {
    companion object {
        private val gson = Gson().newBuilder().create()
        private val osName = System.getProperty("os.name").lowercase()


        fun getFonts() : Array<String> {
            // Get the local graphics environment
            val ge = GraphicsEnvironment.getLocalGraphicsEnvironment()
            // Get all font family names
            val fontNames = ge.availableFontFamilyNames
            return fontNames
        }
        private fun getAvailableWifiSSIDsLinux(): List<String> {
            val ssids = mutableListOf<String>()

            try {
                // Execute the 'iwlist' command to scan for WiFi networks
                val process: Process = ProcessBuilder("sh", "-c", "iwlist wlp2s0 scan | grep 'ESSID'").start()
                // Execute the 'airport' command to scan for WiFi networks
                val reader = BufferedReader(InputStreamReader(process.inputStream))

                // Read the output line by line
                reader.useLines { lines ->
                    lines.forEach { line ->
                        // Extract the SSID from the line
                        val ssid = line.substringAfter("ESSID:\"").substringBefore("\"")
                        if (ssid.isNotEmpty()) {
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
        fun getAvailableWifiSSID(): List<String> {
            val osName = System.getProperty("os.name").lowercase() // Get OS name
            val ssids = mutableListOf<String>()

            try {
                // Execute the platform-specific command to scan for WiFi networks
                lateinit var process: Process
                when {
                    osName.contains("windows") -> {
                        // Command to list available WiFi networks on Windows
                        process = ProcessBuilder("cmd.exe", "/c", "netsh wlan show networks mode=bssid").start()
                    }
                    osName.contains("linux") -> {
                        // Command to list available WiFi networks on Linux using nmcli
                        process = ProcessBuilder("bash", "-c", "nmcli -t -f SSID dev wifi").start()
                    }
                    osName.contains("mac") || osName.contains("darwin") -> {
                        // Command to list available WiFi networks on macOS using airport
                        process = ProcessBuilder(
                            "sh", "-c", "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s"
                        ).start()
                    }
                    else -> {
                        Log.e("Unsupported operating system: $osName")
                        return emptyList()
                    }
                }

                val reader = BufferedReader(InputStreamReader(process.inputStream))

                // For each OS, parse the output to extract SSIDs
                reader.useLines { lines ->
                    lines.forEach { line ->
                        when {
                            osName.contains("windows") -> {
                                // Windows: SSID is typically in the line that starts with 'SSID '
                                if (line.trim().startsWith("SSID ")) {
                                    val ssid = line.substringAfter(":").trim()
                                    if (ssid.isNotEmpty()) {
                                        Log.i("SSID is ", ssid)
                                        ssids.add(ssid)
                                    }
                                }
                            }
                            osName.contains("linux") -> {
                                // Linux: nmcli output contains SSIDs directly, so add them
                                val ssid = line.trim()
                                if (ssid.isNotEmpty()) {
                                    Log.i("SSID is ", ssid)
                                    ssids.add(ssid)
                                }
                            }
                            osName.contains("mac") || osName.contains("darwin") -> {
                                // macOS: SSID is typically the first column in the airport command output
                                val parts = line.trim().split("\\s+".toRegex())
                                if (parts.isNotEmpty()) {
                                    val ssid = parts[0]
                                    if (ssid.isNotEmpty()) {
                                        Log.i("SSID is ", ssid)
                                        ssids.add(ssid)
                                    }
                                }
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
                    lateinit var command: String
                    lateinit var processBuilder: ProcessBuilder
                    when {
                        osName.contains("windows") -> {
                            command = "netsh wlan connect name=\"$ssid\" key=\"$pass\""
                            processBuilder = ProcessBuilder("cmd.exe", "/c", command)
                        }
                        osName.contains("linux") -> {
                            command = "nmcli dev wifi connect '$ssid' password '$pass'"
                            processBuilder = ProcessBuilder("bash", "-c", command)
                        }
                        osName.contains("mac") || osName.contains("darwin") -> {
                            command = "networksetup -setairportnetwork en0 '$ssid' '$pass'"
                            processBuilder = ProcessBuilder("bash", "-c", command)
                        }
                        else -> {
                            Log.e("Unsupported operating system: $osName")
                            return false
                        }
                    }

                    // Execute the command
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
                lateinit var command: String
                lateinit var processBuilder: ProcessBuilder
                when {
                    osName.contains("windows") -> {
                        // Command to check WiFi status on Windows
                        command = "netsh interface show interface name=\"Wi-Fi\""
                        processBuilder = ProcessBuilder("cmd.exe", "/c", command)
                    }
                    osName.contains("linux") -> {
                        // Command to check WiFi status on Linux
                        command = "nmcli -t -f WIFI g"
                        processBuilder = ProcessBuilder("bash", "-c", command)
                    }
                    osName.contains("mac") || osName.contains("darwin") -> {
                        // Command to check WiFi status on macOS
                        command = "networksetup -getairportpower en0"
                        processBuilder = ProcessBuilder("bash", "-c", command)
                    }
                    else -> {
                        Log.e("Unsupported operating system: $osName")
                        return "unsupported"
                    }
                }

                processBuilder.redirectErrorStream(true)

                val process = processBuilder.start()
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                val status = reader.readLine()

                process.waitFor() // Wait for the process to finish

                // Return the Wi-Fi status based on the command's result
                return if (status != null && status.isNotEmpty()) {
                    when {
                        osName.contains("windows") -> {
                            // Windows specific: check if the interface is connected
                            if (status.contains("Connected", ignoreCase = true)) "enabled" else "disabled"
                        }
                        osName.contains("linux") -> {
                            // Linux specific: nmcli returns 'enabled' or 'disabled'
                            status.trim()
                        }
                        osName.contains("mac") || osName.contains("darwin") -> {
                            // macOS specific: check if WiFi is on or off
                            if (status.contains("On", ignoreCase = true)) "enabled" else "disabled"
                        }
                        else -> "unknown"
                    }
                } else {
                    "unknown"
                }

            } catch (e: Exception) {
                e.printStackTrace()
                "error"
            }
        }


        // Method to check the active Wi-Fi connection (SSID)
        private fun getActiveWiFiConnection(): String {
            return try {
                // Command to check active Wi-Fi connection and SSID
                lateinit var command: String
                lateinit var processBuilder: ProcessBuilder
                when {
                    osName.contains("windows") -> {
                        // Command to get active WiFi connection on Windows
                        command = "netsh wlan show interfaces | findstr /R /C:\" SSID\""
                        processBuilder = ProcessBuilder("cmd.exe", "/c", command)
                    }
                    osName.contains("linux") -> {
                        // Command to get active WiFi connection on Linux
                        command = "nmcli -t -f ACTIVE,SSID dev wifi | grep '^yes'"
                        processBuilder = ProcessBuilder("bash", "-c", command)
                    }
                    osName.contains("mac") || osName.contains("darwin") -> {
                        // Command to get active WiFi connection on macOS
                        command = "networksetup -getairportnetwork en0 | awk '{print \$4}'"
                        processBuilder = ProcessBuilder("bash", "-c", command)
                    }
                    else -> {
                        Log.e("Unsupported operating system: $osName")
                        return "unsupported"
                    }
                }

                processBuilder.redirectErrorStream(true)

                val process = processBuilder.start()
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                val result = reader.readLine()

                process.waitFor() // Wait for the process to finish

                // Extract SSID from the result (if available)
                if (result != null && result.isNotEmpty()) {
                    val parts = result.split(":")
                    return if (parts.isNotEmpty() && parts[0] == "yes") {
                        parts[1] // SSID
                    } else {
                        parts[0]
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
            return gson.toJson(map)
        }
        // Method to disconnect from the current Wi-Fi network
        fun wifiDisconnect(): Boolean {
            return try {
                // Command to disconnect the current Wi-Fi connection
                lateinit var command: String
                lateinit var processBuilder: ProcessBuilder
                when {
                    osName.contains("windows") -> {
                        // Command to disconnect from WiFi on Windows
                        command = "netsh wlan disconnect"
                        processBuilder = ProcessBuilder("cmd.exe", "/c", command)
                    }
                    osName.contains("linux") -> {
                        // Command to disconnect from WiFi on Linux using nmcli
                        command = "nmcli connection down id $(nmcli -t -f NAME connection show --active)"
                        processBuilder = ProcessBuilder("bash", "-c", command)
                    }
                    osName.contains("mac") || osName.contains("darwin") -> {
                        // Command to disconnect from WiFi on macOS
                        command = "networksetup -removepreferredwirelessnetwork en0 '$(networksetup -getairportnetwork en0 | awk '{print $4}')'"
                        processBuilder = ProcessBuilder("bash", "-c", command)
                    }
                    else -> {
                        Log.e("Unsupported operating system: $osName")
                        return false
                    }
                }


                processBuilder.redirectErrorStream(true)

                val process = processBuilder.start()
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                val result = reader.readText()

                process.waitFor() // Wait for the process to finish

                if (result.isEmpty()) true else false
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }

        fun setTheme(data: JsonObject) {
            val themeTheme = data.get("theme").asString
            val theme = Themes().getByThemeName(themeTheme)
            SSENotifier.setTheme(gson.toJson(theme))
        }

        fun liveClear() {
            SSENotifier.liveClear()
        }

        fun isConnectedToInternet(): Boolean {
            return try {
                val url = URL("http://www.google.com")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 1500  // Timeout for connection
                connection.connect()              // Try to connect

                // Check for a successful response code (200–299 means success)
                connection.responseCode in 200..299
            } catch (e: Exception) {
                false  // Any exception means no connection
            }
        }

        fun getLink(cache: Cache<Any>): String {
            var link = ""
            val data = cache.get("link").toString()
            if (data.isNotEmpty())
                link = data
            return link
        }
    }
}