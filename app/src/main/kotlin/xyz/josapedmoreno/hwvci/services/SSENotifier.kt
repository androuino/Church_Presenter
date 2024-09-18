package xyz.josapedmoreno.hwvci.services

class SSENotifier(private val sseEventService: SSEEventService?) {
    fun process(lyrics: String) {
        sseEventService?.lyricsChangerNotifier(lyrics)
    }

    companion object {
        @Volatile
        private var instance: SSENotifier? = null

        @Synchronized
        fun setInstance(instance: SSENotifier) {
            this.instance = instance
        }

        @Synchronized
        fun sendLyrics(lyrics: String) {
            instance?.process(lyrics) ?: throw IllegalStateException("SSENotifier is not initialized")
        }
    }
}