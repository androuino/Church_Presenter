package xyz.josapedmoreno.hwvci.ap

import com.intellisrc.core.Log
import java.io.File

object ConfigFileChecker {
    fun isHostapdConfigExists(): Boolean {
        val file = File("/etc/hostapd/hostapd.conf")
        return file.exists()
    }

    fun isDnsmasqConfigExists(): Boolean {
        val file = File("/etc/dnsmasq.conf")
        return file.exists()
    }

    fun setupConfigurationFiles() {
        if (!isHostapdConfigExists()) {
            // Write Hostapd configuration here
            Log.i("Setting up hostapd configuration...")
        } else {
            Log.w("hostapd configuration already exists.")
        }

        if (!isDnsmasqConfigExists()) {
            // Write Dnsmasq configuration here
            Log.i("Setting up dnsmasq configuration...")
        } else {
            Log.w("dnsmasq configuration already exists.")
        }
    }
}