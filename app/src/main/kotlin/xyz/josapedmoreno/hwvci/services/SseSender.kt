package xyz.josapedmoreno.hwvci.services

import xyz.josapedmoreno.hwvci.control.data.EventBroadcaster
import xyz.josapedmoreno.hwvci.control.data.SseEvent

class SseSender {
    suspend fun connected(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "connected",
                data = data
            )
        )
    }
    suspend fun changeBackground(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "changebackground",
                data = data
            )
        )
    }
    suspend fun songTitle(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "title",
                data = data
            )
        )
    }
    suspend fun changeLyrics(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "lyrics",
                data = data
            )
        )
    }
    suspend fun verse(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "verse",
                data = data,
                type = "application/json"
            )
        )
    }
    suspend fun hideLyrics(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "hidelyrics",
                data = data
            )
        )
    }
    suspend fun blackScreen(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "blackscreen",
                data = data
            )
        )
    }
    suspend fun showLyrics(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "showlyrics",
                data = data
            )
        )
    }
    suspend fun removeBackground(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "removebackground",
                data = data
            )
        )
    }
    suspend fun wifiStatus(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "wifi",
                data = data
            )
        )
    }
    suspend fun mode(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "apmode",
                data = data
            )
        )
    }
    suspend fun theme(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "theme",
                data = data,
                type = "application/json"
            )
        )
    }
    suspend fun clearLive(data: String) {
        EventBroadcaster.emit(
            SseEvent(
                event = "clear",
                data = data
            )
        )
    }
}