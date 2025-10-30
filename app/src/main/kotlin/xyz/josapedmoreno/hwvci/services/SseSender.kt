package xyz.josapedmoreno.hwvci.services

import xyz.josapedmoreno.hwvci.control.Core
import xyz.josapedmoreno.hwvci.control.data.EventBroadcaster
import xyz.josapedmoreno.hwvci.control.data.SseEvent
import java.lang.Thread.sleep

class SseSender {
    suspend fun connected(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "connected",
                data = data
            )
        )
    }
    suspend fun changeBackground(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "changebackground",
                data = data
            )
        )
    }
    suspend fun songTitle(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "title",
                data = data
            )
        )
    }
    suspend fun changeLyrics(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "lyrics",
                data = data
            )
        )
    }
    suspend fun verse(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "verse",
                data = data
            )
        )
    }
    suspend fun hideLyrics(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "hidelyrics",
                data = data
            )
        )
    }
    suspend fun blackScreen(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "blackscreen",
                data = data
            )
        )
    }
    suspend fun showLyrics(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "showlyrics",
                data = data
            )
        )
    }
    suspend fun removeBackground(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "removebackground",
                data = data
            )
        )
    }
    suspend fun wifiStatus(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "wifi",
                data = data
            )
        )
    }
    suspend fun mode(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "apmode",
                data = data
            )
        )
    }
    suspend fun theme(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "theme",
                data = data
            )
        )
    }
    suspend fun clearLive(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                type = "clear",
                data = data
            )
        )
    }
}