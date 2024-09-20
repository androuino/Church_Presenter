package xyz.josapedmoreno.hwvci.services

import com.intellisrc.thread.ServiceTask
import xyz.josapedmoreno.hwvci.control.Core
import java.lang.Thread.sleep

class WifiNotifier(private val sseEventService: SSEEventService) : ServiceTask() {
    var running = true
    override fun process(): Runnable? {
        return Thread {
            while (running) {
                val status = Core.getWifiStatus()
                sseEventService.wifiStatusNotifier(status)
                sleep(5000)
            }
        }
    }

    override fun reset(): Boolean {
        running = false
        return true
    }
}