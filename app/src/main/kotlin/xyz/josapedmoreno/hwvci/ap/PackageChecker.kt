package xyz.josapedmoreno.hwvci.ap

import com.intellisrc.core.Log
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

object PackageChecker {

    fun isPackageInstalled(packageName: String): Boolean {
        return try {
            val process = Runtime.getRuntime().exec("dpkg -l $packageName")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            var line: String?
            var installed = false
            while (reader.readLine().also { line = it } != null) {
                if (line!!.contains(packageName)) {
                    installed = true
                    break
                }
            }
            process.waitFor()
            reader.close()
            installed
        } catch (e: Exception) {
            Log.e("Error checking if packages are installed", e.printStackTrace())
            false
        }
    }

    fun installLocalPackage(packagePath: String) {
        val file = File(packagePath)
        if (file.exists()) {
            try {
                Log.d("Installing package from $packagePath...")
                Runtime.getRuntime().exec("sudo dpkg -i $packagePath").waitFor()
            } catch (e: Exception) {
                Log.e("Error installing deb package", e.printStackTrace())
            }
        } else {
            Log.w("Package not found at $packagePath!")
        }
    }

    fun installPackagesIfNecessary() {
        if (!isPackageInstalled("hostapd")) {
            installLocalPackage("resources/hostapd.deb") // Specify the actual path
        } else {
            Log.w("hostapd is already installed.")
        }

        if (!isPackageInstalled("dnsmasq")) {
            installLocalPackage("resources/dnsmasq.deb") // Specify the actual path
        } else {
            Log.w("dnsmasq is already installed.")
        }
    }
}
