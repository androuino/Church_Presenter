package xyz.josapedmoreno.hwvci.control

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.intellisrc.core.Log
import com.intellisrc.etc.Cache
import xyz.josapedmoreno.hwvci.services.SSENotifier
import xyz.josapedmoreno.hwvci.table.Themes
import java.awt.GraphicsEnvironment
import java.io.BufferedReader
import java.io.File
import java.io.FileOutputStream
import java.io.InputStreamReader
import java.lang.reflect.Field
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.NetworkInterface
import java.net.URL

class Core {
    companion object {
        private val gson = Gson().newBuilder().create()
        private val osName = System.getProperty("os.name").lowercase()
        private val KIOSK_LOCK_FILE = File(System.getProperty("java.io.tmpdir"), "hwvci-kiosk.lock")
        private var kioskPid: Long? = null

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
                        process = ProcessBuilder("bash", "-c", "nmcli device wifi list").start()
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
                            command = "sudo nmcli dev wifi connect '$ssid' password '$pass'"
                            processBuilder = ProcessBuilder("bash", "-c", command)
                        }
                        osName.contains("mac") || osName.contains("darwin") -> {
                            command = "networksetup -setairportnetwork en0 '$ssid' '$pass'"
                            processBuilder = ProcessBuilder("bash", "-c", command)
                        }
                        else -> {
                            command = "sudo nmcli device wifi connect '$ssid' password '$pass'"
                            processBuilder = ProcessBuilder("bash", "-c", command)
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
1                    }
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
                Log.e("Error getting wifi address.", ex.printStackTrace())
            }
            return ""
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
                if (activeSSID != "disconnected")
                    status = "connected"
                map["status"] = status
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

        fun getWifiConnectionStatus(): Boolean {
            val data = gson.fromJson(getWifiStatus(), JsonObject::class.java)
            val status = data.get("status").asString
            return status == "connected"
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

        fun disableService(serviceName: String = "kiosk.service"): Boolean {
            var success = false
            val command = "./disable_service.sh $serviceName" // Call the script

            try {
                // Create a process builder
                val processBuilder = ProcessBuilder("bash", "-c", command)
                processBuilder.redirectErrorStream(true) // Combine stdout and stderr

                // Start the process
                val process = processBuilder.start()

                // Read the output
                BufferedReader(InputStreamReader(process.inputStream)).use { reader ->
                    reader.lines().forEach { line -> println(line) }
                }

                // Wait for the process to finish
                val exitCode = process.waitFor()
                if (exitCode == 0) {
                    Log.d("Service $serviceName disabled successfully.")
                    success = true
                } else {
                    println("Failed to disable service $serviceName. Exit code: $exitCode")
                }

            } catch (e: Exception) {
                Log.e("Error disabling kiosk.service", e.printStackTrace())
            }
            return success
        }

        fun enableService(serviceName: String = "kiosk.service"): Boolean {
            var success = false
            val command = "./enable_service.sh $serviceName" // Call the script

            try {
                // Create a process builder
                val processBuilder = ProcessBuilder("bash", "-c", command)
                processBuilder.redirectErrorStream(true) // Combine stdout and stderr

                // Start the process
                val process = processBuilder.start()

                // Read the output
                BufferedReader(InputStreamReader(process.inputStream)).use { reader ->
                    reader.lines().forEach { line -> println(line) }
                }

                // Wait for the process to finish
                val exitCode = process.waitFor()
                if (exitCode == 0) {
                    Log.d("Service $serviceName disabled successfully.")
                    success = true
                } else {
                    println("Failed to disable service $serviceName. Exit code: $exitCode")
                }

            } catch (e: Exception) {
                Log.e("Error disabling kiosk.service", e.printStackTrace())
            }
            return success
        }
        fun startKiosk() {
            if (isKioskRunning()) {
                Log.w("Kiosk already running – not starting")
                return
            }

            val os = System.getProperty("os.name").lowercase()
            val url = "http://localhost:5555"

            when {
                os.contains("win") -> openBrowserWindow(url)
                os.contains("mac") -> openBrowserMac(url)
                os.contains("nix") || os.contains("nux") -> openBrowserLinux(url)
                else -> Log.w("Unsupported OS: $os")
            }
        }
        fun stopKiosk() {
            val os = System.getProperty("os.name").lowercase()
            when {
                os.contains("win") -> stopKioskWindows()
                os.contains("mac") -> stopKioskMac()
                os.contains("nix") || os.contains("nux") -> stopKioskLinux()
            }

            // --- Always clean up lock file ---
            try {
                if (KIOSK_LOCK_FILE.exists()) {
                    KIOSK_LOCK_FILE.delete()
                    Log.i("Kiosk lock file removed")
                }
            } catch (e: Exception) { /* ignore */ }

            kioskPid = null
        }
        fun openBrowserWindow(url: String) {
            if (isKioskRunning()) {
                Log.w("Kiosk is already running (PID: $kioskPid). Not starting another.")
                return
            }
            try {
                // 1. Get real monitor geometry (x, y, w, h, primary)
                // -------------------------------------------------
                val monitors = getWindowsMonitors()
                if (monitors.isEmpty()) {
                    Log.w("No monitors detected on Windows")
                    return
                }

                // Choose the *extended* monitor
                val extended = monitors.find { !it.primary } ?: monitors.getOrNull(1) ?: monitors[0]
                Log.i("Kiosk → ${extended.name} @ ${extended.x},${extended.y} ${extended.width}x${extended.height}")

                // -------------------------------------------------
                // 2. Find Chrome executable
                // -------------------------------------------------
                val chromeExe = findWindowsChrome() ?: run {
                    Log.e("Chrome not found")
                    return
                }

                // -------------------------------------------------
                // 3. Temporary isolated profile
                // -------------------------------------------------
                val profileDir = File(System.getProperty("java.io.tmpdir"),
                    "kiosk-profile-${System.nanoTime()}").apply { mkdirs() }

                // -------------------------------------------------
                // 4. Launch Chrome (new process, correct geometry)
                // -------------------------------------------------
                val pb = ProcessBuilder(
                    chromeExe,
                    "--kiosk",
                    "--no-first-run",
                    "--disable-infobars",
                    "--user-data-dir=${profileDir.absolutePath}",
                    "--window-position=${extended.x},${extended.y}",
                    "--window-size=${extended.width}x${extended.height}",
                    "--app=$url"
                ).redirectErrorStream(true)

                Log.i("Launching: ${pb.command().joinToString(" ")}")
                val process = pb.start()
                kioskPid = getProcessPid(process)  // your Java 8 reflection function
                kioskPid?.let { pid ->
                    KIOSK_LOCK_FILE.writeText(pid.toString())
                    Log.i("Kiosk started with PID: $pid")
                }

                // -------------------------------------------------
                // 5. Wait → move + fullscreen with nircmd
                // -------------------------------------------------
                Thread.sleep(3500)                     // give Chrome time to create the window
                moveChromeWithNirCmd(extended.x, extended.y, extended.width, extended.height)

                // -------------------------------------------------
                // 6. Clean‑up profile later
                // -------------------------------------------------
                Thread {
                    Thread.sleep(15_000)
                    profileDir.deleteRecursively()
                }.start()

            } catch (e: Exception) {
                Log.e("Windows kiosk failed", e)
            }
        }

        fun openBrowserLinux(url: String) {
            if (isKioskRunning()) {
                Log.w("Kiosk is already running (PID: $kioskPid). Not starting another.")
                return
            }
            try {
                val monitors = detectMonitors()
                if (monitors.isEmpty()) {
                    Log.w("No monitors detected")
                    return
                }

                val extended = monitors.find { it["primary"] as? Boolean != true }
                    ?: monitors.getOrNull(1)
                    ?: monitors[0]

                val x = extended["x"] as Int
                val y = extended["y"] as Int
                val w = extended["width"] as Int
                val h = extended["height"] as Int
                val name = extended["name"] as String

                Log.i("Launching kiosk on: $name ($x,$y ${w}x$h)")

                val chromeCmd = findChromeCommand() ?: run {
                    Log.e("Chrome not found")
                    return
                }

                val profileDir = File(System.getProperty("java.io.tmpdir"), "kiosk-profile-${System.nanoTime()}")
                profileDir.mkdirs()

                // Launch with unique title
                val pb = ProcessBuilder(
                    chromeCmd,
                    "--kiosk",
                    "--no-first-run",
                    "--disable-infobars",
                    "--user-data-dir=${profileDir.absolutePath}",
                    "--window-position=$x,$y",
                    "--window-size=${w}x$h",
                    "--app=$url"
                ).redirectErrorStream(true)

                Log.i("Launching Chrome: ${pb.command().joinToString(" ")}")
                val process = pb.start()
                kioskPid = getProcessPid(process)  // your Java 8 reflection function
                kioskPid?.let { pid ->
                    KIOSK_LOCK_FILE.writeText(pid.toString())
                    Log.i("Kiosk started with PID: $pid")
                }

                // Wait for Chrome to appear
                Thread.sleep(4000)

                // Find and move ONLY the Chrome kiosk window
                val windowId = findChromeKioskWindow()
                if (windowId != null) {
                    moveWindowById(windowId, x, y, w, h)
                    fullscreenWindowById(windowId)
                    Log.i("Kiosk moved to $name")
                } else {
                    Log.w("Chrome window not found – skipping move")
                }

                // Clean up
                Thread {
                    Thread.sleep(10000)
                    profileDir.deleteRecursively()
                }.start()

            } catch (e: Exception) {
                Log.e("Kiosk launch failed", e)
            }
        }

        fun openBrowserMac(url: String) {
            if (isKioskRunning()) {
                Log.w("Kiosk is already running (PID: $kioskPid). Not starting another.")
                return
            }
            try {
                // 1. Detect screens
                val screens = getMacScreens()
                if (screens.isEmpty()) {
                    Log.w("No screens found on macOS")
                    return
                }

                // 2. Choose extended screen (not the one with origin 0,0)
                val extended = screens.find { it.x != 0 || it.y != 0 } ?: screens.getOrNull(1) ?: screens[0]

                val x = extended.x
                val y = extended.y
                val w = extended.width
                val h = extended.height
                Log.i("Launching kiosk on macOS screen @ $x,$y ${w}x$h")

                // 3. Find Chrome
                val chromeApp = findMacChrome() ?: run {
                    Log.e("Chrome not found on macOS")
                    return
                }

                // 4. Temp profile
                val profile = File(System.getProperty("java.io.tmpdir"),
                    "kiosk-profile-${System.nanoTime()}")
                profile.mkdirs()

                // 5. AppleScript to open Chrome in kiosk on the exact screen
                val script = """
                    tell application "$chromeApp"
                        activate
                        set newWin to make new window
                        set URL of active tab of newWin to "$url"
                        set bounds of newWin to {$x, $y, ${x + w}, ${y + h}}
                        set fullscreen of newWin to true
                    end tell
                    tell application "System Events"
                        keystroke "k" using {command down, shift down} -- Chrome kiosk shortcut
                    end tell
                """.trimIndent()

                // Write script to temp file
                val scriptFile = File.createTempFile("kiosk", ".scpt")
                scriptFile.writeText(script)
                scriptFile.deleteOnExit()

                // Run it
                // Run osascript
                ProcessBuilder("osascript", scriptFile.absolutePath)
                    .redirectErrorStream(true).start()

                // Wait for Chrome to start
                Thread.sleep(3000)

                // Find & store PID
                kioskPid = findMacKioskPid()
                kioskPid?.let { pid ->
                    KIOSK_LOCK_FILE.writeText(pid.toString())
                    Log.i("Kiosk started with PID: $pid")
                } ?: Log.w("Could not find kiosk PID on macOS")

                // Clean‑up profile later
                Thread {
                    Thread.sleep(15000)
                    profile.deleteRecursively()
                }.start()

            } catch (e: Exception) {
                Log.e("macOS kiosk failed", e)
            }
        }
        private fun stopKioskWindows() {
            try {
                val pb = ProcessBuilder(
                    "taskkill", "/F", "/IM", "chrome.exe",
                    "/FI", "WINDOWTITLE eq *localhost:5555*"
                ).redirectErrorStream(true)
                val process = pb.start()
                process.waitFor()
                Log.i("Kiosk stopped on Windows")
            } catch (e: Exception) {
                Log.e("Failed to stop kiosk on Windows", e)
            }
        }
        private fun stopKioskMac() {
            try {
                val script = """
                    tell application "Google Chrome"
                        repeat with w in windows
                            repeat with t in tabs of w
                                if URL of t contains "localhost:5555" then
                                    close w
                                    exit repeat
                                end if
                            end repeat
                        end repeat
                    end tell
                """.trimIndent()

                val file = File.createTempFile("stop_kiosk", ".scpt").apply { deleteOnExit() }
                file.writeText(script)

                ProcessBuilder("osascript", file.absolutePath)
                    .redirectErrorStream(true)
                    .start()
                    .waitFor()

                kioskPid?.let { pid ->
                    ProcessBuilder("kill", "-9", pid.toString()).start().waitFor()
                }

                Log.i("Kiosk stopped on macOS")
            } catch (e: Exception) {
                Log.e("Failed to stop kiosk on macOS", e)
            }
        }
        private fun stopKioskLinux() {
            try {
                // 1. Try killing by stored PID (most reliable)
                kioskPid?.let { pid ->
                    ProcessBuilder("kill", "-9", pid.toString())
                        .redirectErrorStream(true).start().waitFor()
                    Log.i("Kiosk (PID $pid) terminated")
                    kioskPid = null
                    return
                }

                // 2. Fallback: pkill by URL fragment
                val p = ProcessBuilder("pkill", "-f", "localhost:5555")
                    .redirectErrorStream(true).start()
                val code = p.waitFor()

                if (code == 0) Log.i("Kiosk stopped via pkill")
                else          Log.w("pkill returned $code – maybe already stopped")
            } catch (e: Exception) {
                Log.e("Failed to stop kiosk", e)
            }
        }
        private fun isKioskRunning(): Boolean {
            // 1. Check lock file
            if (!KIOSK_LOCK_FILE.exists()) return false

            // 2. Read PID from lock file
            val pidStr = try { KIOSK_LOCK_FILE.readText().trim() } catch (e: Exception) { return false }
            val pid = pidStr.toLongOrNull() ?: return false

            // 3. Verify the process is still alive + has our URL
            return isProcessAlive(pid) && processHasUrl(pid, "localhost:5555")
        }
    }
}

private fun detectMonitors(): List<Map<String, Any>> {
    return try {
        val p = ProcessBuilder("xrandr", "--query").start()
        val lines = p.inputStream.bufferedReader().readLines()
        p.waitFor()

        lines.filter { it.contains(" connected") }
            .mapNotNull { line ->
                val r = Regex("""(\S+) connected (primary )?(\d+)x(\d+)\+(\d+)\+(\d+)""")
                val m = r.find(line) ?: return@mapNotNull null
                mapOf(
                    "name" to m.groupValues[1],
                    "primary" to m.groupValues[2].isNotEmpty(),
                    "width" to m.groupValues[3].toInt(),
                    "height" to m.groupValues[4].toInt(),
                    "x" to m.groupValues[5].toInt(),
                    "y" to m.groupValues[6].toInt()
                )
            }
    } catch (e: Exception) {
        emptyList()
    }
}

private fun findChromeCommand(): String? {
    // Try common locations + environment
    val candidates = listOf(
        "google-chrome",
        "google-chrome-stable",
        "chromium",
        "chromium-browser",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser",
        "/snap/bin/chrome",
        "/usr/bin/chromium"
    )

    // First: check if in PATH via File
    for (cmd in candidates) {
        if (cmd.contains("/")) {
            if (File(cmd).canExecute()) return cmd
        } else {
            // Try `command -v` without triggering Chrome
            val path = System.getenv("PATH").split(":").map { "$it/$cmd" }.find { File(it).canExecute() }
            if (path != null) return cmd
        }
    }

    // Last resort: try running it (safe, won't open tab)
    return candidates.find { isCommandRunnable(it) }
}

private fun isCommandRunnable(cmd: String): Boolean {
    return try {
        val p = ProcessBuilder(cmd, "--version").redirectErrorStream(true).start()
        p.waitFor() == 0
    } catch (e: Exception) {
        false
    }
}

private fun findChromeKioskWindow(): String? {
    return try {
        val p = ProcessBuilder("wmctrl", "-l").start()
        val output = p.inputStream.bufferedReader().readLines()
        p.waitFor()

        output.map { it.split(Regex("\\s+"), 4) }
            .find { parts ->
                parts.size >= 4 &&
                        parts[3].contains("localhost:5555", ignoreCase = true)
            }?.get(0)  // Return window ID
    } catch (e: Exception) {
        null
    }
}

private fun moveWindowById(id: String, x: Int, y: Int, w: Int, h: Int) {
    try {
        ProcessBuilder("wmctrl", "-i", "-r", id, "-e", "0,$x,$y,$w,$h")
            .redirectErrorStream(true).start().waitFor()
    } catch (_: Exception) {}
}

private fun fullscreenWindowById(id: String) {
    try {
        ProcessBuilder("wmctrl", "-i", "-r", id, "-b", "add,fullscreen")
            .redirectErrorStream(true).start().waitFor()
    } catch (_: Exception) {}
}

private fun getWindowsMonitors(): List<WinMonitor> {
    // -------------------------------------------------
    // 1. Try nircmd (tiny external tool – bundled)
    // -------------------------------------------------
    val nircmd = extractNirCmd() ?: return emptyList()
    val proc = ProcessBuilder(nircmd, "monitor", "list").start()
    val output = proc.inputStream.bufferedReader().readText()
    proc.waitFor()

    // Example output:
    // Monitor 1: \\.\DISPLAY1  Primary  0,0  1920x1080
    // Monitor 2: \\.\DISPLAY2            1920,0  1920x1080
    val regex = Regex("""Monitor \d+: (\\\\\.\\[^ ]+) +(?:Primary +)?(\d+),(\d+) +(\d+)x(\d+)""")
    val monitors = regex.findAll(output).mapNotNull { m ->
        val name = m.groupValues[1]
        val primary = output.contains("$name Primary")
        val x = m.groupValues[2].toInt()
        val y = m.groupValues[3].toInt()
        val w = m.groupValues[4].toInt()
        val h = m.groupValues[5].toInt()
        WinMonitor(name, primary, x, y, w, h)
    }.toList()

    if (monitors.isNotEmpty()) return monitors

    // -------------------------------------------------
    // 2. Fallback – pure Java (EnumDisplayMonitors)
    // -------------------------------------------------
    return enumDisplayMonitorsJava()
}

// Extract nircmd.exe from resources to a temp file
private fun extractNircmd(): String? = try {
    val res = Core::class.java.getResourceAsStream("/nircmd.exe")
        ?: return null
    val tmp = File.createTempFile("nircmd", ".exe")
    tmp.deleteOnExit()
    res.use { input -> FileOutputStream(tmp).use { output -> input.copyTo(output) } }
    tmp.absolutePath
} catch (e: Exception) { null }

private fun findWindowsChrome(): String? {
    val candidates = listOf(
        """C:\Program Files\Google\Chrome\Application\chrome.exe""",
        """C:\Program Files (x86)\Google\Chrome\Application\chrome.exe""",
        """${System.getenv("LOCALAPPDATA")}\Google\Chrome\Application\chrome.exe"""
    )
    return candidates.find { File(it).exists() }
}

private fun getMacScreens(): List<MacScreen> {
    val script = """
        tell application "System Events"
            set screenList to {}
            repeat with d in every desktop
                set end of screenList to {originX, originY, width, height} of d
            end repeat
            screenList
        end tell
    """.trimIndent()

    val tmp = File.createTempFile("screens", ".scpt")
    tmp.writeText(script)
    val proc = ProcessBuilder("osascript", tmp.absolutePath).start()
    val out = proc.inputStream.bufferedReader().readText().trim()
    proc.waitFor()
    tmp.delete()

    // Output format: {{0, 0, 1920, 1080}, {1920, 0, 1920, 1080}}
    return Regex("\\{(\\d+), (\\d+), (\\d+), (\\d+)\\}")
        .findAll(out)
        .map { m ->
            MacScreen(
                x = m.groupValues[1].toInt(),
                y = m.groupValues[2].toInt(),
                width = m.groupValues[3].toInt(),
                height = m.groupValues[4].toInt()
            )
        }.toList()
}

private fun findMacChrome(): String? {
    val paths = listOf(
        "/Applications/Google Chrome.app",
        "/Applications/Chromium.app"
    )
    return paths.find { File("$it/Contents/MacOS/Google Chrome").exists() }
        ?.let { "$it/Contents/MacOS/Google Chrome" }
}

private fun extractNirCmd(): String? = try {
    val input = Core::class.java.getResourceAsStream("/nircmd.exe") ?: return null
    val tmp = File.createTempFile("nircmd", ".exe").apply { deleteOnExit() }
    input.use { i -> FileOutputStream(tmp).use { o -> i.copyTo(o) } }
    tmp.absolutePath
} catch (e: Exception) {
    Log.e("Failed to extract nircmd", e)
    null
}

private fun enumDisplayMonitorsJava(): List<WinMonitor> {
    // Uses JNA – add dependency: com.sun.jna:jna:5.13.0
    // (or implement with JNI – omitted for brevity)
    return emptyList()   // placeholder – you can skip if nircmd works
}

private fun moveChromeWithNirCmd(x: Int, y: Int, w: Int, h: Int) {
    val nircmd = extractNirCmd() ?: return

    // Use ProcessBuilder → preserves quoted paths
    listOf(
        listOf(nircmd, "win", "move", "class", "Chrome_WidgetWin_1", x.toString(), y.toString(), w.toString(), h.toString()),
        listOf(nircmd, "win", "setsize", "class", "Chrome_WidgetWin_1", x.toString(), y.toString(), w.toString(), h.toString()),
        listOf(nircmd, "win", "max", "class", "Chrome_WidgetWin_1")
    ).forEach { cmd ->
        try {
            ProcessBuilder(cmd).redirectErrorStream(true).start().waitFor()
        } catch (_: Exception) {}
    }
}

private fun getProcessPid(process: Process): Long? {
    return try {
        // Java 8: ProcessImpl has private field 'pid'
        val clazz = process.javaClass
        if (clazz.name == "java.lang.UNIXProcess" || clazz.name == "java.lang.ProcessImpl") {
            val f: Field = clazz.getDeclaredField("pid")
            f.isAccessible = true
            return f.getLong(process)
        }

        // Fallback: try "handle" field (Windows)
        val handleField = clazz.getDeclaredField("handle")
        handleField.isAccessible = true
        val handle = handleField.getLong(process)
        return handle // on Windows, handle ≠ PID, but we can use it later if needed
    } catch (e: Exception) {
        Log.w("Could not get PID (Java 8)", e)
        null
    }
}

private fun isProcessAlive(pid: Long): Boolean = try {
    val os = System.getProperty("os.name").lowercase()
    when {
        os.contains("win") -> {
            val p = ProcessBuilder("tasklist", "/FI", "PID eq $pid").start()
            val out = p.inputStream.bufferedReader().readText()
            p.waitFor()
            out.contains(" $pid ")
        }
        os.contains("mac") -> {
            ProcessBuilder("ps", "-p", pid.toString()).start().waitFor() == 0
        }
        else -> { // Linux / Unix
            ProcessBuilder("kill", "-0", pid.toString()).start().waitFor() == 0
        }
    }
} catch (e: Exception) {
    false
}

private fun processHasUrl(pid: Long, urlFragment: String): Boolean = try {
    val os = System.getProperty("os.name").lowercase()
    val cmd = when {
        os.contains("win") -> listOf("wmic", "process", "where", "processid=$pid", "get", "commandline")
        os.contains("mac") -> listOf("ps", "-p", pid.toString(), "-o", "command=")
        else -> listOf("ps", "-p", pid.toString(), "-o", "cmd=")
    }
    val p = ProcessBuilder(cmd).redirectErrorStream(true).start()
    val out = p.inputStream.bufferedReader().readText()
    p.waitFor()
    out.contains(urlFragment)
} catch (e: Exception) {
    false
}

private fun findMacKioskPid(): Long? = try {
    val pb = ProcessBuilder(
        "sh", "-c",
        """ps -eo pid,command | grep "[C]hrome --app=http://localhost:5555" | awk '{print \$1}'"""
    ).redirectErrorStream(true)

    val p = pb.start()
    val out = p.inputStream.bufferedReader().readText().trim()
    p.waitFor()

    out.toLongOrNull()
} catch (e: Exception) {
    Log.w("Failed to find macOS kiosk PID", e)
    null
}