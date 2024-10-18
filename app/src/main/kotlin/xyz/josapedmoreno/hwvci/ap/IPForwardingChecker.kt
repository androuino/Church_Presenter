package xyz.josapedmoreno.hwvci.ap

import com.intellisrc.core.Log
import java.io.BufferedReader
import java.io.InputStreamReader

object IPForwardingChecker {

    fun isIPForwardingEnabled(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec("sysctl net.ipv4.ip_forward")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = reader.readLine()
            process.waitFor()
            reader.close()
            output.contains("= 1")
        } catch (e: Exception) {
            Log.e("Error enabling IP forwarding.", e.printStackTrace())
            false
        }
    }

    fun enableIPForwardingIfNecessary() {
        if (!isIPForwardingEnabled()) {
            Log.i("IP Forwarding is disabled. Enabling it...")
            Runtime.getRuntime().exec("sudo sysctl -w net.ipv4.ip_forward=1").waitFor()
        } else {
            Log.w("IP Forwarding is already enabled.")
        }
    }
}
