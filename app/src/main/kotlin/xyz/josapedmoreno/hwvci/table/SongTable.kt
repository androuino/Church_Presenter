package xyz.josapedmoreno.hwvci.table

import com.google.gson.JsonObject
import com.intellisrc.db.auto.Table
import xyz.josapedmoreno.hwvci.model.Song

class SongTable : Table<Song>() {
    fun insertSong(data: JsonObject) : Boolean {
        var success = false
        val song = Song()
        val id = data.get("id").asInt
        val author = data.get("author").asString
        val title = data.get("title").asString
        val lyrics = data.get("lyrics").asString
        song.id = id
        song.author = author
        song.songTitle = title
        song.lyrics = lyrics
        success = if (id != 0)
            update(song, arrayListOf("id"))
        else
            table.insert(song.toMap())
        return success
    }
    fun getAllSongs() : MutableList<Song> {
        return all
    }
    fun getSongById(id: Int) : Song {
        return get(id)
    }
    fun deleteSongById(id: Int) : Boolean {
        return delete(id)
    }
    fun getSongLyricsById(id: Int) : String {
        return find("id", id).lyrics
    }
    fun saveEditedSong(data: JsonObject) : Boolean {
        var success = false
        val song = Song()
        val id = data.get("id").asInt
        val lyrics = data.get("lyrics").asString
        song.id = id
        song.lyrics = lyrics
        success = update(song, arrayListOf("id", "author", "song_title"))
        return success
    }
}