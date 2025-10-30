package xyz.josapedmoreno.hwvci.control.data

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.serialization.Serializable

@Serializable
data class SseEvent(val type: String, val data: String, val timestamp: Long = System.currentTimeMillis())

object EventBroadcaster {
    private val _events = MutableSharedFlow<SseEvent>(
        extraBufferCapacity = 256,
        replay = 0
    )
    val events: SharedFlow<SseEvent> = _events.asSharedFlow()

    suspend fun emit(event: SseEvent) {
        _events.emit(event)
    }
}
