package xyz.josapedmoreno.hwvci.control

import com.intellisrc.core.Log
import java.awt.GraphicsEnvironment
import java.io.BufferedReader
import java.io.InputStreamReader


class Core {
    companion object {
        fun getFonts() : Array<String> {
            // Get the local graphics environment
            val ge = GraphicsEnvironment.getLocalGraphicsEnvironment()
            // Get all font family names
            val fontNames = ge.availableFontFamilyNames
            // Print all font family names
            Log.i("Installed Fonts:")
            for (fontName in fontNames) {
                Log.i(fontName)
            }
            return fontNames
        }
        fun getAvailableWifiSSIDsLinux(): List<String> {
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
    }
}