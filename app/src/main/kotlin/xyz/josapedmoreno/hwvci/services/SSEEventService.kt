package xyz.josapedmoreno.hwvci.services

import com.google.gson.Gson
import com.intellisrc.web.service.ServerSentEvent

class SSEEventService : ServerSentEvent() {
    override fun getPath(): String {
        return "/events"
    }

    fun lyricsChangerNotifier(lyrics: String) {
        broadcast(lyrics, "lyrics")
    }

    fun wifiStatusNotifier(status: String) {
        broadcast(status, "wifi")
    }

    fun setThemeNotifier(data: String) {
        broadcast(data, "theme")
    }

    fun notifyLiveClear() {
        broadcast("clear", "clear")
    }

    companion object {
        private val gson = Gson().newBuilder().create()
        private val map = LinkedHashMap<String, Any>(1)
    }
}