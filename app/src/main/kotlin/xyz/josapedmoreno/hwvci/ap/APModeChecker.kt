package xyz.josapedmoreno.hwvci.ap

import com.intellisrc.core.Log
import java.io.BufferedReader
import java.io.InputStreamReader

object APModeChecker {

    fun isAccessPointActive(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec("systemctl is-active hostapd")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val status = reader.readLine()
            process.waitFor()
            reader.close()
            status == "active"
        } catch (e: Exception) {
            Log.e("Error activating access point", e.printStackTrace())
            false
        }
    }

    fun startAccessPointIfNecessary() {
        if (!isAccessPointActive()) {
            println("Access Point not active. Starting Access Point...")
            // Command to enable the access point
            Runtime.getRuntime().exec("sudo systemctl start hostapd").waitFor()
        } else {
            Log.w("Access Point is already active.")
        }
    }
}
