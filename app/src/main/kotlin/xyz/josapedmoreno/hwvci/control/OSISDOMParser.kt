package xyz.josapedmoreno.hwvci.control

import com.intellisrc.core.Log
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.w3c.dom.NodeList
import java.io.File
import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory

class OSISDOMParser {
    companion object {
        fun parse() {
            try {
                val inputFile = File("path/to/your/osisfile.xml")
                val dbFactory: DocumentBuilderFactory = DocumentBuilderFactory.newInstance()
                val dBuilder: DocumentBuilder = dbFactory.newDocumentBuilder()
                val doc: Document = dBuilder.parse(inputFile)

                doc.documentElement.normalize()
                val verses: NodeList = doc.getElementsByTagName("verse")

                verses.length.let { i ->
                    val verseNode: Node = verses.item(i)
                    if (verseNode.nodeType == Node.ELEMENT_NODE) {
                        val verseElement: Element = verseNode as Element
                        Log.i("Verse: " + verseElement.textContent)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace();
            }
        }
    }
}