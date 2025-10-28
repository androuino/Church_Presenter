package xyz.josapedmoreno.hwvci.control

data class WinMonitor(
    val name: String,
    val primary: Boolean,
    val x: Int, val y: Int,
    val width: Int, val height: Int
)
