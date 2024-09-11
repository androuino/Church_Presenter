package xyz.josapedmoreno.hwvci.model

import com.intellisrc.db.annot.Column
import com.intellisrc.db.auto.Model

class Song : Model() {
    @Column(primary = true, autoincrement = true)
    var id: Int = 0
    @Column
    var author: String = ""
    @Column
    var songTitle: String = ""
    @Column
    var lyrics: String = ""

    override fun toMap(): MutableMap<String, Any> {
        return mutableMapOf(
            "id" to id,
            "author" to author,
            "song_title" to songTitle,
            "lyrics" to lyrics
        )
    }
}