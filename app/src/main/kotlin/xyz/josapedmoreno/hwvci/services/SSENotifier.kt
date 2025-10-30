package xyz.josapedmoreno.hwvci.services

import com.google.gson.JsonObject
import com.intellisrc.etc.Cache

sealed class AppEvent {
    data class LyricsChangerNotifier(val lyrics: String) : AppEvent()
    data class WifiStatusNotifier(val status: String) : AppEvent()
    data class SetThemeNotifier(val data: String) : AppEvent()
    data class NotifyLiveClear(val clear: String = "clear") : AppEvent()
    data class ProjectVerse(val verse: String) : AppEvent()
    data class HideLyrics(val hide: String = "true") : AppEvent()
    data class ShowLyrics(val show: String = "true") : AppEvent()
    data class BlackScreen(val black: String = "true") : AppEvent()
    data class RemoveBackground(val removeBackground: String = "true") : AppEvent()
    data class SendSongTitle(val title: String) : AppEvent()
    data class ChangeBackground()

    fun send(lyrics: String) {
        sseEventService?.lyricsChangerNotifier(lyrics)
    }

    fun setTheme(data: String) {
        sseEventService?.setThemeNotifier(data)
    }

    fun liveClear() {
        sseEventService?.notifyLiveClear()
    }

    fun projectVerse(verse: String) {
        sseEventService?.projectVerse(verse)
    }

    fun hideLyrics() {
        sseEventService?.hideLyrics()
    }

    fun showLyrics() {
        sseEventService?.showLyrics()
    }

    fun blackScreen() {
        sseEventService?.blackScreen()
    }

    fun removeBackground() {
        sseEventService?.removeBackground()
    }

    fun sendSongTitle(title: String) {
        sseEventService?.sendSongTitle(title)
    }

    fun changeBackground(origName: String) {
        sseEventService?.changeBackground(origName)
    }

    fun setBgLink(data: JsonObject, cache: Cache<Any>) {
        val link = data.get("link").asString
        cache.set("link", link)
        sseEventService?.changeBackground("link")
    }

    fun controllerConnected(success: Boolean) {
        sseEventService?.controllerConnected(success)
    }

    fun apModeActivated(ipAddress: String) {
        sseEventService?.apModeActivated(ipAddress)
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
            instance?.postTask {
                instance?.send(lyrics) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun setTheme(data: String) {
            instance?.postTask {
                instance?.setTheme(data) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun liveClear() {
            instance?.postTask {
                instance?.liveClear() ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun projectVerse(verse: String) {
            instance?.postTask {
                instance?.projectVerse(verse) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun hideLyrics() {
            instance?.postTask {
                instance?.hideLyrics() ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun showLyrics() {
            instance?.postTask {
                instance?.showLyrics() ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun blackScreen() {
            instance?.postTask {
                instance?.blackScreen() ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun removeBackground() {
            instance?.postTask {
                instance?.removeBackground() ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun sendSongTitle(title: String) {
            instance?.postTask {
                instance?.sendSongTitle(title) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun changeBackground(origName: String) {
            instance?.postTask {
                instance?.changeBackground(origName) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun setBgLink(data: JsonObject, cache: Cache<Any>) {
            instance?.postTask {
                instance?.setBgLink(data, cache) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun controllerConnected(success: Boolean) {
            instance?.postTask {
                instance?.controllerConnected(success) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }

        @Synchronized
        fun apModeActivated(ipAddress: String) {
            instance?.postTask {
                instance?.apModeActivated(ipAddress) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }
    }
}