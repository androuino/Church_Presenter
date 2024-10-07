package xyz.josapedmoreno.hwvci.services

import com.aspose.cells.Title
import com.google.gson.Gson
import com.intellisrc.web.service.ServerSentEvent
import org.bouncycastle.asn1.x500.style.RFC4519Style.title

class SSEEventService : ServerSentEvent() {
    override fun getAcceptCharset(): String? {
        return Charsets.UTF_8.name()
    }
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

    fun projectVerse(verse: String) {
        broadcast(verse, "verse")
    }

    fun hideLyrics() {
        broadcast("true", "hidelyrics")
    }

    fun showLyrics() {
        broadcast("true", "showlyrics")
    }

    fun blackScreen() {
        broadcast("true", "blackscreen")
    }

    fun removeBackground() {
        broadcast("true", "removebackground")
    }

    fun sendSongTitle(title: String) {
        broadcast(title, "title")
    }

    fun changeBackground(origName: String) {
        broadcast(origName, "changebackground")
    }

    companion object {
        private val gson = Gson().newBuilder().create()
        private val map = LinkedHashMap<String, Any>(1)
    }
}