package xyz.josapedmoreno.hwvci.control

import com.intellisrc.core.Log
import java.awt.GraphicsEnvironment



class Core {
    companion object {
        fun getFonts() : Array<String> {
            // Get the local graphics environment
            val ge = GraphicsEnvironment.getLocalGraphicsEnvironment()
            // Get all font family names
            val fontNames = ge.availableFontFamilyNames
            // Print all font family names
            Log.i("Installed Fonts:")
            for (fontName in fontNames) {
                Log.i(fontName)
            }
            return fontNames
        }
    }
}