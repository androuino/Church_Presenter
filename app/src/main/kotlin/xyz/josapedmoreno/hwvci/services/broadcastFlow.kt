package xyz.josapedmoreno.hwvci.services

import kotlinx.coroutines.flow.MutableSharedFlow

private val broadcastFlow = MutableSharedFlow<String>(
    extraBufferCapacity = 100
)