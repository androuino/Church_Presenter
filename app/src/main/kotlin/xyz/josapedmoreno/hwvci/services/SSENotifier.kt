package xyz.josapedmoreno.hwvci.services

import com.intellisrc.thread.ServiceTask
import java.lang.Thread.sleep

class SSENotifier(val sseEventService: SSEEventService? = null) : ServiceTask() {
    override fun process(): Runnable? {
        return Thread {
            while (running) {
                sleep(10000)
                //sseEventService.lyricsChangerNotifier("lyrics")
            }
        }
    }

    override fun reset(): Boolean {
        running = false
        return true
    }

    companion object {
        var running = true
        var sseEventService: SSEEventService? = null
        fun sendLyrics(lyrics: String) {
            SSENotifier().sseEventService?.lyricsChangerNotifier(lyrics)
        }
    }
}