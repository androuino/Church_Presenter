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

    companion object {
        private val gson = Gson().newBuilder().create()
        private val map = LinkedHashMap<String, Any>(1)
    }
}