package xyz.josapedmoreno.hwvci

import com.intellisrc.core.Config
import com.intellisrc.core.Log
import com.intellisrc.core.SysService
import com.intellisrc.db.Database
import com.intellisrc.thread.Tasks
import com.intellisrc.web.WebService
import xyz.josapedmoreno.hwvci.ap.APModeChecker
import xyz.josapedmoreno.hwvci.ap.ConfigFileChecker
import xyz.josapedmoreno.hwvci.ap.IPAddressFetcher
import xyz.josapedmoreno.hwvci.ap.IPForwardingChecker
import xyz.josapedmoreno.hwvci.ap.PackageChecker
import xyz.josapedmoreno.hwvci.control.BookApi
import xyz.josapedmoreno.hwvci.control.Core
import xyz.josapedmoreno.hwvci.control.Paths.Companion.publicResources
import xyz.josapedmoreno.hwvci.services.AuthService
import xyz.josapedmoreno.hwvci.services.ControlServices
import xyz.josapedmoreno.hwvci.services.SSEEventService
import xyz.josapedmoreno.hwvci.services.SSENotifier
import xyz.josapedmoreno.hwvci.services.WifiNotifier
import xyz.josapedmoreno.hwvci.table.Themes
import xyz.josapedmoreno.hwvci.table.Users
import java.io.File

class App : SysService() {
    override fun onStart() {
        var port = Config.getInt("web.port")
        if (!args.isEmpty())
            port = Integer.parseInt(args.poll())
        webService.port = port
        webService.setResources(Config.get("web.resources", publicResources))
        Log.i("Resolved publicResources: %s", publicResources.absolutePath)
        Log.i("publicResources exists: %b", publicResources.exists())
        Log.i("index.html exists: %b", File(publicResources, "index.html").exists())
        //webService.setResources(publicResources)
        webService.add(sseEventService)
        webService.add(AuthService())
        webService.add(ControlServices())
        webService.start(true)

        val sseNotifier = SSENotifier(sseEventService)
        sseNotifier.apply { start() }
        SSENotifier.setInstance(sseNotifier)
        val wifiNotifier = WifiNotifier(sseEventService)
        Tasks.add(wifiNotifier)

        if (Users().createAdmin()) {
            Log.i("Admin is created")
        }
        if (Themes().createDefaultTheme()) {
            Log.i("Default theme is created")
        }
        if (BookApi.installDefaultBibleVersions()) { // This needs internet connection
            Log.i("Bible versions are installed")
        }
        if (!Core.getWifiConnectionStatus()) {
            Log.w("Switching to AP mode")
            // Check if packages are installed
            PackageChecker.installPackagesIfNecessary()
            // Check if configuration files are set
            ConfigFileChecker.setupConfigurationFiles()
            // Check if IP forwarding is enabled
            IPForwardingChecker.enableIPForwardingIfNecessary()
            // Check if Access Point is active
            APModeChecker.startAccessPointIfNecessary()
            Log.i("Access point setup complete")

            val ipAddress = IPAddressFetcher.getIPAddress("wlan0") // Replace with the correct interface
            if (ipAddress != null) {
                Log.i("Access Point IP Address: $ipAddress")
                SSENotifier.apModeActivated(ipAddress)
            } else {
                Log.w("Unable to fetch the IP address.")
            }
        } else {
            Log.i("Device is connected to wifi")
        }
    }

    override fun onStop() {
        super.onStop()
        webService.stop()
        Database.getDefault().quit()
    }

    companion object {
        private val webService = WebService()
        init {
            service = App()
        }
        private val sseEventService = SSEEventService()
    }
}