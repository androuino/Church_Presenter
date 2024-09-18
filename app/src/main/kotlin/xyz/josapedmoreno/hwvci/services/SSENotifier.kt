package xyz.josapedmoreno.hwvci.services

class SSENotifier(private val sseEventService: SSEEventService?) : Thread() {
    private val taskQueue = ArrayDeque<() -> Unit>()
    private val lock = Object()  // A lock object for synchronization

    override fun run() {
        while (!isInterrupted) {
            val task: (() -> Unit)?
            synchronized(lock) {
                while (taskQueue.isEmpty()) {
                    lock.wait()  // Wait for tasks to be added
                }
                task = taskQueue.removeFirst()  // Retrieve the next task
            }
            task?.invoke()  // Execute the task outside the synchronized block
        }
    }

    // Add tasks from other parts of the code
    fun postTask(task: () -> Unit) {
        synchronized(lock) {
            taskQueue.addLast(task)
            lock.notify()  // Wake up the thread to process the task
        }
    }

    fun send(lyrics: String) {
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
            instance?.postTask {
                instance?.send(lyrics) ?: throw IllegalStateException("SSENotifier is not initialized")
            }
        }
    }
}